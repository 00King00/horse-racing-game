import { describe, it, expect } from 'vitest'
import { generateSchedule } from '../scheduleGenerator'
import { generateHorses } from '../horseGenerator'
import { RoundStatus } from '../../types'

describe('generateSchedule', () => {
  const horses = generateHorses()

  it('returns exactly 6 rounds', () => {
    const rounds = generateSchedule(horses)
    expect(rounds).toHaveLength(6)
  })

  it('assigns correct distances in order', () => {
    const rounds = generateSchedule(horses)
    const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
    rounds.forEach((round, i) => {
      expect(round.distance).toBe(expectedDistances[i])
    })
  })

  it('assigns sequential ids and laps from 1 to 6', () => {
    const rounds = generateSchedule(horses)
    rounds.forEach((round, i) => {
      expect(round.id).toBe(i + 1)
      expect(round.lap).toBe(i + 1)
    })
  })

  it('each round has exactly 10 horses', () => {
    const rounds = generateSchedule(horses)
    rounds.forEach((round) => {
      expect(round.horses).toHaveLength(10)
    })
  })

  it('each round has no duplicate horses', () => {
    const rounds = generateSchedule(horses)
    rounds.forEach((round) => {
      const ids = round.horses.map((h) => h.id)
      expect(new Set(ids).size).toBe(10)
    })
  })

  it('all horses in each round come from the original pool', () => {
    const rounds = generateSchedule(horses)
    const horseIds = new Set(horses.map((h) => h.id))
    rounds.forEach((round) => {
      round.horses.forEach((horse) => {
        expect(horseIds.has(horse.id)).toBe(true)
      })
    })
  })

  it('each round starts with status Pending', () => {
    const rounds = generateSchedule(horses)
    rounds.forEach((round) => {
      expect(round.status).toBe(RoundStatus.Pending)
    })
  })

  it('does not mutate the original horses array', () => {
    const originalIds = horses.map((h) => h.id)
    generateSchedule(horses)
    expect(horses.map((h) => h.id)).toEqual(originalIds)
  })
})
