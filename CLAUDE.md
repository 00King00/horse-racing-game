# Horse Racing Game

## Project Description
An interactive Horse Racing game — front-end case study for Insider.
The user generates a list of horses, a race schedule, and launches animated races with results display.

## Tech Stack
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **State Management**: Vuex 4 (required by the assignment)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (e2e)
- **Deploy**: Cloudflare Pages

## Project Structure (feature-based)
```
src/
├── features/
│   └── horse-racing/            # single feature — all components are tightly coupled
│       ├── HorseRacing.vue          # main feature component (layout + orchestration)
│       ├── components/
│       │   ├── HorseList.vue        # horse list (name, condition, color)
│       │   ├── MobileOverlay.vue    # mobile slider overlay (HorseList / Program / Results)
│       │   ├── RoundPanel.vue       # shared component for Program and Results
│       │   └── race-track/          # animated race track
│       │       ├── RaceTrack.vue
│       │       ├── RaceLane.vue
│       │       └── HorseIcon.vue
│       ├── store/
│       │   ├── horses.ts            # Vuex module: horses
│       │   └── race.ts              # Vuex module: race, rounds, results
│       ├── composables/
│       │   └── useRaceRunner.ts     # round execution logic
│       ├── utils/
│       │   ├── horseGenerator.ts
│       │   ├── lapLabel.ts          # ordinal lap label (1st, 2nd, 3rd, Nth)
│       │   ├── raceUtils.ts         # calcDurations, createTimer, calcRemaining
│       │   └── scheduleGenerator.ts
│       └── types/
│           └── index.ts             # Horse, Round, RaceResult, GameStatus
│
├── shared/
│   ├── components/
│   │   └── AppHeader.vue            # sticky header with ☰ menu toggle (mobile)
│   └── utils/                       # shared utilities (cross-feature helpers)
│
├── store/
│   └── index.ts                     # Vuex root — registers modules
│
├── assets/
│   └── css/
│       ├── main.css             # entry point — imports variables + base
│       ├── variables.css        # design tokens (colors, spacing, typography)
│       └── base.css             # reset/normalize
├── App.vue
└── main.ts
```

## Business Rules
- 20 horses total, each with a unique color and condition score 1-100
- 6 rounds per race, each round has 10 random horses out of 20
- Round distances: 1200m, 1400m, 1600m, 1800m, 2000m, 2200m
- Rounds run sequentially, one at a time
- Results are displayed after each round

## UI Layout (from PDF)
- **Left**: Horse List (1-20) — table: Name, Condition, Color
- **Center**: Race Track — 10 lanes with animated horses, round label and FINISH line
- **Right**: Program (schedule) + Results — two columns with per-round tables

## Commands
```bash
npm run dev        # start dev server
npm run build      # production build
npm run test       # Vitest unit tests (53 tests)
npm run preview    # preview production build
```

## E2E Tests (Playwright)
```bash
npm run test:e2e        # basic scenarios (8 tests, ~1-2 min) — for quick verification
npm run test:e2e:full   # all tests including full 6-round cycle (9 tests, ~5-8 min)
npm run test:e2e:mobile # mobile overlay/navigation tests (11 tests, ~3-5 min)
```

No need to start the server manually — Playwright automatically starts `npm run dev`.

Run modes:
- `npx playwright test --ui` — UI mode: test list + live browser
- `npx playwright test --headed` — browser opens, see interactions in real time
- `npx playwright show-report` — HTML report after run

## Code Language
- All code, comments, variable names, function names, component names — English
- Commit messages — English
- Types, interfaces, enum values — English

## Responsive Design
- Breakpoint: `≤768px` — mobile layout activates
- On mobile: left/right columns hidden (`display: none`), ☰ button shown in header
- `MobileOverlay` — absolute-positioned slider inside `.horse-racing__main` (3 slides: HorseList → Program → Results)
- `.horse-racing` uses `height: 100vh; overflow: hidden` on mobile to prevent page scroll
- `AppHeader` is `position: sticky; top: 0; z-index: 50` — always visible when scrolling inside panels
- Animation durations scale proportionally with distance: `distanceRatio = distance / 2200`; both `scaledMin` and `scaledMax` scale by this ratio (base range: 8s–20s at 2200m)

## Conventions
- Always `<script setup lang="ts">`
- Components — PascalCase files (e.g. `HorseList.vue`)
- Simple components without subcomponents — `ComponentName.vue` directly in `components/`
- Components with subcomponents — kebab-case folder with all files inside (e.g. `race-track/RaceTrack.vue` + `race-track/RaceLane.vue`)
- Main feature component — at feature root level, not in `components/` (e.g. `horse-racing/HorseRacing.vue`)
- Feature-based structure: all game logic in `features/horse-racing/`
- Vuex modules with `namespaced: true`
- Types in `features/horse-racing/types/index.ts`
- Shared — only what is used outside the feature
- Do not use Options API
- SFC block order: `<template>` → `<script setup lang="ts">` → `<style>`
- CSS — BEM methodology for class naming, global variables in `assets/css/variables.css`
- Component styles — in `<style>` block of the same SFC file (without `scoped`), BEM ensures uniqueness
- Global utilities (helper margins, paddings, etc.) — in global CSS (`assets/css/`)

## Deploy — Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+
