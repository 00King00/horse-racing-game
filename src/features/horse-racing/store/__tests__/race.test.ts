import { describe, it, expect, beforeEach } from 'vitest'
// @ts-expect-error — Vuex 4 types resolution workaround
import { createStore } from 'vuex/dist/vuex.mjs'
import raceModule from '../race'
import { GameStatus, RoundStatus } from '../../types'
import type { Horse, Round, RaceResult } from '../../types'

function createTestStore() {
  return createStore({
    modules: {
      race: raceModule,
    },
  })
}

const mockHorse: Horse = { id: 1, name: 'Thunder Bolt', color: 'hsl(0, 70%, 55%)', condition: 80 }
const mockHorse2: Horse = { id: 2, name: 'Silver Arrow', color: 'hsl(18, 70%, 55%)', condition: 60 }

const mockRound: Round = {
  id: 1,
  lap: 1,
  distance: 1200,
  horses: [mockHorse, mockHorse2],
  status: RoundStatus.Pending,
}

const mockRound2: Round = {
  id: 2,
  lap: 2,
  distance: 1400,
  horses: [mockHorse],
  status: RoundStatus.Pending,
}

describe('race store module — initial state', () => {
  it('has correct initial state', () => {
    const store = createTestStore()
    expect(store.state.race.rounds).toEqual([])
    expect(store.state.race.currentRoundIndex).toBe(0)
    expect(store.state.race.results).toEqual([])
    expect(store.state.race.gameStatus).toBe(GameStatus.Idle)
    expect(store.state.race.animationDurations).toEqual({})
    expect(store.state.race.remainingDurations).toEqual({})
  })
})

describe('race store — mutations', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('SET_ROUNDS updates rounds array', () => {
    store.commit('race/SET_ROUNDS', [mockRound])
    expect(store.state.race.rounds).toEqual([mockRound])
  })

  it('SET_CURRENT_ROUND updates currentRoundIndex', () => {
    store.commit('race/SET_CURRENT_ROUND', 3)
    expect(store.state.race.currentRoundIndex).toBe(3)
  })

  it('SET_ROUND_STATUS updates round status', () => {
    store.commit('race/SET_ROUNDS', [mockRound, mockRound2])
    store.commit('race/SET_ROUND_STATUS', { index: 0, status: RoundStatus.Running })
    expect(store.state.race.rounds[0].status).toBe(RoundStatus.Running)
  })

  it('SET_ROUND_STATUS does nothing for invalid index', () => {
    const freshRound = { ...mockRound, status: RoundStatus.Pending }
    store.commit('race/SET_ROUNDS', [freshRound])
    store.commit('race/SET_ROUND_STATUS', { index: 99, status: RoundStatus.Running })
    expect(store.state.race.rounds[0].status).toBe(RoundStatus.Pending)
  })

  it('SET_GAME_STATUS updates gameStatus', () => {
    store.commit('race/SET_GAME_STATUS', GameStatus.Running)
    expect(store.state.race.gameStatus).toBe(GameStatus.Running)
  })

  it('ADD_HORSE_FINISH creates new result if roundId does not exist', () => {
    store.commit('race/ADD_HORSE_FINISH', { roundId: 1, lap: 1, distance: 1200, horse: mockHorse })
    expect(store.state.race.results).toHaveLength(1)
    expect(store.state.race.results[0].roundId).toBe(1)
    expect(store.state.race.results[0].rankings).toEqual([mockHorse])
  })

  it('ADD_HORSE_FINISH appends to existing result rankings', () => {
    store.commit('race/ADD_HORSE_FINISH', { roundId: 1, lap: 1, distance: 1200, horse: mockHorse })
    store.commit('race/ADD_HORSE_FINISH', { roundId: 1, lap: 1, distance: 1200, horse: mockHorse2 })
    expect(store.state.race.results).toHaveLength(1)
    expect(store.state.race.results[0].rankings).toEqual([mockHorse, mockHorse2])
  })

  it('ADD_HORSE_FINISH creates separate results for different roundIds', () => {
    store.commit('race/ADD_HORSE_FINISH', { roundId: 1, lap: 1, distance: 1200, horse: mockHorse })
    store.commit('race/ADD_HORSE_FINISH', { roundId: 2, lap: 2, distance: 1400, horse: mockHorse2 })
    expect(store.state.race.results).toHaveLength(2)
  })

  it('SET_ANIMATION_DURATIONS stores durations per roundId', () => {
    store.commit('race/SET_ANIMATION_DURATIONS', { roundId: 1, durations: { 1: 9000, 2: 12000 } })
    expect(store.state.race.animationDurations[1]).toEqual({ 1: 9000, 2: 12000 })
  })

  it('SET_REMAINING_DURATIONS replaces remainingDurations', () => {
    store.commit('race/SET_REMAINING_DURATIONS', { 1: 5000, 2: 3000 })
    expect(store.state.race.remainingDurations).toEqual({ 1: 5000, 2: 3000 })
    store.commit('race/SET_REMAINING_DURATIONS', {})
    expect(store.state.race.remainingDurations).toEqual({})
  })

  it('RESET restores initial state', () => {
    store.commit('race/SET_ROUNDS', [mockRound])
    store.commit('race/SET_GAME_STATUS', GameStatus.Running)
    store.commit('race/ADD_HORSE_FINISH', { roundId: 1, lap: 1, distance: 1200, horse: mockHorse })
    store.commit('race/RESET')
    expect(store.state.race.rounds).toEqual([])
    expect(store.state.race.currentRoundIndex).toBe(0)
    expect(store.state.race.results).toEqual([])
    expect(store.state.race.gameStatus).toBe(GameStatus.Idle)
    expect(store.state.race.animationDurations).toEqual({})
    expect(store.state.race.remainingDurations).toEqual({})
  })
})

describe('race store — getters', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('currentRound returns null when rounds is empty', () => {
    expect(store.getters['race/currentRound']).toBeNull()
  })

  it('currentRound returns correct round by index', () => {
    store.commit('race/SET_ROUNDS', [mockRound, mockRound2])
    store.commit('race/SET_CURRENT_ROUND', 1)
    expect(store.getters['race/currentRound']).toEqual(mockRound2)
  })

  it('isRunning returns true only for Running status', () => {
    expect(store.getters['race/isRunning']).toBe(false)
    store.commit('race/SET_GAME_STATUS', GameStatus.Running)
    expect(store.getters['race/isRunning']).toBe(true)
  })

  it('isPaused returns true only for Paused status', () => {
    expect(store.getters['race/isPaused']).toBe(false)
    store.commit('race/SET_GAME_STATUS', GameStatus.Paused)
    expect(store.getters['race/isPaused']).toBe(true)
  })

  it('isFinished returns true only for Finished status', () => {
    expect(store.getters['race/isFinished']).toBe(false)
    store.commit('race/SET_GAME_STATUS', GameStatus.Finished)
    expect(store.getters['race/isFinished']).toBe(true)
  })

  it('allRounds returns rounds array', () => {
    store.commit('race/SET_ROUNDS', [mockRound, mockRound2])
    expect(store.getters['race/allRounds']).toEqual([mockRound, mockRound2])
  })

  it('completedResults returns results array', () => {
    const result: RaceResult = { roundId: 1, lap: 1, distance: 1200, rankings: [mockHorse] }
    store.commit('race/ADD_RESULT', result)
    expect(store.getters['race/completedResults']).toEqual([result])
  })

  it('currentDurations returns empty object when no rounds', () => {
    expect(store.getters['race/currentDurations']).toEqual({})
  })

  it('currentDurations returns durations for current round', () => {
    store.commit('race/SET_ROUNDS', [mockRound])
    store.commit('race/SET_ANIMATION_DURATIONS', { roundId: 1, durations: { 1: 9000 } })
    expect(store.getters['race/currentDurations']).toEqual({ 1: 9000 })
  })

  it('currentDurations returns empty object if no durations for current round', () => {
    store.commit('race/SET_ROUNDS', [mockRound])
    expect(store.getters['race/currentDurations']).toEqual({})
  })
})
