import type { GameState, Tile } from './model';

const tiles: Tile[] = [
  { id: '0-0', x: 0, y: 0, terrain: 'forest' },
  { id: '1-0', x: 1, y: 0, terrain: 'urban' },
  { id: '2-0', x: 2, y: 0, terrain: 'water' },
  { id: '3-0', x: 3, y: 0, terrain: 'farmland' },
  { id: '0-1', x: 0, y: 1, terrain: 'farmland', ownerId: 'red' },
  { id: '1-1', x: 1, y: 1, terrain: 'urban' },
  { id: '2-1', x: 2, y: 1, terrain: 'forest' },
  { id: '3-1', x: 3, y: 1, terrain: 'water' },
  { id: '0-2', x: 0, y: 2, terrain: 'water' },
  { id: '1-2', x: 1, y: 2, terrain: 'forest' },
  { id: '2-2', x: 2, y: 2, terrain: 'urban' },
  { id: '3-2', x: 3, y: 2, terrain: 'farmland', ownerId: 'blue' },
];

export const createInitialState = (): GameState => ({
  round: 1,
  currentPlayerId: 'red',
  actionsRemaining: 1,
  players: {
    red: {
      id: 'red',
      name: 'Red Community',
      survivors: 5,
      wounded: 0,
      resources: { food: 5, water: 5, medicine: 1, materials: 0 },
      settlementTileId: '0-1',
    },
    blue: {
      id: 'blue',
      name: 'Blue Community',
      survivors: 5,
      wounded: 0,
      resources: { food: 5, water: 5, medicine: 1, materials: 0 },
      settlementTileId: '3-2',
    },
  },
  tiles,
  log: [{ id: 1, text: 'Round 1 begins. Red Community acts first.' }],
  nextLogId: 2,
});
