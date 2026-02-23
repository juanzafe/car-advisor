import { test, expect, type Page } from '@playwright/test';

const APP_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';

const searchFor = async (page: Page, query: string) => {
  await page.fill('#car-search-input', query);
  await page.getByRole('button', { name: /^(buscar|search)$/i }).click();
};

const waitForCards = async (page: Page) => {
  await page.waitForSelector('[data-testid="car-card-image"]', {
    timeout: 25000,
  });
};

const addCarToComparison = async (page: Page, nth = 0) => {
  await searchFor(page, 'toyota');
  await waitForCards(page);
  const btn = page.locator('[data-testid="compare-btn"]').nth(nth);
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(600);
};

test.describe('SearchBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('search input is visible on load', async ({ page }) => {
    await expect(page.locator('#car-search-input')).toBeVisible();
  });

  test('search button is disabled when input is empty', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /^(buscar|search)$/i })
    ).toBeDisabled();
  });

  test('search button enables after typing', async ({ page }) => {
    await page.fill('#car-search-input', 'toyota');
    await expect(
      page.getByRole('button', { name: /^(buscar|search)$/i })
    ).toBeEnabled();
  });

  test('submitting empty input does not trigger search', async ({ page }) => {
    await page.locator('#car-search-input').press('Enter');
    await expect(page.locator('[class*="animate-pulse"]')).not.toBeVisible();
  });

  test('loading skeleton appears while searching', async ({ page }) => {
    await page.fill('#car-search-input', 'bmw');
    await page.getByRole('button', { name: /^(buscar|search)$/i }).click();
    await expect(page.locator('[class*="animate-pulse"]').first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('results appear after a valid search', async ({ page }) => {
    await searchFor(page, 'toyota');
    await waitForCards(page);
    await expect(
      page.locator('[data-testid="car-card-image"]').first()
    ).toBeVisible();
  });
});

test.describe('PreferenceFilters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('preference sliders are visible', async ({ page }) => {
    await expect(page.locator('input[type="range"]').first()).toBeVisible();
  });

  test('min power slider changes value', async ({ page }) => {
    const slider = page.locator('input[name="minPower"]');
    await slider.fill('300');
    await expect(slider).toHaveValue('300');
  });

  test('max consumption slider changes value', async ({ page }) => {
    const slider = page.locator('input[name="maxConsumption"]');
    await slider.fill('6');
    await expect(slider).toHaveValue('6');
  });

  test('max price slider changes value', async ({ page }) => {
    const slider = page.locator('input[name="maxPrice"]');
    await slider.fill('60000');
    await expect(slider).toHaveValue('60000');
  });

  test('traction select has expected options', async ({ page }) => {
    const select = page.locator('select[name="preferredTraction"]');
    await expect(select).toBeVisible();
    const options = await select.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(4);
  });

  test('traction select changes correctly', async ({ page }) => {
    const select = page.locator('select[name="preferredTraction"]');
    await select.selectOption('AWD');
    await expect(select).toHaveValue('AWD');
  });
});

test.describe('CarsGrid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('empty state message shows before any search', async ({ page }) => {
    await expect(
      page.getByText(/busca una marca|search for a brand/i)
    ).toBeVisible();
  });

  test('cards render after search', async ({ page }) => {
    await searchFor(page, 'ford');
    await waitForCards(page);
    expect(
      await page.locator('[data-testid="car-card-image"]').count()
    ).toBeGreaterThan(0);
  });

  test('each card shows the searched brand name', async ({ page }) => {
    await searchFor(page, 'bmw');
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll('.grid .rounded-2xl')).some((c) =>
          c.textContent?.toUpperCase().includes('BMW')
        ),
      { timeout: 15000 }
    );
    const text = await page.locator('.grid .rounded-2xl').first().textContent();
    expect(text?.toUpperCase()).toContain('BMW');
  });

  test('compare button is present on cards', async ({ page }) => {
    await searchFor(page, 'audi');
    await waitForCards(page);
    const btn = page.locator('[data-testid="compare-btn"]').first();
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible();
  });
});

test.describe('CarCard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await searchFor(page, 'mercedes');
    await waitForCards(page);
  });

  test('color swatches are visible', async ({ page }) => {
    const swatch = page.locator('button[title="white"]').first();
    await swatch.scrollIntoViewIfNeeded();
    await expect(swatch).toBeVisible();
  });

  test('clicking compare adds car to comparison panel', async ({ page }) => {
    const btn = page.locator('[data-testid="compare-btn"]').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(page.locator('[data-testid="comparison-panel"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('compare button becomes disabled after adding to comparison', async ({
    page,
  }) => {
    const btn = page.locator('[data-testid="compare-btn"]').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(btn).toBeDisabled({ timeout: 5000 });
  });

  test('clicking a card image opens the modal', async ({ page }) => {
    const imageWrapper = page.locator('[data-testid="car-card-image"]').first();
    await imageWrapper.scrollIntoViewIfNeeded();
    await imageWrapper.click();
    await expect(page.locator('[data-testid="car-modal"]')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('CarModal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await searchFor(page, 'porsche');
    await waitForCards(page);
    const imageWrapper = page.locator('[data-testid="car-card-image"]').first();
    await imageWrapper.scrollIntoViewIfNeeded();
    await imageWrapper.click();
    await page.waitForSelector('[data-testid="car-modal"]', { timeout: 8000 });
  });

  test('modal is visible after opening', async ({ page }) => {
    await expect(page.locator('[data-testid="car-modal"]')).toBeVisible();
  });

  test('modal shows car model name', async ({ page }) => {
    const text = await page.locator('[data-testid="car-modal"]').textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('close button dismisses the modal', async ({ page }) => {
    await page.locator('[data-testid="car-modal-close"]').click();
    await expect(page.locator('[data-testid="car-modal"]')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('clicking backdrop closes the modal', async ({ page }) => {
    await page.locator('[data-testid="car-modal-backdrop"]').click();
    await expect(page.locator('[data-testid="car-modal"]')).not.toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('ComparisonGrid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('comparison panel appears after adding a car', async ({ page }) => {
    await addCarToComparison(page, 0);
    await expect(page.locator('[data-testid="comparison-panel"]')).toBeVisible({
      timeout: 5000,
    });
  });

  test('comparison count badge shows correct number', async ({ page }) => {
    await addCarToComparison(page, 0);
    const badge = page
      .locator('[data-testid="comparison-panel"] span.rounded-full')
      .first();
    await expect(badge).toHaveText('1', { timeout: 5000 });
  });

  test('clear all button removes the comparison panel', async ({ page }) => {
    await addCarToComparison(page, 0);
    const clearBtn = page.locator('[data-testid="clear-comparison"]');
    await clearBtn.scrollIntoViewIfNeeded();
    await clearBtn.click();
    await expect(
      page.locator('[data-testid="comparison-panel"]')
    ).not.toBeVisible({ timeout: 3000 });
  });

  test('radar chart renders inside comparison panel', async ({ page }) => {
    await addCarToComparison(page, 0);
    await expect(
      page.locator('[data-testid="comparison-panel"] .recharts-surface').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('winner cards are shown in comparison panel', async ({ page }) => {
    await addCarToComparison(page, 0);
    await expect(
      page
        .locator('[data-testid="comparison-panel"]')
        .getByText(/el mejor|best/i)
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Language switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('ES and EN buttons are present', async ({ page }) => {
    await expect(page.locator('[data-testid="lang-es"]')).toBeVisible();
    await expect(page.locator('[data-testid="lang-en"]')).toBeVisible();
  });

  test('switching to EN changes search button label', async ({ page }) => {
    await page.locator('[data-testid="lang-en"]').click();
    await page.fill('#car-search-input', 'honda');
    await expect(page.getByRole('button', { name: /^search$/i })).toBeVisible();
  });

  test('switching back to ES restores Spanish labels', async ({ page }) => {
    await page.locator('[data-testid="lang-en"]').click();
    await page.locator('[data-testid="lang-es"]').click();
    await page.fill('#car-search-input', 'honda');
    await expect(page.getByRole('button', { name: /^buscar$/i })).toBeVisible();
  });
});

test.describe('Privacy policy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('privacy link is in the footer', async ({ page }) => {
    await expect(
      page
        .locator('footer')
        .getByRole('button', { name: /privacidad|privacy/i })
    ).toBeVisible();
  });

  test('clicking privacy link shows privacy page content', async ({ page }) => {
    await page
      .locator('footer')
      .getByRole('button', { name: /privacidad|privacy/i })
      .click();
    await expect(page.locator('main')).not.toContainText(
      /busca una marca|search for a brand/i
    );
  });
});

test.describe('Basic accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('page has a non-empty title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('search input has an accessible label', async ({ page }) => {
    await expect(page.locator('#car-search-input')).toBeVisible();
    await expect(page.locator('label[for="car-search-input"]')).toBeAttached();
  });

  test('range inputs have associated labels', async ({ page }) => {
    for (const id of [
      'min-power-range',
      'max-consumption-range',
      'max-price-range',
    ]) {
      await expect(page.locator(`label[for="${id}"]`)).toBeAttached();
    }
  });

  test('traction select has an accessible label', async ({ page }) => {
    await expect(page.locator('label[for="traction-select"]')).toBeAttached();
  });
});
