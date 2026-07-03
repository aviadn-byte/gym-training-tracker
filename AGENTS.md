# AGENTS.md — Gym Training Tracker (PWA)

## Mission

Build the **complete application** described in `אפיון-אפליקציית-אימונים.md` (the PRD, in Hebrew — read it fully before writing code): phases 1 AND 2. Phase 3 (Supabase/auth/sharing) is out of scope — do not build it, but keep the data layer clean enough to add sync later.

This includes the **full visual design** — the app must look like a polished commercial product, not a developer prototype. Design direction is specified below and is not optional.

## Stack (fixed — do not substitute)

- React 18 + TypeScript (strict) + Vite
- Tailwind CSS, RTL layout (`dir="rtl"` on `<html>`)
- Zustand for state
- Dexie.js (IndexedDB) — local-first, no backend, must work fully offline
- Recharts for charts
- vite-plugin-pwa (Workbox) — installable, offline-capable
- react-router
- Deploy: GitHub Pages via GitHub Actions on push to `main` (include the workflow file)
- Tests: Vitest + React Testing Library

## Design direction — "modern, but cool"

The vibe: a premium fitness product. Dark, energetic, confident. Think less "form over data" and more "training companion that gets you hyped".

### Visual language
- **Dark-first.** Background near-black (#0A0A0C), surfaces as elevated dark cards (#151519) with 16–20px radius and subtle 1px borders (white at 6–8% opacity). No pure gray-on-gray mush — keep contrast crisp.
- **One electric accent:** volt green (#C8FF2E or similar) for primary actions, active states, progress, and highlights. Secondary accent: hot orange/red only for PRs and warnings. Everything else stays neutral. Do not rainbow the UI.
- **Typography:** Heebo (Google Fonts). Weights: 400/600/800. **Numbers are the heroes** — weight, reps, and timer displayed huge (32–56px, weight 800, tabular-nums, `dir="ltr"`). Labels small, muted (60% white).
- **Depth:** subtle gradients on cards (2–3% lightness shift), soft glow on the accent color for active elements (e.g. `box-shadow: 0 0 24px rgba(200,255,46,0.15)`). No skeuomorphism, no heavy shadows.
- **Iconography:** lucide-react, 1.5px stroke, consistent 20/24px sizes.

### Motion & delight (implement these — this is the "cool")
- Micro-interactions: buttons scale to 0.97 on press; set rows animate in; checkmark springs when a set is saved.
- **Rest timer:** full-width floating pill with an animated circular/linear progress ring in the accent color; pulses gently in the final 5 seconds.
- **PR celebration:** when a set beats a personal record — brief confetti burst + "שיא חדש! 🏆" toast. Make hitting a PR feel like something.
- **Workout summary:** animated count-up of total volume, duration, and PRs.
- Progress charts draw in on mount; week-consistency shown as a streak of glowing dots.
- Use CSS transitions/keyframes or framer-motion (allowed). Respect `prefers-reduced-motion`.

### Layout
- **Mobile-first (390px is the primary design target).** Bottom tab bar navigation (5 tabs: היום, אימון, תוכניות, התקדמות, הגדרות) with the active tab glowing in accent.
- Active workout screen: one exercise in focus, previous performance ghosted next to each input, giant +/- steppers (min 56px touch targets), sticky rest-timer pill. Must be operable with sweaty thumbs — zero precision taps.
- Desktop (program builder mostly): same theme, centered max-w-2xl content, no separate design.
- All UI text in Hebrew, RTL. Numbers LTR inside RTL (`dir="ltr"` spans).

## Functional requirements — summary (PRD is authoritative)

**Programs:** create/edit/duplicate/archive programs (goal: strength/hypertrophy/mixed → templates derive real rep ranges & rest: strength 3–6 reps, 3–5min; hypertrophy 6–15 reps, 1.5–3min); days with ordered exercises (sets, target rep range, target RPE, rest seconds); **supersets** via `supersetGroup`; built-in **deload** config (every N weeks, load/set factors); templates: PPL, Upper/Lower, Full Body.

**Exercise library:** ~150 seeded exercises in `db/seed/exercises.ts` (Hebrew + English names, primary/secondary muscles, equipment) — actually write the full seed list; **bilingual search**; custom exercises; per-exercise persistent `notes` (machine seat/pin settings — always visible in active workout) and `weightIncrementKg` (2.5 default; 1/2/5).

**Active workout:** start from program day or resume interrupted session (`status: 'active'`); every set persisted immediately; defaults = last performance; edit/delete sets (also after completion); set types: warmup/working/drop/AMRAP; add/swap/skip exercises mid-session; rest timer auto-starts on set save (vibration, no audio interruption; skip & +30s buttons); **plate calculator** on tapping weight (bar 20kg, configurable); optional **painScore** (0–10) per set; end-of-session summary with **sessionRPE** (1–10).

**Progress:** per-exercise chart (max weight, volume, e1RM); weekly volume by muscle group (primary ×1.0, secondary ×0.5) vs recommended range; PR table; calendar history with editable session details; **body weight tracking** + relative strength; stagnation/load/pain alerts surfaced on the home screen.

**Import/export:** full JSON backup/restore; **CSV import from Hevy and Strong** with automatic exercise mapping (English names) + manual reconciliation screen for unmatched.

**Disclaimer:** first launch + settings — the app is not medical advice.

## Domain rules (pure functions in `src/domain/`, all unit-tested)

- e1RM (Epley): `weight * (1 + reps/30)` — working sets of 1–10 reps only
- Volume: Σ(weight × reps), working sets only; per-muscle: primary ×1.0, secondary ×0.5
- Effective sets: working sets with RPE ≥ 7 or no RPE
- Stagnation: linear regression on e1RM over last 4–5 exposures; slope ≤ 0 → flag. Suggestions conservative (variation / rep-range change / deload), never just "add weight". Pain-flagged exercises excluded from load-increase suggestions
- Pain: score ≥ 4, or pain in 2 consecutive exposures → suggest avoiding exercise + seeing a professional
- Double progression: all sets at top of rep range at RPE ≤ target → suggest +increment next session; else suggest +1 rep. Shown as dismissible "suggested target" in active workout
- Weekly load alert: weekly volume > 125% of trailing 4-week average
- Units: kg only. PRs are derived — never stored

## Data model (Dexie)

Tables: `exercises`, `programs`, `workoutDays`, `workoutSessions` (embedded `loggedSets[]`), `bodyWeightEntries`. Fields per PRD §5.3 (includes `supersetGroup`, `notes`, `weightIncrementKg`, `sessionRPE`, `painScore`, session `status`). Dates as ISO UTC strings, displayed via `Intl.DateTimeFormat('he-IL')`. App data only in IndexedDB; localStorage only for UI prefs.

## Project structure

```
src/
  components/     # Button, NumberStepper, RestTimer, PlateCalculator, Confetti, ...
  features/
    programs/  workout/  progress/  exercises/  settings/
  db/             # Dexie schema, migrations, seed/exercises.ts
  domain/         # pure logic + tests
  i18n/he.ts      # ALL UI strings — no hardcoded text in components
```

## Build order

1. Scaffold: Vite + TS + Tailwind (RTL, dark theme tokens) + Dexie schema + router + tab bar + disclaimer
2. Design system primitives: colors/typography tokens, Button, Card, NumberStepper, toast, bottom tabs — get the look right HERE, everything else inherits it
3. Exercise library (seed + bilingual search + notes/increment editing)
4. Program builder (days, exercises, supersets, deload, templates)
5. Active workout screen (the product — full polish: timer, steppers, previous/target ghosting, plate calculator, PR confetti, summary)
6. History + session editing
7. Progress: charts, volume, PRs, body weight, alerts
8. Import/export (JSON + Hevy/Strong CSV)
9. PWA hardening (offline, install prompt, icons/manifest — generate a fitting app icon) + GitHub Actions deploy workflow

Commit after each step with a descriptive message. Do not skip step 2.

## Definition of done

- `npm run build`, `npm run test`, `npm run lint` all pass
- Full flow works offline (DevTools → Network → Offline): create program → run workout → view progress
- Verified in 390px mobile viewport, RTL, dark theme
- Domain logic fully unit-tested; a PR triggers confetti; rest timer vibrates
- Lighthouse PWA installable; app deployed by the included GitHub Actions workflow
