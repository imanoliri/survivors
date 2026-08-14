export type PlayerId = 'red' | 'blue';
export type TerrainType = 'urban' | 'forest' | 'water' | 'farmland';
export type BuildingType =
  | 'base'
  | 'bridge'
  | 'farm'
  | 'hunterCamp'
  | 'lumberCamp'
  | 'quarry'
  | 'well'
  | 'waterCleaner'
  | 'pharmacy'
  | 'workshop'
  | 'radio'
  | 'watchtower';

export type Resources = {
  water: number;
  food: number;
  wood: number;
  rock: number;
  medicines: number;
  tools: number;
  weapons: number;
  information: number;
};

export type Building = {
  type: BuildingType;
  ownerId: PlayerId;
};

export type ScavengerAssignment = {
  tileId: string;
  survivors: number;
};

export type AttackParty = {
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
  scavengers: ScavengerAssignment[];
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
  players: Record<PlayerId, Player>;
  tiles: Tile[];
  attackParties: AttackParty[];
  nextAttackPartyId: number;
  log: GameLogEntry[];
  nextLogId: number;
};

export type GameAction =
  | { type: 'declareScavengers'; playerId: PlayerId; tileId: string; survivors: number }
  | { type: 'gather'; playerId: PlayerId; tileId: string }
  | { type: 'build'; playerId: PlayerId; tileId: string; buildingType: BuildingType }
  | { type: 'createAttackParty'; playerId: PlayerId; survivors: number }
  | { type: 'disbandAttackParty'; playerId: PlayerId; partyId: string }
  | { type: 'moveAttackParty'; playerId: PlayerId; partyId: string; destinationTileId: string }
  | { type: 'endTurn'; playerId: PlayerId };
