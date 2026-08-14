# Prototype Parity Refactor Progress

This file records concrete corrections made after comparing the rewrite with `survivors_prototype`.

## Corrected in the rewrite

- Restored the prototype's eight resource categories: **Water, Food, Wood, Rock, Medicines, Tools, Weapons, Information**.
- Removed generic `Materials` from the game model.
- Removed the invented `actionsRemaining = 1` / one-action-per-turn rule.
- Removed the invented Warehouse / Supermarket / Hospital special-location system.
- Removed finite/depleted POI scavenging from the current parity implementation.
- Separated **scavenger declarations** from **attack parties**.
- Scavengers are assignments of community survivors to map tiles rather than generic mobile expeditions.
- Attack parties are their own entity with create, move and disband operations.
- Forming an attack party no longer reduces the community's total `survivors` count; parties/scavengers are modeled as subsets of that population.
- Restored explicit medicine consumption for wounded survivors at end turn.
- Kept 1 Food + 1 Water per survivor consumption.
- Restored the prototype structure catalog: **Base, Bridge, Farm, Hunter Camp, Lumber Camp, Quarry, Well, Water Cleaner, Pharmacy, Workshop, Radio, Watchtower**.
- Bases are represented directly on each starting settlement tile.
- Reconstructed the distinction visible in the prototype economy diagram between **gathering-with-building** structures and **production** structures.
- Radio stores the prototype-confirmed **+1 found survivor** effect.
- Watchtower stores the prototype-confirmed **+1 to one combat die** effect.
- Restored the two separate prototype card decks: **event cards** and **player cards**.
- Card definitions use the recovered prototype schema: **number of copies, name, description**.
- Restored the prototype draw/dealt/reshuffle lifecycle: exhausted decks are rebuilt from dealt cards.
- Restored card timing from the Python game loop: **one event card at round start and one player card at each player-turn start**.
- Card effects remain descriptive/manual, matching the old prototype's actual level of automation.

## Still provisional / not claimed as recovered rules

The following remain implementation placeholders because their exact prototype values/rules have not yet been recovered from the binary workbook/documentation:

- actual event-card names, descriptions and effects;
- actual player-card names, descriptions and effects;
- the rewrite currently uses clearly labeled placeholder cards to exercise the recovered deck flow;
- deterministic deck order is used in tests/UI until seeded random shuffling is introduced;
- terrain gathering values;
- numeric gathering bonuses from Farm / Hunter Camp / Lumber Camp / Quarry;
- numeric production amounts from Well / Water Cleaner / Pharmacy / Workshop;
- all construction costs;
- exact Workshop Tools/Weapons conversion behavior;
- exact terrain taxonomy mapping (`forest/water/farmland/urban` is still a UI placeholder around the older Lake/Wood/Grass/Buildings/Rocks concepts);
- exact Bridge placement/crossing rules;
- exact attack-party movement range/cost;
- combat rules beyond the recovered Watchtower bonus;
- exact survivor assignment restrictions.

Provisional numeric values and placeholder card content are explicitly documented in code and must not be treated as original game balance/content.

## High-priority parity work remaining

1. Restore victory points and prototype end conditions.
2. Implement Look for Survivors, including Radio's documented `+1 found survivor` effect.
3. Recover dice-based combat and apply Watchtower's documented combat bonus.
4. Restore real-world map-to-tile generation.
5. Recover exact economy/building costs, production values and original card content from the original workbook/documentation when possible.
6. Add other factions and radiation/sandstorm/nature-effect phases.
