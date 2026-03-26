# Horse Racing Game — Planning

## Time Estimate
**Total: ~10-14 hours** of clean coding

| Part | Estimate |
|---|---|
| Part 1 — Project Initialization | 0.5h |
| Part 2 — TypeScript types + Vuex store | 1.5h |
| Part 3 — Components (HorseList, RoundPanel, AppHeader) | 2h |
| Part 4 — Race Track + animation | 3h |
| Part 5 — Game logic (generation, rounds) | 2h |
| Part 6 — UI Styling | 1.5h |
| Part 7 — Unit tests (Vitest) | 1.5h |
| Part 8 — E2E tests (Playwright) | 2h |
| Part 9 — Deploy to Cloudflare Pages | 0.5h |

---

## ✅ Part 1 — Project Initialization
**Goal**: Clean Vue 3 + Vite + TypeScript + Vuex project

### Tasks
- [x] `npm create vue@latest` with options: TypeScript, Vitest, Playwright, ESLint
- [x] Install `vuex@4`, remove unused `pinia`, `vue-router`
- [x] Configure Vite aliases (`@/` → `src/`)
- [x] Vitest and Playwright installed
- [x] Clean up boilerplate (HelloWorld, demo components, views, stores)
- [x] Feature-based folder structure `src/features/horse-racing/`
- [x] Global styles: `variables.css` (design tokens), `base.css` (reset), `main.css` (entry)
  > **Note**: All CSS files in `assets/css/` — `variables.css`, `base.css`, `main.css`; `shared/styles/` removed; empty `shared/utils/` added
- [x] BEM methodology — no scoped styles
- [x] Vuex 4 TypeScript workaround — import from `vuex/dist/vuex.mjs` due to known issue with `exports` field
- [x] `npm run build` — clean build with no errors

---

## ✅ Part 2 — TypeScript Types + Vuex Store
**Goal**: Data foundation and state management

### TypeScript types (`src/features/horse-racing/types/index.ts`)
- [x] `Horse` — id, name, color, condition (1-100)
- [x] `Round` — id, lap, distance, horses[], status (pending/running/finished)
- [x] `RaceResult` — roundId, lap, distance, rankings (Horse[])
- [x] `GameStatus` — enum: idle, generated, running, paused, finished
- [x] `RoundStatus` — enum: pending, running, finished

### Vuex Store (`src/features/horse-racing/store/`)

**horses.ts** — namespaced module `horses`
- [x] state: `horses: Horse[]`
- [x] mutation: `SET_HORSES`
- [x] action: `setHorses`
- [x] getter: `allHorses`

**race.ts** — namespaced module `race`
- [x] state: `rounds`, `currentRoundIndex`, `results`, `gameStatus`, `animationDurations`, `remainingDurations`
- [x] mutations: `SET_ROUNDS`, `SET_CURRENT_ROUND`, `SET_ROUND_STATUS`, `ADD_RESULT`, `ADD_HORSE_FINISH`, `SET_GAME_STATUS`, `SET_ANIMATION_DURATIONS`, `SET_REMAINING_DURATIONS`, `RESET`
- [x] actions: corresponding for each mutation
- [x] getters: `currentRound`, `isRunning`, `isPaused`, `isFinished`, `completedResults`, `allRounds`, `currentDurations`

**`src/store/index.ts`** — root store registers both modules
- [x] Modules registered: `horses`, `race`
- [x] TypeScript fix: `Module` and `ActionContext` imported from `vuex` (not `.mjs`), `createStore` — from `vuex/dist/vuex.mjs`
- [x] `env.d.ts` — added `declare module 'vuex/dist/vuex.mjs'` re-exporting types from `vuex`
- [x] `npm run build` — clean build with no errors

---

## ✅ Part 3 — UI Components (static)
**Goal**: Markup and structure without logic

### HorseList (`src/features/horse-racing/components/HorseList.vue`)
- [x] Table: # | Name | Condition | Color
- [x] Color displayed as a colored dot
- [x] Scrollable when rows overflow (`height: var(--scrollable-height)`)
- [x] Connected to Vuex `horses/allHorses` getter

### RoundPanel (`src/features/horse-racing/components/RoundPanel.vue`)
- [x] Replaced separate `Program` and `Results` — single reusable component
- [x] Props: `title`, `items: PanelItem[]`, `activeId?`
- [x] Per round: Position (1-10 always) | Name table
- [x] Active round highlighted in Program (`activeId`)
- [x] Results: all 6 rounds shown immediately with empty rows, Name fills progressively as horses finish
- [x] Scrollable (`height: var(--scrollable-height)`)

### AppHeader (`src/shared/components/AppHeader.vue`)
- [x] Title "Horse Racing"
- [x] Buttons "Generate Program" and "Start / Pause"
- [x] "Start" disabled until generated; after 6 rounds — disabled until new Generate
- [x] Buttons emit `generate` and `toggleRace` events

### HorseRacing (`src/features/horse-racing/HorseRacing.vue`)
- [x] Main feature component — three-column layout + orchestration
  > **Note**: Located at feature root (`features/horse-racing/HorseRacing.vue`), not in `components/`
- [x] App.vue — minimal, only mounts `<HorseRacing />`

### Technical fixes
- [x] `env.d.ts` — added `declare module 'vuex'` with `useStore` type (workaround for `useStore` in components)
- [x] Component styles in `<style>` block of SFC (without scoped), BEM naming
- [x] `npm run build` — clean build with no errors

---

## ✅ Part 4 — Race Track + Animation
**Goal**: Visual part of the race

### RaceTrack (`src/features/horse-racing/components/race-track/RaceTrack.vue`)
- [x] 10 lanes — one per horse in the current round (from Vuex `race/currentRound`)
- [x] Each lane: number | START line (green) | animated SVG horse | FINISH line (red)
- [x] Current round label: "1st Lap — 1200m"

### RaceLane (`src/features/horse-racing/components/race-track/RaceLane.vue`)
- [x] Props: `horse`, `laneNumber`, `distance`, `isRunning`, `isPaused`, `animationDuration`, `remainingDuration`, `roundId`, `roundLap`, `roundDistance`, `roundIndex`
- [x] CSS animation via `transform: translateX()` on wrapper element
- [x] Pause: saves current position via `getComputedStyle` + `DOMMatrix` (`frozenX`)
- [x] Resume: continues from `frozenX` with `remainingDuration`
- [x] Emits `finished` with `{ horseId, roundId, lap, distance }` on `transitionend`
- [x] `watch(roundIndex)` — triggers animation on transition to next round

### HorseIcon (`src/features/horse-racing/components/race-track/HorseIcon.vue`)
- [x] SVG horse facing right (towards finish)
- [x] Props: `color`, `size` — color matches `horse.color`

### Animation duration logic
- [x] `MIN_DURATION = 8000ms`, `MAX_DURATION = 20000ms`
- [x] `duration = MIN + (1 - (condition-1)/99) * (MAX - MIN) * randomNoise(0.9-1.1)`
- [x] Durations stored in Vuex (`animationDurations`) before round starts

### Technical fixes
- [x] `npm run build` — clean build with no errors

---

## ✅ Part 5 — Game Logic
**Goal**: Connect everything together

### Horse generation (`src/features/horse-racing/utils/horseGenerator.ts`)
- [x] 20 unique names (hardcoded list)
- [x] 20 unique colors (HSL evenly distributed over 360°)
- [x] Random condition 1-100 for each horse

### Schedule generation (`src/features/horse-racing/utils/scheduleGenerator.ts`)
- [x] 6 rounds with distances: 1200, 1400, 1600, 1800, 2000, 2200m
- [x] Per round — 10 random horses out of 20 (Fisher-Yates shuffle)

### Race Runner (`src/features/horse-racing/composables/useRaceRunner.ts`)
- [x] `startRace()` — runs **one** round, after completion sets `GameStatus.Generated` (button → "Start")
- [x] `runRound()` — waits `maxDuration` timer, then `waitForAllFinished()` until all horses are written to store
- [x] `pauseRace()` — cancels `setTimeout` via `createTimer().cancel()`, saves `remainingDurations`
- [x] `resumeRace()` — continues from `remainingDurations` in store
- [x] After 6th round → `GameStatus.Finished`
- [x] Progressive results: each horse pushed via `ADD_HORSE_FINISH` on `transitionend`

### HorseRacing — orchestration
- [x] `handleGenerate` — generates horses and schedule, saves to store
- [x] `handleToggleRace` — start / pause / resume depending on `GameStatus`

### Technical fixes
- [x] TS: `colors[index] as string`, Fisher-Yates temp var, guard `if (!round) break`
- [x] `npm run build` — clean build with no errors

---

## ✅ Part 6 — UI Styling
**Goal**: Match the PDF mockup

### Global styles (`src/assets/css/`)
- [x] `variables.css` — CSS variables: colors, fonts, spacing, layout heights
- [x] `base.css` — reset/normalize
- [x] `main.css` — entry point with imports

### Component styles
- [x] AppHeader — dark background, Generate button (orange), Start button (green)
- [x] HorseList — table with header, sticky thead, color dot
- [x] race-track — START (green) and FINISH (red) lines, SVG horse in horse color, lane number
- [x] RoundPanel — Program and Results with the same component, active round highlighted
- [x] Scrollable columns: `--scrollable-height: calc(100vh - 57px - 68px)`
- [x] Column headers aligned in height (`padding: var(--spacing-md)`, `font-size: var(--font-size-base)`)

---

## ✅ Part 7 — Unit Tests (Vitest)
**Goal**: Cover business logic

### Tier 1 — Pure functions
- [x] `horseGenerator` — exactly 20 horses, HSL colors (hue = i/20*360), condition 1-100, unique names
- [x] `scheduleGenerator` — 6 rounds, distances [1200..2200], 10 horses each, Fisher-Yates does not mutate original
- [x] `calcDurations()` — condition 100 → ~8s, condition 1 → ~20s, noise 0.9-1.1, result is integers

### Tier 2 — Vuex store
- [x] `race.ts` mutations: `ADD_HORSE_FINISH` (new result / append to existing), `RESET`, `SET_ROUND_STATUS` (guard on invalid index)
- [x] `race.ts` getters: `currentRound` (null if rounds empty), `currentDurations` ({} if no round)
- [x] `horses.ts` — `SET_HORSES`, `allHorses` getter

### Tier 3 — Composable logic
- [x] `createTimer` — resolves after ms; `cancel()` rejects with `'paused'`
- [x] `pauseRace` — correctly calculates `remainingDurations = total - elapsed`
  > **Note**: `calcDurations`, `createTimer`, `calcRemaining` are not exported — logic reproduced in test file for isolated testing
- [x] `startRace` — tested via `calcDurations` and store mutations

### Components — not covered by unit tests
> RaceLane/RaceTrack/HorseIcon — DOM/CSS animation, covered by E2E

### Result
- 52 tests in 5 files — all passing
- Files: `utils/__tests__/horseGenerator.test.ts`, `utils/__tests__/scheduleGenerator.test.ts`, `store/__tests__/horses.test.ts`, `store/__tests__/race.test.ts`, `composables/__tests__/useRaceRunner.test.ts`

---

## ✅ Part 8 — E2E Tests (Playwright + MCP)
**Goal**: Test the full user flow

### Scenarios — basic flow (8 tests, `npm run test:e2e`)
- [x] Open app — empty state displayed
- [x] Click "GENERATE PROGRAM" — horse list and schedule appear
- [x] Click "START" — animation begins, horses move
- [x] After a round — results appear in Results panel
- [x] Click "PAUSE" during race — animation stops
- [x] Click "START" again — resumes from paused position
- [x] "START" button re-enables between rounds
- [x] "GENERATE PROGRAM" resets state and generates new horses

### Scenarios — full 6-round cycle (1 test, `npm run test:e2e:full`)
- [x] Single pass: pause/resume each round → 10 results after each → after 6th round Start disabled → Generate Program resets everything → new race starts

### Implementation
- [x] `e2e/horse-racing.spec.ts` — 9 tests in 2 describe blocks
- [x] Playwright MCP configured in `.mcp.json` with full nvm path
- [x] `playwright.config.ts` timeout increased to 60s for animations
- [x] `waitForRoundEnd()` / `waitForLastRoundEnd()` helpers (no `waitForTimeout`)
- [x] Full race test: single pass through all 6 rounds instead of 3 separate tests (~2 min instead of ~6 min)

---

## Part 9 — Deploy to Cloudflare Pages
**Goal**: Public demo

### Steps
- [ ] Verify `npm run build` — clean dist with no errors
- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Settings: Build command `npm run build`, Output `dist`
- [ ] Environment variables if needed
- [ ] Verify production URL

---

## Architectural Decisions

### Why Vuex and not Pinia?
The assignment explicitly requires Vuex Store. Using Vuex 4 with TypeScript typing.

### Animation logic
CSS-based animation (`transition: transform`). Duration normalized to 8–20s:
```
duration(ms) = MIN + (1 - (condition-1)/99) * (MAX - MIN) * noise(0.9-1.1)
```
Higher condition = shorter duration = faster horse.

### Round sequence
`useRaceRunner` runs one round at a time. After a round completes — `GameStatus.Generated`, button becomes "Start". Next click starts the next round.

### Position determination
Positions are determined **before animation starts** (deterministic result based on duration), animation only visualizes the already-known result.

### Progressive results
Each horse is pushed to Results immediately on `transitionend` via `ADD_HORSE_FINISH`. `waitForAllFinished()` ensures all 10 horses are recorded before advancing to the next round.
