# Survivors Prototype → Rewrite Parity Audit

This document compares the current TypeScript rewrite against the recoverable design of `imanoliri/survivors_prototype`.

## Status labels

- **Faithful** — directly supported by prototype code/design artifacts.
- **Adapted** — based on a prototype concept, but current rules/values are new.
- **Missing** — clearly present in the prototype design but not yet implemented in the rewrite.
- **New** — introduced by the rewrite; no evidence found in the prototype artifacts inspected so far.

## Prototype evidence inspected

- `README.md`
- `design_notes.md`
- `game.py`
- `play.py`
- `cards.py` / `card_stacks.py` / `card_stacks.json`
- `map2tiles.py` / `map2tiles.json`
- `documentation/economy.svg`
- repository icon set
- branch inventory (`main`, `v1`, `automatic`, `reprogram-game`)

The binary `game_san_sebastian.xlsx` and Word/PDF game documentation remain important sources for exact balancing and card text. The connected GitHub interface exposes those files but does not decode their binary contents, so exact values that exist only there are not yet verified.

# Confirmed prototype design

## Round / turn structure

The prototype explicitly defines:

1. Pull an event card.
2. Resolve the event card.
3. For each player:
   - declare scavengers;
   - pull a player card;
   - resolve the player card;
   - automatic resource production;
   - activities:
     - build;
     - produce resources;
     - gather;
     - look for survivors;
     - create/disband an attack party;
     - move-attack an already existing attack party;
   - consume resources;
   - update victory points;
   - check game end.
4. Other factions act.
5. Radiation/sandstorm/nature effects act.

The Python prototype automated card dealing and game-end checks, while the actual board/economy actions were performed manually in Google Sheets.

## Consumption

Prototype rule explicitly documented:

- 1 Food + 1 Water per survivor.
- If insufficient, survivors die.
- 1 Medicine per wounded survivor.
- If insufficient, wounded survivors die.

## Victory

Two prototype end modes are implemented in Python:

- only one player has survivors remaining → that player wins;
- nobody has survivors → nobody wins;
- optional card-depletion ending → player with highest victory points wins, ties are stalemates.

## Prototype resources

The economy diagram contains eight resource categories:

- Water
- Food
- Wood
- Rock
- Medicines
- Tools
- Weapons
- Information

This is significantly richer than the rewrite's current `food / water / medicine / materials` model.

## Prototype map / terrain economy

The economy diagram explicitly contains these map/resource concepts:

- Lake
- Wood
- Grass
- Buildings
- Rocks

The map-generation code converts real map imagery into tile categories. The prototype was designed around real geography rather than a generic abstract grid.

## Prototype buildings / structures

Confirmed from the economy diagram and icon set:

- Base
- Bridge
- Farm
- Hunter Camp
- Lumber Camp
- Quarry
- Well
- Water Cleaner / Cleaner
- Pharmacy
- Workshop
- Radio Station / Radio
- Watchtower

Known effects visible in the economy diagram include:

- Radio: `+1 found survivor` effect.
- Watchtower: `+1 to one dice in combat` effect.
- Well and Cleaner produce Water at different rates.
- Farm / Hunter Camp produce Food.
- Lumber Camp produces Wood.
- Quarry produces Rock.
- Pharmacy produces Medicines.
- Workshop participates in Tools/Weapons production.

Exact costs/production values should be recovered from the spreadsheet/documentation before hard-coding them in the rewrite.

## Cards

The prototype has two separate decks:

- event cards
- player cards

Cards have at least:

- number of copies;
- name;
- description.

The Python program deals and reshuffles these decks, but card effects were intended to be applied manually.

# Current rewrite parity matrix

| Rewrite feature | Status | Notes |
|---|---|---|
| React + TypeScript architecture | New | Technology/architecture choice only; does not alter intended game design. |
| Pure action-based game engine | New | Good implementation architecture, not a prototype mechanic. |
| Two local players | Adapted | Multiplayer factions are faithful; exact player setup/count is not recovered yet. |
| Survivors population | Faithful | Central prototype mechanic. |
| Wounded survivors field | Faithful concept / incomplete | Prototype explicitly requires wounded survivors + medicine consumption; rewrite does not yet implement wound lifecycle. |
| Food | Faithful | Prototype resource. |
| Water | Faithful | Prototype resource. |
| Medicine | Faithful | Prototype resource, called Medicines in economy diagram. |
| Generic `Materials` | **Not faithful** | Prototype distinguishes Wood, Rock and Tools, and also Weapons + Information. This abstraction should be removed if parity is the goal. |
| 1 Food + 1 Water consumption | Faithful | Explicit prototype rule. |
| Current casualty calculation | Adapted | Prototype states shortage causes deaths, but exact simultaneous-shortage algorithm used by rewrite is our implementation choice. |
| One action per player turn | **New** | No evidence in prototype that activities were limited to exactly one action. Likely wrong unless documentation confirms it. |
| 4×3 predefined map | New placeholder | Temporary implementation scaffold only. |
| Real-world map → tile map | Missing | One of the prototype's most distinctive implemented features. |
| Current terrain types: urban/forest/water/farmland | Adapted | Prototype economy uses Lake/Wood/Grass/Buildings/Rocks and image-classified tile categories; current taxonomy is not faithful. |
| Settlement entity | Adapted | Bases/players on board are evidenced, but current exact settlement mechanics are rewrite choices. |
| Gather from settlement or adjacent tile | **New** | No prototype evidence found for one-tile settlement gathering range. |
| Terrain gather yields currently hard-coded | **New / not faithful** | Current values (e.g. farmland +3 Food, water +3 Water) were invented for the rewrite. |
| Farm building | Faithful concept | Farm exists in prototype. |
| Farm costs 2 generic Materials | **New / not faithful** | Prototype has distinct Wood/Rock/etc.; exact original cost not yet recovered. |
| Farm produces 2 Food | **Adapted/unverified** | Prototype Farm produces Food, but the rewrite's exact value is not verified. |
| Farm only buildable on farmland settlement | **New/unverified** | Prototype says Farm is associated with Grass; exact placement constraints need recovery. |
| Automatic building production | Faithful | Explicit prototype turn phase. |
| Survivor groups / expeditions | Adapted | Prototype explicitly has attack parties, but our generic expedition model is broader than confirmed prototype behavior. |
| Create group by removing survivors from base | Faithful direction / adapted rules | Creating/disbanding attack parties exists; exact formation constraints are not recovered. |
| Must leave 1 survivor at settlement | **New** | No prototype evidence found. |
| Orthogonal one-tile movement | **New/unverified** | Prototype has `Move-attack` but exact geometry/range is not yet recovered. |
| Water impassable to groups | **New/unverified** | Could be reasonable, but not established from inspected prototype artifacts. Bridge icon strongly suggests crossing rules existed and should be recovered. |
| Gathering from a tile occupied by an expedition | **New/unverified** | Prototype separates scavengers, gather, and attack parties; current combination may be conceptually wrong. |
| Special urban locations: Warehouse/Supermarket/Hospital | **New** | These specific POIs were invented for rewrite. Prototype instead clearly contains economy structures such as Pharmacy, Workshop, Radio, etc. |
| Finite special-location loot | **New/unverified** | No evidence found yet for depletion mechanic. |
| Scavenge action requiring expedition physically on tile | Adapted/New | Prototype has `Declare scavengers`, but current implementation is not proven equivalent. |
| Depleted scavenging sites | **New** | No evidence recovered so far. |
| Fog-of-war proposal | **New/unverified** | Do not implement until prototype rules are recovered. |
| Event-card system | Missing | Core prototype feature. |
| Player-card system | Missing | Core prototype feature. |
| Look for survivors | Missing | Explicit prototype activity. |
| Radio survivor-finding bonus | Missing | Economy diagram explicitly shows +1 found survivor. |
| Attack parties | Partial/adapted | Generic groups exist, but prototype attack/combat mechanics are not implemented faithfully. |
| Combat | Missing | Watchtower bonus proves dice-based combat existed. |
| Watchtower | Missing | Confirmed prototype building; +1 to one combat die. |
| Hunter Camp | Missing | Confirmed prototype building. |
| Lumber Camp | Missing | Confirmed prototype building. |
| Quarry | Missing | Confirmed prototype building. |
| Well | Missing | Confirmed prototype building. |
| Water Cleaner | Missing | Confirmed prototype building. |
| Pharmacy | Missing | Confirmed prototype building. |
| Workshop | Missing | Confirmed prototype building. |
| Radio | Missing | Confirmed prototype building. |
| Bridge | Missing | Confirmed by prototype icon set; exact rule pending documentation. |
| Wood resource | Missing | Confirmed prototype resource. |
| Rock resource | Missing | Confirmed prototype resource. |
| Tools resource | Missing | Confirmed prototype resource. |
| Weapons resource | Missing | Confirmed prototype resource. |
| Information resource | Missing | Confirmed prototype resource. |
| Medicine consumption by wounded | Missing | Explicit prototype rule. |
| Victory points | Missing | Explicit prototype mechanic and implemented end condition. |
| Last survivor faction victory | Missing in current engine | Implemented in old Python prototype. |
| Everyone-dead ending | Missing | Implemented in old Python prototype. |
| Other factions | Missing | Explicit prototype turn phase. |
| Radiation/sandstorm/nature effects | Missing | Explicit prototype turn phase. |

# Most important corrections before continuing

## 1. Restore the original resource model

Replace generic `materials` with the prototype's actual resource categories, at minimum:

`Water / Food / Wood / Rock / Medicines / Tools / Weapons / Information`.

Do not balance these yet until the spreadsheet/documentation values are recovered.

## 2. Stop using the one-action-per-turn assumption

The prototype lists multiple activities within a player's turn and does not establish a one-action limit in the artifacts inspected. The current `actionsRemaining = 1` system should be considered temporary and likely removed.

## 3. Separate scavengers from attack parties

The prototype specifically says:

- declare scavengers;
- create/disband an attack party;
- move-attack an existing attack party.

That suggests the rewrite's single generic expedition abstraction may be conflating two distinct systems.

## 4. Replace invented POI scavenging with recovered prototype mechanics

Warehouse / Supermarket / Hospital and permanent depletion are rewrite inventions. Keep them only if we consciously decide to improve the original game after parity is achieved.

## 5. Recover the original building economy

The prototype economy is substantially richer and appears central to the game. Farm should not be developed in isolation; the full building/resource graph should be reconstructed first.

## 6. Restore prototype endgame and cards early

Event cards, player cards, victory points and elimination were among the few systems the original Python prototype actually automated. They should be high-priority parity features.

# Recommended rewrite policy from this point

1. **Parity first:** implement only rules that can be traced to prototype evidence.
2. Mark uncertain values as `TODO: recover prototype value`, rather than inventing a number.
3. Maintain this matrix as mechanics are recovered.
4. Keep rewrite-only improvements in a separate backlog.
5. Once prototype parity is playable, explicitly decide which legacy rules to modernize.
