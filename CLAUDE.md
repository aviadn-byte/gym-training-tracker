# CLAUDE.md — Gym Training Tracker (PWA)

> Also works as AGENTS.md for Codex — same instructions apply.

## Project

Hebrew (RTL) gym workout planning & tracking PWA for a single experienced lifter (friends may join later). Full spec: `אפיון-אפליקציית-אימונים.md` (v1.1) — read it before implementing any feature.

Core loop: build training programs → log sets during workouts (mobile, offline) → analyze progress and get progression guidance (volume, estimated 1RM, PRs, stagnation & overload alerts).

## Stack

- React 18 + TypeScript (strict) + Vite
- Tailwind CSS, RTL layout (`dir="rtl"` on root), dark theme default, font: Heebo
- Zustand for state
- Dexie.js (IndexedDB) for all persistence — **local-first, no backend in phases 1–2**
- Recharts for charts
- vite-plugin-pwa (Workbox) — app must fully work offline
- Deploy: GitHub Pages via GitHub Actions on push to `main`
- Tests: Vitest + React Testing Library

## Project structure

```
src/
  components/     # shared UI (Button, NumberStepper, RestTimer, PlateCalculator, ...)
  features/
    programs/     # program builder: list, editor, day editor, supersets, deload config
    workout/      # active workout session screen + timer + session recovery
    progress/     # charts, PRs, calendar, stagnation, body weight, load alerts
    exercises/    # exercise library + custom exercises + per-exercise notes
    settings/     # export/import JSON, Hevy/Strong CSV import, preferences
  db/             # Dexie schema, migrations, seed data
  domain/         # pure logic: 1RM, volume, progression, PR/stagnation/load detection
  i18n/           # Hebrew strings (single he.ts file, no i18n lib needed yet)
```

## Data model (Dexie tables)

`exercises`, `programs`, `workoutDays`, `workoutSessions` (embedded loggedSets array), `bodyWeightEntries`. See PRD §5.3. Key fields beyond the obvious:

- `Exercise`: `notes` (persistent — machine seat/pin settings, shown in active workout), `weightIncrementKg` (default 2.5; 1/2/5 allowed)
- `PlannedExercise`: `supersetGroup` (string | null — same group = performed alternately)
- `Program`: `deload` config ({ everyNWeeks, loadFactor, setFactor } | null)
- `WorkoutSession`: `status` ('active' | 'completed') for crash/battery recovery, `sessionRPE` (1–10, optional)
- `LoggedSet`: `painScore` (0–10, optional) + `painNote`
- PRs are **derived**, computed in `domain/` — never stored

## Domain rules (implement in `src/domain/`, pure functions, unit-tested)

- Estimated 1RM: Epley `weight * (1 + reps/30)`, working sets of 1–10 reps only
- Volume: Σ(weight × reps) over working sets (exclude warmups). Per-muscle-group volume: primary muscle ×1.0, secondary ×0.5
- Effective sets: working sets with RPE ≥ 7 or no RPE logged
- Stagnation: linear regression over e1RM of the exercise's last 4–5 sessions; slope ≤ 0 → flagged. Suggestions must be conservative (exercise variation, rep-range change, deload) — never just "add weight". Exercises with an active pain flag are excluded from load-increase suggestions
- Pain: painScore ≥ 4, or pain logged in 2 consecutive exposures → suggest avoiding the exercise and seeing a professional
- Progression (double progression): all sets hit top of target rep range at RPE ≤ target → suggest +weightIncrementKg next session; otherwise suggest +1 rep on missed sets. Shown as "suggested target" in active workout, dismissible
- Weekly load alert: weekly volume > 125% of trailing 4-week average → warn
- Units: kg only (phase 1). Default bar weight 20kg (configurable) for plate calculator

## Conventions

- All UI text in Hebrew, sourced from `i18n/he.ts` — no hardcoded strings in components
- Mobile-first: the active-workout screen is the product. Touch targets ≥ 48px, +/- steppers using the exercise's `weightIncrementKg`, previous performance + suggested target + exercise notes visible per set
- Exercise search must match both Hebrew and English names
- Every logged set is persisted immediately (crash-safe); on app open, an unfinished session ('active') is offered for resumption
- Sets and completed sessions are editable/deletable after the fact
- Rest timer: starts on set save; vibration/silent notification (must not interrupt user's music), skip and +30s buttons; duration from the planned exercise
- Supersets: render grouped in program editor and active workout; rest timer applies after the group
- Medical disclaimer (not medical advice) on first launch + settings screen
- Dates: store as ISO strings (UTC), display via `Intl.DateTimeFormat('he-IL')`
- Weight numbers displayed LTR inside RTL layout (`dir="ltr"` on numeric spans)
- No localStorage for app data — IndexedDB via Dexie only. localStorage OK for UI prefs
- `db/seed/exercises.ts` is the single source for the built-in library (~150 exercises, Hebrew + English names, primary/secondary muscle groups, equipment)
- Program templates (PPL, Upper/Lower, Full Body) must derive real parameters from goal: strength = 3–6 reps / 3–5 min rest; hypertrophy = 6–15 reps / 1.5–3 min rest

## Build order (phase 1 MVP — do in this order)

1. Scaffold: Vite + TS + Tailwind RTL + Dexie schema + routing (react-router) + disclaimer
2. Exercise library: seed data + browse/search (bilingual)/filter + per-exercise notes & increment
3. Program builder: create program → add days → add exercises with sets/reps/RPE targets + superset grouping
4. Active workout screen: start/resume session, log sets (immediate persist), edit/delete sets, rest timer (vibrate/skip/+30s), previous-performance + notes display, session summary
5. History: calendar list of past sessions, session detail view with editing
6. Export/import JSON in settings

Phase 2 (only after MVP works): per-exercise charts, weekly volume by muscle group (×0.5 secondary), PR table, trend-based stagnation, double-progression suggestions, pain flags, session RPE, weekly load alert, built-in deload, body weight tracking, plate calculator, Hevy/Strong CSV import, PWA offline hardening, program templates.

Phase 3 (not now): Supabase auth + sync + program sharing + shareable PR card.

## Commands

```
npm run dev        # local dev
npm run test       # vitest
npm run build      # tsc && vite build
npm run lint       # eslint + prettier check
```

## Definition of done

- `npm run build` and `npm run test` pass
- Feature works offline (test with DevTools → Network → Offline)
- UI verified in mobile viewport (390px) in RTL
- Domain logic has unit tests; UI logic tested where practical
