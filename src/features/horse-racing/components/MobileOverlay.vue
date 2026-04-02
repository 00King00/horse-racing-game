<template>
  <div class="mobile-overlay">
    <div class="mobile-overlay__slider" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div
        class="mobile-overlay__track"
        :style="{ transform: `translateX(${-activeIndex * 100}%)` }"
      >
        <div class="mobile-overlay__slide">
          <HorseList />
        </div>
        <div class="mobile-overlay__slide">
          <RoundPanel title="Program" :items="programItems" :active-id="activeRoundId" />
        </div>
        <div class="mobile-overlay__slide">
          <RoundPanel title="Results" :items="resultItems" />
        </div>
      </div>
    </div>

    <div class="mobile-overlay__nav">
      <button class="mobile-overlay__arrow" @click="prev">&#8592;</button>
      <div class="mobile-overlay__dots">
        <button
          v-for="(_, i) in SLIDES"
          :key="i"
          class="mobile-overlay__dot"
          :class="{ 'mobile-overlay__dot--active': activeIndex === i }"
          @click="setSlide(i)"
        />
      </div>
      <button class="mobile-overlay__arrow" @click="next">&#8594;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import HorseList from './HorseList.vue'
import RoundPanel from './RoundPanel.vue'
import type { Round, RaceResult } from '@/features/horse-racing/types'

const SLIDES = 3

const props = defineProps<{ activeSlide?: number }>()
const emit = defineEmits<{ slideChange: [index: number] }>()

const store = useStore()
const activeIndex = ref(props.activeSlide ?? 0)

const activeRoundId = computed<number | undefined>(
  () => (store.getters['race/currentRound'] as Round | null)?.id,
)

const programItems = computed(() =>
  (store.getters['race/allRounds'] as Round[]).map((r) => ({
    id: r.id,
    lap: r.lap,
    distance: r.distance,
    horses: r.horses,
  })),
)

const resultItems = computed(() => {
  const allRounds = store.getters['race/allRounds'] as Round[]
  const completed = store.getters['race/completedResults'] as RaceResult[]
  return allRounds.map((r) => {
    const result = completed.find((c) => c.roundId === r.id)
    return { id: r.id, lap: r.lap, distance: r.distance, horses: result?.rankings ?? [] }
  })
})

function setSlide(index: number) {
  activeIndex.value = index
  emit('slideChange', index)
}

function prev() {
  setSlide((activeIndex.value - 1 + SLIDES) % SLIDES)
}

function next() {
  setSlide((activeIndex.value + 1) % SLIDES)
}

let touchStartX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX ?? 0
}

function onTouchEnd(e: TouchEvent) {
  const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX
  if (Math.abs(delta) > 40) {
    delta < 0 ? next() : prev()
  }
}
</script>

<style>
.mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

@media (min-width: 769px) {
  .mobile-overlay {
    display: none;
  }
}

.mobile-overlay__slider {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.mobile-overlay__track {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}

.mobile-overlay__slide {
  flex: 0 0 100%;
  width: 100%;
  overflow-y: auto;
  height: 100%;
}

.mobile-overlay__nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.mobile-overlay__arrow {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: none;
  border-radius: var(--border-radius-sm);
}

.mobile-overlay__arrow:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.mobile-overlay__dots {
  display: flex;
  gap: var(--spacing-sm);
}

.mobile-overlay__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-border);
  transition: background-color 0.2s;
}

.mobile-overlay__dot--active {
  background-color: var(--color-primary);
}
</style>
