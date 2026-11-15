// Captures REAL screenshots + visible text of the live projects (for verified case-study copy)
// and pulls public GitHub profile/repo data. Output: public/assets/projects/*.webp, scratch/projects/*.json
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const IMG = 'public/assets/projects';
const DATA = process.argv[2] || 'scratch/projects';
fs.mkdirSync(IMG, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const projects = [
  { id: 'spendsense', url: 'https://spendsense-psi-two.vercel.app/' },
  { id: 'signsense', url: 'https://sign-sense-blush.vercel.app/' },
  { id: 'medikiosk', url: 'https://medikiosk-wine-rho.vercel.app/' },
  { id: 'devtalks', url: 'https://devtalks-beta.vercel.app/' },
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

for (const p of projects) {
  const page = await browser.newPage();
  const out = { ...p, pages: [] };
  try {
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await sleep(4000);
    const grab = async (tag) => {
      const meta = await page.evaluate(() => ({
        url: location.href, title: document.title,
        desc: document.querySelector('meta[name="description"]')?.content,
        text: document.body.innerText.slice(0, 6000),
        links: [...document.querySelectorAll('a')].map((a) => ({ t: a.innerText.trim().slice(0, 50), h: a.href })).slice(0, 80),
        buttons: [...document.querySelectorAll('button')].map((b) => b.innerText.trim().slice(0, 50)).filter(Boolean).slice(0, 40),
        h: document.documentElement.scrollHeight,
        colors: (() => { const cs = getComputedStyle(document.body); return { bg: cs.backgroundColor, fg: cs.color, font: cs.fontFamily }; })(),
      }));
      out.pages.push({ tag, ...meta });
      return meta;
    };
    const m = await grab('home');
    await page.screenshot({ path: path.join(IMG, `${p.id}-01.webp`), type: 'webp', quality: 82 });
    // scrolled shots
    let i = 2;
    for (let y = 900; y < Math.min(m.h, 5400) && i <= 5; y += 900) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await sleep(1400);
      await page.screenshot({ path: path.join(IMG, `${p.id}-0${i}.webp`), type: 'webp', quality: 82 });
      i++;
    }
    // follow internal links (same origin) to discover routes
    const origin = new URL(p.url).origin;
    const internal = [...new Set(m.links.map((l) => l.h).filter((h) => h.startsWith(origin) && h !== p.url && !h.includes('#')))].slice(0, 6);
    let k = 1;
    for (const href of internal) {
      await page.goto(href, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
      await sleep(3000);
      await grab('route:' + href);
      await page.screenshot({ path: path.join(IMG, `${p.id}-r${k}.webp`), type: 'webp', quality: 82 });
      k++;
    }
    // mobile hero
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await sleep(3000);
    await page.screenshot({ path: path.join(IMG, `${p.id}-m1.webp`), type: 'webp', quality: 80 });
  } catch (e) { out.error = String(e); }
  fs.writeFileSync(path.join(DATA, `${p.id}.json`), JSON.stringify(out, null, 2));
  await page.close();
  console.log('captured', p.id);
}
await browser.close();

// GitHub public data
const gh = async (u) => { try { const r = await fetch(u, { headers: { 'User-Agent': 'portfolio-audit' } }); return await r.json(); } catch (e) { return { error: String(e) }; } };
const user = await gh('https://api.github.com/users/PRINCE-CODER679');
const repos = await gh('https://api.github.com/users/PRINCE-CODER679/repos?per_page=100&sort=updated');
const readmes = {};
if (Array.isArray(repos)) {
  for (const r of repos) {
    if (/spend|sign|medi|dev.?talk|portfolio|dsa|leet|asrar/i.test(r.name)) {
      for (const br of [r.default_branch, 'main', 'master']) {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/${r.full_name}/${br}/README.md`);
          if (res.ok) { readmes[r.name] = (await res.text()).slice(0, 8000); break; }
        } catch (e) {}
      }
      try { readmes[r.name + '__languages'] = await gh(r.languages_url); } catch (e) {}
    }
  }
}
const slim = Array.isArray(repos) ? repos.map((r) => ({ name: r.name, desc: r.description, lang: r.language, url: r.html_url, homepage: r.homepage, topics: r.topics, updated: r.pushed_at, fork: r.fork, stars: r.stargazers_count })) : repos;
fs.writeFileSync(path.join(DATA, 'github.json'), JSON.stringify({ user, repos: slim, readmes }, null, 2));
console.log('github done', Array.isArray(repos) ? repos.length : repos);

