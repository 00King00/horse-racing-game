import { test, expect } from '@playwright/test'

/**
 * Smoke tests — run against the deployed production URL.
 * Covers only critical paths: page loads, generate, race starts.
 * Run via: BASE_URL=https://... npm run test:e2e:smoke
 */
test.describe('Smoke — Production', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Horse Racing Game')
    await expect(page.getByRole('heading', { name: 'Horse Racing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Program' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled()
  })

  test('Generate Program works', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()

    await expect(page.locator('.horse-list__row')).toHaveCount(20)
    await expect(page.locator('.race-lane')).toHaveCount(10)
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
  })

  test('race starts and can be paused', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Program' })).toBeDisabled()

    await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled()
    await page.getByRole('button', { name: 'Pause' }).click()

    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
  })
})
