# Session handover

Snapshot: 2026-08-15. This file is for the next coding session and should be refreshed at each substantial handoff.

## Repository state

- Repository: `imanoliri/survivors`
- Canonical working branch: `rewrite-codex`
- Starting HEAD for this documentation handoff: `c6d153b259d2fcf5d927767136b10f273cb28741`
- Protected `origin/main`: `f93c2b5f8ce5a53e5ed2dabdaab9b434fc2ababb`
- Protected `origin/rewrite`: `9784b94dc101d739edc8f68cc0da9efd3637c7f6`
- Draft PR: [#1](https://github.com/imanoliri/survivors/pull/1), `rewrite-codex` -> `main`
- Netlify preview: [deploy-preview-1--city-survivors.netlify.app](https://deploy-preview-1--city-survivors.netlify.app)
- First activity-shelf implementation: `67b7a4e` (`Expose turn activities directly below map`), pushed on `rewrite-codex`. The current checkpoint has uncommitted compact-shelf refinements on top of that commit and still needs its second verification cycle.

Do not use the old local/remote `codex/rewrite-codex` duplicate as the continuation branch. Do not modify `main` or `rewrite`.

## What is complete

### Archaeology and evidence

The authoritative `survivors_prototype` was deeply inspected across Python, history/branches, JSON/config, the full XLSX XML/formulas/worksheets/tables/names/drawings, rendered PDF and DOCX structure, `economy.svg`, maps and generated map workbooks, and icons/assets. The experimental `rewrite` was inspected only for comparison.

The findings are preserved in:

- `docs/original-game.md`
- `docs/balance-and-data.md`
- `docs/uncertainties.md`
- `docs/rewrite-comparison.md`

### Game and engine

The repository now has React + TypeScript + Vite + Vitest with a pure, serializable, seed-deterministic `applyAction` engine. Implemented coverage includes:

- Exact recovered 8-resource/8-terrain economy, weighted card catalogs, costs, production, weather, starting values, consumption, and endings.
- Once-per-round event and automatic per-player card reveal/acknowledgement.
- Order-independent Scavenge, Build/Gather, and Produce turn workflow.
- Direct/base/building gathering with recovered adjacency behavior.
- Construction activation timing, tool timing, found-building placement, workshop output, survivor search, and three-card information peeks.
- Worker accounting and activity allowances.
- Persistent attack parties and keyboard-assisted grid movement.
- Deterministic serializable combat, modifiers, casualties, retreats, pause/resume, capture, and resolution.
- Optional finite-deck ending, save migrations through schema v3, bounded structured turn history, and safer map replacement.
- In-browser real-image-to-terrain conversion plus the original San Sebastian map presentation.

### Current UI

The latest user-directed layout is the acceptance baseline:

- The current-player command HUD is a bar immediately above the map, not over it. It contains the team color/name, round/turn, workers, all eight resources, and activity count.
- The map uses the recovered San Sebastian image underneath restrained cell borders, terrain overlays/emojis, and player-owned markers.
- A collapsed **Map visibility** drawer below the board holds the opacity sliders and map conversion. It sits immediately above **Intel & private peeks** and uses the same menu presentation.
- A compact full-width two-tier activity shelf is below the map. Required turn decisions expose Scavenge, Produce, and End Turn directly; the second tier exposes Build, Gather, Search survivors, and Form party without routing those activities through a combined menu.
- Scavenge, Gather, and Form party keep their bounded amounts beside the action, Produce keeps its workshop-output choice beside its action, and Build keeps the structure select inline in its card with the selected map cell as target. A pending found building appears as a direct placement action.
- Terrain legend is gone. Party movement follows the activity shelf. Map visibility, Intel, and field-log/game controls are collapsed below.
- Bases/buildings/parties and HOME markers sit above terrain on player-colored badges; the current player reticle uses that color and recenters on the current base at handoff.
- Terrain presentation defaults: background 50%, terrain emoji 60%, overlay 20%. Grass is `🌾`; mountain is `🗻` with a pale rock tint; swamp is purple-distinguished. Terrain emoji themselves have no badge rectangle.
- Cards reveal automatically. The player acknowledges the card, performs Scavenge/Build-Gather/Produce in any order, and gets a consumption-only End Turn summary.
- Keyboard support covers `S`, `B`, and `P` focusing the direct Scavenge, Build structure, and Produce controls, `E` requesting End Turn, target-panel grid arrows, number/select adjustments, Enter, Escape/focus restoration, and accessible announcements/help. End Turn validation focuses the missing required direct control.

## Verification at the last implementation checkpoint

At `c6d153b` before these documentation-only changes:

- Vitest: 50 tests in 5 files passed.
- TypeScript + Vite production build passed.
- `git diff --check` passed.
- Desktop and 390px local production-browser QA passed for the final map/HUD/Orders/Visibility composition.
- Live Netlify preview was verified after deployment with no console warnings/errors.
- `origin/main` and `origin/rewrite` remained unchanged.

The documentation handoff then reran the full suite: all 50 tests passed, the TypeScript/Vite production build passed, and `git diff --check` passed.

The next UI adjustment removed the `COMMANDING` label and replaced the map-corner eye with a collapsed **Map visibility** drawer immediately above **Intel & private peeks**. The full 50-test suite and production build passed again. Local production-browser QA passed at desktop and 390x844: drawer order/opening and 50/60/20 values were verified, the removed label/eye were absent, mobile had no horizontal overflow, and the console had no warnings or errors.

For the first deployed activity-shelf checkpoint (`67b7a4e`):

- Vitest: 51 tests in 5 files passed.
- TypeScript + Vite production build passed.
- `git diff --check` passed.
- A local production preview was started, but the in-app browser could not reach the host loopback address.
- The pushed Netlify deploy preview was subsequently available for review. User feedback from that first deployed preview was that the shelf needed to be more compact and the separate Build disclosure added an unnecessary choice step. The current uncommitted refinement compacts the shelf and moves the structure select directly into the Build card.
- A second verification cycle is pending for the refinement: rerun the full suite/build/diff check, push it, then verify the new Netlify preview at desktop and 390px, including interactions, focus, overflow, and console output. Protected refs and deployment status must also be rechecked.

The repository does not yet contain browser E2E tests; the current compact-shelf refinement still needs its second reachable-browser QA pass.

## Known uncertainties and intentional partials

Do not “finish” these by silently inventing original mechanics. Consult `docs/uncertainties.md` first.

- The original points/victory scoring formula remains unrecovered. `finiteDecks` exists, but default play is reshuffling/last-standing.
- Prototype combat evidence leaves the full comparison, open-ground geography, target/capture, and retreat algorithms incomplete. Implemented policies are explicitly labeled in the docs.
- The prototype's flee notation `1D6 < 2` is unresolved; current retreat is a documented no-roll policy back to origin.
- Base capture transfers the marker but does not automatically eliminate the refuge; this is an inference.
- Simultaneous food and water shortage interpretation remains uncertain.
- River/orientation information is absent from recovered map data.
- Trade is not enforced, and other-faction/radiation/sandstorm ideas are incomplete prototype material.

## Recommended next-session priorities

Begin with the user's next concrete request rather than starting a broad redesign. Good engineering follow-ups, if requested, are:

1. Complete desktop and 390px QA of the compact direct activity shelf against the second remote Netlify preview after commit/push. Check every direct action, the inline Build structure choice and selected-cell target, End Turn prerequisite focus, keyboard shortcuts/focus restoration, overflow, and console output.
2. Refactor `App.tsx` and the accumulated end-of-file `styles.css` overrides into stable components/modules while preserving the current approved visual contract.
3. Improve party movement/combat discoverability with no rule changes.
4. Add browser E2E coverage for card acknowledgement, direct Scavenge/Produce/Build/Gather/Search/Form party actions, player handoff/base focus, the Map visibility drawer, mobile overflow, map import, and one combat flow.
5. Resolve points, flee, shortage, or combat policy only if new evidence or an explicit design decision is available.

The user has been iterating visually and values exact placement. For any UI request, verify the wording literally against a live screenshot/DOM at desktop and 390px before declaring completion.

## Resume checklist

1. Read `AGENTS.md` and `ARCHITECTURE.md`.
2. Confirm the branch and refs:

   ```powershell
   git -c safe.directory='C:/Users/imajon/Documents/ChatGPT/survivors game' status --short --branch
   git -c safe.directory='C:/Users/imajon/Documents/ChatGPT/survivors game' log --oneline -12
   git -c safe.directory='C:/Users/imajon/Documents/ChatGPT/survivors game' rev-parse origin/main origin/rewrite origin/rewrite-codex
   ```

3. Read the requested subsystem and its tests before editing.
4. Run the full baseline:

   ```powershell
   pnpm test
   pnpm build
   git diff --check
   ```

5. For UI work, run a production preview and test desktop, 390px, keyboard/focus, and console output.
6. Commit coherently, push only `rewrite-codex`, verify PR #1/Netlify, confirm protected refs, and update this handover.

If `pnpm` is unavailable, use the bundled runtime paths recorded in `AGENTS.md` or rediscover them through the Codex workspace dependency helper.

## Recent implementation commits

```text
c6d153b Move visibility eye into map corner
12717f5 Keep visibility control behind action menus
58a94e5 Place command HUD above map
fd85bf1 Move map orders to bottom bar
80dc0b1 Reframe map UI as RTS command view
f531e0d Add keyboard-driven combat milestone
ccd49ce Redesign player turns around map actions
7cc4e39 Isolate terrain glyph presentation
fdff7c2 Improve map layers and make player card first
29510a9 Clarify turn flow and worker allocation
b3c80fe Redesign board around original map
d711f90 Publish Vite build on Netlify
```
