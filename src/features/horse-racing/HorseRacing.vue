<template>
  <div class="horse-racing">
    <AppHeader @generate="handleGenerate" @toggle-race="handleToggleRace" />
    <main class="horse-racing__main">
      <aside class="horse-racing__col horse-racing__col--left">
        <HorseList />
      </aside>
      <section class="horse-racing__col horse-racing__col--center">
        <RaceTrack />
      </section>
      <aside class="horse-racing__col horse-racing__col--right">
        <div class="horse-racing__panels">
          <RoundPanel
            title="Program"
            :items="programItems"
            :active-id="currentRound?.id"
          />
          <RoundPanel
            title="Results"
            :items="resultItems"
          />
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppHeader from '@/shared/components/AppHeader.vue'
import HorseList from '@/features/horse-racing/components/HorseList.vue'
import RaceTrack from '@/features/horse-racing/components/race-track/RaceTrack.vue'
import RoundPanel from '@/features/horse-racing/components/RoundPanel.vue'
import { generateHorses } from '@/features/horse-racing/utils/horseGenerator'
import { generateSchedule } from '@/features/horse-racing/utils/scheduleGenerator'
import { useRaceRunner } from '@/features/horse-racing/composables/useRaceRunner'
import type { Round, RaceResult } from '@/features/horse-racing/types'
import { GameStatus } from '@/features/horse-racing/types'

const store = useStore()
const { startRace, pauseRace, resumeRace } = useRaceRunner()

const currentRound = computed<Round | null>(() => store.getters['race/currentRound'])

// Program: all scheduled rounds with their starting horses
const programItems = computed(() =>
  (store.getters['race/allRounds'] as Round[]).map((r) => ({
    id: r.id,
    lap: r.lap,
    distance: r.distance,
    horses: r.horses,
  })),
)

// Results: all scheduled rounds with rankings filled in progressively as horses finish
const resultItems = computed(() => {
  const allRounds = store.getters['race/allRounds'] as Round[]
  const completed = store.getters['race/completedResults'] as RaceResult[]
  return allRounds.map((r) => {
    const result = completed.find((c) => c.roundId === r.id)
    return {
      id: r.id,
      lap: r.lap,
      distance: r.distance,
      horses: result?.rankings ?? [],
    }
  })
})

function handleGenerate() {
  store.dispatch('race/reset')
  const horses = generateHorses()
  store.dispatch('horses/setHorses', horses)
  const rounds = generateSchedule(horses)
  store.dispatch('race/setRounds', rounds)
}

function handleToggleRace() {
  const status: GameStatus = store.state.race.gameStatus
  if (status === GameStatus.Running) {
    pauseRace()
  } else if (status === GameStatus.Paused) {
    resumeRace()
  } else if (status === GameStatus.Generated) {
    startRace()
  }
}
</script>

<style>
.horse-racing {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

.horse-racing__main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.horse-racing__col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.horse-racing__col--left {
  width: 240px;
  flex-shrink: 0;
}

.horse-racing__col--center {
  flex: 1;
  min-width: 0;
  background-color: var(--track-bg);
}

.horse-racing__col--right {
  width: 450px;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border);
  overflow: hidden;
}

.horse-racing__panels {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.horse-racing__panels > * {
  flex: 1;
  min-width: 0;
  border-right: 1px solid var(--color-border);
}

.horse-racing__panels > *:last-child {
  border-right: none;
}
</style>
