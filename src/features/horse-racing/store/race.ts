// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Vuex 4 types resolution workaround
import type { Module, ActionContext } from 'vuex'
import type { Round, RaceResult, Horse } from '../types'
import { GameStatus, RoundStatus } from '../types'

export interface RaceState {
  rounds: Round[]
  currentRoundIndex: number
  results: RaceResult[]
  gameStatus: GameStatus
  // pre-calculated animation durations per horse per round: roundId -> horseId -> ms
  animationDurations: Record<number, Record<number, number>>
  // remaining durations after pause: horseId -> ms left
  remainingDurations: Record<number, number>
}

const raceModule: Module<RaceState, unknown> = {
  namespaced: true,

  state: (): RaceState => ({
    rounds: [],
    currentRoundIndex: 0,
    results: [],
    gameStatus: GameStatus.Idle,
    animationDurations: {},
    remainingDurations: {},
  }),

  mutations: {
    SET_ROUNDS(state: RaceState, rounds: Round[]) {
      state.rounds = rounds
    },

    SET_CURRENT_ROUND(state: RaceState, index: number) {
      state.currentRoundIndex = index
    },

    SET_ROUND_STATUS(state: RaceState, { index, status }: { index: number; status: RoundStatus }) {
      if (state.rounds[index]) {
        state.rounds[index].status = status
      }
    },

    ADD_RESULT(state: RaceState, result: RaceResult) {
      state.results.push(result)
    },

    // Push a single horse finish into the current round's result progressively
    ADD_HORSE_FINISH(
      state: RaceState,
      { roundId, lap, distance, horse }: { roundId: number; lap: number; distance: number; horse: Horse },
    ) {
      const existing = state.results.find((r) => r.roundId === roundId)
      if (existing) {
        existing.rankings.push(horse)
      } else {
        state.results.push({ roundId, lap, distance, rankings: [horse] })
      }
    },

    SET_GAME_STATUS(state: RaceState, status: GameStatus) {
      state.gameStatus = status
    },

    SET_ANIMATION_DURATIONS(
      state: RaceState,
      payload: { roundId: number; durations: Record<number, number> },
    ) {
      state.animationDurations[payload.roundId] = payload.durations
    },

    SET_REMAINING_DURATIONS(state: RaceState, durations: Record<number, number>) {
      state.remainingDurations = durations
    },

    RESET(state: RaceState) {
      state.rounds = []
      state.currentRoundIndex = 0
      state.results = []
      state.gameStatus = GameStatus.Idle
      state.animationDurations = {}
      state.remainingDurations = {}
    },
  },

  actions: {
    setRounds({ commit }: ActionContext<RaceState, unknown>, rounds: Round[]) {
      commit('SET_ROUNDS', rounds)
      commit('SET_GAME_STATUS', GameStatus.Generated)
    },

    setCurrentRound({ commit }: ActionContext<RaceState, unknown>, index: number) {
      commit('SET_CURRENT_ROUND', index)
    },

    setRoundStatus(
      { commit }: ActionContext<RaceState, unknown>,
      payload: { index: number; status: RoundStatus },
    ) {
      commit('SET_ROUND_STATUS', payload)
    },

    addResult({ commit }: ActionContext<RaceState, unknown>, result: RaceResult) {
      commit('ADD_RESULT', result)
    },

    addHorseFinish(
      { commit }: ActionContext<RaceState, unknown>,
      payload: { roundId: number; lap: number; distance: number; horse: Horse },
    ) {
      commit('ADD_HORSE_FINISH', payload)
    },

    setGameStatus({ commit }: ActionContext<RaceState, unknown>, status: GameStatus) {
      commit('SET_GAME_STATUS', status)
    },

    setAnimationDurations(
      { commit }: ActionContext<RaceState, unknown>,
      payload: { roundId: number; durations: Record<number, number> },
    ) {
      commit('SET_ANIMATION_DURATIONS', payload)
    },

    setRemainingDurations({ commit }: ActionContext<RaceState, unknown>, durations: Record<number, number>) {
      commit('SET_REMAINING_DURATIONS', durations)
    },

    reset({ commit }: ActionContext<RaceState, unknown>) {
      commit('RESET')
    },
  },

  getters: {
    currentRound: (state: RaceState) => state.rounds[state.currentRoundIndex] ?? null,

    isRunning: (state: RaceState) => state.gameStatus === GameStatus.Running,

    isPaused: (state: RaceState) => state.gameStatus === GameStatus.Paused,

    isFinished: (state: RaceState) => state.gameStatus === GameStatus.Finished,

    completedResults: (state: RaceState) => state.results,

    allRounds: (state: RaceState) => state.rounds,

    currentDurations: (state: RaceState) => {
      const round = state.rounds[state.currentRoundIndex]
      if (!round) return {}
      return state.animationDurations[round.id] ?? {}
    },
  },
}

export default raceModule
