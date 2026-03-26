<template>
  <div class="round-panel">
    <h2 class="round-panel__title">{{ title }}</h2>
    <div class="round-panel__list">
      <div
        v-for="item in items"
        :key="item.id"
        class="round-panel__round"
        :class="{ 'round-panel__round--active': isActive(item) }"
      >
        <h3 class="round-panel__round-title">
          {{ lapLabel(item.lap) }} Lap — {{ item.distance }}m
        </h3>
        <table class="round-panel__table">
          <thead>
            <tr>
              <th class="round-panel__th">Position</th>
              <th class="round-panel__th">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pos in 10"
              :key="pos"
              class="round-panel__row"
            >
              <td class="round-panel__td round-panel__td--pos">{{ pos }}</td>
              <td class="round-panel__td">{{ item.horses[pos - 1]?.name ?? '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Horse } from '@/features/horse-racing/types'

interface PanelItem {
  id: number
  lap: number
  distance: number
  horses: Horse[]
}

const props = defineProps<{
  title: string
  items: PanelItem[]
  activeId?: number // highlights the active round (used in Program)
}>()

function isActive(item: PanelItem): boolean {
  return props.activeId !== undefined && item.id === props.activeId
}

function lapLabel(lap: number): string {
  const suffixes: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }
  return suffixes[lap] ?? `${lap}th`
}
</script>

<style>
.round-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-surface);
}

.round-panel__title {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-heading);
  background-color: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.round-panel__list {
  overflow-y: auto;
  height: var(--scrollable-height);
}

.round-panel__round {
  border-bottom: 1px solid var(--color-border);
}

.round-panel__round--active .round-panel__round-title {
  color: var(--color-primary);
}

.round-panel__round-title {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--color-border);
}

.round-panel__th {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.round-panel__row:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.03);
}

.round-panel__td {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.round-panel__td--pos {
  color: var(--color-text-muted);
  width: 64px;
}
</style>
