import type { GameAction, GameState, Player, PlayerId, Resources, SurvivorGroup, TerrainType, Tile } from './model';

const gatherYield: Record<TerrainType, Partial<Resources>> = {
  urban: { materials: 2 },
  forest: { materials: 2, food: 1 },
  water: { water: 3 },
  farmland: { food: 3 },
};

const FARM_MATERIAL_COST = 2;
const FARM_FOOD_PRODUCTION = 2;

const appendLog = (state: GameState, text: string): GameState => ({
  ...state,
  log: [...state.log, { id: state.nextLogId, text }],
  nextLogId: state.nextLogId + 1,
});

const consume = (player: Player): { player: Player; casualties: number } => {
  const required = player.survivors;
  const foodShortage = Math.max(0, required - player.resources.food);
  const waterShortage = Math.max(0, required - player.resources.water);
  const casualties = Math.min(player.survivors, Math.max(foodShortage, waterShortage));

  return {
    casualties,
    player: {
      ...player,
      survivors: player.survivors - casualties,
      resources: {
        ...player.resources,
        food: Math.max(0, player.resources.food - required),
        water: Math.max(0, player.resources.water - required),
      },
    },
  };
};

const nextPlayer = (id: PlayerId): PlayerId => (id === 'red' ? 'blue' : 'red');

const tileById = (state: GameState, tileId: string): Tile | undefined =>
  state.tiles.find((tile) => tile.id === tileId);

const groupById = (state: GameState, groupId: string): SurvivorGroup | undefined =>
  state.groups.find((group) => group.id === groupId);

const isAdjacent = (a: Tile, b: Tile): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export function isTileReachableFromSettlement(
  state: GameState,
  playerId: PlayerId,
  tileId: string,
): boolean {
  const settlement = tileById(state, state.players[playerId].settlementTileId);
  const target = tileById(state, tileId);
  if (!settlement || !target) return false;
  const distance = Math.abs(settlement.x - target.x) + Math.abs(settlement.y - target.y);
  return distance <= 1;
}

export function hasGroupOnTile(state: GameState, playerId: PlayerId, tileId: string): boolean {
  return state.groups.some((group) => group.ownerId === playerId && group.tileId === tileId);
}

export function canGatherFromTile(state: GameState, playerId: PlayerId, tileId: string): boolean {
  return isTileReachableFromSettlement(state, playerId, tileId) || hasGroupOnTile(state, playerId, tileId);
}

export function getGatherError(state: GameState, playerId: PlayerId, tileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (state.actionsRemaining < 1) return 'No actions remaining. End the turn.';
  if (!tileById(state, tileId)) return 'Tile not found.';
  if (!canGatherFromTile(state, playerId, tileId)) {
    return 'That tile is outside settlement reach and has no expedition group.';
  }
  return null;
}

export function getBuildFarmError(state: GameState, playerId: PlayerId, tileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (state.actionsRemaining < 1) return 'No actions remaining. End the turn.';

  const player = state.players[playerId];
  const tile = tileById(state, tileId);
  if (!tile) return 'Tile not found.';
  if (tile.id !== player.settlementTileId) return 'Farms can currently only be built in your settlement.';
  if (tile.terrain !== 'farmland') return 'A Farm requires farmland.';
  if (tile.buildings.some((building) => building.type === 'farm')) return 'This settlement already has a Farm.';
  if (player.resources.materials < FARM_MATERIAL_COST) return `A Farm costs ${FARM_MATERIAL_COST} materials.`;
  return null;
}

export function getCreateGroupError(state: GameState, playerId: PlayerId, survivors: number): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (state.actionsRemaining < 1) return 'No actions remaining. End the turn.';
  if (!Number.isInteger(survivors) || survivors < 1) return 'A group needs at least 1 survivor.';
  const player = state.players[playerId];
  if (player.survivors <= survivors) return 'At least 1 survivor must remain in the settlement.';
  return null;
}

export function getMoveGroupError(
  state: GameState,
  playerId: PlayerId,
  groupId: string,
  destinationTileId: string,
): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (state.actionsRemaining < 1) return 'No actions remaining. End the turn.';
  const group = groupById(state, groupId);
  if (!group) return 'Group not found.';
  if (group.ownerId !== playerId) return 'You do not control this group.';
  const origin = tileById(state, group.tileId);
  const destination = tileById(state, destinationTileId);
  if (!origin || !destination) return 'Tile not found.';
  if (!isAdjacent(origin, destination)) return 'Groups can only move to an adjacent tile.';
  if (destination.terrain === 'water') return 'Basic survivor groups cannot enter water.';
  return null;
}

function produceFood(state: GameState, playerId: PlayerId): { state: GameState; produced: number } {
  const farms = state.tiles.reduce(
    (count, tile) => count + tile.buildings.filter((building) => building.type === 'farm' && building.ownerId === playerId).length,
    0,
  );
  const produced = farms * FARM_FOOD_PRODUCTION;
  if (!produced) return { state, produced: 0 };

  const player = state.players[playerId];
  return {
    produced,
    state: {
      ...state,
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          resources: { ...player.resources, food: player.resources.food + produced },
        },
      },
    },
  };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'gather') {
    const error = getGatherError(state, action.playerId, action.tileId);
    if (error) throw new Error(error);

    const tile = tileById(state, action.tileId)!;
    const player = state.players[action.playerId];
    const resources = { ...player.resources };

    for (const [resource, amount] of Object.entries(gatherYield[tile.terrain])) {
      resources[resource as keyof Resources] += amount ?? 0;
    }

    return appendLog({
      ...state,
      actionsRemaining: state.actionsRemaining - 1,
      players: { ...state.players, [action.playerId]: { ...player, resources } },
    }, `${player.name} gathered on ${tile.terrain} tile ${tile.id}.`);
  }

  if (action.type === 'buildFarm') {
    const error = getBuildFarmError(state, action.playerId, action.tileId);
    if (error) throw new Error(error);

    const player = state.players[action.playerId];
    const nextState: GameState = {
      ...state,
      actionsRemaining: state.actionsRemaining - 1,
      players: {
        ...state.players,
        [action.playerId]: {
          ...player,
          resources: { ...player.resources, materials: player.resources.materials - FARM_MATERIAL_COST },
        },
      },
      tiles: state.tiles.map((tile) =>
        tile.id === action.tileId
          ? { ...tile, buildings: [...tile.buildings, { type: 'farm' as const, ownerId: action.playerId }] }
          : tile,
      ),
    };
    return appendLog(nextState, `${player.name} built a Farm in settlement ${action.tileId}.`);
  }

  if (action.type === 'createGroup') {
    const error = getCreateGroupError(state, action.playerId, action.survivors);
    if (error) throw new Error(error);
    const player = state.players[action.playerId];
    const groupId = `G${state.nextGroupId}`;
    const nextState: GameState = {
      ...state,
      actionsRemaining: state.actionsRemaining - 1,
      nextGroupId: state.nextGroupId + 1,
      players: {
        ...state.players,
        [action.playerId]: { ...player, survivors: player.survivors - action.survivors },
      },
      groups: [
        ...state.groups,
        { id: groupId, ownerId: action.playerId, tileId: player.settlementTileId, survivors: action.survivors },
      ],
    };
    return appendLog(nextState, `${player.name} formed expedition ${groupId} with ${action.survivors} survivor(s).`);
  }

  if (action.type === 'moveGroup') {
    const error = getMoveGroupError(state, action.playerId, action.groupId, action.destinationTileId);
    if (error) throw new Error(error);
    const nextState: GameState = {
      ...state,
      actionsRemaining: state.actionsRemaining - 1,
      groups: state.groups.map((group) =>
        group.id === action.groupId ? { ...group, tileId: action.destinationTileId } : group,
      ),
    };
    return appendLog(nextState, `${action.groupId} moved to tile ${action.destinationTileId}.`);
  }

  if (action.playerId !== state.currentPlayerId) {
    throw new Error('It is not this player’s turn.');
  }

  const production = produceFood(state, action.playerId);
  let nextState = production.state;
  const actingPlayer = nextState.players[action.playerId];
  const consumption = consume(actingPlayer);
  const incomingPlayerId = nextPlayer(action.playerId);
  const nextRound = action.playerId === 'blue' ? state.round + 1 : state.round;

  nextState = {
    ...nextState,
    round: nextRound,
    currentPlayerId: incomingPlayerId,
    actionsRemaining: 1,
    players: { ...nextState.players, [action.playerId]: consumption.player },
  };

  if (production.produced) {
    nextState = appendLog(nextState, `${actingPlayer.name}'s Farm produced ${production.produced} food.`);
  }

  nextState = appendLog(
    nextState,
    `${actingPlayer.name} ended their turn and consumed food and water.${consumption.casualties ? ` ${consumption.casualties} survivor(s) died from shortages.` : ''}`,
  );

  if (action.playerId === 'blue') {
    nextState = appendLog(nextState, `Round ${nextRound} begins. Red Community acts first.`);
  }

  return nextState;
}
