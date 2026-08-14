import type { GameAction, GameState, Player, PlayerId, Resources, TerrainType } from './model';

const gatherYield: Record<TerrainType, Partial<Resources>> = {
  urban: { materials: 2 },
  forest: { materials: 2, food: 1 },
  water: { water: 3 },
  farmland: { food: 3 },
};

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

export function applyAction(state: GameState, action: GameAction): GameState {
  if (action.playerId !== state.currentPlayerId) {
    throw new Error('It is not this player’s turn.');
  }

  if (action.type === 'gather') {
    const tile = state.tiles.find((candidate) => candidate.id === action.tileId);
    if (!tile) throw new Error('Tile not found.');

    const player = state.players[action.playerId];
    const yieldForTile = gatherYield[tile.terrain];
    const resources = { ...player.resources };

    for (const [resource, amount] of Object.entries(yieldForTile)) {
      resources[resource as keyof Resources] += amount ?? 0;
    }

    const nextState: GameState = {
      ...state,
      players: {
        ...state.players,
        [action.playerId]: { ...player, resources },
      },
    };

    return appendLog(nextState, `${player.name} gathered on ${tile.terrain} tile ${tile.id}.`);
  }

  const actingPlayer = state.players[action.playerId];
  const consumption = consume(actingPlayer);
  const incomingPlayerId = nextPlayer(action.playerId);
  const nextRound = action.playerId === 'blue' ? state.round + 1 : state.round;

  let nextState: GameState = {
    ...state,
    round: nextRound,
    currentPlayerId: incomingPlayerId,
    players: {
      ...state.players,
      [action.playerId]: consumption.player,
    },
  };

  nextState = appendLog(
    nextState,
    `${actingPlayer.name} ended their turn and consumed food and water.${consumption.casualties ? ` ${consumption.casualties} survivor(s) died from shortages.` : ''}`,
  );

  if (action.playerId === 'blue') {
    nextState = appendLog(nextState, `Round ${nextRound} begins. Red Community acts first.`);
  }

  return nextState;
}
