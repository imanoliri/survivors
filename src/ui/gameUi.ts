import { BUILDINGS } from '../game/data';
import type { Building, BuildingType, GameState, Player, Resource, Resources, Tile } from '../game/model';

export type ArrowKey='ArrowLeft'|'ArrowRight'|'ArrowUp'|'ArrowDown';
export type ShortcutTarget={tagName?:string;inputType?:string;isContentEditable?:boolean};

export function hasShortcutModifier(event:Pick<KeyboardEvent,'ctrlKey'|'altKey'|'metaKey'>):boolean{return event.ctrlKey||event.altKey||event.metaKey}
export function isEditableShortcutTarget(target:ShortcutTarget):boolean{const tag=target.tagName?.toUpperCase();return Boolean(target.isContentEditable||tag==='TEXTAREA'||(tag==='INPUT'&&!['number','range'].includes(target.inputType?.toLowerCase()??'')))}
export function moveGridSelection(tiles:Pick<Tile,'id'|'x'|'y'>[],selectedId:string,key:ArrowKey):string{const selected=tiles.find(tile=>tile.id===selectedId);if(!selected)return selectedId;const delta:keyof typeof offsets=key;const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]} as const;const [dx,dy]=offsets[delta];return tiles.find(tile=>tile.x===selected.x+dx&&tile.y===selected.y+dy)?.id??selectedId}
export function adjustNumber(value:number,min:number,max:number,step:number,direction:1|-1):number{const safeStep=Number.isFinite(step)&&step>0?step:1;const precision=Math.max(decimalPlaces(safeStep),decimalPlaces(min));const next=Math.min(max,Math.max(min,value+safeStep*direction));return Number(next.toFixed(precision))}
export function cycleOption<T>(options:readonly T[],current:T,direction:1|-1):T{if(!options.length)return current;const index=options.indexOf(current);return options[(Math.max(0,index)+direction+options.length)%options.length]}
export function shouldActivatePrimary(key:string,legal:boolean,target:ShortcutTarget,modified=false):boolean{return key==='Enter'&&legal&&!modified&&!isEditableShortcutTarget(target)&&target.tagName?.toUpperCase()!=='BUTTON'&&target.tagName?.toUpperCase()!=='A'}
function decimalPlaces(value:number):number{const text=String(value);return text.includes('.')?text.length-text.indexOf('.')-1:0}

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
