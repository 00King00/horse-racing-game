<template>
  <div class="horse-list">
    <h2 class="horse-list__title">Horse List (1-20)</h2>
    <div class="horse-list__table-wrap">
      <table class="horse-list__table">
        <thead>
          <tr>
            <th class="horse-list__th">#</th>
            <th class="horse-list__th">Name</th>
            <th class="horse-list__th">Condition</th>
            <th class="horse-list__th">Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id" class="horse-list__row">
            <td class="horse-list__td horse-list__td--num">{{ horse.id }}</td>
            <td class="horse-list__td">{{ horse.name }}</td>
            <td class="horse-list__td">{{ horse.condition }}</td>
            <td class="horse-list__td">
              <span
                class="horse-list__color-dot"
                :style="{ backgroundColor: horse.color }"
              ></span>
            </td>
          </tr>
          <tr v-if="!horses.length">
            <td class="horse-list__td horse-list__td--empty" colspan="4">
              No horses generated yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse } from '@/features/horse-racing/types'

const store = useStore()
const horses = computed<Horse[]>(() => store.getters['horses/allHorses'])
</script>

<style>
.horse-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
}

.horse-list__title {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-heading);
  background-color: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.horse-list__table-wrap {
  overflow-y: auto;
  height: var(--scrollable-height);
}

.horse-list__table {
  width: 100%;
}

.horse-list__th {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background-color: var(--color-bg-surface);
}

.horse-list__row:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.03);
}

.horse-list__td {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.horse-list__td--num {
  color: var(--color-text-muted);
  width: 32px;
}

.horse-list__td--empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-lg);
}

.horse-list__color-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
