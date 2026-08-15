# Survivors

A parity-first modern rebuild of Imanol Irizar's 2022 party survival board and card game. It is a local hot-seat React app backed by a pure, serializable `applyAction(state, action)` engine, seeded decks, exact recovered workbook data, and real-map terrain conversion.

## Run

```sh
pnpm install
pnpm dev
```

Use `pnpm test` and `pnpm build` for verification. The browser saves the current match locally. No backend is required; state and actions are intentionally JSON-compatible so a future authoritative server can validate the same transitions.

## Archaeology

- [Reconstructed original](docs/original-game.md)
- [Balance and data ledger](docs/balance-and-data.md)
- [Confidence and uncertainties](docs/uncertainties.md)
- [Comparison with the older rewrite](docs/rewrite-comparison.md)
- [Architecture](ARCHITECTURE.md)
- [Current session handover](HANDOVER.md)

The built-in 12×16 board is the generated output for the prototype's `San_Sebastian_V_terrain` real-world map. The visible background at `public/maps/san-sebastian-terrain.jpg` is a byte-for-byte copy of the authoritative prototype asset `.archaeology/survivors_prototype/maps/San_Sebastian_V_terrain.jpg` (700×933, SHA-256 `646c68cb3d8093cc2dae52386f6d438c24face12450791ff22bcdde99958b26d`). It is an original Google Maps snippet included in the recovered prototype; the app makes no Google API or network request.

Use **Convert another map** to run the same nearest-reference-color/majority pipeline entirely in the browser. The uploaded image remains beneath its transparent terrain overlay and is kept separately from pure game state in local browser presentation storage. **New game** restores the built-in San Sebastián image and terrain.

The collapsed **Map visibility** menu directly above **Intel & private peeks** controls the background map (50% default), terrain emoji (60%), and canonical terrain-color overlay (20%). These presentation preferences persist separately from game state and are retained by **New game**; **Reset appearance** restores the defaults.

The world event is once-per-round setup. Each refuge then automatically reveals its player card for acknowledgement. Scavenge, Build/Gather, and Produce can be completed in any order from the four-button Orders bar below the map; End Turn presents only the calculated consumption. The compact HUD directly above the map shows the current team, resources, activity use, and workers split among wounded, scavenging, idle, used-this-turn, and persistent party assignments.

## Combat and keyboard control

Select a current-player attack party on the map to reveal its contextual **Attack** control; combat is intentionally not a fifth permanent dock mode. Adjacent enemy parties and owned structures are targets. The combat dialog records seeded dice, weapons, watchtower modifiers, casualties, retreats, ten-round pauses, and resolution in serializable game state.

The recovered prototype confirms Risk-like 4-vs-2 dice, 3-vs-3 open-ground combat with mutual losses on ties, nearby watchtower and distributed equipment bonuses, weapon breakage/capture, ten-throw pauses, and no retreat for base defenders. The prototype does not specify the complete comparison, geography, retreat, or capture algorithm. This rewrite therefore labels and documents its policy choices: descending comparisons, defender wins ordinary ties, Grass/Sand/Rocks are open ground, one weapon adds +1 to one die and then breaks, retreat returns the party to its origin, and capturing a base transfers its marker without automatically eliminating its refuge.

Keyboard controls remain contextual: `S`, `B`, `P`, `E` open the four primary modes; arrows move the selected map cell while a mode is open; focused numeric fields use Up/Down; selects use Left/Right with wrapping; Enter invokes the legal primary action; Escape closes an action panel and restores its opener. Active combat cannot be dismissed with Escape.
