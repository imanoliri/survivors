export const RESOURCE_KEYS = ['water','food','medicines','rock','wood','tools','weapons','information'] as const;
export type Resource = typeof RESOURCE_KEYS[number];
export type Resources = Record<Resource, number>;
export type Terrain = 'lake'|'swamp'|'wood'|'grass'|'buildings'|'mountain'|'rocks'|'sand';
export type BuildingType = 'base'|'bridge'|'well'|'waterCleaner'|'pharmacy'|'workshop'|'radio'|'watchtower'|'farm'|'hunterCamp'|'lumberCamp'|'quarry';
export type PlayerId = string;
export type Phase = 'event'|'declare'|'card'|'production'|'activities'|'consumption'|'gameOver';

export interface Building { id: string; type: BuildingType; ownerId: PlayerId; readyRound: number; }
export interface Tile { id: string; x: number; y: number; terrain: Terrain; buildings: Building[]; depleted: Partial<Resources>; }
export interface Party { id: string; ownerId: PlayerId; tileId: string; survivors: number; movesLeft: number; }
export interface Player { id: PlayerId; name: string; color: string; survivors: number; wounded: number; idlers: number; scavengers: number; resources: Resources; baseTileId: string; points: number; currentCardId?: string; pendingFoundBuilding?: BuildingType; workshopOutput: 'tools'|'weapons'; }
export interface Card { id: string; deck: 'event'|'player'; copies: number; name: string; description: string; effect: CardEffect; }
export type CardEffect =
  | { type:'none' }
  | { type:'gainAll'; resource:Resource; amount:number }
  | { type:'loseAll'; amounts:Partial<Resources> }
  | { type:'woundHalf' }
  | { type:'weather'; weather:'snow'|'heat'; }
  | { type:'scavenge'; resource:Resource; base:number; perScavenger:number }
  | { type:'scavengerWound'|'scavengerDeath' }
  | { type:'survivors' }
  | { type:'foundBuilding'; building:BuildingType };
export interface Deck { draw: string[]; discard: string[]; }
export interface GameState { version:1; seed:number; rng:number; round:number; turn:number; playerOrder:PlayerId[]; currentPlayerId:PlayerId; phase:Phase; players:Record<PlayerId,Player>; tiles:Tile[]; parties:Party[]; cards:Record<string,Card>; decks:{event:Deck;player:Deck}; currentEventId?:string; weather?:'snow'|'heat'; activityUsed:number; activityLimit:number; winnerIds:PlayerId[]; log:string[]; nextId:number; }

export type Action =
  | { type:'resolveEvent' }
  | { type:'declareScavengers'; count:number }
  | { type:'resolvePlayerCard' }
  | { type:'produce' }
  | { type:'gather'; tileId:string; survivors:number }
  | { type:'build'; tileId:string; building:BuildingType }
  | { type:'placeFoundBuilding'; tileId:string }
  | { type:'setWorkshopOutput'; resource:'tools'|'weapons' }
  | { type:'lookForSurvivors'; food:number }
  | { type:'createParty'; survivors:number }
  | { type:'moveParty'; partyId:string; tileId:string }
  | { type:'endActivities' }
  | { type:'consumeAndEndTurn' }
  | { type:'replaceMap'; terrain:Terrain[][] };
