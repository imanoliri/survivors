export type PlayerId = 'red' | 'blue';
export type TerrainType = 'urban' | 'forest' | 'water' | 'farmland';
export type BuildingType = 'farm';

export type Resources = {
  food: number;
  water: number;
  medicine: number;
  materials: number;
};

export type Building = {
  type: BuildingType;
  ownerId: PlayerId;
};

export type SurvivorGroup = {
  id: string;
  ownerId: PlayerId;
  tileId: string;
  survivors: number;
};

export type Player = {
  id: PlayerId;
  name: string;
  survivors: number;
  wounded: number;
  resources: Resources;
  settlementTileId: string;
};

export type Tile = {
  id: string;
  x: number;
  y: number;
  terrain: TerrainType;
  ownerId?: PlayerId;
  buildings: Building[];
};

export type GameLogEntry = {
  id: number;
  text: string;
};

export type GameState = {
  round: number;
  currentPlayerId: PlayerId;
  actionsRemaining: number;
  players: Record<PlayerId, Player>;
  tiles: Tile[];
  groups: SurvivorGroup[];
  nextGroupId: number;
  log: GameLogEntry[];
  nextLogId: number;
};

export type GameAction =
  | { type: 'gather'; playerId: PlayerId; tileId: string }
  | { type: 'buildFarm'; playerId: PlayerId; tileId: string }
  | { type: 'createGroup'; playerId: PlayerId; survivors: number }
  | { type: 'moveGroup'; playerId: PlayerId; groupId: string; destinationTileId: string }
  | { type: 'endTurn'; playerId: PlayerId };
