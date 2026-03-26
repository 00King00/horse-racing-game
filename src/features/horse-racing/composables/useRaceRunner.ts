import { useStore } from 'vuex'
import type { Round } from '../types'
import { GameStatus, RoundStatus } from '../types'

const MIN_DURATION = 8000
const MAX_DURATION = 20000

function calcDurations(round: Round): Record<number, number> {
  const durations: Record<number, number> = {}
  round.horses.forEach((horse) => {
    const randomNoise = 0.9 + Math.random() * 0.2
    const normalized = 1 - (horse.condition - 1) / 99
    const base = MIN_DURATION + normalized * (MAX_DURATION - MIN_DURATION)
    durations[horse.id] = Math.round(base * randomNoise)
  })
  return durations
}


function createTimer(ms: number): { promise: Promise<void>; cancel: () => void } {
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

function waitForAllFinished(store: ReturnType<typeof useStore>, roundId: number, horseCount: number): Promise<void> {
  return new Promise((resolve) => {
    function check() {
      const results = store.state.race.results
      const result = results.find((r: { roundId: number }) => r.roundId === roundId)
      if (result && result.rankings.length >= horseCount) {
        resolve()
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })
}

export function useRaceRunner() {
  const store = useStore()

  let cancelCurrentTimer: (() => void) | null = null
  // Track when current round started to calc remaining time on pause
  let roundStartedAt = 0
  let currentDurations: Record<number, number> = {}

  async function runRound(round: Round, index: number, durations: Record<number, number>): Promise<boolean> {
    store.dispatch('race/setAnimationDurations', { roundId: round.id, durations })
    // Clear remaining — this is a fresh (or resumed) start
    store.dispatch('race/setRemainingDurations', {})
    store.dispatch('race/setCurrentRound', index)
    store.dispatch('race/setRoundStatus', { index, status: RoundStatus.Running })
    store.dispatch('race/setGameStatus', GameStatus.Running)

    const maxDuration = Math.max(...Object.values(durations))
    roundStartedAt = performance.now()
    currentDurations = durations

    const timer = createTimer(maxDuration)
    cancelCurrentTimer = timer.cancel

    try {
      await timer.promise
    } catch {
      cancelCurrentTimer = null
      return false
    }

    cancelCurrentTimer = null

    // Wait for all transitionend events to fire before advancing to next round
    await waitForAllFinished(store, round.id, round.horses.length)

    store.dispatch('race/setRoundStatus', { index, status: RoundStatus.Finished })
    return true
  }

  async function startRace(): Promise<void> {
    const rounds: Round[] = store.getters['race/allRounds']
    const currentIndex: number = store.state.race.currentRoundIndex
    const round = rounds[currentIndex]
    if (!round) return

    // Check if resuming a paused round — use remaining durations if available
    const savedRemaining: Record<number, number> = store.state.race.remainingDurations
    const isResuming = Object.keys(savedRemaining).length > 0
    const durations = isResuming ? savedRemaining : calcDurations(round)

    const completed = await runRound(round, currentIndex, durations)

    if (!completed) return // paused — do nothing, pauseRace already set status

    const isLastRound = currentIndex >= rounds.length - 1
    if (isLastRound) {
      store.dispatch('race/setGameStatus', GameStatus.Finished)
    } else {
      store.dispatch('race/setCurrentRound', currentIndex + 1)
      store.dispatch('race/setGameStatus', GameStatus.Generated)
    }
  }

  function pauseRace(): void {
    // Calculate remaining time for each horse
    const elapsed = performance.now() - roundStartedAt
    const remaining: Record<number, number> = {}
    Object.entries(currentDurations).forEach(([horseId, total]) => {
      remaining[Number(horseId)] = Math.max(0, total - elapsed)
    })
    store.dispatch('race/setRemainingDurations', remaining)

    if (cancelCurrentTimer) {
      cancelCurrentTimer()
      cancelCurrentTimer = null
    }
    store.dispatch('race/setGameStatus', GameStatus.Paused)
  }

  function resumeRace(): void {
    startRace()
  }

  return { startRace, pauseRace, resumeRace }
}
