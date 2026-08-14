# Confidence and uncertainties

## Confirmed and implemented

Starting balance; eight resources and terrain classes; exact RGB classifier; full deck composition/text and weighted seeded draws; event/card phases; event effects; automatic building outputs; build costs; survivor search; five-tile party movement; food/water/medicine upkeep; elimination ending; local hot-seat state; real-image conversion.

## Confirmed but still partial

- Gathering buildings cover their own and adjacent relevant tiles with up to three gatherers each. The milestone supports direct tile gathering; area assignment is not automated.
- Building uses three survivors. The prose's two-turn delay when the workers lack tools and its no-use-on-completion-turn rule need a construction queue; the exact relationship to the separate tool construction cost is unclear.
- Workshop output is a choice between five tools or five weapons after consuming rock and wood; the active player can set that output.
- Spend 3 information to view the next event or player card even outside one's turn is not yet exposed.
- Found-building cards grant a free placement; found buildings activate on the following round.
- Snow, bridge crossing, and five-step movement work; river orientation does not exist in the tile data.
- Victory points exist and drive the optional finite-deck ending, but no scoring formula was recovered.
- Combat evidence is substantial, but the missing comparison/casualty specification makes automation unsafe.

## Unknown, conflicting, or defective sources

- Food and water shortage each say “one dies”; simultaneous shortage may mean one total or one per shortage. The engine currently applies one per resource shortage and documents that interpretation.
- Empty decks both reshuffle (`CardStack`) and can end a configured game (`game_finished`). Default follows the playable reshuffle behavior.
- Mixed terrain/swamp logic is described in `tiles.py`, but `if len(counts): return tile` makes it unreachable. The converter follows shipped dominant classification.
- The Python converter iterates x-major then reshapes row-major, transposing cell ordering. The web uses geographical row-major ordering.
- Flee notation `1D6<2` is ambiguous.
- Base placement, player count, attack-party minimum, trade enforcement, building capture, points, other factions, radiation, and sandstorms are incomplete.
- Workbook scoped names and unused player rows contain `#REF!`; these are spreadsheet defects, not mechanics.
