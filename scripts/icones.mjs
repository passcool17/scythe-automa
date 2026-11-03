// Génère les icônes PNG à partir de public/icones/icone.svg (npm run icones).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const svg = readFileSync(new URL('../public/icones/icone.svg', import.meta.url), 'utf8');
const navigateur = await chromium.launch();
const page = await navigateur.newPage();
for (const [taille, nom, marge] of [[192, 'icone-192.png', 0], [512, 'icone-512.png', 0], [512, 'icone-maskable-512.png', 0.12]]) {
  await page.setViewportSize({ width: taille, height: taille });
  const interieur = Math.round(taille * (1 - 2 * marge));
  await page.setContent(`<body style="margin:0;background:#3b2f22;display:grid;place-items:center;height:${taille}px">
    <div style="width:${interieur}px;height:${interieur}px">${svg.replace('<svg ', `<svg width="${interieur}" height="${interieur}" `)}</div></body>`);
  await page.screenshot({ path: `public/icones/${nom}`, omitBackground: marge === 0 });
}
await navigateur.close();
