# Survivors — Rewrite Game Specification

## Product Vision

**Survivors** is a turn-based multiplayer survival strategy game played on a map derived from a real-world location.

Each player controls a small community of survivors after a societal collapse. Players must secure food, water and medicine, explore surrounding terrain, recruit additional survivors, construct infrastructure, form expedition and combat groups, endure random events, and compete or coexist with other survivor communities.

> **Take a real place, turn it into a post-apocalyptic game board, and see which survivor community can endure and dominate it.**

## Core Design Principles

### Real-world maps are the game board
A selected real-world area is converted into a grid of playable terrain tiles. Terrain affects gameplay rather than existing only visually.

### Population is both power and burden
More survivors provide labor, production, exploration and military strength, but every additional survivor consumes food and water and may require medicine.

### Survival comes before expansion
The fundamental loop is:

**survive → gather → build → expand → compete → survive again**

### Terrain creates strategic differences
Forests, water, farmland, urban areas, industrial areas, hills and special locations provide different resources, movement properties and strategic opportunities.

### Random events create stories
Global events, player cards, discoveries, environmental hazards and encounters should generate strategic situations and emergent stories.

## Game Structure

A game consists of:

1. Game creation
2. Map generation
3. Player setup
4. Initial settlement placement
5. Repeating rounds
6. Endgame
7. Final scoring

Target approximately **2–6 players**, configurable by scenario.

## Game Setup

The host chooses game name, map location, map size, number of players, game length, victory rules, optional scenario, optional AI factions and difficulty settings.

The selected real-world area becomes a tile grid. Each tile contains at least:

```text
id
coordinates
terrain type
resource modifiers
movement cost
ownership
occupants
buildings
discovered state
special location
```

The first implementation does not require sophisticated machine vision. Geographic APIs, simplified map data or predefined maps are acceptable before automatic real-world terrain conversion is implemented.

## Terrain

Initial terrain types:

- **Urban** — high scavenging potential; materials, tools, medicine, food and equipment; greater encounter risk.
- **Forest** — wood, hunting and food; slower movement.
- **Water** — water and fishing; restricts normal movement.
- **Swamp / Wetland** — water and biological resources; slow movement, disease risk and poor construction.
- **Farmland / Open Land** — food production and suitable construction areas.
- **Industrial** — materials, fuel, machinery and tools.
- **Hills / Difficult Terrain** — slower movement and defensive advantages.
- **Special Locations** — hospitals, supermarkets, police stations, military facilities, factories, farms, warehouses and fuel stations with unique scavenging opportunities or bonuses.

## Player Community

Each player controls one survivor faction containing:

```text
name
color
survivors
wounded survivors
resources
settlements
buildings
groups
territory
cards
victory points
status effects
```

The community is the primary strategic entity. Individual named characters can later appear as specialists or heroes.

## Survivors

MVP survivor states:

- healthy
- wounded
- dead

Possible future states include sick, infected, exhausted and starving.

## Resources

Core resources:

- **Food** — consumed every round.
- **Water** — consumed every round.
- **Medicine** — treats wounded survivors and resolves medical events.
- **Materials** — used for construction; initially abstracts wood, metal and other building materials.

Possible later resources include fuel, ammunition, tools, electricity, morale and knowledge.

## Consumption

Each survivor requires per consumption phase:

```text
1 Food
1 Water
```

Wounded survivors may additionally require medicine. Shortages cause casualties. Exact values must be data-driven rather than hard-coded.

## Player Turn

### 1. Player Card
Draw a player card providing an opportunity, bonus, choice, temporary effect, discovery or problem.

### 2. Assign Survivors
Allocate survivors to gathering, production, building, exploration, scavenging, expedition groups or combat groups.

### 3. Production
Buildings and controlled terrain generate resources.

### 4. Actions
Players receive a configurable number of actions. Core actions are:

- **Gather** — collect resources from terrain.
- **Scavenge** — search urban or special locations.
- **Build** — construct infrastructure.
- **Recruit** — search for additional survivors.
- **Create Group** — assign survivors to an expedition/combat group.
- **Disband Group** — return members to a settlement.
- **Move Group** — move an existing group across the map.
- **Attack** — attack an enemy group or settlement.
- **Explore** — reveal undiscovered information.

### 5. Consumption
Consume food and water and treat wounded survivors where possible.

### 6. Score / End Check
Evaluate victory points and ending conditions.

## Round Structure

```text
Start Round

1. Draw global event
2. Resolve global event
3. Player 1 turn
4. Player 2 turn
5. Player 3 turn
...
6. AI / neutral factions act
7. Environmental effects resolve
8. End-of-round checks

Next Round
```

## Global Event Cards

One event is drawn at the start of each round. Events should usually create decisions or strategic situations rather than simply removing resources.

Examples: Heavy Rain, Epidemic, Heat Wave, Refugees, Supply Drop, Bandit Activity and Good Harvest.

## Player Cards

Player cards can provide equipment, temporary bonuses, special actions, recruitment, tactical effects, discoveries or emergencies.

Examples: Experienced Medic, Hidden Supplies, Old Truck, Local Knowledge and Desperate Survivors.

## Buildings

Initial buildings:

- **Shelter** — increases capacity or protection.
- **Farm** — produces food.
- **Water Collector** — produces water.
- **Workshop** — produces materials or improves construction.
- **Clinic** — improves wounded survivor recovery.
- **Watchtower** — improves defense or visibility.

Buildings require materials, survivor labor and potentially construction time.

## Settlements

Each player begins with one settlement containing survivors, stored resources, buildings and defensive strength. Additional settlements may be added later; one primary settlement per player is sufficient for the first version.

## Groups

Mobile survivor groups contain:

```text
owner
current tile
survivor count
movement points
health/status
equipment
mission
```

Groups support scavenging, exploration, transport, recruitment and combat.

## Movement

Groups move between adjacent tiles. Movement costs depend on terrain. Example values:

```text
Road / Urban: 1
Open terrain: 1
Forest: 2
Hill: 2
Swamp: 3
Water: impassable without special equipment
```

All values are balancing data.

## Exploration and Scavenging

Terrain may be visible while loot, survivors, enemies, hazards and special locations remain hidden until explored.

Urban and special-location tiles can be scavenged for resources, equipment, cards and survivors, with possible hostile encounters. Scavenging locations become depleted over time.

## Recruiting Survivors

Recruitment increases labor, production and military strength while simultaneously increasing food, water and medical requirements. Population growth must therefore be a strategic trade-off.

## Combat

Combat is intentionally abstract rather than tactical. It considers:

```text
number of survivors
equipment
terrain
defensive buildings
cards
random combat modifier
```

Possible outcomes include casualties, wounded survivors, retreat, attacker/defender victory and settlement capture. Combat should contain uncertainty without being completely random.

## Neutral Factions

Optional later factions include bandits, raiders, independent survivor camps and military remnants. They may control territory, attack, trade, recruit or become allies.

## Environmental Systems

Possible hazards include radiation, storms, fire, flooding, disease, extreme heat and extreme cold. Initially these should remain lightweight and event-driven.

## Victory Conditions

### Last Community Standing
Eliminate all rival communities.

### Victory Points
After a fixed number of rounds or deck depletion, highest score wins. Scoring may include surviving population, territory, buildings, resources, objectives, defeated enemies and discoveries.

### Scenario Victory
Future scenarios may require evacuation, control of a location, surviving a set duration, constructing something specific or cooperating against a common threat.

A player is eliminated when no surviving population or viable groups remain. If all factions die, the game may end with **No one survived.**

## Information Model

Static game definitions and dynamic game state must be separated.

Static definitions include terrain types, resources, cards, buildings, events, movement rules, combat modifiers and victory rules. These should live in structured TypeScript/JSON data.

Dynamic state includes players, round, turn, resources, survivors, ownership, buildings, groups, remaining cards and active effects. One authoritative game-state model owns all gameplay state; UI components do not.

## Browser UI

The map is the dominant interface element, with community information and contextual actions surrounding it.

```text
┌────────────────────────────────────────────┐
│ Round 6 | Player: Blue | Event: Heat Wave │
├───────────────────────────┬────────────────┤
│                           │ Community      │
│                           │ Survivors: 14  │
│         MAP               │ Food: 11       │
│                           │ Water: 18      │
│                           │ Medicine: 4    │
│                           │ Materials: 9   │
│                           │ Buildings      │
│                           │ Groups         │
│                           │ Cards          │
├───────────────────────────┴────────────────┤
│ Gather | Explore | Build | Group | End Turn│
└────────────────────────────────────────────┘
```

Selecting a tile shows terrain, owner, resource potential, buildings, groups, special locations and valid contextual actions.

## Game Log

Maintain a visible chronological log so the game can be reconstructed and understood:

```text
Round 5 begins.
Event: Heavy Rain
Red scavenged the hospital.
Red found 2 Medicine.
Blue recruited 3 survivors.
Green attacked Blue.
Blue lost 2 survivors.
Green retreated.
```

## Multiplayer

The eventual intended form is online multiplayer with one authoritative game session. Players connect through browsers; the server validates actions and broadcasts updates.

The first playable version may run locally or as a single-host game.

## Technical Direction

The rewrite is a web application, not a line-by-line port of the Python prototype.

Recommended direction:

```text
Frontend: React + TypeScript
Game engine: Pure TypeScript
Map rendering: Canvas / SVG / web map library
Backend: optional initially; later lightweight API + persistence
Game definitions: JSON / TypeScript data
Persistence: database or serialized game state
```

The game engine must not depend on React, map rendering or persistence.

Conceptually:

```ts
newState = applyAction(gameState, action)
```

This makes rules testable and supports multiplayer, replay and AI.

## Main Domain Objects

```text
Game
GameConfig
GameState
Map
Tile
TerrainType
Player
Community
SurvivorGroup
ResourceInventory
Building
BuildingType
Card
CardDeck
Event
Action
Round
Effect
Combat
VictoryCondition
GameLogEntry
```

## Action Model

Every player interaction becomes a validated game action:

```text
GatherAction
BuildAction
MoveAction
ExploreAction
ScavengeAction
RecruitAction
CreateGroupAction
DisbandGroupAction
AttackAction
PlayCardAction
EndTurnAction
```

This enables validation, logging, replay, multiplayer, AI and automated tests.

The engine rejects invalid actions such as overspending resources, illegal movement, invalid construction, controlling another player's units, out-of-range attacks, playing unavailable cards or acting outside the player's turn.

## MVP

The first genuinely playable version contains:

### Map
- predefined map
- terrain tiles
- tile selection

### Players
- 2–4 players
- one settlement each

### Resources
- food
- water
- medicine
- materials

### Population
- healthy survivors
- wounded survivors

### Actions
- gather
- build
- recruit
- create group
- move
- attack

### Buildings
- farm
- water collector
- clinic
- workshop

### Cards
- event deck
- player deck

### Game flow
- rounds
- turns
- consumption
- deaths
- victory condition
- game log

## Deferred Features

The following do not block the first playable version:

- automatic real-world terrain recognition
- sophisticated geographic APIs
- individual named characters
- complex diplomacy
- trading
- equipment inventories
- technology trees
- advanced AI
- weather simulation
- procedural narratives
- mobile apps
- large persistent servers
- many resource types

## Development Order

1. **Game Engine** — players, resources, survivors, turns, actions, consumption and victory.
2. **Board** — tile grid, terrain, settlements, movement and gathering.
3. **Economy** — production, buildings, recruitment and wounded survivors.
4. **Conflict** — groups, movement, combat and elimination.
5. **Cards** — event deck, player cards and temporary effects.
6. **Proper UI** — polished browser interface.
7. **Real-world Maps** — turn arbitrary real-world locations into playable Survivors boards.
8. **Multiplayer** — hosted sessions and remote players.

## What the Rewrite Must Preserve

The rewrite preserves the prototype's concepts rather than its implementation:

- survival community management
- food and water upkeep
- wounded survivors and medicine
- gathering and production
- building
- recruitment
- expedition/attack groups
- shared geographical board
- real-world map conversion
- global events
- player cards
- environmental hazards
- elimination
- victory points
- possibility that everyone dies

Everything else is open to redesign.

## Product Identity

Survivors should not become a generic zombie game or generic civilization game.

Its distinguishing combination is:

> **real geography + board-game strategy + survival economy + competing communities + unpredictable events**

The target is emergent geographic storytelling: players should remember that they started in one neighborhood, secured the river, scavenged the hospital, survived an epidemic and eventually fought for the industrial district.