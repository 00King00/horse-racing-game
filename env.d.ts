/// <reference types="vite/client" />

// Vuex 4 ESM workaround — re-export createStore with proper types
declare module 'vuex/dist/vuex.mjs' {
  export * from 'vuex'
}

// Vuex 4 useStore type fix for composition API
declare module 'vuex' {
  export function useStore(): import('vuex').Store<unknown>
}
