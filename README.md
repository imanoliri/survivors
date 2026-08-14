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

The built-in 12×16 board is the generated output for the prototype's `San_Sebastian_V_terrain` real-world map. Use **Convert another map** to run the same nearest-reference-color/majority pipeline entirely in the browser.
