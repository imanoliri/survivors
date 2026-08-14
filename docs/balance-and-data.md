# Balance and data ledger

## Starting party

Each of the five workbook examples starts with 3 survivors/idlers, 9 water, 9 food, 4 medicines, 4 rock, 4 wood, 5 tools, 0 weapons, 5 information, 0 wounded, and 0 points. The prototype does not mandate five players; this hot-seat milestone starts two.

## Terrain

| Code | Terrain | Build | Big | Walk | Workbook resource fields |
|---|---|---:|---:|---:|---|
| L | Lake | no | no | no | direct water 1, food 3, rock 1 |
| S | Swamp | yes | no | yes | direct water 1 |
| W | Wood | yes | no | yes | underground water 1, food 3, wood 1 |
| G | Grass | yes | yes | yes | underground water 1, food 3 |
| B | Buildings | yes | yes | yes | food, medicines, rock, wood, tools 1 each |
| M | Mountain | yes | no | no | rock 4 |
| R | Rocks | yes | yes | yes | rock 3 |
| A | Sand | yes | yes | yes | none |

RGB calibration: `L 154,192,255`; `S 166,207,216`; `W 168,218,181`; `G 209,229,217`; `B 231,235,238`; `M 0,0,0`; `R 255,255,255`; `A 252,232,231`.

## Structures

| Structure | Construction cost | Automatic output / confirmed role |
|---|---|---|
| Well | rock 3, wood 3, tools 2 | water 15 |
| Water cleaner | rock 1, wood 1, tools 1, information 1 | water 5 |
| Pharmacy (`farmacy`) | medicines 6, rock 2, wood 2, tools 1, information 6 | medicines 3, information 1 |
| Workshop | rock 2, wood 2, tools 3, information 4 | consumes rock 1 + wood 1; choose tools 5 or weapons 5 |
| Radio station | rock 2, wood 2, tools 15, information 4 | information 1; +1 found survivor |
| Watchtower | rock 2, wood 2, tools 10, weapons 5 | information 1; +1 highest combat die in range 1 |
| Farm | rock 2, wood 2, tools 5, information 2 | up to 3 gatherers on containing/adjacent Grass |
| Hunter camp | rock 2, wood 2, tools 5, weapons 3, information 2 | up to 3 gatherers on containing/adjacent Wood |
| Lumber camp | rock 2, wood 2, tools 5, information 2 | up to 3 gatherers on containing/adjacent Wood |
| Quarry | rock 2, wood 2, tools 5, information 2 | up to 3 gatherers on containing/adjacent tiles |

Bridge has 12 find cards but no construction row. Base has an icon but no cost row.

## Decks

Event deck: Rats ×5, Sickness ×3, Snow storm ×3, Heatwave ×3, Rainy day ×6, Sunny day ×10 = 30.

Player deck: eight Scavenge resource cards ×7; Accident ×7; Fatal accident ×3; Survivors ×15; Bridge ×12; six subbuildings ×2; four large buildings ×1 = 109. Water/Food Scavenge grants `15 + 10S`; other resources grant `5 + 3S` when at least one scavenger is active.

The 12×16 generated San Sebastián V board used here has 192 cells. The workbook's separate 14×14 UI map has 196 (Lake 44, Wood 41, Grass 8, Buildings 99, Rocks 1, Sand 3); the artifacts are different aspect-ratio variants, not a counting discrepancy.

