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

The built-in 12×16 board is the generated output for the prototype's `San_Sebastian_V_terrain` real-world map. The visible background at `public/maps/san-sebastian-terrain.jpg` is a byte-for-byte copy of the authoritative prototype asset `.archaeology/survivors_prototype/maps/San_Sebastian_V_terrain.jpg` (700×933, SHA-256 `646c68cb3d8093cc2dae52386f6d438c24face12450791ff22bcdde99958b26d`). It is an original Google Maps snippet included in the recovered prototype; the app makes no Google API or network request.

Use **Convert another map** to run the same nearest-reference-color/majority pipeline entirely in the browser. The uploaded image remains beneath its transparent terrain overlay and is kept separately from pure game state in local browser presentation storage. **New game** restores the built-in San Sebastián image and terrain.

The compact map appearance controls independently adjust the background map (50% default), terrain emoji (60%), and canonical terrain-color overlay (20%). These presentation preferences persist separately from game state and are retained by **New game**; **Reset appearance** restores the defaults.

The world event is once-per-round setup outside the player timeline. Each refuge then starts by revealing its player card, chooses scavengers with that information visible, applies the card, and continues through production, activities, and consumption. The timeline records those decisions with plain-language **Now / Next** guidance. The worker panel accounts separately for wounded survivors, scavengers, idle workers, crews used this turn, and persistent attack parties.
