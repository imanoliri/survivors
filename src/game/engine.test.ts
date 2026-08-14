import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState } from './engine';

const toActivities=(seed=1,scavengers=0)=>{let s=createInitialState(seed);s=applyAction(s,{type:'resolveEvent'});s=applyAction(s,{type:'declareScavengers',count:scavengers});s=applyAction(s,{type:'resolvePlayerCard'});return applyAction(s,{type:'produce'});};
describe('deterministic engine',()=>{
 it('creates identical games from the same seed',()=>expect(createInitialState(42)).toEqual(createInitialState(42)));
 it('uses the workbook starting balance',()=>expect(createInitialState(1).players.red.resources).toMatchObject({water:9,food:9,medicines:4,rock:4,wood:4,tools:5,weapons:0,information:5}));
 it('follows event, declaration, card, production, activity, consumption phases',()=>{let s=toActivities();expect(s.phase).toBe('activities');s=applyAction(s,{type:'endActivities'});s=applyAction(s,{type:'consumeAndEndTurn'});expect(s.currentPlayerId).toBe('blue');expect(s.phase).toBe('declare');});
 it('grants one activity per three non-scavengers, rounded up',()=>{const s=toActivities(3,1);expect(s.activityLimit).toBe(1);});
 it('rejects gathering by more than three workers',()=>{const s=toActivities();expect(()=>applyAction(s,{type:'gather',tileId:s.players.red.baseTileId,survivors:4})).toThrow(/1–3/);});
 it('does not mutate prior state',()=>{const s=createInitialState(4),before=structuredClone(s);applyAction(s,{type:'resolveEvent'});expect(s).toEqual(before);});
 it('turns a found-building card into a free placement',()=>{let s=createInitialState(8);s.phase='card';s.players.red.currentCardId='p-well';s=applyAction(s,{type:'resolvePlayerCard'});s=applyAction(s,{type:'produce'});const before=s.players.red.resources;s=applyAction(s,{type:'placeFoundBuilding',tileId:s.players.red.baseTileId});expect(s.tiles.find(t=>t.id===s.players.red.baseTileId)?.buildings.some(b=>b.type==='well')).toBe(true);expect(s.players.red.resources).toEqual(before);});
 it('lets a player choose workshop output',()=>{const s=applyAction(createInitialState(9),{type:'setWorkshopOutput',resource:'weapons'});expect(s.players.red.workshopOutput).toBe('weapons');});
});
