<template>
  <div class="race-lane">
    <span class="race-lane__num">{{ laneNumber }}</span>
    <div ref="trackRef" class="race-lane__track">
      <span class="race-lane__start">START</span>
      <span
        ref="horseRef"
        class="race-lane__horse-wrapper"
        :style="wrapperStyle"
        @transitionend="onTransitionEnd"
      >
        <HorseIcon :color="horse.color" :size="44" />
      </span>
      <span class="race-lane__finish">FINISH</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Horse } from '@/features/horse-racing/types'
import HorseIcon from './HorseIcon.vue'

const props = defineProps<{
  horse: Horse
  laneNumber: number
  distance: number
  isRunning: boolean
  isPaused: boolean
  animationDuration: number
  remainingDuration: number // ms left after resume
  roundId: number
  roundLap: number
  roundDistance: number
  roundIndex: number
}>()

const emit = defineEmits<{
  finished: [payload: { horseId: number; roundId: number; lap: number; distance: number }]
}>()

const trackRef = ref<HTMLElement | null>(null)
const horseRef = ref<HTMLElement | null>(null)

const wrapperStyle = ref<Record<string, string>>({
  transform: 'translateX(0px)',
  transition: 'none',
})

let targetX = 0
let frozenX = 0 // position saved on pause

watch(
  () => props.isPaused,
  (paused) => {
    if (!paused) return
    // Freeze: read computed translateX and lock horse in place
    const style = window.getComputedStyle(horseRef.value!)
    const matrix = new DOMMatrix(style.transform)
    frozenX = matrix.m41
    wrapperStyle.value = {
      transform: `translateX(${frozenX}px)`,
      transition: 'none',
    }
  },
)

async function startAnimation() {
  const trackWidth = trackRef.value?.offsetWidth ?? 400
  targetX = trackWidth - 45

  const resuming = frozenX > 0

  if (resuming) {
    // Resume from frozen position — no reset needed, just continue
    await nextTick()
    trackRef.value?.getBoundingClientRect() // force reflow
    wrapperStyle.value = {
      transform: `translateX(${targetX}px)`,
      transition: `transform ${props.remainingDuration}ms linear`,
    }
    frozenX = 0
  } else {
    // Fresh start — reset to 0 first
    wrapperStyle.value = { transform: 'translateX(0px)', transition: 'none' }
    await nextTick()
    trackRef.value?.getBoundingClientRect()
    wrapperStyle.value = {
      transform: `translateX(${targetX}px)`,
      transition: `transform ${props.remainingDuration}ms linear`,
    }
  }
}

watch(
  () => props.isRunning,
  (running) => {
    if (running) startAnimation()
  },
  { immediate: false },
)

watch(
  () => props.roundIndex,
  () => {
    if (props.isRunning) startAnimation()
  },
)

function onTransitionEnd() {
  emit('finished', {
    horseId: props.horse.id,
    roundId: props.roundId,
    lap: props.roundLap,
    distance: props.roundDistance,
  })
}
</script>

<style>
.race-lane {
  display: flex;
  align-items: center;
  height: var(--lane-height);
  border-bottom: 1px solid var(--lane-border);
}

.race-lane__num {
  width: 28px;
  flex-shrink: 0;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.race-lane__track {
  flex: 1;
  position: relative;
  height: 100%;
}

.race-lane__horse-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  will-change: transform;
  z-index: 1;
}

.race-lane__start {
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-start-line);
  border-right: 2px dashed var(--color-start-line);
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  pointer-events: none;
}


.race-lane__finish {
  position: absolute;
  right: 0;
  top: 0;
  width: 48px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-finish-line);
  border-left: 2px dashed var(--color-finish-line);
  writing-mode: vertical-rl;
  letter-spacing: 2px;
  pointer-events: none;
}
</style>
