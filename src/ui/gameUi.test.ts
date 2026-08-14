import {describe,expect,it} from 'vitest';
import {createInitialState} from '../game/engine';
import {buildActionCost,buildingTooltip,consumptionCostText,formatResourceCost,selectionTransitionKey} from './gameUi';

describe('player-focused map UI',()=>{
 it('keys selection to the player turn and current base',()=>{const state=createInitialState();expect(selectionTransitionKey(state)).toBe(`1:1:red:${state.players.red.baseTileId}`);state.currentPlayerId='blue';state.turn=2;expect(selectionTransitionKey(state)).toBe(`1:2:blue:${state.players.blue.baseTileId}`);state.players.blue.baseTileId='new-base';expect(selectionTransitionKey(state)).toBe('1:2:blue:new-base')});
 it('formats exact building resource costs in canonical order',()=>expect(formatResourceCost({rock:3,wood:3,tools:2})).toBe('🪨 3 rock · 🪵 3 wood · 🛠️ 2 tools'));
 it('calls unknown construction cost out explicitly',()=>expect(formatResourceCost({})).toBe('No recovered construction cost'));
 it('describes ownership, readiness, and base identity',()=>{const state=createInitialState(),base=state.tiles.flatMap(t=>t.buildings).find(b=>b.type==='base')!;expect(buildingTooltip(base,state.players[base.ownerId],state.round)).toContain('Home base · Owner:');expect(buildingTooltip(base,state.players[base.ownerId],state.round)).toContain('Ready and active');expect(buildingTooltip(base,state.players[base.ownerId],state.round)).toContain('No recovered construction cost')});
 it('reports build requirements and calculated heatwave consumption',()=>{expect(buildActionCost('well')).toBe('Costs 1 activity · requires 3 idle survivors · 🪨 3 rock · 🪵 3 wood · 🛠️ 2 tools');const state=createInitialState();state.weather='heat';state.players.red.idlers=1;state.players.red.wounded=2;expect(consumptionCostText(state.players.red,state.weather)).toContain('💧 5 water · 🥫 3 food · up to 💊 2 medicines');expect(consumptionCostText(state.players.red,state.weather)).toContain('2 extra heatwave water')});
});
