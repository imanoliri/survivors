# Survivors architecture

This document describes the current `rewrite-codex` implementation. It is the technical map for maintainers; recovered design evidence and unresolved rules remain in `docs/`.

## System overview

Survivors is currently a client-only, local hot-seat React/TypeScript game. Its core is a pure, deterministic, JSON-serializable state machine:

```text
React UI -> typed Action -> applyAction(gameState, action) -> new GameState
                                                            |
                                                            +-> localStorage
```

There is no backend, database, runtime API, or map-service dependency. This boundary is deliberate: a future authoritative multiplayer service can receive actions, run the same transitions, and return state without moving rules into React.

## Layers and ownership

| Area | Files | Responsibility |
| --- | --- | --- |
| Entry point | `src/main.tsx` | Mount React in strict mode and load global styles. |
| Domain schema | `src/game/model.ts` | Serializable `GameState`, domain types, and discriminated `Action` union. |
| Recovered content | `src/game/data.ts` | Resources, terrain, buildings, cards, costs, yields, starting balance, and the built-in 12x16 board. |
| Rules engine | `src/game/engine.ts` | Creation, migration, validation, turn flow, activities, upkeep, parties, combat, endings, and map replacement. |
| Map conversion | `src/game/mapConversion.ts` | Pure image-sample classification helpers used by the browser converter. |
| Application shell | `src/ui/App.tsx` | UI composition, dispatch, forms, keyboard/focus behavior, dialogs, storage, and map upload. |
| Pure UI helpers | `src/ui/gameUi.ts` | Grid navigation, shortcuts, form adjustments, costs, tooltips, and consumption summaries. |
| Presentation settings | `src/ui/presentation.ts` | Appearance defaults, parsing/clamping, CSS variables, and UI-only terrain colors. |
| Styling | `src/ui/styles.css`, `src/ui/responsive.css` | Tactical board layout, visual layers, dialogs, focus, and mobile safeguards. |
| Static presentation | `public/icons/`, `public/maps/` | Building markers and the built-in San Sebastian map image. |
| Evidence | `docs/`, `.archaeology/` | Reconstructed rules/data, uncertainty ledger, rewrite comparison, and preserved prototype material. |

`App.tsx` is presently a large orchestration component, and `styles.css` contains successive override blocks from several UI iterations. Later declarations are authoritative. A future component/CSS refactor is welcome, but it should first preserve observable behavior with tests or browser checks.

## State and transition contract

`GameState` is currently schema version 3. It contains the RNG seed/state, round and turn, current player and phase, players and resources, tiles and buildings, persistent field parties, cards/decks/discards/peeks, weather, workflow flags, an optional active battle, a structured current-turn record, the last eight archived turns, end-mode/winner data, the text log, and an ID counter.

The central contract is:

```ts
const nextState = applyAction(previousState, action)
```

`applyAction` deep-clones its input with `structuredClone`, validates the action, applies one transition, and returns the new state. It must never mutate its argument. While combat is active, unrelated actions are rejected. UI code must dispatch an `Action`; it must not duplicate or bypass domain validation.

The UI sometimes applies an action speculatively to decide whether a visible primary action is legal. A failed speculative transition is caught and does not replace persisted state.

For incompatible state changes, increment `GameState.version` and extend `migrateGameState`. Keep all engine state JSON-compatible.

## Turn workflow

A round begins with the once-per-round world event. Resolving it starts the first player turn and automatically reveals that player's card. The card is an acknowledgement dialog rather than a manual draw.

During a turn, Scavenge, Build/Gather, and Produce are order-independent. Workflow flags record the required once-per-turn Scavenge and Produce decisions. Player-card effects resolve when scavengers are declared. Other activities consume the allowance calculated from available idle workers.

End Turn is enabled after Scavenge and Produce. It moves to consumption, shows only the calculated water/food/medicine cost, and on confirmation applies shortages, archives the structured turn record, and starts the next player or the next round event. `getWorkerAllocation` is the canonical accounting for wounded, scavenging, idle, used-this-turn, and party-assigned survivors.

The default ending is `lastStanding`, with empty decks reshuffled. The optional `finiteDecks` mode ends on deck exhaustion and uses stored points, but the original scoring formula was not recovered.

## Determinism and decks

All mechanical randomness comes from the RNG value stored in state. The 32-bit linear congruential step is:

```text
rng = (rng * 1664525 + 1013904223) mod 2^32
```

Fisher-Yates deck shuffling and combat dice use this generator. The same initial seed and action sequence must produce the same result. Never use `Math.random()` for rules.

Decks expand catalog copy counts into ID arrays. Draws pop an ID, append it to the discard, and clear private peeks for that deck.

## Content and source-of-truth policy

`src/game/data.ts` is the executable balance catalog: eight resources, eight terrain classes, twelve structure types, weighted event/player-card decks, starting values, and the generated San Sebastian board.

Rule confidence is not encoded by pretending uncertainty is fact. Use these documents together:

- `docs/original-game.md`: reconstructed game and evidence.
- `docs/balance-and-data.md`: exact recovered values.
- `docs/uncertainties.md`: missing, conflicting, or inferred mechanics.
- `docs/rewrite-comparison.md`: comparison-only audit of the experimental `rewrite` branch.

When changing a recovered rule, update executable data/rules, tests, and the relevant evidence or uncertainty entry in the same change.

## Real-world map conversion and board rendering

Real-world-map conversion is a product feature, not a demo utility. The built-in game uses a 12x16 terrain board generated from the prototype's San Sebastian map. `public/maps/san-sebastian-terrain.jpg` is byte-identical to the authoritative prototype image and is displayed underneath the game grid without a Google Maps network request.

An uploaded image is converted entirely in the browser:

1. Choose grid dimensions of roughly 200 cells while preserving aspect ratio.
2. Read pixels from a canvas.
3. Classify samples by squared RGB distance to canonical terrain reference colors.
4. Assign each cell its majority classification.
5. Dispatch map replacement, which validates traversable base capacity and resets invalid positional state.

The authoritative terrain grid and the visible source image are separate. Rendering has three independent layers:

- Background image: 50% default opacity.
- Canonical terrain-color overlay: 20% default opacity.
- Terrain emoji: 60% default opacity.

Buildings and parties render above those layers. Presentation-only color adjustments, such as the pale rock-like mountain tint, live in `presentation.ts` and do not change classifier RGB values or engine terrain data.

## Current UI contract

The current layout is intentionally map-centric:

```text
battlefield
|-- optional contextual party/attack control
|-- optional Attack panel over the lower map
`-- board wrapper
    |-- command HUD in normal flow above the map
    |-- map
    `-- two-tier activity shelf
        |-- required decisions: Scavenge | Produce | End Turn
        `-- direct activities: Build | Gather | Search survivors | Form party

below the board: party movement, collapsed Map visibility, collapsed Intel, collapsed field log/game controls
```

The HUD above the map shows the active team/banner, round/turn, worker allocation, all eight resource counts, and activity use. It must not overlay map cells. The terrain legend was deliberately removed. The compact activity shelf is also a deliberate rewrite presentation choice rather than recovered prototype evidence: number, output, and Build structure controls sit beside their direct actions, and the selected map cell supplies the target. At viewport widths up to 600px, its two semantic tiers each become a horizontally scrollable, swipeable single row. This contains overflow within the tier, preserves usable control sizes, and reduces the shelf's vertical obstruction of the map.

The collapsed **Map visibility** drawer immediately above **Intel & private peeks** contains the three opacity sliders, Reset appearance, and map conversion. It shares the same below-board details-menu presentation, so appearance controls never cover the map or an action panel. Buildings, bases, parties, selection reticles, and ownership badges use player colors.

Primary keyboard controls are contextual:

- `S`, `B`, `P`: focus the direct Scavenge, Build structure, and Produce controls.
- `G`, `F`: focus the Gather amount and Form Party amount fields respectively; these shortcuts do not dispatch an activity.
- `E`: request End Turn.
- Arrow keys: move the selected map cell while a target panel is open, without wrapping.
- Up/Down on a number field: bounded numeric adjustment.
- Left/Right on a select: cycle options with wrapping.
- Enter: invoke the legal primary action.
- Escape: close an action panel and restore its opener; active combat cannot be dismissed this way.

Shortcuts are suppressed for text/file/editable controls and with Ctrl/Alt/Meta modifiers. Focus transfer, ARIA labels, live announcements, and cost/requirement help are part of the interface contract.

## Persistence and migration

Three browser storage records deliberately keep domain and presentation concerns apart:

| Key | Contents |
| --- | --- |
| `survivors-save-v1` | Migrated, serialized `GameState`. |
| `survivors-map-presentation-v1` | Uploaded background image data URL. |
| `survivors-appearance-v1` | Map, terrain-emoji, and overlay opacity preferences. |

Malformed saves fall back to a new game. Migration currently upgrades v1/v2 saves to v3, adds workflow/history/peek/end-mode/workshop fields, and adapts old phase/card state. Active combat is serializable. New Game restores the built-in map/image but intentionally preserves appearance preferences.

## Combat subsystem

Combat is contextual to a selected current-player party. Legal targets are orthogonally adjacent enemy parties, buildings, or bases. `BattleState` persists the committed forces/equipment, origin and target, rolls, casualties, modifiers, round count, status, and retreat/capture outcome.

The lifecycle is:

```text
startCombat -> rollCombat x N -> terminal result -> resolveCombat
                   |                  ^
                   `-> pause at 10 -> resume
                   `-> legal retreat
```

Implemented mechanics include 4-vs-2 normal dice, 3-vs-3 open-ground dice, descending comparisons, defender-winning ordinary ties, mutual casualties on open-ground ties, a nearby ready watchtower bonus, separately committed one-use weapon bonuses, party/base retreat restrictions, a ten-round pause, casualties, movement after victory, and structure/base ownership transfer.

Some combat algorithms are explicit rewrite policy because the prototype evidence is incomplete. They are labeled in `docs/uncertainties.md`; do not silently reclassify them as original rules.

## Verification and deployment

Vitest runs state-transition and helper tests in Node:

- `src/game/engine.test.ts`
- `src/game/combat.test.ts`
- `src/game/mapConversion.test.ts`
- `src/ui/gameUi.test.ts`
- `src/ui/presentation.test.ts`

There is no checked-in browser E2E suite, so meaningful UI/layout changes also require manual production-preview QA at desktop and 390px mobile width, including keyboard/focus behavior and the browser console.

Commands:

```sh
pnpm test
pnpm build
```

`pnpm build` runs `tsc -b && vite build`. Netlify uses `netlify.toml` to run that command and publish `dist`. Each pushed PR commit should receive a deploy preview.

## Evolution rules

- Keep rules pure, deterministic, serializable, and independent from React.
- Add domain behavior through typed actions and transition tests.
- Keep balance/content data centralized rather than scattering constants through the engine or UI.
- Keep uploaded imagery and appearance settings outside `GameState`.
- Preserve source confidence labels and prototype parity before deliberate improvements.
- Preserve the map/HUD/direct activity shelf and below-board Map visibility interaction contract unless the user explicitly requests another redesign.
- Before removing accumulated CSS overrides or splitting `App.tsx`, capture current behavior and verify desktop/mobile parity after the refactor.
