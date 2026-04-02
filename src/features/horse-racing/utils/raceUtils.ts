import type { Round } from '../types'

export const MIN_DURATION = 8000
export const MAX_DURATION = 20000
export const MAX_DISTANCE = 2200

export function calcDurations(round: Round): Record<number, number> {
  const durations: Record<number, number> = {}
  // Scale the full [MIN..MAX] range proportionally to distance
  // 2200m → [8s..20s], 1200m → [~4.4s..~10.9s]
  const distanceRatio = round.distance / MAX_DISTANCE
  const scaledMin = MIN_DURATION * distanceRatio
  const scaledMax = MAX_DURATION * distanceRatio
  round.horses.forEach((horse) => {
    const randomNoise = 0.9 + Math.random() * 0.2
    const normalized = 1 - (horse.condition - 1) / 99
    const base = scaledMin + normalized * (scaledMax - scaledMin)
    durations[horse.id] = Math.round(base * randomNoise)
  })
  return durations
}

export function createTimer(ms: number): { promise: Promise<void>; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout>
  let rejectFn: (reason: string) => void

  const promise = new Promise<void>((resolve, reject) => {
    rejectFn = reject
    timeoutId = setTimeout(resolve, ms)
  })

  return {
    promise,
    cancel: () => {
      clearTimeout(timeoutId)
      rejectFn('paused')
    },
  }
}

export function calcRemaining(
  currentDurations: Record<number, number>,
  elapsed: number,
): Record<number, number> {
  const remaining: Record<number, number> = {}
  Object.entries(currentDurations).forEach(([horseId, total]) => {
    remaining[Number(horseId)] = Math.max(0, total - elapsed)
  })
  return remaining
}
