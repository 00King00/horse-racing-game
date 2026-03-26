<template>
  <header class="app-header">
    <h1 class="app-header__title">Horse Racing</h1>
    <div class="app-header__actions">
      <button
        class="app-header__btn app-header__btn--generate"
        :disabled="isRunning"
        @click="emit('generate')"
      >
        Generate Program
      </button>
      <button
        class="app-header__btn app-header__btn--start"
        :disabled="!isGenerated"
        @click="emit('toggleRace')"
      >
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { GameStatus } from '@/features/horse-racing/types'

const emit = defineEmits<{
  generate: []
  toggleRace: []
}>()

const store = useStore()

const gameStatus = computed<GameStatus>(() => store.state.race.gameStatus)
const isRunning = computed(() => gameStatus.value === GameStatus.Running)
const isGenerated = computed(
  () =>
    gameStatus.value === GameStatus.Generated ||
    gameStatus.value === GameStatus.Running ||
    gameStatus.value === GameStatus.Paused,
)
</script>

<style>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
}

.app-header__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.app-header__actions {
  display: flex;
  gap: var(--spacing-sm);
}

.app-header__btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s;
}

.app-header__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.app-header__btn--generate {
  background-color: var(--color-btn-generate);
  color: #fff;
}

.app-header__btn--generate:hover:not(:disabled) {
  background-color: var(--color-btn-generate-hover);
}

.app-header__btn--start {
  background-color: var(--color-btn-start);
  color: #fff;
}

.app-header__btn--start:hover:not(:disabled) {
  background-color: var(--color-btn-start-hover);
}
</style>
