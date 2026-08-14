import type { BuildingType, Card, Resource, Resources, Terrain } from './model';

export const emptyResources = (): Resources => ({water:0,food:0,medicines:0,rock:0,wood:0,tools:0,weapons:0,information:0});
export const STARTING_RESOURCES: Resources = {water:9,food:9,medicines:4,rock:4,wood:4,tools:5,weapons:0,information:5};

export const TERRAIN: Record<Terrain,{letter:string;label:string;color:string;rgb:[number,number,number];traversable:boolean;buildable:boolean;big:boolean;yields:Partial<Resources>}> = {
  lake:{letter:'L',label:'Lake',color:'#7fb7da',rgb:[154,192,255],traversable:false,buildable:false,big:false,yields:{water:1,food:3,rock:1}},
  swamp:{letter:'S',label:'Swamp',color:'#8fb9a8',rgb:[166,207,216],traversable:true,buildable:true,big:false,yields:{water:1}},
  wood:{letter:'W',label:'Wood',color:'#477558',rgb:[168,218,181],traversable:true,buildable:true,big:false,yields:{food:3,wood:1}},
  grass:{letter:'G',label:'Grass',color:'#a9ba78',rgb:[209,229,217],traversable:true,buildable:true,big:true,yields:{food:3}},
  buildings:{letter:'B',label:'Buildings',color:'#9c8f86',rgb:[231,235,238],traversable:true,buildable:true,big:true,yields:{food:1,medicines:1,rock:1,wood:1,tools:1}},
  mountain:{letter:'M',label:'Mountain',color:'#6e7274',rgb:[0,0,0],traversable:false,buildable:true,big:false,yields:{rock:4}},
  rocks:{letter:'R',label:'Rocks',color:'#a77b68',rgb:[255,255,255],traversable:true,buildable:true,big:true,yields:{rock:3}},
  sand:{letter:'A',label:'Sand',color:'#c5a574',rgb:[252,232,231],traversable:true,buildable:true,big:true,yields:{}},
};

export interface BuildingDef { label:string; cost:Partial<Resources>; production:Partial<Resources>; placeableInBuilding:boolean; placement?:Terrain[]; }
export const BUILDINGS: Record<BuildingType,BuildingDef> = {
  base:{label:'Base',cost:{},production:{},placeableInBuilding:false}, bridge:{label:'Bridge',cost:{},production:{},placeableInBuilding:false,placement:['lake']},
  well:{label:'Well',cost:{rock:3,wood:3,tools:2},production:{water:15},placeableInBuilding:true},
  waterCleaner:{label:'Water cleaner',cost:{rock:1,wood:1,tools:1,information:1},production:{water:5},placeableInBuilding:true},
  pharmacy:{label:'Pharmacy',cost:{medicines:6,rock:2,wood:2,tools:1,information:6},production:{medicines:3,information:1},placeableInBuilding:true},
  workshop:{label:'Workshop',cost:{rock:2,wood:2,tools:3,information:4},production:{rock:-1,wood:-1,tools:5},placeableInBuilding:true},
  radio:{label:'Radio station',cost:{rock:2,wood:2,tools:15,information:4},production:{information:1},placeableInBuilding:true},
  watchtower:{label:'Watchtower',cost:{rock:2,wood:2,tools:10,weapons:5},production:{information:1},placeableInBuilding:true},
  farm:{label:'Farm',cost:{rock:2,wood:2,tools:5,information:2},production:{},placeableInBuilding:false,placement:['grass']},
  hunterCamp:{label:'Hunter camp',cost:{rock:2,wood:2,tools:5,weapons:3,information:2},production:{},placeableInBuilding:false,placement:['wood']},
  lumberCamp:{label:'Lumber camp',cost:{rock:2,wood:2,tools:5,information:2},production:{},placeableInBuilding:false,placement:['wood']},
  quarry:{label:'Quarry',cost:{rock:2,wood:2,tools:5,information:2},production:{},placeableInBuilding:false},
};

const resources:Resource[]=['water','food','medicines','rock','wood','tools','weapons','information'];
export const CARDS:Card[] = [
  {id:'e-rats',deck:'event',copies:5,name:'Rats',description:'All players lose 5 food and water and 1 of every other resource.',effect:{type:'loseAll',amounts:{food:5,water:5,medicines:1,rock:1,wood:1,tools:1,weapons:1,information:1}}},
  {id:'e-sick',deck:'event',copies:3,name:'Sickness',description:'Half the survivors of each player (rounding down) are wounded.',effect:{type:'woundHalf'}},
  {id:'e-snow',deck:'event',copies:3,name:'Snow storm',description:'Surface water freezes: traversable, but produces no water this round.',effect:{type:'weather',weather:'snow'}},
  {id:'e-heat',deck:'event',copies:3,name:'Heatwave',description:'Every working survivor consumes 2 water instead of 1.',effect:{type:'weather',weather:'heat'}},
  {id:'e-rain',deck:'event',copies:6,name:'Rainy day',description:'Every player gains 10 water.',effect:{type:'gainAll',resource:'water',amount:10}},
  {id:'e-sun',deck:'event',copies:10,name:'Sunny day',description:'Nothing happens.',effect:{type:'none'}},
  ...resources.map((resource,i):Card=>({id:`p-scavenge-${resource}`,deck:'player',copies:7,name:'Scavenge',description:`Find ${resource}: ${i<2?'15 + 10':'5 + 3'} per active scavenger.`,effect:{type:'scavenge',resource,base:i<2?15:5,perScavenger:i<2?10:3}})),
  {id:'p-accident',deck:'player',copies:7,name:'Accident',description:'One active scavenger is wounded.',effect:{type:'scavengerWound'}},
  {id:'p-fatal',deck:'player',copies:3,name:'Fatal accident',description:'One active scavenger dies.',effect:{type:'scavengerDeath'}},
  {id:'p-survivors',deck:'player',copies:15,name:'Survivors',description:'3 + number of radio stations survivors arrive.',effect:{type:'survivors'}},
  {id:'p-bridge',deck:'player',copies:12,name:'Bridge',description:'Place a bridge over water.',effect:{type:'foundBuilding',building:'bridge'}},
  ...(['well','waterCleaner','pharmacy','workshop','radio','watchtower'] as BuildingType[]).map((building):Card=>({id:`p-${building}`,deck:'player',copies:2,name:'Subbuilding',description:`Found ${BUILDINGS[building].label}.`,effect:{type:'foundBuilding',building}})),
  ...(['farm','hunterCamp','lumberCamp','quarry'] as BuildingType[]).map((building):Card=>({id:`p-${building}`,deck:'player',copies:1,name:'Building',description:`Found ${BUILDINGS[building].label}.`,effect:{type:'foundBuilding',building}})),
];

export const SAN_SEBASTIAN:Terrain[][] = [
  'LLLLLLLLLLLL','LLLLLLLLLWWW','LLLLLLLLWWBW','LLLLLLLAAWWW','WLLLLABABBBB','WWLLLLRBBBBB','WBBLLBBBBBRB','BBBBBBBBBBBB','BBBBBWBBBBBW','BBBBWBBRBBBB','BBBBBBBBBBBB','BBBGBWGBBWBB','BBBGWBBBBAWB','BBGBBBBBWWBB','WWWBBBWGWWWB','WWBB BWWBWWWB'.replace(' ','')
].map(row=>[...row].map(letter=>Object.keys(TERRAIN).find(k=>TERRAIN[k as Terrain].letter===letter) as Terrain));
