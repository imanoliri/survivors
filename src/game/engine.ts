import { BUILDINGS } from './buildings';
import type {
  AttackParty,
  BuildingType,
  GameAction,
  GameState,
  Player,
  PlayerId,
  Resources,
  TerrainType,
  Tile,
} from './model';

// Exact workbook values are still unrecovered. These terrain yields remain
// explicitly provisional; building relationships are reconstructed separately.
export const PROVISIONAL_GATHER_YIELD: Record<TerrainType, Partial<Resources>> = {
  urban: { information: 1 },
  forest: { wood: 3, food: 1 },
  water: { water: 3 },
  farmland: { food: 3 },
};

const appendLog = (state: GameState, text: string): GameState => ({
  ...state,
  log: [...state.log, { id: state.nextLogId, text }],
  nextLogId: state.nextLogId + 1,
});

const nextPlayer = (id: PlayerId): PlayerId => (id === 'red' ? 'blue' : 'red');
const tileById = (state: GameState, tileId: string): Tile | undefined => state.tiles.find((tile) => tile.id === tileId);
const partyById = (state: GameState, partyId: string): AttackParty | undefined => state.attackParties.find((party) => party.id === partyId);
const isAdjacent = (a: Tile, b: Tile): boolean => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
const assignedScavengers = (player: Player): number => player.scavengers.reduce((sum, a) => sum + a.survivors, 0);
const assignedAttackPartySurvivors = (state: GameState, playerId: PlayerId): number => state.attackParties.filter((p) => p.ownerId === playerId).reduce((sum, p) => sum + p.survivors, 0);
const availableUnassignedSurvivors = (state: GameState, playerId: PlayerId): number => state.players[playerId].survivors - assignedScavengers(state.players[playerId]) - assignedAttackPartySurvivors(state, playerId);

export function getDeclareScavengersError(state: GameState, playerId: PlayerId, tileId: string, survivors: number): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!tileById(state, tileId)) return 'Tile not found.';
  if (!Number.isInteger(survivors) || survivors < 0) return 'Scavenger count must be a non-negative integer.';
  const player = state.players[playerId];
  const existing = player.scavengers.find((a) => a.tileId === tileId)?.survivors ?? 0;
  if (survivors > availableUnassignedSurvivors(state, playerId) + existing) return 'Not enough unassigned survivors.';
  return null;
}

export function canGatherFromTile(state: GameState, playerId: PlayerId, tileId: string): boolean {
  return state.players[playerId].scavengers.some((a) => a.tileId === tileId && a.survivors > 0);
}

export function getGatherError(state: GameState, playerId: PlayerId, tileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!tileById(state, tileId)) return 'Tile not found.';
  if (!canGatherFromTile(state, playerId, tileId)) return 'Declare scavengers on this tile before gathering.';
  return null;
}

export function getBuildError(state: GameState, playerId: PlayerId, tileId: string, buildingType: BuildingType): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const tile = tileById(state, tileId);
  if (!tile) return 'Tile not found.';
  if (buildingType === 'base') return 'Bases are created during setup, not built during a turn.';
  if (tile.buildings.some((b) => b.type === buildingType && b.ownerId === playerId)) return `You already have a ${BUILDINGS[buildingType].label} on this tile.`;
  const placement = BUILDINGS[buildingType].placement;
  if (Array.isArray(placement) && !placement.includes(tile.terrain)) return `${BUILDINGS[buildingType].label} is not supported on ${tile.terrain} terrain by the recovered prototype graph.`;
  return null;
}

export function getCreateAttackPartyError(state: GameState, playerId: PlayerId, survivors: number): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  if (!Number.isInteger(survivors) || survivors < 1) return 'An attack party needs at least 1 survivor.';
  if (survivors > availableUnassignedSurvivors(state, playerId)) return 'Not enough unassigned survivors.';
  return null;
}

export function getDisbandAttackPartyError(state: GameState, playerId: PlayerId, partyId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const party = partyById(state, partyId);
  if (!party) return 'Attack party not found.';
  if (party.ownerId !== playerId) return 'You do not control this attack party.';
  return null;
}

export function getMoveAttackPartyError(state: GameState, playerId: PlayerId, partyId: string, destinationTileId: string): string | null {
  if (playerId !== state.currentPlayerId) return 'It is not this player’s turn.';
  const party = partyById(state, partyId);
  if (!party) return 'Attack party not found.';
  if (party.ownerId !== playerId) return 'You do not control this attack party.';
  const origin = tileById(state, party.tileId);
  const destination = tileById(state, destinationTileId);
  if (!origin || !destination) return 'Tile not found.';
  if (!isAdjacent(origin, destination)) return 'Attack parties currently move one adjacent tile at a time (movement rule still provisional).';
  return null;
}

function gatheringBonusForTile(tile: Tile, playerId: PlayerId): Partial<Resources> {
  const bonus: Partial<Resources> = {};
  for (const building of tile.buildings.filter((b) => b.ownerId === playerId)) {
    for (const [resource, amount] of Object.entries(BUILDINGS[building.type].gatheringBonus ?? {})) {
      const key = resource as keyof Resources;
      bonus[key] = (bonus[key] ?? 0) + (amount ?? 0);
    }
  }
  return bonus;
}

function produceResources(state: GameState, playerId: PlayerId): { state: GameState; produced: Partial<Resources> } {
  const produced: Partial<Resources> = {};
  for (const tile of state.tiles) {
    for (const building of tile.buildings.filter((b) => b.ownerId === playerId)) {
      for (const [resource, amount] of Object.entries(BUILDINGS[building.type].production ?? {})) {
        const key = resource as keyof Resources;
        produced[key] = (produced[key] ?? 0) + (amount ?? 0);
      }
    }
  }
  const player = state.players[playerId];
  const resources = { ...player.resources };
  for (const [resource, amount] of Object.entries(produced)) resources[resource as keyof Resources] += amount ?? 0;
  return { state: { ...state, players: { ...state.players, [playerId]: { ...player, resources } } }, produced };
}

function consume(player: Player): { player: Player; casualties: number } {
  const required = player.survivors;
  const foodShortage = Math.max(0, required - player.resources.food);
  const waterShortage = Math.max(0, required - player.resources.water);
  const survivalCasualties = Math.min(player.survivors, Math.max(foodShortage, waterShortage));
  const untreatedWounded = Math.max(0, player.wounded - player.resources.medicines);
  const medicalCasualties = Math.min(player.survivors - survivalCasualties, untreatedWounded);
  const casualties = survivalCasualties + medicalCasualties;
  return {
    casualties,
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
    const rest = player.scavengers.filter((a) => a.tileId !== action.tileId);
    const scavengers = action.survivors > 0 ? [...rest, { tileId: action.tileId, survivors: action.survivors }] : rest;
    return appendLog({ ...state, players: { ...state.players, [action.playerId]: { ...player, scavengers } } }, `${player.name} declared ${action.survivors} scavenger(s) on tile ${action.tileId}.`);
  }

  if (action.type === 'gather') {
    const error = getGatherError(state, action.playerId, action.tileId);
    if (error) throw new Error(error);
    const tile = tileById(state, action.tileId)!;
    const player = state.players[action.playerId];
    const count = player.scavengers.find((a) => a.tileId === action.tileId)!.survivors;
    const resources = { ...player.resources };
    const yieldPerScavenger: Partial<Resources> = { ...PROVISIONAL_GATHER_YIELD[tile.terrain] };
    for (const [resource, amount] of Object.entries(gatheringBonusForTile(tile, action.playerId))) {
      const key = resource as keyof Resources;
      yieldPerScavenger[key] = (yieldPerScavenger[key] ?? 0) + (amount ?? 0);
    }
    for (const [resource, amount] of Object.entries(yieldPerScavenger)) resources[resource as keyof Resources] += (amount ?? 0) * count;
    return appendLog({ ...state, players: { ...state.players, [action.playerId]: { ...player, resources } } }, `${player.name}'s ${count} scavenger(s) gathered on ${tile.terrain} tile ${tile.id}.`);
  }

  if (action.type === 'build') {
    const error = getBuildError(state, action.playerId, action.tileId, action.buildingType);
    if (error) throw new Error(error);
    const definition = BUILDINGS[action.buildingType];
    // Exact construction costs are intentionally not charged yet: the old
    // workbook values have not been recovered, and inventing costs would break parity.
    return appendLog({
      ...state,
      tiles: state.tiles.map((tile) => tile.id === action.tileId ? { ...tile, buildings: [...tile.buildings, { type: action.buildingType, ownerId: action.playerId }] } : tile),
    }, `${state.players[action.playerId].name} built ${definition.label} on ${action.tileId}. Construction cost pending prototype recovery.`);
  }

  if (action.type === 'createAttackParty') {
    const error = getCreateAttackPartyError(state, action.playerId, action.survivors);
    if (error) throw new Error(error);
    const player = state.players[action.playerId];
    const partyId = `A${state.nextAttackPartyId}`;
    return appendLog({ ...state, nextAttackPartyId: state.nextAttackPartyId + 1, attackParties: [...state.attackParties, { id: partyId, ownerId: action.playerId, tileId: player.settlementTileId, survivors: action.survivors }] }, `${player.name} created attack party ${partyId} with ${action.survivors} survivor(s).`);
  }

  if (action.type === 'disbandAttackParty') {
    const error = getDisbandAttackPartyError(state, action.playerId, action.partyId);
    if (error) throw new Error(error);
    return appendLog({ ...state, attackParties: state.attackParties.filter((p) => p.id !== action.partyId) }, `${action.partyId} was disbanded.`);
  }

  if (action.type === 'moveAttackParty') {
    const error = getMoveAttackPartyError(state, action.playerId, action.partyId, action.destinationTileId);
    if (error) throw new Error(error);
    return appendLog({ ...state, attackParties: state.attackParties.map((p) => p.id === action.partyId ? { ...p, tileId: action.destinationTileId } : p) }, `${action.partyId} moved to tile ${action.destinationTileId}.`);
  }

  if (action.playerId !== state.currentPlayerId) throw new Error('It is not this player’s turn.');
  const production = produceResources(state, action.playerId);
  let nextState = production.state;
  const actingPlayer = nextState.players[action.playerId];
  const consumption = consume(actingPlayer);
  const incomingPlayerId = nextPlayer(action.playerId);
  const nextRound = action.playerId === 'blue' ? state.round + 1 : state.round;
  nextState = { ...nextState, round: nextRound, currentPlayerId: incomingPlayerId, players: { ...nextState.players, [action.playerId]: consumption.player } };
  const producedText = Object.entries(production.produced).filter(([, amount]) => amount).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
  if (producedText) nextState = appendLog(nextState, `${actingPlayer.name}'s production buildings produced ${producedText} (amounts provisional).`);
  nextState = appendLog(nextState, `${actingPlayer.name} consumed food, water and medicine.${consumption.casualties ? ` ${consumption.casualties} survivor(s) died from shortages.` : ''}`);
  if (action.playerId === 'blue') nextState = appendLog(nextState, `Round ${nextRound} begins. Red Community acts first.`);
  return nextState;
}
