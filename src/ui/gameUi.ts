import { BUILDINGS } from '../game/data';
import type { Building, BuildingType, GameState, Player, Resource, Resources } from '../game/model';

const RESOURCE_META:Record<Resource,{emoji:string;label:string}>={water:{emoji:'💧',label:'water'},food:{emoji:'🥫',label:'food'},medicines:{emoji:'💊',label:'medicines'},rock:{emoji:'🪨',label:'rock'},wood:{emoji:'🪵',label:'wood'},tools:{emoji:'🛠️',label:'tools'},weapons:{emoji:'⚔️',label:'weapons'},information:{emoji:'📻',label:'information'}};

export function formatResourceCost(cost:Partial<Resources>):string {
 const entries=Object.entries(cost).filter((entry):entry is [Resource,number]=>typeof entry[1]==='number'&&entry[1]>0);
 return entries.length?entries.map(([resource,amount])=>`${RESOURCE_META[resource].emoji} ${amount} ${RESOURCE_META[resource].label}`).join(' · '):'No recovered construction cost';
}

export function selectionTransitionKey(state:Pick<GameState,'round'|'turn'|'currentPlayerId'|'players'>):string {
 return `${state.round}:${state.turn}:${state.currentPlayerId}:${state.players[state.currentPlayerId]?.baseTileId??''}`;
}

export function buildingTooltip(building:Building,owner:Player|undefined,round:number):string {
 const definition=BUILDINGS[building.type];
 const readiness=building.readyRound<=round?'Ready and active':`Under construction · ready round ${building.readyRound}`;
 return `${building.type==='base'?'Home base':definition.label} · Owner: ${owner?.name??'Unknown refuge'} · ${readiness} · Construction: ${formatResourceCost(definition.cost)}`;
}

export function consumptionCostText(player:Player,weather:GameState['weather']):string {
 const working=player.survivors-player.idlers;
 const water=player.survivors+(weather==='heat'?working:0);
 return `Consumes 💧 ${water} water · 🥫 ${player.survivors} food · up to 💊 ${player.wounded} medicines for wounds${weather==='heat'?` · includes ${working} extra heatwave water`:''}`;
}

export function phaseActionCost(state:GameState):string {
 const player=state.players[state.currentPlayerId];
 switch(state.phase){
  case'event':return 'No resource cost · resolves the round event';
  case'card':return 'No resource cost · reveals this refuge’s player card';
  case'declare':return `Requires 0–${player.idlers} idle survivors · no resource cost`;
  case'production':return 'No activity or resource cost · ready structures produce';
  case'activities':return 'No resource cost · advances to consumption';
  case'consumption':return consumptionCostText(player,state.weather);
  case'gameOver':return 'No action available';
 }
}

export function buildActionCost(building:BuildingType):string{return `Costs 1 activity · requires 3 idle survivors · ${formatResourceCost(BUILDINGS[building].cost)}`}
