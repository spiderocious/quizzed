// Takes the five store-listing screenshots (375 × 812, portrait, 2x) by
// playing the real game against the local dev server.
//
// The Lagos Life SDK only answers inside their game player, so it is swapped
// for a small stand-in that names the player and hands out dev sessions. The
// screens, the questions and the scoring are the real ones.
//
//   cd <a folder with puppeteer-core installed> && node <this file>
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'noop.js'));
const puppeteer = require('puppeteer-core');

const QUIZ = process.env.QUIZ ?? 'http://localhost:5174';
const OUT = process.env.OUT ?? './listing';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PLAYER = process.env.PLAYER ?? 'Ada';
mkdirSync(OUT, { recursive: true });

const SDK = `
(() => {
  const id = 'shots' + Math.random().toString(36).slice(2, 8);
  const player = { id, name: ${JSON.stringify(PLAYER)}, avatar: null };
  let best = 0;
  const board = () => ({ top: best ? [{ rank: 1, name: player.name, score: best }] : [], me: best ? { rank: 1, label: '#1', score: best } : null });
  window.Vatar = {
    init: async () => ({ player, session: 'dev:' + id + ':' + player.name, mode: 'test' }),
    session: async () => ({ session: 'dev:' + id + ':' + player.name, exp: Date.now() + 9e5 }),
    submitScore: async (n) => { best = Math.max(best, n); return { best, accepted: true }; },
    leaderboard: async () => board(),
    onPause: () => () => {}, onResume: () => () => {},
    purchase: async (productId) => ({ purchaseId: 'dev_' + productId + '_' + Math.random().toString(36).slice(2, 10), productId }),
    purchases: async () => [], onPurchase: () => () => {},
    match: { create: async () => null, join: async () => null, quick: async () => null, current: async () => null, leave: async () => null, onUpdate: () => () => {} },
  };
})();`;

// The right answers, read from the local question bank, so the run shown is a
// good one rather than whatever tapping the first tile happens to score.
const key = (prompt, options) => `${prompt}|${[...options].sort().join('|')}`;
const truth = new Map();
for (const row of execFileSync('mongosh', ['--quiet', process.env.MONGODB_DB ?? 'familytime', '--eval',
  'db.questions.find({}, {_id:0, prompt:1, correct:1, wrong:1}).forEach(q => print(JSON.stringify(q)))'], { maxBuffer: 512 * 1024 * 1024 }).toString().split('\n')) {
  if (row.trim() === '') continue;
  const q = JSON.parse(row);
  truth.set(key(q.prompt, [q.correct, ...q.wrong]), q.correct);
}
// Two honest misses, so it does not read as a perfect score.
const MISSES = new Set([4, 8]);

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setRequestInterception(true);
page.on('request', (request) => {
  if (request.url().includes('/sdk/vatar-games-v1.js')) return request.respond({ status: 200, contentType: 'application/javascript', body: SDK });
  return request.continue();
});

const sees = (text, timeout = 20000) => page.waitForFunction((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), { timeout }, text);
const tap = (text) => page.evaluate((t) => [...document.querySelectorAll('button, a')].find((el) => el.innerText.trim().toLowerCase().includes(t.toLowerCase()) && !el.disabled)?.click(), text);
const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });

await page.goto(QUIZ, { waitUntil: 'networkidle2' });
await sees(`Hello, ${PLAYER}`);
await pause(1200);
await shot('1-home');

await tap('Solo run');
await sees('How hard?');
await pause(900);
await shot('2-choose-your-run');

await tap('Play');
await page.waitForSelector('button[aria-label^="Answer "]:not([disabled])', { timeout: 30000 });
await sees('Get 10 gems');
await tap('Get 10 gems');
await sees('Reveal answer');
await pause(700);
await shot('3-question');

let shotResult = false;
for (let q = 1; q <= 10; q += 1) {
  await page.waitForFunction((n) => document.body.innerText.includes(`${n} / 10`) && document.querySelector('button[aria-label^="Answer "]:not([disabled])'), { timeout: 30000 }, q);
  await pause(900 + Math.round(Math.random() * 900));
  if (q === 1) {
    await tap('Reveal answer');
    await sees('Answer shown');
    await pause(900);
    await shot('4-reveal-an-answer');
    await page.evaluate(() => [...document.querySelectorAll('button[aria-label^="Answer "]')].find((b) => b.innerText.includes('💡'))?.click());
  } else {
    const asked = await page.evaluate(() => ({
      prompt: document.querySelector('[data-testid="question-prompt"]')?.innerText ?? '',
      options: [...document.querySelectorAll('button[aria-label^="Answer "]')].map((b) => b.innerText.trim()),
    }));
    const right = Math.max(0, asked.options.indexOf(truth.get(key(asked.prompt, asked.options))));
    const pick = MISSES.has(q) ? (right + 1) % asked.options.length : right;
    await page.evaluate((index) => document.querySelectorAll('button[aria-label^="Answer "]')[index]?.click(), pick);
  }
  await page.waitForFunction(() => /Correct!|Not quite!|Too slow!|Run complete/.test(document.body.innerText), { timeout: 30000 });
  if (!shotResult && q > 1 && (await page.evaluate(() => document.body.innerText.includes('Correct!')))) {
    await pause(1100);
    await shot('5-correct');
    shotResult = true;
  }
  await page.waitForFunction(() => !/Correct!|Not quite!|Too slow!/.test(document.body.innerText), { timeout: 15000 });
}
await sees('Run complete');
await pause(2600);
await shot('6-run-complete');
console.log(`screenshots in ${OUT}${shotResult ? '' : ' (no correct answer happened this run: 5-correct is missing, run again)'}`);
await browser.close();
