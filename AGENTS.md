# Repository instructions for coding agents

These instructions apply to the entire repository. Read `HANDOVER.md`, `ARCHITECTURE.md`, `README.md`, and the relevant `docs/` files before changing behavior.

## Protected branches and working branch

- Work on `rewrite-codex` unless the user explicitly chooses another non-protected branch.
- Never modify, merge into, force-push, or rewrite `main`.
- Never modify the existing experimental `rewrite` branch.
- Treat `codex/rewrite-codex` as an obsolete duplicate branch, not the canonical implementation.
- Before editing, confirm `git status --short --branch`, the current branch, and the protected remote refs.
- Preserve unrelated user changes. Stage only files belonging to the task.
- Make coherent commits, push only `rewrite-codex`, and keep PR #1 as a draft unless the user asks otherwise.

Because this checkout may trigger Git's ownership protection, use command-local configuration rather than changing global settings:

```powershell
git -c safe.directory='C:/Users/imajon/Documents/ChatGPT/survivors game' status --short --branch
```

## Source-of-truth order

Prototype parity comes before redesign or convenience. For original mechanics, use this precedence:

1. Playable/final material in `.archaeology/survivors_prototype`, especially the workbook, final map assets, code behavior, and final documentation.
2. Newer/more complete prototype history where evidence conflicts.
3. Explicit, documented inference only where evidence is incomplete.
4. Deliberate new design only when the user authorizes it.

The remote `imanoliri/survivors_prototype` and its local archaeology copy are authoritative. The old `rewrite` branch is comparison material only.

Always distinguish:

- **Confirmed original**: supported by authoritative evidence.
- **Reasonable inference / rewrite policy**: necessary implementation choice, labeled as such.
- **Unknown**: not recovered; do not invent it and present it as original.

Update `docs/original-game.md`, `docs/balance-and-data.md`, or `docs/uncertainties.md` whenever a rule/value/confidence assessment changes.

## Architecture constraints

- The core transition remains `nextState = applyAction(gameState, action)`.
- Put domain types and action variants in `src/game/model.ts`.
- Put executable recovered content/balance in `src/game/data.ts`.
- Put rule validation/transitions in `src/game/engine.ts`, not React.
- Keep `applyAction` pure and do not mutate input state.
- Keep every `GameState` field and active battle JSON-serializable.
- Use only the seeded RNG stored in state for mechanics; never use `Math.random()`.
- For incompatible persisted-state changes, bump the schema version and add migration tests.
- Keep UI-only preferences, uploaded image data, focus, panels, and form state outside `GameState`.
- Treat map conversion as a core product feature. Do not replace it with a static abstract board.
- Keep rules/content/map/UI separated so a future authoritative server can reuse the engine.

Add or update deterministic tests for every rule change. Do not make UI code the sole implementation of a game rule.

## Current product/UI contract

The most recent user-approved layout is map-centric and should not regress accidentally:

- A compact current-player HUD is directly above the map in normal document flow. It shows the team banner, round/turn, worker allocation, resources, and activities. It must not overlay cells.
- Four labeled Orders buttons are directly below the map: Scavenge, Build/Gather, Produce, End Turn. Their shortcuts are `S`, `B`, `P`, and `E`.
- The terrain legend is removed.
- Map appearance and conversion live in a collapsed **Map visibility** details menu below the board, immediately above **Intel & private peeks**, using the same drawer presentation.
- Visibility defaults are map 50%, terrain emoji 60%, and terrain overlay 20%.
- Terrain glyphs have no badge background. Grass uses `🌾`, mountain uses the broadly supported `🗻`, mountains have a pale grey-white overlay, and swamp is purple-distinguished without a square.
- Bases, buildings, parties, and ownership markers appear above terrain layers on player-colored circles/badges. The current player's selection reticle uses that player's color and jumps to their base on handoff.
- Player cards reveal automatically and require acknowledgement; there is no manual draw button.
- Scavenge, Build/Gather, and Produce can be completed in any order. End Turn shows the consumption summary.
- Party movement, Map visibility, Intel, and field log/game controls stay below or collapsed around the board rather than crowding the map.

Preserve keyboard and accessibility behavior: contextual grid arrows, bounded numeric Up/Down, wrapped select Left/Right, legal Enter, safe Escape/focus restoration, input/modifier suppression, visible focus, live announcements, ARIA labels, and cost/requirement help.

`src/ui/App.tsx` is monolithic and `src/ui/styles.css` contains older declarations followed by authoritative overrides. Refactor them only in a behavior-preserving change with thorough browser QA; do not assume an earlier CSS declaration reflects the live layout.

## Work procedure

1. Read the handover and inspect the clean/dirty state and recent log.
2. Identify whether the requested behavior is confirmed prototype parity, a documented inference, or a deliberate UI/product improvement.
3. Inspect existing tests and pure helpers before editing.
4. Use `apply_patch` for manual file edits. Avoid broad rewrites of user-tuned UI unless requested.
5. Run focused tests while working, then the full verification set.
6. For UI work, run a production preview and test the actual interaction at desktop and 390px. Check focus/shortcuts, overflow, broken images, and console warnings/errors.
7. Update architecture/evidence/handover documentation when the change affects them.
8. Review `git diff` and `git diff --check`; stage only intended files.
9. Commit a coherent checkpoint and push only `rewrite-codex`.
10. Confirm the Netlify PR preview and protected refs, then leave the worktree clean.

## Runtime and verification

Preferred commands:

```powershell
pnpm test
pnpm build
git diff --check
```

If `node` or `pnpm` is not on `PATH`, the bundled desktop runtime currently lives under:

```text
C:\Users\imajon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin
C:\Users\imajon\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd
```

Prepend the Node directory for the command and invoke that `pnpm.cmd`. Do not hard-code this path into project files; rediscover the workspace runtime if it changes.

The required completion bar is:

- Full Vitest suite passes.
- TypeScript and Vite production build pass.
- `git diff --check` passes.
- Relevant browser flows pass without console errors; check mobile for layout changes.
- Netlify deploy-preview status succeeds after push.
- `origin/main` and `origin/rewrite` remain unchanged.
- Worktree is clean and synchronized with `origin/rewrite-codex`.

## Documentation and handoff

- `ARCHITECTURE.md` describes the implemented system and its boundaries.
- `HANDOVER.md` is the current session checkpoint; update its commit, completed work, verification, open issues, and next steps before handing off.
- `README.md` is the concise public entry point.
- `docs/` preserves evidence and uncertainty, not just implementation notes.

Do not claim Firefox/Chrome, Netlify, or mobile verification unless it was actually performed. Do not claim an inferred rule is recovered evidence. A useful handoff states exact refs, commands/results, deployment state, and any incomplete browser path.
