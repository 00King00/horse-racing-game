<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
  >
    <!-- Body — slimmer, elongated horse shape -->
    <path d="M14 40 C14 32 20 28 30 28 C40 28 46 32 46 36 C46 44 40 48 30 48 C20 48 14 46 14 40 Z" :fill="color" />

    <!-- Rump bump -->
    <path d="M14 38 C12 34 14 30 18 30 C22 30 22 34 20 38 Z" :fill="color" />

    <!-- Neck -->
    <path d="M42 32 C45 27 46 22 44 18 C42 14 38 14 37 17 C35 20 36 26 38 30 Z" :fill="color" />

    <!-- Head -->
    <ellipse cx="47" cy="15" rx="6" ry="4.5" transform="rotate(-15 47 15)" :fill="color" />

    <!-- Snout / muzzle -->
    <path d="M51 13 C55 12 57 15 55 18 C53 21 50 20 50 17 Z" :fill="color" />

    <!-- Nostril -->
    <ellipse cx="53.5" cy="17" rx="0.9" ry="0.7" fill="rgba(0,0,0,0.35)" />

    <!-- Eye -->
    <circle cx="47" cy="13" r="1.1" fill="#111" />
    <circle cx="47.3" cy="12.6" r="0.35" fill="rgba(255,255,255,0.65)" />

    <!-- Ear -->
    <path d="M41 11 C42 7 45 7 44 11 Z" :fill="color" />

    <!-- Mane -->
    <path d="M37 17 C35 20 34 24 35 29" stroke="rgba(0,0,0,0.3)" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <path d="M39 16 C37 19 36 23 37 28" stroke="rgba(0,0,0,0.18)" stroke-width="1.8" stroke-linecap="round" fill="none" />

    <!-- Tail -->
    <path d="M16 36 C10 31 5 34 7 41 C9 46 14 44 16 39 Z" :fill="color" />
    <path d="M15 38 C7 37 3 43 7 48" stroke="rgba(0,0,0,0.22)" stroke-width="2" stroke-linecap="round" fill="none" />

    <!-- Legs — gallop pose -->
    <!-- Front right extended -->
    <path d="M39 46 C40 51 41 55 40 59" stroke-width="3.5" stroke-linecap="round" :stroke="color" fill="none" />
    <!-- Front left tucked -->
    <path d="M37 46 C36 50 34 52 33 50" stroke-width="3.5" stroke-linecap="round" :stroke="color" fill="none" />
    <!-- Rear right extended -->
    <path d="M21 46 C19 51 18 55 19 59" stroke-width="3.5" stroke-linecap="round" :stroke="color" fill="none" />
    <!-- Rear left tucked -->
    <path d="M23 46 C23 50 25 52 27 51" stroke-width="3.5" stroke-linecap="round" :stroke="color" fill="none" />

    <!-- Hooves -->
    <ellipse cx="40" cy="59" rx="2.2" ry="1.1" fill="rgba(0,0,0,0.5)" />
    <ellipse cx="19" cy="59" rx="2.2" ry="1.1" fill="rgba(0,0,0,0.5)" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
  size?: number
}>(), {
  color: '#c8a96e',
  size: 48,
})
</script>
