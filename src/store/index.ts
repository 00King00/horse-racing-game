// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Vuex 4 types resolution workaround
import { createStore } from 'vuex/dist/vuex.mjs'
import horsesModule from '@/features/horse-racing/store/horses'
import raceModule from '@/features/horse-racing/store/race'

export default createStore({
  modules: {
    horses: horsesModule,
    race: raceModule,
  },
})
