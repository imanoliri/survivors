# Reconstructed original game

## Evidence and precedence

The authority is `imanoliri/survivors_prototype`, final commit `c86ccc9` (2022-10-31). Its `main`, `automatic`, and `reprogram-game` tips coincide; `v1` preserves the preceding documentation edits. Evidence examined: all Python/configuration source, full branch history, `game_san_sebastian.xlsx` sheets/tables/formulas/names/drawings, generated map workbooks, DOCX structure, every rendered page of the matching PDF, `economy.svg`, real map images, and all icons.

When sources conflict, this rebuild records the conflict. It gives exact balance values to the workbook, flow rules to the final PDF, and executable lifecycle behavior to Python. It does not treat spreadsheet errors as rules.

## Confirmed round and turn flow

Each round draws and resolves one event card. Each player then declares scavengers, draws/resolves one player card, receives automatic production, performs activities, consumes supplies, updates victory points, and checks the ending. The design notes reserve later phases for other factions and environmental effects, but define neither.

An activity is available per three non-scavenging survivors, rounded up. Confirmed activities are building, gathering, survivor search, forming/disbanding an attack party, and moving/attacking with one. Survivor search spends 4–12 food, finding one survivor per four food plus one per radio station. Attack parties move five tiles per turn. Resources or rights to unused facilities may be traded during the active player's turn.

Three survivors construct a building. Crews with three tools finish faster, but even a finished building cannot be actively used that turn; the web therefore activates equipped construction next round and unequipped construction after two rounds. Farm, hunter camp, lumber camp, and quarry extend gathering to their own and adjacent appropriate tiles. Any player may spend 3 information to inspect the next event or player card, including outside their turn.

Every survivor consumes one food and one water. A shortage kills a survivor. Every wounded survivor needs one medicine to heal; if supplies are insufficient, the wounded do not heal and one dies. A heatwave makes working survivors consume a second water.

The last living party wins; no survivors means no winner. Python also contains an optional end-on-deck-depletion mode resolved by points, including tied stalemate, while its `CardStack` normally reshuffles an empty deck.

## Combat

Combat is Risk-like: attacker rolls four dice and defender two. Open ground uses three each and ties kill both. Watchtowers add one to the highest friendly die within one tile; equipment bonuses are spread over dice. A combat pauses after ten throws. Used weapons break; remaining committed weapons of an eliminated side are captured. Base defenders cannot flee. The comparison/casualty algorithm and the phrase `1D6<2` are not specified well enough for safe implementation.

## Map pipeline

The prototype consumes a real map image, chooses a grid near 200 tiles from its aspect ratio, maps sampled pixels to the nearest of eight calibrated terrain colors, and assigns each cell's dominant class. The original generated vertical San Sebastián board is 12×16. The web converter preserves the effective dominant-class pipeline and allows local image upload without a server.
