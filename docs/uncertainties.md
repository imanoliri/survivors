# Confidence and uncertainties

## Confirmed and implemented

Starting balance; eight resources and terrain classes; exact RGB classifier; full deck composition/text and weighted seeded draws; event/card phases; event effects; automatic building outputs; build costs and activation timing; adjacent gathering-building reach; survivor search; the 3-information next-card peek; five-tile party movement; food/water/medicine upkeep; elimination and optional finite-deck endings; local hot-seat state; real-image conversion.

## Confirmed but still partial

- Gathering buildings cover their own and orthogonally adjacent relevant tiles with up to three gatherers each. The engine enforces reach and readiness; the prototype has no durable worker-location model to automate assignments beyond the activity.
- Building uses three survivors. A crew holding three tools completes for next-round activation; a crew holding fewer takes two rounds. This crew-tool check is evaluated before the separate workbook construction cost is paid.
- Workshop output is a choice between five tools or five weapons after consuming rock and wood; the active player can set that output.
- Spend 3 information to view the next event or player card even outside one's turn is implemented in the serializable engine. The hot-seat UI exposes it for the player currently holding the device, avoiding hidden-information leakage.
- Found-building cards grant a free placement; found buildings activate on the following round.
- Snow, bridge crossing, and five-step movement work; river orientation does not exist in the tile data.
- Victory points drive the implemented optional finite-deck ending, but no scoring formula was recovered; the default remains the playable reshuffling/last-party mode.
- Combat evidence is substantial. The rewrite now automates it with documented, deterministic policy choices where the prototype is silent; those choices remain candidates for replacement if stronger evidence is recovered.

## Unknown, conflicting, or defective sources

- Food and water shortage each say “one dies”; simultaneous shortage may mean one total or one per shortage. The engine currently applies one per resource shortage and documents that interpretation.
- Empty decks both reshuffle (`CardStack`) and can end a configured game (`game_finished`). Default follows the playable reshuffle behavior.
- Mixed terrain/swamp logic is described in `tiles.py`, but `if len(counts): return tile` makes it unreachable. The converter follows shipped dominant classification.
- The Python converter iterates x-major then reshapes row-major, transposing cell ordering. The web uses geographical row-major ordering.
- Flee notation `1D6<2` is ambiguous and is not treated as a confirmed die check. The current retreat action has no flee roll and returns a party to its origin.
- Casualty comparison/pairing is absent from the prototype. Current policy sorts dice descending, pairs them, awards ordinary ties to the defender, and kills both on open-ground ties.
- “Open ground” is not mapped to terrain names. Current policy uses Grass, Sand, and Rocks because they are the unobstructed traversable prototype terrain classes; Wood, Buildings, and Swamp are excluded.
- Equipment distribution timing is incomplete. Current policy spends at most one weapon per rolled die per round; it adds +1 and breaks. Unused committed weapons return unless their side is eliminated, in which case the winner captures them.
- Building/base capture and retreat destinations are unspecified. Current policy transfers the targeted marker, does not eliminate a refuge solely for losing its base, and moves a victorious attacker onto the target tile.
- Base placement, player count, attack-party minimum, trade enforcement, points, other factions, radiation, and sandstorms are incomplete.
- Workbook scoped names and unused player rows contain `#REF!`; these are spreadsheet defects, not mechanics.
