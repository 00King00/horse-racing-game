import type { Horse, Round } from '../types'
import { RoundStatus } from '../types'

const ROUND_DISTANCES: number[] = [1200, 1400, 1600, 1800, 2000, 2200]
const HORSES_PER_ROUND = 10

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i] as T
    copy[i] = copy[j] as T
    copy[j] = temp
  }
  return copy
}

export function generateSchedule(horses: Horse[]): Round[] {
  return ROUND_DISTANCES.map((distance, index) => {
    const shuffled = shuffleArray(horses)
    return {
      id: index + 1,
      lap: index + 1,
      distance,
      horses: shuffled.slice(0, HORSES_PER_ROUND),
      status: RoundStatus.Pending,
    }
  })
}
