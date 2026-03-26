# Horse Racing Game

An interactive horse racing game built as a front-end case study for Insider. The user generates a list of horses, a race schedule, and launches animated races with progressive results display.

**Live demo**: _coming soon — Cloudflare Pages_

---

## What it does

- Generates 20 horses, each with a unique name, color, and condition score (1–100)
- Creates a 6-round race schedule — 10 random horses per round, distances from 1200m to 2200m
- Runs animated races round by round — horses move at speeds based on their condition
- Supports **Pause / Resume** mid-race with smooth animation continuation
- Displays results progressively as each horse crosses the finish line
- After all 6 rounds complete, the Start button disables — Generate resets everything

## Tech Stack

| | |
|---|---|
| Framework | Vue 3 + Composition API (`<script setup>`) |
| State Management | Vuex 4 |
| Language | TypeScript |
| Build Tool | Vite |
| Unit Tests | Vitest (52 tests) |
| E2E Tests | Playwright (9 tests) |
| Deploy | Cloudflare Pages |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run preview      # preview production build
npm run test:unit    # run Vitest unit tests (52 tests)
npm run lint         # run ESLint + oxlint
```

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
```

Covers: horse generation, schedule generation, Vuex store mutations/getters, race runner composable logic.

### E2E Tests (Playwright)

No need to start the server manually — Playwright starts it automatically.

```bash
# Basic scenarios (8 tests, ~1-2 min) — quick check
npm run test:e2e

# Full 6-round cycle (9 tests, ~5-8 min) — complete workflow
npm run test:e2e:full
```

Other Playwright modes:

```bash
npx playwright test --ui        # UI mode — live browser + test list (like Cypress open)
npx playwright test --headed    # headed mode — see browser interactions in real time
npx playwright show-report      # open last HTML report
```

## Project Structure

```
src/
├── features/
│   └── horse-racing/            # single feature — all components tightly coupled
│       ├── HorseRacing.vue          # main feature component (layout + orchestration)
│       ├── components/
│       │   ├── HorseList.vue        # horse list (name, condition, color)
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
│       │   └── scheduleGenerator.ts
│       └── types/
│           └── index.ts             # Horse, Round, RaceResult, GameStatus
├── shared/
│   └── components/
│       └── AppHeader.vue
├── store/
│   └── index.ts                     # Vuex root store
├── assets/
│   └── css/
│       ├── main.css                 # entry point
│       ├── variables.css            # design tokens
│       └── base.css                 # reset/normalize
├── App.vue
└── main.ts
```

## For AI Assistants (Claude Code)

- [`CLAUDE.md`](CLAUDE.md) — project conventions, tech stack, commands, coding rules
- [`PLANNING.md`](PLANNING.md) — full implementation plan with status of each part
