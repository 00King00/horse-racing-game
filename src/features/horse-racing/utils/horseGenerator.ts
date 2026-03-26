import type { Horse } from '../types'

const HORSE_NAMES: string[] = [
  'Thunder Bolt',
  'Silver Arrow',
  'Golden Flash',
  'Dark Storm',
  'Wild Spirit',
  'Iron Hoof',
  'Sky Dancer',
  'Midnight Run',
  'Desert Wind',
  'Star Chaser',
  'Fire Blaze',
  'Ocean Wave',
  'Moon Shadow',
  'Swift Breeze',
  'Red Fury',
  'Blue Comet',
  'Snow Flake',
  'Black Pearl',
  'Sun Racer',
  'Storm King',
]

// Generate 20 evenly distributed HSL colors
function generateColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((i / count) * 360)
    return `hsl(${hue}, 70%, 55%)`
  })
}

function randomCondition(): number {
  return Math.floor(Math.random() * 100) + 1
}

export function generateHorses(): Horse[] {
  const colors = generateColors(HORSE_NAMES.length)

  return HORSE_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    color: colors[index] as string,
    condition: randomCondition(),
  }))
}
