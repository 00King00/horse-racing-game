import { describe, it, expect, beforeEach } from 'vitest'
// @ts-expect-error — Vuex 4 types resolution workaround
import { createStore } from 'vuex/dist/vuex.mjs'
import horsesModule from '../horses'
import type { Horse } from '../../types'

function createTestStore() {
  return createStore({
    modules: {
      horses: horsesModule,
    },
  })
}

const mockHorses: Horse[] = [
  { id: 1, name: 'Thunder Bolt', color: 'hsl(0, 70%, 55%)', condition: 80 },
  { id: 2, name: 'Silver Arrow', color: 'hsl(18, 70%, 55%)', condition: 60 },
]

describe('horses store module', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('initial state has empty horses array', () => {
    expect(store.state.horses.horses).toEqual([])
  })

  it('SET_HORSES mutation updates horses', () => {
    store.commit('horses/SET_HORSES', mockHorses)
    expect(store.state.horses.horses).toEqual(mockHorses)
  })

  it('setHorses action commits SET_HORSES', async () => {
    await store.dispatch('horses/setHorses', mockHorses)
    expect(store.state.horses.horses).toEqual(mockHorses)
  })

  it('allHorses getter returns horses array', async () => {
    await store.dispatch('horses/setHorses', mockHorses)
    expect(store.getters['horses/allHorses']).toEqual(mockHorses)
  })

  it('setHorses replaces previous horses (no accumulation)', async () => {
    await store.dispatch('horses/setHorses', mockHorses)
    const newHorses: Horse[] = [{ id: 3, name: 'New Horse', color: 'hsl(36, 70%, 55%)', condition: 50 }]
    await store.dispatch('horses/setHorses', newHorses)
    expect(store.getters['horses/allHorses']).toHaveLength(1)
    expect(store.getters['horses/allHorses'][0].id).toBe(3)
  })
})
