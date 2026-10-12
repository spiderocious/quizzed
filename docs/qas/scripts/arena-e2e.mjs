// Drives the one-phone modes end to end in headless Chrome: a solo run and a
// two-phone duel in the quiz build, and solo inside the Family Time build.
// Every answer is checked against MongoDB.
//
//   QUIZ=http://localhost:5174 PARTY=http://localhost:5173 SHOTS=./shots node arena-e2e.mjs
//
// Needs both web builds and the backend running (outside production, so the
// stand-in platform identity is accepted), mongosh, and puppeteer-core.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'noop.js'));
const puppeteer = require('puppeteer-core');

const QUIZ = process.env.QUIZ ?? 'http://localhost:5174';
const PARTY = process.env.PARTY ?? 'http://localhost:5173';
const SHOTS = process.env.SHOTS ?? './shots';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync(SHOTS, { recursive: true });

const key = (prompt, options) => `${prompt}|${[...options].sort().join('|')}`;
const truth = new Map();
for (const row of execFileSync('mongosh', ['--quiet', process.env.MONGODB_DB ?? 'familytime', '--eval',
  'db.questions.find({}, {_id:0, prompt:1, correct:1, wrong:1}).forEach(q => print(JSON.stringify(q)))'], { maxBuffer: 512 * 1024 * 1024 }).toString().split('\n')) {
  if (row.trim() === '') continue;
  const q = JSON.parse(row);
  truth.set(key(q.prompt, [q.correct, ...q.wrong]), q.correct);
}

const problems = [];
const check = (ok, message) => {
  console.log(ok ? '  ✓' : '  ✗', message);
  if (!ok) problems.push(message);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

async function phone(name) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('console', (msg) => {
    // The Lagos Life SDK is loaded from their site and refuses to start outside
    // their frame; that refusal is the expected path here, not a fault of ours.
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('lagoslife.app') && !text.includes('Vatar')) problems.push(`[${name}] console error: ${text}`);
  });
  page.on('pageerror', (error) => problems.push(`[${name}] page error: ${error.message}`));
  return page;
}

const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const sees = (page, text, timeout = 30000) =>
  page.waitForFunction((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), { timeout }, text);
const clickText = async (page, text) => {
  const handle = await page.waitForFunction(
    (t) => [...document.querySelectorAll('button, a')].find((el) => el.innerText.trim().toLowerCase().includes(t.toLowerCase()) && !el.disabled),
    { timeout: 15000 }, text);
  await handle.click();
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Reads the question on screen and returns the index of the right answer.
async function readQuestion(page) {
  await page.waitForSelector('button[aria-label^="Answer "]:not([disabled])', { timeout: 30000 });
  const asked = await page.evaluate(() => ({
    prompt: document.querySelector('[data-testid="question-prompt"], p.mt-1.font-display')?.innerText ?? '',
    options: [...document.querySelectorAll('button[aria-label^="Answer "]')].map((b) => b.innerText.trim()),
  }));
  const correct = truth.get(key(asked.prompt, asked.options));
  return { ...asked, right: asked.options.indexOf(correct) };
}
const answer = async (page, index) => (await page.$$('button[aria-label^="Answer "]'))[index].click();

// ---------------------------------------------------------------- solo (quiz)
console.log('quiz build · solo run');
const solo = await phone('solo');
await solo.goto(QUIZ, { waitUntil: 'networkidle2' });
await sees(solo, 'Solo run');
const home = await solo.evaluate(() => document.body.innerText);
check(home.includes('Hello, Guest') && home.includes('Preview mode'), 'outside Lagos Life the game says it is in preview mode, with a stand-in player');
check(!home.includes('Host this') && !home.includes('Got a code'), 'the quiz build has no host or join-by-code screens');
await shot(solo, '20-quiz-home');

await clickText(solo, 'Solo run');
await sees(solo, 'How hard?');
check(!(await solo.evaluate(() => document.body.innerText)).includes('Your name'), 'no name is asked for: the platform says who is playing');
await clickText(solo, 'Hard');
await clickText(solo, '10s');
await sees(solo, '×1.56');
check(true, 'Hard on a 10-second clock previews as ×1.56');
await shot(solo, '21-solo-setup');
await clickText(solo, 'Play');

let soloTotal = 0;
for (let q = 1; q <= 10; q += 1) {
  const asked = await readQuestion(solo);
  check(asked.right >= 0, `Q${q}: the question and its four answers are in the database — ${asked.prompt}`);
  if (q === 1) await shot(solo, '22-solo-question');
  await answer(solo, asked.right);
  await sees(solo, 'Correct!');
  const points = await solo.evaluate(() => Number((document.body.innerText.match(/\+([\d,]+)/)?.[1] ?? '0').replace(/,/g, '')));
  // 500 base + up to 500 speed, ×1.56, plus up to 500 streak bonus ×1.56.
  if (points < 780 || points > 2340) problems.push(`Q${q}: ${points} points is outside what ×1.56 can produce`);
  soloTotal += points;
  if (q === 1) await shot(solo, '23-solo-correct');
  await solo.waitForFunction(() => !document.body.innerText.includes('Correct!'), { timeout: 10000 });
}
await sees(solo, 'Run complete');
await pause(1800);
const finalText = await solo.evaluate(() => document.body.innerText);
const shownScore = Number((finalText.match(/([\d,]+)\s*pts/)?.[1] ?? '0').replace(/,/g, ''));
check(finalText.includes('10/10') && finalText.includes('100%'), 'solo final: 10/10, 100%');
check(shownScore === soloTotal, `solo final score ${shownScore} equals the sum of the ten awards (${soloTotal})`);
check(finalText.includes('Play again') && finalText.includes('Settings'), 'the finish offers Play again and Settings');
await shot(solo, '24-solo-final');
await clickText(solo, 'Play again');
await readQuestion(solo);
check(true, 'Play again starts a fresh run with no host');

// ---------------------------------------------------------------- duel (quiz)
console.log('quiz build · duel (two phones, test match)');
const ada = await phone('ada');
const bem = await phone('bem');
const matchName = `e2e-${Date.now()}`;
for (const page of [ada, bem]) {
  await page.goto(`${QUIZ}/duel`, { waitUntil: 'networkidle2' });
  await sees(page, 'Preview mode');
  await page.type('input[aria-label="Test match name"]', matchName);
}
await shot(ada, '25-duel-lobby');
await clickText(ada, 'Join test match');
await sees(ada, 'Match lobby');
await sees(ada, 'Start unlocks when another player joins');
check(await ada.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.innerText.includes('Start match') && b.disabled)), 'alone in the lobby, the first player sees Start but cannot press it');
await shot(ada, '26-duel-waiting');
await clickText(bem, 'Join test match');
await sees(bem, 'Waiting for');
check(!(await bem.evaluate(() => document.body.innerText)).includes('Start match'), 'the second player has no Start button and is told who starts');
await pause(2500);
check((await ada.evaluate(() => document.body.innerText)).includes('Match lobby'), 'nothing starts on its own once both are in');
await shot(bem, '26b-duel-waiting-for-starter');
await clickText(ada, 'Start match');

for (let q = 1; q <= 7; q += 1) {
  const [a, b] = await Promise.all([readQuestion(ada), readQuestion(bem)]);
  check(a.prompt === b.prompt && a.right === b.right && a.right >= 0, `Q${q}: both phones got the same question — ${a.prompt}`);
  if (q === 2) {
    // Leaving mid-match asks first, in the player's own numbers.
    await bem.click('button[aria-label="Leave the game"]');
    await sees(bem, 'Leave the match?');
    const warning = await bem.evaluate(() => document.querySelector('[role="dialog"]').innerText);
    check(/lose this match to/.test(warning) && /pts/.test(warning), `leaving mid-match warns who wins and the scores — ${warning.split('\n')[1]}`);
    await shot(bem, '26c-leave-warning');
    await clickText(bem, 'Keep playing');
    check(!(await bem.evaluate(() => document.querySelector('[role="dialog"]'))), 'Keep playing closes the warning and stays in the match');
  }
  await answer(ada, a.right);
  await answer(bem, (b.right + 1) % 4);
  await sees(ada, 'Correct!');
  await sees(bem, 'Not quite!');
  await Promise.all([ada, bem].map((p) => p.waitForFunction(() => !/Correct!|Not quite!/.test(document.body.innerText), { timeout: 10000 })));
}
await sees(ada, 'You won the match');
await sees(bem, 'won this one');
check(true, 'the right player is told they won, the other that they lost');
await pause(1200);
await shot(ada, '27-duel-won');
await shot(bem, '28-duel-lost');

// ---------------------------------------------------------- solo (Family Time)
console.log('Family Time build · solo');
const party = await phone('party');
await party.goto(PARTY, { waitUntil: 'networkidle2' });
await sees(party, 'Play solo');
check((await party.evaluate(() => document.body.innerText)).includes('Host this'), 'Family Time still has its party screens, plus Play solo');
await clickText(party, 'Play solo');
await sees(party, 'Your name');
await party.type('input[placeholder="e.g. Tobi"]', 'Tobi');
await clickText(party, 'Play');
const first = await readQuestion(party);
check(first.right >= 0, 'standalone solo starts from a typed name and deals a real question');
await shot(party, '29-party-solo');

await browser.close();
if (problems.length > 0) {
  console.error(`\nFAIL · ${problems.length} problem(s)`);
  for (const p of problems) console.error('  -', p);
  process.exit(1);
}
console.log('\nPASS · solo, duel and standalone solo all played through the real UI');
