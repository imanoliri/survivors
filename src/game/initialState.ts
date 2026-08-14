import type { GameState, Tile } from './model';

const tiles: Tile[] = [
  { id: '0-0', x: 0, y: 0, terrain: 'forest', buildings: [] },
  { id: '1-0', x: 1, y: 0, terrain: 'urban', buildings: [] },
  { id: '2-0', x: 2, y: 0, terrain: 'water', buildings: [] },
  { id: '3-0', x: 3, y: 0, terrain: 'farmland', buildings: [] },
  { id: '0-1', x: 0, y: 1, terrain: 'farmland', ownerId: 'red', buildings: [] },
  { id: '1-1', x: 1, y: 1, terrain: 'urban', buildings: [] },
  { id: '2-1', x: 2, y: 1, terrain: 'forest', buildings: [] },
  { id: '3-1', x: 3, y: 1, terrain: 'water', buildings: [] },
  { id: '0-2', x: 0, y: 2, terrain: 'water', buildings: [] },
  { id: '1-2', x: 1, y: 2, terrain: 'forest', buildings: [] },
  { id: '2-2', x: 2, y: 2, terrain: 'urban', buildings: [] },
  { id: '3-2', x: 3, y: 2, terrain: 'farmland', ownerId: 'blue', buildings: [] },
];

const startingResources = () => ({
  water: 5,
  food: 5,
  wood: 0,
  rock: 0,
  medicines: 1,
  tools: 0,
  weapons: 0,
  information: 0,
});

export const createInitialState = (): GameState => ({
  round: 1,
  currentPlayerId: 'red',
  players: {
    red: {
      id: 'red',
      name: 'Red Community',
      survivors: 5,
      wounded: 0,
      resources: startingResources(),
      settlementTileId: '0-1',
      scavengers: [],
    },
    blue: {
      id: 'blue',
      name: 'Blue Community',
      survivors: 5,
      wounded: 0,
      resources: startingResources(),
      settlementTileId: '3-2',
      scavengers: [],
    },
  },
  tiles,
  attackParties: [],
  nextAttackPartyId: 1,
  log: [{ id: 1, text: 'Round 1 begins. Red Community acts first.' }],
  nextLogId: 2,
});
