import { expect, test } from '@playwright/test';
import { PiktivPage } from './pages/piktiv.po';

test.describe('Piktiv App', () => {
  let po: PiktivPage;

  test.beforeEach(({ page }) => {
    po = new PiktivPage(page);
  });

  test('has correct title', async ({ page }) => {
    await po.gotoHome();
    await expect(page).toHaveTitle(/Piktiv/);
  });

  test('displays photo stream on home', async () => {
    await po.gotoHome();
    await expect(po.headingDiscover()).toBeVisible({ timeout: 15000 });
    // At least 4 cards (initial load); infinite scroll may load more
    await expect(po.photoCards().nth(3)).toBeVisible({ timeout: 20000 });
  });

  test('navigates to photo detail on card click', async ({ page }) => {
    await po.gotoHome();
    await po.waitForPhotoStream();
    await po.clickFirstPhotoCard();
    await expect(page).toHaveURL(/\/photos\/\d+/, { timeout: 10000 });
    await expect(po.photoDetailContent()).toBeVisible({ timeout: 15000 });
  });

  test('can add photo to favorites', async ({ page }) => {
    await po.gotoHome();
    await po.waitForPhotoStream();
    await po.addFirstPhotoToFavorites();
    await po.navigateToFavorites();
    await expect(page).toHaveURL(/\/favorites/);
    await expect(po.photoCards()).toHaveCount(1, { timeout: 5000 });
  });

  test('shows favorites page', async () => {
    await po.gotoFavorites();
    await expect(po.headingMyFavorites()).toBeVisible({ timeout: 15000 });
  });

  test('header navigation works', async ({ page }) => {
    await po.gotoHome();
    await po.navigateToHome();
    await expect(page).toHaveURL('/');
    await po.navigateToFavorites();
    await expect(page).toHaveURL('/favorites');
  });
});
