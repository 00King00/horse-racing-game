import { test, expect, type Page } from '@playwright/test'

const MOBILE_VIEWPORT = { width: 375, height: 812 }
const ROUND_TIMEOUT = 30000

async function setMobileViewport(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT)
}

async function waitForRoundEnd(page: Page, timeout = ROUND_TIMEOUT) {
  const btn = page.getByRole('button', { name: 'Start' })
  await expect(btn).toBeVisible({ timeout })
  await expect(btn).toBeEnabled({ timeout })
}

test.describe('Horse Racing Game — Mobile (375x812)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await setMobileViewport(page)
  })

  // --- Scenario 1: Mobile layout ---
  test('shows mobile layout — menu button visible, sidebars hidden', async ({ page }) => {
    await expect(page.getByRole('button', { name: '☰' })).toBeVisible()
    await expect(page.locator('.horse-racing__col--left')).toBeHidden()
    await expect(page.locator('.horse-racing__col--right')).toBeHidden()
    await expect(page.locator('.race-track')).toBeVisible()
  })

  // --- Scenario 2: Open overlay ---
  test('opens overlay with HorseList on ☰ click', async ({ page }) => {
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay.locator('.horse-list__title')).toBeVisible()
    await expect(overlay.getByRole('button', { name: '←' })).toBeVisible()
    await expect(overlay.getByRole('button', { name: '→' })).toBeVisible()
    await expect(overlay.locator('.mobile-overlay__dot')).toHaveCount(3)
  })

  // --- Scenario 3: Close overlay ---
  test('closes overlay on second ☰ click', async ({ page }) => {
    await page.getByRole('button', { name: '☰' }).click()
    await expect(page.locator('.mobile-overlay')).toBeVisible()

    await page.getByRole('button', { name: '☰' }).click()
    await expect(page.locator('.mobile-overlay')).toBeHidden()
  })

  // --- Scenario 4: HorseList shows 20 horses after Generate (anchor for subsequent tests) ---
  test('shows 20 horses in overlay HorseList after Generate Program', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')
    await expect(overlay.locator('.horse-list__row')).toHaveCount(20)
  })

  // --- Scenario 5: Slide navigation with arrows ---
  test('navigates slides with → and ← arrows', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')

    await expect(overlay.locator('.horse-list__title')).toBeVisible()

    await overlay.getByRole('button', { name: '→' }).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Program' }),
    ).toBeVisible()

    await overlay.getByRole('button', { name: '→' }).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Results' }),
    ).toBeVisible()

    // Loop back to HorseList
    await overlay.getByRole('button', { name: '→' }).click()
    await expect(overlay.locator('.horse-list__title')).toBeVisible()

    // ← loops back to Results
    await overlay.getByRole('button', { name: '←' }).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Results' }),
    ).toBeVisible()
  })

  // --- Scenario 6: Dot navigation ---
  test('navigates slides by clicking dots', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')
    const dots = overlay.locator('.mobile-overlay__dot')

    // Hide Vue DevTools overlay so it doesn't intercept pointer events on mobile
    await page.evaluate(() => {
      const devtools = document.getElementById('__vue-devtools-container__')
      if (devtools) devtools.style.display = 'none'
    })

    await dots.nth(1).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Program' }),
    ).toBeVisible()

    await dots.nth(2).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Results' }),
    ).toBeVisible()

    await dots.nth(0).click()
    await expect(overlay.locator('.horse-list__title')).toBeVisible()
  })

  // --- Scenario 7: Active dot updates on navigation ---
  test('active dot updates as slide changes', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')
    const dots = overlay.locator('.mobile-overlay__dot')

    await expect(dots.nth(0)).toHaveClass(/mobile-overlay__dot--active/)
    await expect(dots.nth(1)).not.toHaveClass(/mobile-overlay__dot--active/)

    await overlay.getByRole('button', { name: '→' }).click()
    await expect(dots.nth(1)).toHaveClass(/mobile-overlay__dot--active/)
    await expect(dots.nth(0)).not.toHaveClass(/mobile-overlay__dot--active/)
  })

  // --- Scenario 8: Active slide preserved after close/reopen ---
  test('preserves active slide after closing and reopening overlay', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')

    await overlay.getByRole('button', { name: '→' }).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Program' }),
    ).toBeVisible()

    await page.getByRole('button', { name: '☰' }).click()
    await expect(overlay).toBeHidden()

    await page.getByRole('button', { name: '☰' }).click()
    await expect(
      overlay.locator('.round-panel__title').filter({ hasText: 'Program' }),
    ).toBeVisible()
  })

  // --- Scenario 9: Program shows schedule ---
  test('shows round schedule in Program slide after Generate Program', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: '☰' }).click()

    const overlay = page.locator('.mobile-overlay')
    await overlay.getByRole('button', { name: '→' }).click()

    const programPanel = overlay.locator('.round-panel').filter({
      has: page.locator('.round-panel__title', { hasText: 'Program' }),
    })
    await expect(programPanel.locator('.round-panel__round')).toHaveCount(6)
    await expect(programPanel.getByText('1st Lap — 1200m')).toBeVisible()
  })

  // --- Scenario 10: Start/Pause buttons work on mobile ---
  test('Start and Pause buttons work on mobile viewport', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()

    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Program' })).toBeDisabled()

    await page.getByRole('button', { name: 'Pause' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()

    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  })

  // --- Scenario 11: Results appear in overlay after round 1 ---
  test('shows round 1 results in Results slide after first round completes', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    await waitForRoundEnd(page)

    await page.getByRole('button', { name: '☰' }).click()
    const overlay = page.locator('.mobile-overlay')

    await page.evaluate(() => {
      const devtools = document.getElementById('__vue-devtools-container__')
      if (devtools) devtools.style.display = 'none'
    })
    await overlay.locator('.mobile-overlay__dot').nth(2).click()

    const resultsPanel = overlay.locator('.round-panel').filter({
      has: page.locator('.round-panel__title', { hasText: 'Results' }),
    })
    const nameCells = resultsPanel
      .locator('.round-panel__round')
      .first()
      .locator('.round-panel__td:not(.round-panel__td--pos)')
      .filter({ hasText: /\w+/ })

    await expect(nameCells).toHaveCount(10, { timeout: 10000 })
  })
})
