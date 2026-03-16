import type { Page } from '@playwright/test';

/**
 * Page Object for Piktiv app - centralized locators and actions.
 * Reuses queries for performance and maintainability.
 */
export class PiktivPage {
  constructor(private readonly page: Page) {}

  // ─── Locators (cached; Playwright evaluates lazily on use)
  readonly headingDiscover = () => this.page.getByRole('heading', { name: /Discover Photos/i });
  readonly headingMyFavorites = () => this.page.getByRole('heading', { name: 'My Favorites' });
  readonly linkFavorites = () => this.page.getByRole('link', { name: /Favorites/i });
  readonly linkPiktiv = () => this.page.getByRole('link', { name: /Piktiv/i }).first();

  readonly grid = () => this.page.locator('.photo-stream__grid');
  readonly photoCards = () => this.page.locator('app-photo-card');
  readonly firstPhotoCard = () => this.photoCards().first();
  readonly firstPhotoCardMedia = () => this.firstPhotoCard().locator('.photo-card__media');
  readonly addToFavoritesBtn = () =>
    this.firstPhotoCard().locator('button[aria-label*="Add to favorites"]');

  readonly cardsOrSkeletons = () =>
    this.page.locator('app-photo-card, .photo-stream__skeleton');
  readonly photoDetailContent = () =>
    this.page.locator('.photo-detail__image, .photo-detail__loading');

  // ─── Actions
  async gotoHome() {
    await this.page.goto('/');
  }

  async gotoFavorites() {
    await this.page.goto('/favorites');
  }

  async waitForPhotoStream(timeout = 10000) {
    await this.page.waitForSelector('app-photo-card', {
      state: 'visible',
      timeout,
    });
  }

  /** Waits for either 4 photo cards or 4 skeletons (initial load state). */
  async waitForPhotoStreamOrSkeletons(timeout = 30000) {
    const locator = this.page.locator('app-photo-card, .photo-stream__skeleton');
    await locator.nth(3).waitFor({ state: 'visible', timeout });
  }

  async clickFirstPhotoCard() {
    await this.firstPhotoCardMedia().click();
  }

  async addFirstPhotoToFavorites() {
    await this.addToFavoritesBtn().click();
  }

  async navigateToFavorites() {
    await this.linkFavorites().click();
  }

  async navigateToHome() {
    await this.linkPiktiv().click();
  }
}
