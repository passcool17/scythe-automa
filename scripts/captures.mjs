// Captures d'écran 412×915 (npm run captures, avec « npx vite preview --port 4173 » lancé).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const dossier = process.argv[2] || '../scythe-automa-shots';
mkdirSync(dossier, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-CA' });
const p = await ctx.newPage();
const url = 'http://localhost:4173/';
const neuf = async () => { await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); };
const vers = async (sel) => { await p.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: 'start' })); await p.waitForTimeout(450); };
const photo = (nom) => p.screenshot({ path: `${dossier}/${nom}` });

await neuf();
await photo('1-configuration.png');

await p.locator('[data-champ="niveau"][data-i="0"]').selectOption('automa');
await p.getByRole('button', { name: 'Commencer la partie' }).click();
await p.locator('.piocher').click();
await vers('.carte');
await photo('2-carte-base-rusviet.png');
await vers('.explication');
await photo('2b-explication.png');

await neuf();
await p.locator('[data-champ="faction"][data-i="0"]').selectOption('albion');
await p.locator('[data-champ="niveau"][data-i="0"]').selectOption('automaszyna');
await p.getByRole('button', { name: 'Commencer la partie' }).click();
await p.locator('.piocher').click();
await p.waitForTimeout(450);
await p.evaluate(() => window.scrollTo(0, 0));
await photo('3-invaders-albion.png');
await vers('.ext');
await photo('3b-invaders-albion-jetons.png');

await neuf();
await p.locator('[data-champ="faction"][data-i="0"]').selectOption('togawa');
await p.locator('[data-champ="aeronef"][data-i="0"]').selectOption('bombard');
await p.getByRole('button', { name: 'Commencer la partie' }).click();
await p.locator('.piocher').click();
await vers('.ext.aeronef');
await photo('4-wind-gambit-aeronef.png');

await neuf();
await p.locator('[data-nombre="3"]').click();
await p.locator('[data-champ="faction"][data-i="1"]').selectOption('polania');
await p.locator('[data-champ="niveau"][data-i="2"]').selectOption('ultimaszyna');
await p.getByRole('button', { name: 'Commencer la partie' }).click();
for (let i = 0; i < 3; i++) { await p.locator('.onglets button').nth(i).click(); await p.locator('.piocher').click(); }
await p.locator('.onglets button').nth(1).click();
await p.waitForTimeout(450);
await p.evaluate(() => window.scrollTo(0, 0));
await photo('5-trois-automates.png');
await b.close();
console.log('captures dans', dossier);
