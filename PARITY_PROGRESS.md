# Prototype Parity Refactor Progress

This file records concrete corrections made after comparing the rewrite with `survivors_prototype`.

## Corrected in the rewrite

- Restored the prototype's eight resource categories: **Water, Food, Wood, Rock, Medicines, Tools, Weapons, Information**.
- Removed generic `Materials` from the game model.
- Removed the invented `actionsRemaining = 1` / one-action-per-turn rule.
- Removed the invented Warehouse / Supermarket / Hospital special-location system.
- Removed finite/depleted POI scavenging from the current parity implementation.
- Separated **scavenger declarations** from **attack parties**.
- Scavengers are now assignments of community survivors to map tiles rather than generic mobile expeditions.
- Attack parties are now their own entity with create, move and disband operations.
- Forming an attack party no longer reduces the community's total `survivors` count; parties/scavengers are modeled as subsets of that population.
- Restored explicit medicine consumption for wounded survivors at end turn.
- Kept 1 Food + 1 Water per survivor consumption.

## Still provisional / not claimed as recovered rules

The following remain implementation placeholders because their exact prototype values/rules have not yet been recovered from the binary workbook/documentation:

- terrain gathering values;
- exact terrain taxonomy mapping (`forest/water/farmland/urban` is still a UI placeholder around the older Lake/Wood/Grass/Buildings/Rocks concepts);
- Farm construction cost;
- Farm food output;
- exact attack-party movement range/cost;
- combat rules;
- exact survivor assignment restrictions.

Provisional numeric values in code are deliberately named `PROVISIONAL_*` and should not be treated as original game balance.

## High-priority parity work remaining

1. Recover and implement the full building economy: Base, Bridge, Farm, Hunter Camp, Lumber Camp, Quarry, Well, Water Cleaner, Pharmacy, Workshop, Radio and Watchtower.
2. Restore event and player card decks/effects.
3. Restore victory points and prototype end conditions.
4. Implement Look for Survivors, including Radio's documented `+1 found survivor` effect.
5. Recover dice-based combat and Watchtower's documented combat bonus.
6. Restore real-world map-to-tile generation.
7. Add other factions and radiation/sandstorm/nature-effect phases.
