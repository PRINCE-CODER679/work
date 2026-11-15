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
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  });
  try {
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(BASE_URL, ['camera']);
  } catch {}

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
    const actionsRect = document.querySelector('.hero-film__actions')?.getBoundingClientRect() || null;
    const flankRightRect = document.querySelector('.hero-film__flank--right')?.getBoundingClientRect() || null;
    const tex = window.__asrar?.heroTexture || null;
    return {
      webgl: Boolean(window.__asrar?.app?.webgl),
      intro: window.__asrar?.scenes?.hero?.intro ?? null,
      progress: window.__asrar?.scenes?.hero?.progress ?? null,
      canvasRect: cr ? { w: Math.round(cr.width), h: Math.round(cr.height) } : null,
      flankRightBottom: flankRightRect ? Math.round(flankRightRect.bottom) : null,
      actionsBottom: actionsRect ? Math.round(actionsRect.bottom) : null,
      portraitLoaded: Boolean(tex?.loaded),
      portraitNaturalWidth: tex?.width || 0,
      portraitNaturalHeight: tex?.height || 0,
      activeLabel: document.querySelector('.nav__status span')?.textContent || '',
    };
  });
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero.png') });
  assert(heroAtTop.webgl, 'Expected WebGL to be active on desktop');
  assert(heroAtTop.canvasRect && heroAtTop.canvasRect.w > 1200, 'Expected fullscreen WebGL Stage3D canvas');
  assert(heroAtTop.portraitLoaded && heroAtTop.portraitNaturalWidth >= 700, `Expected 3D hero portrait loaded in WebGL (got ${heroAtTop.portraitNaturalWidth}x${heroAtTop.portraitNaturalHeight})`);
  assert(heroAtTop.actionsBottom && heroAtTop.actionsBottom <= 900, `Expected Hero CTA actions above fold (got bottom=${heroAtTop.actionsBottom})`);

  // Move pointer across upper-center portrait rig to trigger rim sweep & camera parallax
  await page.mouse.move(720, 420, { steps: 12 });
  await sleep(380);
  heroAtTop.pointerActiveAfterHover = await page.evaluate(() => Boolean(window.__asrar?.pointer?.active));
  assert(heroAtTop.pointerActiveAfterHover, 'Expected pointer.active to become true on Hero hover');
  await page.screenshot({ path: path.join(OUT_DIR, '01-hero-hover.png') });

  // Verify keyboard Tab focus lands cleanly on an interactive element
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  heroAtTop.keyboardFocusTag = await page.evaluate(() => document.activeElement?.tagName || '');

  // Scroll into Hero camera dive midpoint (~750px) & check progress advances + reverse scroll returns
  await page.evaluate(() => window.scrollTo({ top: 750, behavior: 'instant' }));
  await sleep(600);
  const heroMidDive = await page.evaluate(() => ({
    progress: window.__asrar?.scenes?.hero?.progress ?? 0,
    camReadout: document.querySelector('.hero-film__telemetry--right')?.textContent || '',
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

  // Scene 03 Selected Work: Kai Marlow 3D Project Ring
  report.interactions.workIntroLabel = await captureScene('#scene-work-intro', '03-work-intro.png', 40);
  report.interactions.ringSlots = await page.$$eval('#scene-work-intro .ring-slot', (els) => els.length);
  assert(report.interactions.ringSlots === 3, `Expected exactly 3 project cards in 3D ring (got ${report.interactions.ringSlots})`);

  // Verify DEVTALKS is NOT in the 3D ring
  const ringTitles = await page.$$eval('#scene-work-intro .ring-card__title', (els) => els.map((e) => e.textContent));
  report.interactions.ringTitles = ringTitles;
  assert(!ringTitles.some((t) => t.includes('DEVTALKS')), 'DEVTALKS must NOT be present in 3D project ring');
  assert(ringTitles.some((t) => t.includes('SPENDSENSE')), 'SPENDSENSE must be present in 3D project ring');
  assert(ringTitles.some((t) => t.includes('SIGNSENSE')), 'SIGNSENSE must be present in 3D project ring');
  assert(ringTitles.some((t) => t.includes('MEDIKIOSK')), 'MEDIKIOSK must be present in 3D project ring');

  // Test ring rotation step via arrow navigation
  const nextBtn = await page.$('#scene-work-intro .ring-arrow-btn[data-cursor="NEXT"]');
  if (nextBtn) {
    await nextBtn.click();
    await sleep(400);
    report.interactions.ringRotatedNext = true;
  }

  // Snap to SignSense (index 1) and test physical 3D card flip
  const pips = await page.$$('#scene-work-intro .ring-pip');
  if (pips.length >= 2) {
    await pips[1].click(); // Snap to SignSense
    await sleep(400);
  }

  // Click active front card to flip
  const activeCard = await page.$('#scene-work-intro .ring-slot.is-active');
  if (activeCard) {
    await activeCard.click();
    await sleep(500);
    report.interactions.activeCardFlipped = await page.evaluate(() =>
      Boolean(document.querySelector('#scene-work-intro .ring-card-flipper.is-flipped'))
    );
    assert(report.interactions.activeCardFlipped, 'Expected active 3D project card to flip on click');
    await page.screenshot({ path: path.join(OUT_DIR, '03b-ring-flipped.png') });

    // Verify verified links on backface
    const liveHref = await page.$eval('#scene-work-intro .ring-card-flipper.is-flipped .ring-btn--live', (el) => el.href);
    const repoHref = await page.$eval('#scene-work-intro .ring-card-flipper.is-flipped .ring-btn--repo', (el) => el.href);
    assert(liveHref.startsWith('https://'), `Expected valid Live Demo URL (got ${liveHref})`);
    assert(repoHref.includes('github.com/PRINCE-CODER679/'), `Expected valid GitHub repo URL (got ${repoHref})`);

    // Test reverse flip via Escape key
    await page.keyboard.press('Escape');
    await sleep(350);
    const flippedAfterEsc = await page.evaluate(() =>
      Boolean(document.querySelector('#scene-work-intro .ring-card-flipper.is-flipped'))
    );
    assert(!flippedAfterEsc, 'Expected card to flip back to front on Escape');
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

  // Scene 10 Digital World + ASRAR Easter egg overclock + graceful camera fallback
  report.interactions.labLabel = await captureScene('#scene-lab', '10-lab.png', 40);
  report.interactions.labSceneVisible = await page.evaluate(() => Boolean(window.__asrar?.scenes?.lab?.visible));
  report.interactions.labHeadline = await page.$eval('#scene-lab h2', (el) => el.textContent || '');
  assert(report.interactions.labHeadline.toUpperCase().includes('DIGITAL WORLD'), `Expected Digital World headline in Scene 10 (got ${report.interactions.labHeadline})`);
  await page.keyboard.type('asrar', { delay: 40 });
  await sleep(300);
  report.interactions.labOverclockState = await page.$eval('#scene-lab', (el) => Boolean(el.querySelector('.lab__canvas')));
  const labBtns = await page.$$('#scene-lab .lab__ctrl-btn');
  for (const btn of labBtns) {
    const label = await btn.evaluate((el) => el.textContent || '');
    if (label.includes('HAND CONTROL') || label.includes('HAND PAN')) {
      await btn.click();
      await sleep(350);
      report.interactions.labCamNote = await btn.evaluate((el) => el.textContent || '');
      if (report.interactions.labCamNote.includes(': ON')) {
        await btn.click();
        await sleep(150);
      }
      break;
    }
  }
  await page.screenshot({ path: path.join(OUT_DIR, '10b-lab-overclock.png') });

  // Scene 11 & 12 Direction + Contact
  report.interactions.dirLabel = await captureScene('#scene-direction', '11-direction.png', 40);
  report.interactions.contactLabel = await captureScene('#scene-contact', '12-contact.png', 40);
  report.interactions.contactProgress = await page.evaluate(() => window.__asrar?.scenes?.contact?.progress ?? 0);
  assert(report.interactions.contactProgress > 0.1, `Expected Contact finale progress > 0.1 (got ${report.interactions.contactProgress})`);

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
    const sec = document.querySelector('#scene-work-intro');
    if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
  });
  await sleep(350);
  await page.evaluate(() => {
    if (window.__asrar?.openCase) {
      window.__asrar.openCase('signsense');
    }
  });
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
    const el = document.querySelector('#scene-work-intro');
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

