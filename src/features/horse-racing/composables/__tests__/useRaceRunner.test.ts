import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Round, Horse } from '../../types'
import { RoundStatus } from '../../types'
import {
  createTimer,
  calcDurations,
  calcRemaining,
  MIN_DURATION,
  MAX_DURATION,
} from '../../utils/raceUtils'

// --- Fixtures ---
const makeHorse = (id: number, condition: number): Horse => ({
  id,
  name: `Horse ${id}`,
  color: `hsl(${id * 18}, 70%, 55%)`,
  condition,
})

const makeRound = (horses: Horse[]): Round => ({
  id: 1,
  lap: 1,
  distance: 1200,
  horses,
  status: RoundStatus.Pending,
})

describe('createTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('promise resolves after the specified duration', async () => {
    const timer = createTimer(1000)
    const resolved = vi.fn()
    timer.promise.then(resolved)

    vi.advanceTimersByTime(999)
    await Promise.resolve()
    expect(resolved).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    await Promise.resolve()
    expect(resolved).toHaveBeenCalled()
  })

  it('cancel() rejects the promise with "paused"', async () => {
    const timer = createTimer(5000)
    let rejection: string | undefined

    timer.promise.catch((reason) => {
      rejection = reason
    })

    timer.cancel()
    await Promise.resolve()
    expect(rejection).toBe('paused')
  })

  it('cancel() prevents the promise from resolving', async () => {
    const timer = createTimer(1000)
    const resolved = vi.fn()
    timer.promise.then(resolved).catch(() => {})

    timer.cancel()
    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    expect(resolved).not.toHaveBeenCalled()
  })
})

describe('calcDurations', () => {
  it('returns one entry per horse', () => {
    const round = makeRound([makeHorse(1, 50), makeHorse(2, 80)])
    const durations = calcDurations(round)
    expect(Object.keys(durations)).toHaveLength(2)
    expect(durations[1]).toBeDefined()
    expect(durations[2]).toBeDefined()
  })

  it('all durations are integers', () => {
    const round = makeRound([makeHorse(1, 50), makeHorse(2, 99)])
    const durations = calcDurations(round)
    Object.values(durations).forEach((d) => {
      expect(Number.isInteger(d)).toBe(true)
    })
  })

  it('horse with condition=100 has shorter duration than condition=1', () => {
    // Run multiple times to account for random noise
    const results: boolean[] = []
    for (let i = 0; i < 20; i++) {
      const round = makeRound([makeHorse(1, 100), makeHorse(2, 1)])
      const durations = calcDurations(round)
      results.push((durations[1] as number) < (durations[2] as number))
    }
    // Should be true in vast majority of runs (noise is ±10%)
    const trueCount = results.filter(Boolean).length
    expect(trueCount).toBeGreaterThanOrEqual(15)
  })

  it('durations scale with distance — 2200m longer than 1200m', () => {
    const horses = [makeHorse(1, 50)]
    const round1200 = { ...makeRound(horses), distance: 1200 }
    const round2200 = { ...makeRound(horses), distance: 2200 }

    let sum1200 = 0
    let sum2200 = 0
    for (let i = 0; i < 20; i++) {
      sum1200 += calcDurations(round1200)[1] as number
      sum2200 += calcDurations(round2200)[1] as number
    }
    expect(sum2200).toBeGreaterThan(sum1200)
  })

  it('durations are within the expected scaled range (noise ±10%)', () => {
    // At distance=2200m (MAX_DISTANCE), range should be [MIN..MAX] with noise
    const round = { ...makeRound([makeHorse(1, 100), makeHorse(2, 1)]), distance: 2200 }
    for (let i = 0; i < 10; i++) {
      const durations = calcDurations(round)
      // condition=100 → base=MIN_DURATION, with noise: [MIN*0.9, MIN*1.1]
      expect(durations[1]).toBeGreaterThanOrEqual(MIN_DURATION * 0.9)
      expect(durations[1]).toBeLessThanOrEqual(MIN_DURATION * 1.1 + 1)
      // condition=1 → base=MAX_DURATION, with noise: [MAX*0.9, MAX*1.1]
      expect(durations[2]).toBeGreaterThanOrEqual(MAX_DURATION * 0.9)
      expect(durations[2]).toBeLessThanOrEqual(MAX_DURATION * 1.1 + 1)
    }
  })
})

describe('calcRemaining (pauseRace logic)', () => {
  it('subtracts elapsed from each horse duration', () => {
    const durations = { 1: 10000, 2: 15000 }
    const remaining = calcRemaining(durations, 3000)
    expect(remaining[1]).toBe(7000)
    expect(remaining[2]).toBe(12000)
  })

  it('clamps to 0 if elapsed exceeds duration', () => {
    const durations = { 1: 5000 }
    const remaining = calcRemaining(durations, 8000)
    expect(remaining[1]).toBe(0)
  })

  it('returns all horse entries', () => {
    const durations = { 1: 10000, 2: 12000, 3: 9000 }
    const remaining = calcRemaining(durations, 1000)
    expect(Object.keys(remaining)).toHaveLength(3)
  })
})
