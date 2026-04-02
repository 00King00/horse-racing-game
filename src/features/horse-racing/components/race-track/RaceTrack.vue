<template>
  <div class="race-track">
    <div class="race-track__header">
      <span v-if="currentRound" class="race-track__label">
        {{ lapLabel(currentRound.lap) }} Lap — {{ currentRound.distance }}m
      </span>
      <span v-else class="race-track__label race-track__label--empty">
        Waiting for race to start...
      </span>
    </div>

    <div class="race-track__lanes">
      <RaceLane
        v-for="(horse, index) in lanes"
        :key="`${currentRoundIndex}-${horse.id}`"
        :horse="horse"
        :lane-number="index + 1"
        :distance="currentRound?.distance ?? 1200"
        :is-running="isRunning"
        :is-paused="isPaused"
        :animation-duration="getDuration(horse.id)"
        :remaining-duration="getRemaining(horse.id)"
        :round-id="currentRound?.id ?? 0"
        :round-lap="currentRound?.lap ?? 0"
        :round-distance="currentRound?.distance ?? 1200"
        :round-index="currentRoundIndex"
        @finished="onHorseFinished"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import RaceLane from './RaceLane.vue'
import type { Horse, Round } from '@/features/horse-racing/types'
import { GameStatus } from '@/features/horse-racing/types'
import { lapLabel } from '@/features/horse-racing/utils/lapLabel'

const store = useStore()

const currentRound = computed<Round | null>(() => store.getters['race/currentRound'])
const currentRoundIndex = computed<number>(() => store.state.race.currentRoundIndex)
const isRunning = computed<boolean>(() => store.state.race.gameStatus === GameStatus.Running)
const isPaused = computed<boolean>(() => store.state.race.gameStatus === GameStatus.Paused)
const lanes = computed<Horse[]>(() => currentRound.value?.horses ?? [])

// Stable durations pre-calculated by useRaceRunner and stored in Vuex
const durations = computed<Record<number, number>>(() => store.getters['race/currentDurations'])
const remainingDurations = computed<Record<number, number>>(
  () => store.state.race.remainingDurations,
)

function getDuration(horseId: number): number {
  return durations.value[horseId] ?? 8000
}

function getRemaining(horseId: number): number {
  // If we have remaining durations (resume case) use them, otherwise use full duration
  const rem = remainingDurations.value[horseId]
  return rem !== undefined ? rem : getDuration(horseId)
}

function onHorseFinished(payload: {
  horseId: number
  roundId: number
  lap: number
  distance: number
}) {
  // Find horse across all rounds — currentRound may already be the next round when transitionend fires
  const allRounds: Round[] = store.getters['race/allRounds']
  const horse = allRounds.flatMap((r) => r.horses).find((h) => h.id === payload.horseId)
  if (!horse) return
  store.dispatch('race/addHorseFinish', {
    roundId: payload.roundId,
    lap: payload.lap,
    distance: payload.distance,
    horse,
  })
}
</script>

<style>
.race-track {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--track-bg);
}

.race-track__header {
  flex-shrink: 0;
  padding: var(--spacing-md);
  background-color: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.race-track__label {
  font-size: var(--font-size-base);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-primary);
}

.race-track__label--empty {
  color: var(--color-text-muted);
  font-weight: 400;
}

.race-track__lanes {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: start;
  padding: var(--spacing-sm) 0;
}

@media (max-width: 768px) {
  .race-track__header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .race-track__label {
    font-size: var(--font-size-xs);
  }
}
</style>
