import { describe, it, expect } from 'vitest'
import { generateHorses } from '../horseGenerator'

describe('generateHorses', () => {
  it('returns exactly 20 horses', () => {
    const horses = generateHorses()
    expect(horses).toHaveLength(20)
  })

  it('assigns sequential ids from 1 to 20', () => {
    const horses = generateHorses()
    horses.forEach((horse, index) => {
      expect(horse.id).toBe(index + 1)
    })
  })

  it('all horse names are unique', () => {
    const horses = generateHorses()
    const names = horses.map((h) => h.name)
    expect(new Set(names).size).toBe(20)
  })

  it('all colors are unique', () => {
    const horses = generateHorses()
    const colors = horses.map((h) => h.color)
    expect(new Set(colors).size).toBe(20)
  })

  it('colors are in HSL format', () => {
    const horses = generateHorses()
    const hslPattern = /^hsl\(\d+, 70%, 55%\)$/
    horses.forEach((horse) => {
      expect(horse.color).toMatch(hslPattern)
    })
  })

  it('colors have evenly distributed hues (increments of 18°)', () => {
    const horses = generateHorses()
    horses.forEach((horse, i) => {
      const expectedHue = Math.round((i / 20) * 360)
      expect(horse.color).toBe(`hsl(${expectedHue}, 70%, 55%)`)
    })
  })

  it('condition is an integer between 1 and 100', () => {
    const horses = generateHorses()
    horses.forEach((horse) => {
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
      expect(Number.isInteger(horse.condition)).toBe(true)
    })
  })
})
