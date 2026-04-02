// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Vuex 4 types resolution workaround
import type { Module, ActionContext } from 'vuex'
import type { Horse } from '../types'

export interface HorsesState {
  horses: Horse[]
}

const horsesModule: Module<HorsesState, unknown> = {
  namespaced: true,

  state: (): HorsesState => ({
    horses: [],
  }),

  mutations: {
    SET_HORSES(state: HorsesState, horses: Horse[]) {
      state.horses = horses
    },
  },

  actions: {
    setHorses({ commit }: ActionContext<HorsesState, unknown>, horses: Horse[]) {
      commit('SET_HORSES', horses)
    },
  },

  getters: {
    allHorses: (state: HorsesState) => state.horses,
  },
}

export default horsesModule
