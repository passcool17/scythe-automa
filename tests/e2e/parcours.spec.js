import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('configuration → tour → combat → annuler → sauvegarde', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Scythe Automa/ })).toBeVisible();
  await page.locator('[data-champ="niveau"][data-i="0"]').selectOption('automa');
  await page.getByRole('button', { name: 'Commencer la partie' }).click();

  await expect(page.locator('.piocher')).toBeVisible();
  await page.locator('.piocher').click();
  await expect(page.locator('.carte')).toBeVisible();
  await expect(page.locator('.explication')).toContainText(/Déplacement|Gain|Recrue/);
  await expect(page.getByText('Pioche : 18')).toBeVisible();

  await page.getByRole('button', { name: 'Piocher une carte Combat' }).click();
  await expect(page.locator('.res-combat')).toBeVisible();

  // Annuler deux fois revient au début.
  await page.getByRole('button', { name: /Annuler/ }).click();
  await page.getByRole('button', { name: /Annuler/ }).click();
  await expect(page.getByText('Pioche : 19')).toBeVisible();
  await expect(page.getByRole('button', { name: /Annuler/ })).toBeDisabled();

  // La partie est sauvegardée.
  await page.locator('.piocher').click();
  await page.reload();
  await expect(page.locator('.carte')).toBeVisible();
  await expect(page.getByText('Pioche : 18')).toBeVisible();

  // Nouvelle partie (avec confirmation).
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Nouvelle partie' }).click();
  await expect(page.getByRole('button', { name: 'Commencer la partie' })).toBeVisible();
});

test('3 Automates avec Invaders et aéronef', async ({ page }) => {
  await page.locator('[data-nombre="3"]').click();
  await page.locator('[data-champ="faction"][data-i="1"]').selectOption('albion');
  await page.locator('[data-champ="aeronef"][data-i="1"]').selectOption('bombard');
  await page.locator('[data-champ="faction"][data-i="2"]').selectOption('togawa');
  await page.getByRole('button', { name: 'Commencer la partie' }).click();
  await expect(page.locator('.onglets button')).toHaveCount(3);
  await page.locator('.onglets button').nth(1).click();
  await expect(page.locator('.fiche')).toContainText('Albion');
  await expect(page.locator('.ext').first()).toContainText(/Drapeau/);
  await expect(page.locator('.ext.aeronef')).toContainText('Bombardement');
  await expect(page.locator('.carte-aeronef')).toBeVisible();
  await page.locator('.piocher').click();
  await expect(page.locator('.carte')).toBeVisible();
  await page.locator('.onglets button').nth(2).click();
  await expect(page.locator('.fiche')).toContainText('Togawa');
});

test('mode hors-ligne : manifeste et service worker', async ({ page, context }) => {
  const manifeste = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  expect(manifeste.lang).toBe('fr');
  expect(manifeste.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Scythe Automa/ })).toBeVisible();
  await context.setOffline(false);
});
