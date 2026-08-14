import type {
  AttackParty,
  GameAction,
  GameState,
  Player,
  PlayerId,
  Resources,
  TerrainType,
  Tile,
} from './model';

// The prototype confirms terrain-based gathering but the exact spreadsheet
// values are not fully recoverable from source control. Keep these values
// explicitly provisional until the original workbook/documentation is decoded.
export const PROVISIONAL_GATHER_YIELD: Record<TerrainType, Partial<Resources>> = {
  urban: { information: 1 },
  forest: { wood: 3, food: 1 },
  water: { water: 3 },
  farmland: { food: 3 },
};

// Farm existence and food production are prototype features. Exact cost/output
// values remain provisional pending recovery of the original balance tables.
export const PROVISIONAL_FARM_COST: Partial<Resources> = { wood: 3, rock: 1 };
export const PROVISIONAL_FARM_FOOD_PRODUCTION = 3;

const appendLog = (state: GameState, text: string): GameState => ({
  ...state,
  log: [...state.log, { id: state.nextLogId, text }],
  nextLogId: state.nextLogId + 1,
});

const nextPlayer = (id: PlayerId): PlayerId => (id === 'red' ? 'blue' : 'red');
const tileById = (state: GameState, tileId: string): Tile | undefined =>
  state.tiles.find((tile) => tile.id === tileId);
const partyById = (state: GameState, partyId: string): AttackParty | undefined =>
  state.attackParties.find((party) => party.id === partyId);
const isAdjacent = (a: Tile, b: Tile): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

const assignedScavengers = (player: Player): number =>
  player.scavengers.reduce((sum, assignment) => sum + assignment.survivors, 0);

const assignedAttackPartySurvivors = (state: GameState, playerId: PlayerId): number =>
  state.attackParties
    .filter((party) => party.ownerId === playerId)
    .reduce((sum, party) => sum + party.survivors, 0);

const availableUnassignedSurvivors = (state: GameState, playerId: PlayerId): number => {
  const player = state.players[playerId];
  return player.survivors - assignedScavengers(player) - assignedAttackPartySurvivors(state, playerId);
};

export function getDeclareScavengersError(
  state: GameState,
  playerId: PlayerId,
  tileId: string,
  survivors: number,
): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!tileById(state, tileId)) return 'Tile not found.';
  if (!Number.isInteger(survivors) || survivors < 0) return 'Scavenger count must be a non-negative integer.';

  const player = state.players[playerId];
  const existing = player.scavengers.find((assignment) => assignment.tileId === tileId)?.survivors ?? 0;
  const availableIncludingExisting = availableUnassignedSurvivors(state, playerId) + existing;
  if (survivors > availableIncludingExisting) return 'Not enough unassigned survivors.';
  return null;
}

export function canGatherFromTile(state: GameState, playerId: PlayerId, tileId: string): boolean {
  return state.players[playerId].scavengers.some(
    (assignment) => assignment.tileId === tileId && assignment.survivors > 0,
  );
}

export function getGatherError(state: GameState, playerId: PlayerId, tileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!tileById(state, tileId)) return 'Tile not found.';
  if (!canGatherFromTile(state, playerId, tileId)) return 'Declare scavengers on this tile before gathering.';
  return null;
}

export function getBuildFarmError(state: GameState, playerId: PlayerId, tileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const player = state.players[playerId];
  const tile = tileById(state, tileId);
  if (!tile) return 'Tile not found.';
  if (tile.terrain !== 'farmland') return 'A Farm requires grass/farmland terrain.';
  if (tile.buildings.some((building) => building.type === 'farm' && building.ownerId === playerId)) {
    return 'You already have a Farm on this tile.';
  }
  for (const [resource, cost] of Object.entries(PROVISIONAL_FARM_COST)) {
    if (player.resources[resource as keyof Resources] < (cost ?? 0)) {
      return `Not enough ${resource} for the provisional Farm cost.`;
    }
  }
  return null;
}

export function getCreateAttackPartyError(
  state: GameState,
  playerId: PlayerId,
  survivors: number,
): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!Number.isInteger(survivors) || survivors < 1) return 'An attack party needs at least 1 survivor.';
  if (survivors > availableUnassignedSurvivors(state, playerId)) return 'Not enough unassigned survivors.';
  return null;
}

export function getDisbandAttackPartyError(
  state: GameState,
  playerId: PlayerId,
  partyId: string,
): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const party = partyById(state, partyId);
  if (!party) return 'Attack party not found.';
  if (party.ownerId !== playerId) return 'You do not control this attack party.';
  return null;
}

export function getMoveAttackPartyError(
  state: GameState,
  playerId: PlayerId,
  partyId: string,
  destinationTileId: string,
): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const party = partyById(state, partyId);
  if (!party) return 'Attack party not found.';
  if (party.ownerId !== playerId) return 'You do not control this attack party.';
  const origin = tileById(state, party.tileId);
  const destination = tileById(state, destinationTileId);
  if (!origin || !destination) return 'Tile not found.';
  // Adjacency is retained as a temporary board implementation detail; terrain
  // movement costs from the original game still need recovery.
  if (!isAdjacent(origin, destination)) return 'Attack parties currently move one adjacent tile at a time.';
  return null;
}

function produceFood(state: GameState, playerId: PlayerId): { state: GameState; produced: number } {
  const farms = state.tiles.reduce(
    (count, tile) =>
      count + tile.buildings.filter((building) => building.type === 'farm' && building.ownerId === playerId).length,
    0,
  );
  const produced = farms * PROVISIONAL_FARM_FOOD_PRODUCTION;
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

function consume(player: Player): { player: Player; casualties: number; untreatedWounded: number } {
  const required = player.survivors;
  const foodShortage = Math.max(0, required - player.resources.food);
  const waterShortage = Math.max(0, required - player.resources.water);
  const survivalCasualties = Math.min(player.survivors, Math.max(foodShortage, waterShortage));

  const medicineAvailable = player.resources.medicines;
  const untreatedWounded = Math.max(0, player.wounded - medicineAvailable);
  const medicalCasualties = Math.min(player.survivors - survivalCasualties, untreatedWounded);
  const casualties = survivalCasualties + medicalCasualties;

  return {
    casualties,
    untreatedWounded,
    player: {
      ...player,
      survivors: player.survivors - casualties,
      wounded: Math.max(0, player.wounded - medicalCasualties),
      scavengers: [],
      resources: {
        ...player.resources,
        food: Math.max(0, player.resources.food - required),
        water: Math.max(0, player.resources.water - required),
        medicines: Math.max(0, player.resources.medicines - player.wounded),
      },
    },
  };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.type === 'declareScavengers') {
    const error = getDeclareScavengersError(state, action.playerId, action.tileId, action.survivors);
    if (error) throw new Error(error);
    const player = state.players[action.playerId];
    const otherAssignments = player.scavengers.filter((assignment) => assignment.tileId !== action.tileId);
    const scavengers = action.survivors > 0
      ? [...otherAssignments, { tileId: action.tileId, survivors: action.survivors }]
      : otherAssignments;
    return appendLog(
      {
        ...state,
        players: { ...state.players, [action.playerId]: { ...player, scavengers } },
      },
      `${player.name} declared ${action.survivors} scavenger(s) on tile ${action.tileId}.`,
    );
  }

  if (action.type === 'gather') {
    const error = getGatherError(state, action.playerId, action.tileId);
    if (error) throw new Error(error);
    const tile = tileById(state, action.tileId)!;
    const player = state.players[action.playerId];
    const scavengers = player.scavengers.find((assignment) => assignment.tileId === action.tileId)!.survivors;
    const resources = { ...player.resources };
    for (const [resource, baseAmount] of Object.entries(PROVISIONAL_GATHER_YIELD[tile.terrain])) {
      resources[resource as keyof Resources] += (baseAmount ?? 0) * scavengers;
    }
    return appendLog(
      { ...state, players: { ...state.players, [action.playerId]: { ...player, resources } } },
      `${player.name}'s ${scavengers} scavenger(s) gathered on ${tile.terrain} tile ${tile.id}.`,
    );
  }

  if (action.type === 'buildFarm') {
    const error = getBuildFarmError(state, action.playerId, action.tileId);
    if (error) throw new Error(error);
    const player = state.players[action.playerId];
    const resources = { ...player.resources };
    for (const [resource, cost] of Object.entries(PROVISIONAL_FARM_COST)) {
      resources[resource as keyof Resources] -= cost ?? 0;
    }
    return appendLog(
      {
        ...state,
        players: { ...state.players, [action.playerId]: { ...player, resources } },
        tiles: state.tiles.map((tile) =>
          tile.id === action.tileId
            ? { ...tile, buildings: [...tile.buildings, { type: 'farm' as const, ownerId: action.playerId }] }
            : tile,
        ),
      },
      `${player.name} built a Farm on tile ${action.tileId} using provisional balance values.`,
    );
  }

  if (action.type === 'createAttackParty') {
    const error = getCreateAttackPartyError(state, action.playerId, action.survivors);
    if (error) throw new Error(error);
    const player = state.players[action.playerId];
    const partyId = `A${state.nextAttackPartyId}`;
    return appendLog(
      {
        ...state,
        nextAttackPartyId: state.nextAttackPartyId + 1,
        attackParties: [
          ...state.attackParties,
          { id: partyId, ownerId: action.playerId, tileId: player.settlementTileId, survivors: action.survivors },
        ],
      },
      `${player.name} created attack party ${partyId} with ${action.survivors} survivor(s).`,
    );
  }

  if (action.type === 'disbandAttackParty') {
    const error = getDisbandAttackPartyError(state, action.playerId, action.partyId);
    if (error) throw new Error(error);
    return appendLog(
      { ...state, attackParties: state.attackParties.filter((party) => party.id !== action.partyId) },
      `${action.partyId} was disbanded.`,
    );
  }

  if (action.type === 'moveAttackParty') {
    const error = getMoveAttackPartyError(state, action.playerId, action.partyId, action.destinationTileId);
    if (error) throw new Error(error);
    return appendLog(
      {
        ...state,
        attackParties: state.attackParties.map((party) =>
          party.id === action.partyId ? { ...party, tileId: action.destinationTileId } : party,
        ),
      },
      `${action.partyId} moved to tile ${action.destinationTileId}.`,
    );
  }

  if (action.playerId !== state.currentPlayerId) throw new Error('It is not this player’s turn.');

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
    players: { ...nextState.players, [action.playerId]: consumption.player },
  };

  if (production.produced) {
    nextState = appendLog(nextState, `${actingPlayer.name}'s Farm produced ${production.produced} food (provisional value).`);
  }
  nextState = appendLog(
    nextState,
    `${actingPlayer.name} consumed food, water and medicine.${consumption.casualties ? ` ${consumption.casualties} survivor(s) died from shortages.` : ''}`,
  );
  if (action.playerId === 'blue') {
    nextState = appendLog(nextState, `Round ${nextRound} begins. Red Community acts first.`);
  }
  return nextState;
}
