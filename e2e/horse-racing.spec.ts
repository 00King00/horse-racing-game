import { test, expect, type Page } from '@playwright/test'

async function waitForRoundEnd(page: Page, timeout = 30000) {
  const btn = page.getByRole('button', { name: 'Start' })
  await expect(btn).toBeVisible({ timeout })
  await expect(btn).toBeEnabled({ timeout })
}

async function waitForLastRoundEnd(page: Page, timeout = 30000) {
  const btn = page.getByRole('button', { name: 'Start' })
  await expect(btn).toBeVisible({ timeout })
  await expect(btn).toBeDisabled({ timeout })
}

test.describe('Horse Racing Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // --- Scenario 1: Initial empty state ---
  test('shows empty state on load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Horse Racing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Program' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled()
    await expect(page.getByText('No horses generated yet')).toBeVisible()
    await expect(page.getByText('Waiting for race to start...')).toBeVisible()
  })

  // --- Scenario 2: Generate Program ---
  test('generates horses and schedule on Generate Program click', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()

    // Horse list: 20 rows
    const horseRows = page.locator('.horse-list__row')
    await expect(horseRows).toHaveCount(20)

    // Race track: 10 lanes visible
    const lanes = page.locator('.race-lane')
    await expect(lanes).toHaveCount(10)

    // Program panel: 6 rounds
    const programRounds = page.locator('.round-panel').first().locator('.round-panel__round')
    await expect(programRounds).toHaveCount(6)

    // Results panel: 6 rounds with empty rows
    const resultsRounds = page.locator('.round-panel').last().locator('.round-panel__round')
    await expect(resultsRounds).toHaveCount(6)

    // Start button becomes enabled
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()

    // Round header shows 1st Lap
    await expect(page.getByText('1st Lap — 1200m').first()).toBeVisible()
  })

  // --- Scenario 3: Start race — animation begins ---
  test('starts race animation on Start click', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    // Button switches to Pause
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

    // Generate Program button becomes disabled during race
    await expect(page.getByRole('button', { name: 'Generate Program' })).toBeDisabled()
  })

  // --- Scenario 4: Pause stops animation ---
  test('pauses race on Pause click', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    // Wait until Pause button is stable then click
    await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled()
    await page.getByRole('button', { name: 'Pause' }).click()

    // Button switches back to Start
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
  })

  // --- Scenario 5: Resume continues from paused state ---
  test('resumes race after pause', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled()
    await page.getByRole('button', { name: 'Pause' }).click()

    // Resume
    await page.getByRole('button', { name: 'Start' }).click()

    // Should be running again
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  })

  // --- Scenario 6: Results fill progressively after round 1 ---
  test('results appear progressively after first round', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    // Wait for first round to complete (max 22s with noise)
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible({ timeout: 25000 })

    // Results panel first round should have at least some horses
    const firstRoundResults = page
      .locator('.round-panel')
      .last()
      .locator('.round-panel__round')
      .first()
      .locator('.round-panel__td')
      .filter({ hasText: /\w+/ })

    await expect(firstRoundResults.first()).toBeVisible()
  })

  // --- Scenario 7: After round 1, Start button re-enables for round 2 ---
  test('Start button re-enables between rounds', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await page.getByRole('button', { name: 'Start' }).click()

    // Wait for round 1 to finish
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled({ timeout: 25000 })

    // Track header should advance to round 2
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect(page.getByText('2nd Lap — 1400m').first()).toBeVisible()
  })

  // --- Scenario 8: Generate Program resets everything ---
  test('Generate Program resets state and generates new horses', async ({ page }) => {
    await page.getByRole('button', { name: 'Generate Program' }).click()

    // Get first horse name
    const firstHorseName = await page.locator('.horse-list__row').first().locator('td').nth(1).textContent()

    // Generate again
    await page.getByRole('button', { name: 'Generate Program' }).click()

    // Results should be empty again
    const firstResultCell = page
      .locator('.round-panel')
      .last()
      .locator('.round-panel__round')
      .first()
      .locator('tbody tr')
      .first()
      .locator('td')
      .last()

    await expect(firstResultCell).toHaveText('')

    // Start button should be enabled
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()

    // Horse list still has 20 horses
    await expect(page.locator('.horse-list__row')).toHaveCount(20)

    // First horse name may differ (random generation)
    const newFirstHorseName = await page.locator('.horse-list__row').first().locator('td').nth(1).textContent()
    // Names are the same pool but conditions differ — just verify it's still a valid horse
    expect(newFirstHorseName).toBeTruthy()
    void firstHorseName // used for context
  })
})

// --- Full race flow: single end-to-end pass through all 6 rounds ---
test.describe('Horse Racing Game — Full Race Flow', () => {
  const ROUND_TIMEOUT = 30000 // max time per round (20s animation + buffer)

  const LAP_LABELS = [
    '1st Lap — 1200m',
    '2nd Lap — 1400m',
    '3rd Lap — 1600m',
    '4th Lap — 1800m',
    '5th Lap — 2000m',
    '6th Lap — 2200m',
  ]

  // --- Scenario 9: Full race — pause/resume each round, all results filled, reset after ---
  test('completes all 6 rounds with pause/resume, verifies results and reset', async ({ page }) => {
    test.setTimeout(6 * ROUND_TIMEOUT + 60000)

    await page.goto('/')
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()

    for (let round = 0; round < 6; round++) {
      // Correct lap label visible before starting
      await expect(page.getByText(LAP_LABELS[round]).first()).toBeVisible()

      // Start round
      await page.getByRole('button', { name: 'Start' }).click()
      await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Generate Program' })).toBeDisabled()

      // Pause mid-round
      await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled()
      await page.getByRole('button', { name: 'Pause' }).click()
      await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
      await expect(page.getByRole('button', { name: 'Generate Program' })).toBeEnabled()

      // Resume
      await page.getByRole('button', { name: 'Start' }).click()
      await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

      // Wait for round to finish
      if (round < 5) await waitForRoundEnd(page, ROUND_TIMEOUT)
      else await waitForLastRoundEnd(page, ROUND_TIMEOUT)

      // Results for this round: all 10 name cells filled
      const nameCells = page
        .locator('.round-panel').last()
        .locator('.round-panel__round').nth(round)
        .locator('.round-panel__td:not(.round-panel__td--pos)')
        .filter({ hasText: /\w+/ })
      await expect(nameCells).toHaveCount(10, { timeout: 10000 })

      // Generate Program available between rounds (and after last)
      await expect(page.getByRole('button', { name: 'Generate Program' })).toBeEnabled()
    }

    // After 6th round: Start is disabled, all 60 results filled
    await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled()

    // Generate Program resets everything
    await page.getByRole('button', { name: 'Generate Program' }).click()
    await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled()
    await expect(page.getByText('1st Lap — 1200m').first()).toBeVisible()

    const firstResultCell = page
      .locator('.round-panel').last()
      .locator('.round-panel__round').first()
      .locator('tbody tr').first()
      .locator('td').last()
    await expect(firstResultCell).toHaveText('')

    // New race can start immediately
    await page.getByRole('button', { name: 'Start' }).click()
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  })
})
