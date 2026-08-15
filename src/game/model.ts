export const RESOURCE_KEYS = ['water','food','medicines','rock','wood','tools','weapons','information'] as const;
export type Resource = typeof RESOURCE_KEYS[number];
export type Resources = Record<Resource, number>;
export type Terrain = 'lake'|'swamp'|'wood'|'grass'|'buildings'|'mountain'|'rocks'|'sand';
export type BuildingType = 'base'|'bridge'|'well'|'waterCleaner'|'pharmacy'|'workshop'|'radio'|'watchtower'|'farm'|'hunterCamp'|'lumberCamp'|'quarry';
export type PlayerId = string;
export type Phase = 'event'|'declare'|'card'|'production'|'activities'|'consumption'|'gameOver';
export type TurnStep = Exclude<Phase,'event'|'gameOver'>;

export interface Building { id: string; type: BuildingType; ownerId: PlayerId; readyRound: number; }
export interface Tile { id: string; x: number; y: number; terrain: Terrain; buildings: Building[]; depleted: Partial<Resources>; }
export interface Party { id: string; ownerId: PlayerId; tileId: string; survivors: number; movesLeft: number; }
export type BattleStatus='active'|'paused'|'attackerWon'|'defenderWon'|'attackerRetreated'|'defenderRetreated';
export interface BattleSide { playerId:PlayerId; partyId?:string; committedPeople:number; remainingPeople:number; committedWeapons:number; remainingWeapons:number; casualties:number; towerBonus:boolean; }
export interface CombatRoll { round:number; attackerDice:number[]; defenderDice:number[]; attackerCasualties:number; defenderCasualties:number; attackerWeaponsUsed:number; defenderWeaponsUsed:number; attackerTower:boolean; defenderTower:boolean; }
export interface BattleState { id:string; attacker:BattleSide; defender:BattleSide; targetTileId:string; targetKind:'party'|'building'|'base'; targetId:string; originTileId:string; openGround:boolean; round:number; roundsSinceResume:number; status:BattleStatus; history:CombatRoll[]; }
export interface AttackTarget { tileId:string; kind:'party'|'building'|'base'; targetId:string; ownerId:PlayerId; label:string; }
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
export interface ResourceChange { resource:Resource; amount:number; }
export type TurnActivity =
  | { type:'gather'; tileId:string; terrain:Terrain; survivors:number; gains:ResourceChange[] }
  | { type:'build'; tileId:string; building:BuildingType; survivors:number; readyRound:number }
  | { type:'foundBuilding'; tileId:string; building:BuildingType; readyRound:number }
  | { type:'survivors'; food:number; found:number }
  | { type:'partyCreated'; partyId:string; survivors:number; tileId:string }
  | { type:'partyMoved'; partyId:string; survivors:number; fromTileId:string; tileId:string; distance:number }
  | { type:'combat'; battleId:string; targetTileId:string; result:BattleStatus; rounds:number }
  | { type:'intel'; playerId:PlayerId; deck:'event'|'player'; cardId:string };
export interface TurnRecord {
  round:number; turn:number; playerId:PlayerId;
  event?:{cardId:string; name:string; description:string; resolved:boolean};
  scavengers?:number;
  playerCard?:{cardId:string; name:string; description:string; resolved:boolean};
  production?:ResourceChange[];
  activities:TurnActivity[];
  consumption?:{waterNeed:number; foodNeed:number; medicinesNeed:number; medicinesUsed:number; deaths:number};
  completed:boolean;
}
export interface WorkerAllocation { total:number; wounded:number; scavenging:number; idle:number; usedThisTurn:number; parties:number; accounted:number; }
export interface TurnWorkflow { cardAcknowledged:boolean; scavenged:boolean; produced:boolean }
export interface GameState { version:3; seed:number; rng:number; round:number; turn:number; playerOrder:PlayerId[]; currentPlayerId:PlayerId; phase:Phase; players:Record<PlayerId,Player>; tiles:Tile[]; parties:Party[]; battle?:BattleState; cards:Record<string,Card>; decks:{event:Deck;player:Deck}; currentEventId?:string; weather?:'snow'|'heat'; activityUsed:number; activityLimit:number; workflow:TurnWorkflow; winnerIds:PlayerId[]; log:string[]; nextId:number; endMode:'lastStanding'|'finiteDecks'; peeks:Record<PlayerId,Partial<Record<'event'|'player',string>>>; currentTurn:TurnRecord; turnHistory:TurnRecord[]; }

export type Action =
  | { type:'resolveEvent' }
  | { type:'declareScavengers'; count:number }
  | { type:'resolvePlayerCard' }
  | { type:'acknowledgePlayerCard' }
  | { type:'produce' }
  | { type:'gather'; tileId:string; survivors:number }
  | { type:'build'; tileId:string; building:BuildingType }
  | { type:'placeFoundBuilding'; tileId:string }
  | { type:'setWorkshopOutput'; resource:'tools'|'weapons' }
  | { type:'peekNextCard'; playerId:PlayerId; deck:'event'|'player' }
  | { type:'lookForSurvivors'; food:number }
  | { type:'createParty'; survivors:number }
  | { type:'moveParty'; partyId:string; tileId:string }
  | { type:'startCombat'; partyId:string; targetId:string; people:number; weapons:number; defenderWeapons:number }
  | { type:'rollCombat' }
  | { type:'retreatCombat'; side:'attacker'|'defender' }
  | { type:'resumeCombat' }
  | { type:'resolveCombat' }
  | { type:'endActivities' }
  | { type:'consumeAndEndTurn' }
  | { type:'replaceMap'; terrain:Terrain[][] };
