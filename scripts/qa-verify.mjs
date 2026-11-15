import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT_DIR = 'C:/Users/ADMIN/.gemini/antigravity/brain/6ecc882d-02a4-43ce-bf70-0f4ad33d3b24/scratch/qa';
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const urlArgIdx = process.argv.indexOf('--url');
const externalUrl = urlArgIdx !== -1 ? process.argv[urlArgIdx + 1] : null;
const TEST_PORT = 4179;
const BASE_URL = externalUrl || `http://127.0.0.1:${TEST_PORT}`;

function waitForHttp(url, timeoutMs = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
      });
      req.on('error', retry);
      function retry() {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server at ${url} did not respond within ${timeoutMs}ms`));
          return;
        }
        setTimeout(attempt, 250);
      }
    };
    attempt();
  });
}

let viteProc = null;
if (!externalUrl) {
  viteProc = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(TEST_PORT), '--strictPort'],
    { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0' } }
  );
  viteProc.stdout.on('data', (d) => {
    const msg = d.toString().trim();
    if (msg) console.log('[vite:out]', msg);
  });
  viteProc.stderr.on('data', (d) => {
    const msg = d.toString().trim();
    if (msg) console.error('[vite:err]', msg);
  });
}

const report = {
  baseUrl: BASE_URL,
  errors: [],
  failedRequests: [],
  viewports: [],
  heroCheck: {},
  interactions: {},
  reducedMotion: {},
  webglFallback: {},
};

function assert(cond, msg) {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`);
  }
}

let browser = null;
let fallbackBrowser = null;

try {
  await waitForHttp(BASE_URL);

  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });

  // 1) Multi-viewport overflow & rendering check across all target widths
  const widths = [
    [1920, 1080],
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [768, 1024],
    [430, 932],
    [390, 844],
    [360, 800],
  ];

  for (const [w, h] of widths) {
    console.log(`[qa] viewport ${w}x${h}...`);
    const p = await browser.newPage();
    const errs = [];
    p.on('pageerror', (e) => {
      console.error(`[${w}x${h} pageerror]`, e.message);
      errs.push(`pageerror: ${e.message}`);
    });
    p.on('console', (m) => {
      if (m.type() === 'error') {
        console.error(`[${w}x${h} console.error]`, m.text());
        errs.push(`console.error: ${m.text()}`);
      }
    });
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await p.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 45000 });
    await sleep(350);
    const metrics = await p.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const offenders = [];
      const isClippedByInnerMask = (el) => {
        let p = el.parentElement;
        while (p && p.tagName !== 'SECTION' && p.tagName !== 'HEADER' && p !== document.body) {
          const ov = getComputedStyle(p).overflowX;
          if (ov === 'hidden' || ov === 'clip') return true;
          p = p.parentElement;
        }
        return false;
      };
      for (const el of document.querySelectorAll('main *, header *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.right > cw + 0.5 && !isClippedByInnerMask(el)) {
          offenders.push({
            tag: el.tagName,
            cls: el.className?.toString?.() || '',
            right: Math.round(r.right * 10) / 10,
            cw,
            text: (el.textContent || '').trim().slice(0, 40),
          });
          if (offenders.length >= 6) break;
        }
      }
      return {
        innerWidth: window.innerWidth,
        docWidth: cw,
        scrollWidth: document.documentElement.scrollWidth,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - cw),
        scrollHeight: document.body.scrollHeight,
        introDone: Boolean(window.__asrar?.app?.introDone),
        canvasCount: document.querySelectorAll('canvas').length,
        offenders,
      };
    });
    report.viewports.push({ width: w, height: h, ...metrics, errs });
    if (errs.length) report.errors.push(...errs.map((x) => `[${w}x${h}] ${x}`));
    if (metrics.overflowPx > 0) {
      console.error(`OVERFLOW at ${w}x${h}: ${metrics.overflowPx}px`, JSON.stringify(metrics.offenders));
    }
    assert(metrics.introDone, `BootIntro did not complete at ${w}x${h}`);
    await p.close();
  }

  // 2) Full 1440x900 deep desktop choreography, scene screenshots & interactions
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => report.errors.push(`desktop pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') report.errors.push(`desktop console.error: ${m.text()}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) {
      report.failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, '00-boot.png') });

  await page.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(800);

  const heroAtTop = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const cr = canvas ? canvas.getBoundingClientRect() : null;
    const footRect = document.querySelector('.hero__foot')?.getBoundingClientRect() || null;
    const actionsRect = document.querySelector('.hero__actions')?.getBoundingClientRect() || null;
    const portraitImg = document.querySelector('.hero-portrait__img');
    const portraitRect = document.querySelector('.hero-portrait')?.getBoundingClientRect() || null;
    return {
      webgl: Boolean(window.__asrar?.app?.webgl),
      intro: window.__asrar?.scenes?.hero?.intro ?? null,
      progress: window.__asrar?.scenes?.hero?.progress ?? null,
      canvasRect: cr ? { w: cr.width, h: cr.height } : null,
      footBottom: footRect ? Math.round(footRect.bottom) : null,
      actionsBottom: actionsRect ? Math.round(actionsRect.bottom) : null,
      portraitLoaded: Boolean(portraitImg && portraitImg.complete && portraitImg.naturalWidth > 0),
      portraitNaturalWidth: portraitImg ? portraitImg.naturalWidth : 0,
      portraitNaturalHeight: portraitImg ? portraitImg.naturalHeight : 0,
      portraitRect: portraitRect
        ? {
            x: Math.round(portraitRect.left),
            y: Math.round(portraitRect.top),
            w: Math.round(portraitRect.width),
            h: Math.round(portraitRect.height),
          }
        : null,
      activeLabel: document.querySelector('.nav__status span')?.textContent || '',
    };
  });
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero.png') });
  assert(heroAtTop.webgl, 'Expected WebGL to be active on desktop');
  assert(heroAtTop.canvasRect && heroAtTop.canvasRect.w > 1200, 'Expected fullscreen WebGL Stage3D canvas');
  assert(heroAtTop.portraitLoaded && heroAtTop.portraitNaturalWidth === 576, `Expected hero portrait 576px wide loaded (got ${heroAtTop.portraitNaturalWidth}x${heroAtTop.portraitNaturalHeight})`);
  assert(heroAtTop.actionsBottom && heroAtTop.actionsBottom <= 900, `Expected Hero CTA actions above fold (got bottom=${heroAtTop.actionsBottom})`);
  assert(heroAtTop.footBottom && heroAtTop.footBottom <= 900, `Expected Hero foot above fold (got bottom=${heroAtTop.footBottom})`);

  // Move pointer directly onto the portrait face/shoulder area to trigger spotlight + ASCII hover lens
  const pr = heroAtTop.portraitRect;
  const hoverX = pr ? Math.round(pr.x + pr.w * 0.45) : 1040;
  const hoverY = pr ? Math.round(pr.y + pr.h * 0.44) : 410;
  await page.mouse.move(hoverX, hoverY, { steps: 10 });
  await sleep(380);
  heroAtTop.pointerActiveAfterHover = await page.evaluate(() => Boolean(window.__asrar?.pointer?.active));
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero-hover.png') });

  // Scroll into Hero camera dive midpoint (~750px) & check progress advances + reverse scroll returns
  await page.evaluate(() => window.scrollTo({ top: 750, behavior: 'instant' }));
  await sleep(600);
  const heroMidDive = await page.evaluate(() => ({
    progress: window.__asrar?.scenes?.hero?.progress ?? 0,
    camReadout: document.querySelector('.hero__cad')?.textContent || '',
  }));
  await page.screenshot({ path: path.join(OUT_DIR, '01b-hero-mid-dive.png') });

  // Reverse scroll back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(550);
  const heroReversed = await page.evaluate(() => ({
    progress: window.__asrar?.scenes?.hero?.progress ?? 0,
  }));

  report.heroCheck = { heroAtTop, heroMidDive, heroReversed };
  assert(heroMidDive.progress > 0.25, `Hero dive progress did not advance on scroll (got ${heroMidDive.progress})`);
  assert(heroReversed.progress < 0.08, `Hero scroll did not reverse smoothly (got ${heroReversed.progress})`);

  // Helper to jump cleanly to each scene anchor & capture full screenshot
  const captureScene = async (id, fileName, extraScroll = 0) => {
    await page.evaluate(
      (sel, off) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY + off;
        window.scrollTo({ top: y, behavior: 'instant' });
      },
      id,
      extraScroll
    );
    await sleep(650);
    const label = await page.evaluate(() => document.querySelector('.nav__status span')?.textContent || '');
    await page.screenshot({ path: path.join(OUT_DIR, fileName) });
    return label;
  };

  report.interactions.aboutLabel = await captureScene('#scene-about', '02-about.png', 20);
  report.interactions.workIntroLabel = await captureScene('#scene-work-intro', '03-work-intro.png', 40);

  // Scene 04 SpendSense + interactive architecture tab click
  report.interactions.spendLabel = await captureScene('#scene-spendsense', '04-spendsense.png', 60);
  const spendTabs = await page.$$('#scene-spendsense .spend-layer');
  if (spendTabs.length >= 3) {
    await spendTabs[2].click();
    await sleep(250);
    report.interactions.spendActiveLayer = await page.$eval(
      '#scene-spendsense .spend-console__float',
      (el) => el.textContent
    );
  }

  // Scene 05 SignSense + ASL preset button click + pointer drag
  report.interactions.signLabel = await captureScene('#scene-signsense', '05-signsense.png', 60);
  const poseBtns = await page.$$('#scene-signsense .sign-pose');
  if (poseBtns.length >= 2) {
    await poseBtns[1].click();
    await sleep(250);
    report.interactions.signPoseText = await page.$eval('#scene-signsense .sign-pose.is-active', (el) => el.textContent);
  }

  // Scene 06 MediKiosk + Step & Language toggle
  report.interactions.mediLabel = await captureScene('#scene-medikiosk', '06-medikiosk.png', 60);
  const langBtns = await page.$$('#scene-medikiosk .medi-lang');
  if (langBtns.length >= 2) {
    await langBtns[1].click();
    await sleep(250);
    report.interactions.mediLangActive = await page.$eval('#scene-medikiosk .medi-lang.is-active', (el) => el.textContent);
  }

  // Scene 07 DEVTALKS + flip dossier card + next poster
  report.interactions.dtLabel = await captureScene('#scene-devtalks', '07-devtalks.png', 60);
  const dtCard = await page.$('#scene-devtalks .dt-card');
  if (dtCard) {
    await dtCard.click();
    await sleep(250);
    report.interactions.dtFlipped = await page.$eval('#scene-devtalks .dt-card', (el) => el.classList.contains('is-flipped'));
  }

  // Scene 08 Toolbox + filter + node selection
  report.interactions.toolboxLabel = await captureScene('#scene-toolbox', '08-toolbox.png', 40);

  // Scene 09 DSA Studio + step interaction
  report.interactions.dsaLabel = await captureScene('#scene-dsa', '09-dsa.png', 40);
  const dsaBtns = await page.$$('#scene-dsa .dsa__ctrl-btn');
  for (const b of dsaBtns) {
    const txt = await b.evaluate((el) => el.textContent || '');
    if (txt.includes('STEP')) {
      await b.click();
      await sleep(200);
      report.interactions.dsaStepClicked = true;
      break;
    }
  }

  // Scene 10 Experiment Lab + ASRAR Easter egg overclock
  report.interactions.labLabel = await captureScene('#scene-lab', '10-lab.png', 40);
  await page.keyboard.type('asrar', { delay: 40 });
  await sleep(300);
  report.interactions.labOverclockState = await page.$eval('#scene-lab .lab__hud', (el) => el.textContent);
  await page.screenshot({ path: path.join(OUT_DIR, '10b-lab-overclock.png') });

  // Scene 11 & 12 Direction + Contact
  report.interactions.dirLabel = await captureScene('#scene-direction', '11-direction.png', 40);
  report.interactions.contactLabel = await captureScene('#scene-contact', '12-contact.png', 40);

  // Test Fullscreen Menu open/close
  await page.click('.nav__menu-btn');
  await sleep(450);
  report.interactions.menuOpened = await page.$eval('.fs-menu', (el) => el.classList.contains('is-open'));
  await page.screenshot({ path: path.join(OUT_DIR, '13-menu.png') });
  await page.keyboard.press('Escape');
  await sleep(350);

  // Test Command Palette `/` -> wireframe & blueprint modes -> reset
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(350);
  await page.keyboard.press('/');
  await sleep(250);
  report.interactions.paletteOpened = Boolean(await page.$('.cmd-drawer'));
  await page.type('.cmd-drawer__input', 'wireframe');
  await page.keyboard.press('Enter');
  await sleep(250);
  await page.keyboard.press('/');
  await sleep(200);
  await page.type('.cmd-drawer__input', 'blueprint');
  await page.keyboard.press('Enter');
  await sleep(350);
  report.interactions.blueprintLoud = await page.$eval('.bp-grid', (el) => el.classList.contains('is-loud'));
  await page.screenshot({ path: path.join(OUT_DIR, '14-wireframe-blueprint.png') });

  // Reset wireframe + blueprint
  await page.keyboard.press('/');
  await sleep(200);
  await page.type('.cmd-drawer__input', 'reset');
  await page.keyboard.press('Enter');
  await sleep(350);

  // Test Case Study route (/work/signsense) via Case Study CTA + curtain return
  await page.evaluate(() => {
    const sec = document.querySelector('#scene-signsense');
    if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await sleep(350);
  await page.click('#scene-signsense .btn');
  await page.waitForFunction(() => location.pathname === '/work/signsense', { timeout: 6000 });
  await sleep(1100);
  report.interactions.caseStudyPath = await page.evaluate(() => location.pathname);
  report.interactions.caseStudyHeading = await page.$eval('.case h1', (el) => el.textContent);
  assert(report.interactions.caseStudyPath === '/work/signsense', `Expected /work/signsense, got ${report.interactions.caseStudyPath}`);
  await page.screenshot({ path: path.join(OUT_DIR, '15-case-study.png') });

  // Return to Exhibition via Case Study back button
  await page.click('.case button');
  await page.waitForFunction(() => location.pathname === '/', { timeout: 6000 });
  await sleep(900);
  report.interactions.returnedPath = await page.evaluate(() => location.pathname);
  assert(report.interactions.returnedPath === '/', `Expected return to '/', got ${report.interactions.returnedPath}`);
  await page.close();

  // 3) Tablet (768x1024) & Mobile (390x844, 360x800) captures
  const tPage = await browser.newPage();
  await tPage.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  tPage.on('pageerror', (e) => report.errors.push(`tablet pageerror: ${e.message}`));
  await tPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await tPage.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(800);
  await tPage.screenshot({ path: path.join(OUT_DIR, '16b-tablet-hero.png') });
  await tPage.close();

  const mPage = await browser.newPage();
  await mPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  mPage.on('pageerror', (e) => report.errors.push(`mobile pageerror: ${e.message}`));
  await mPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mPage.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(800);
  await mPage.screenshot({ path: path.join(OUT_DIR, '16-mobile-hero.png') });
  await mPage.evaluate(() => {
    const el = document.querySelector('#scene-spendsense');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await sleep(500);
  await mPage.screenshot({ path: path.join(OUT_DIR, '17-mobile-project.png') });
  await mPage.evaluate(() => {
    const el = document.querySelector('#scene-contact');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await sleep(500);
  await mPage.screenshot({ path: path.join(OUT_DIR, '18-mobile-contact.png') });
  await mPage.close();

  const mSmallPage = await browser.newPage();
  await mSmallPage.setViewport({ width: 360, height: 800, deviceScaleFactor: 1 });
  mSmallPage.on('pageerror', (e) => report.errors.push(`mobile360 pageerror: ${e.message}`));
  await mSmallPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mSmallPage.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(800);
  await mSmallPage.screenshot({ path: path.join(OUT_DIR, '16c-mobile360-hero.png') });
  await mSmallPage.close();

  // 4) prefers-reduced-motion: reduce emulation
  const rPage = await browser.newPage();
  await rPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await rPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await rPage.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(300);
  report.reducedMotion = await rPage.evaluate(() => ({
    introDoneImmediately: Boolean(window.__asrar?.app?.introDone),
    reducedFlag: Boolean(window.__asrar?.app?.reducedMotion),
  }));
  assert(report.reducedMotion.introDoneImmediately, 'BootIntro should skip immediately under prefers-reduced-motion');
  await rPage.close();

  // 5) WebGL disabled fallback verification (--disable-webgl)
  console.log('[qa] testing WebGL fallback...');
  fallbackBrowser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--disable-webgl', '--disable-webgl2', '--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 },
  });
  const wPage = await fallbackBrowser.newPage();
  const webglErrs = [];
  wPage.on('pageerror', (e) => webglErrs.push(e.message));
  await wPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wPage.waitForFunction(() => Boolean(window.__asrar?.app?.introDone), { timeout: 25000 });
  await sleep(450);
  report.webglFallback = await wPage.evaluate(() => ({
    webglDetected: Boolean(window.__asrar?.app?.webgl),
    hasFallbackEl: Boolean(document.querySelector('.webgl-fallback')),
    heroTextVisible: Boolean(document.querySelector('#scene-hero')?.textContent?.includes('BUILDING')),
  }));
  assert(!report.webglFallback.webglDetected, 'Expected webglDetected=false under --disable-webgl');
  assert(report.webglFallback.hasFallbackEl, 'Expected .webgl-fallback element when WebGL disabled');
  assert(report.webglFallback.heroTextVisible, 'Expected hero headline visible under WebGL fallback');
  assert(webglErrs.length === 0, `Unexpected runtime errors with WebGL disabled: ${webglErrs.join('; ')}`);
  await wPage.close();

  fs.writeFileSync(path.join(OUT_DIR, 'qa-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  for (const vp of report.viewports) {
    assert(vp.overflowPx === 0 && vp.offenders.length === 0, `Horizontal overflow at ${vp.width}x${vp.height}: ${vp.overflowPx}px (${JSON.stringify(vp.offenders)})`);
  }

  if (report.errors.length > 0 || report.failedRequests.length > 0) {
    throw new Error(`Errors/4xx detected: errors=${report.errors.length}, failedRequests=${report.failedRequests.length}`);
  }
} finally {
  if (browser) await browser.close().catch(() => {});
  if (fallbackBrowser) await fallbackBrowser.close().catch(() => {});
  if (viteProc && !viteProc.killed) {
    viteProc.kill('SIGTERM');
  }
}

