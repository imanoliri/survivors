import { describe, expect, it } from 'vitest';
import { applyAction, isTileReachableFromSettlement } from './engine';
import { createInitialState } from './initialState';

describe('Survivors game engine', () => {
  it('gathers terrain resources from a tile adjacent to the settlement', () => {
    const state = createInitialState();
    const next = applyAction(state, { type: 'gather', playerId: 'red', tileId: '1-1' });
    expect(next.players.red.resources.materials).toBe(2);
    expect(next.actionsRemaining).toBe(0);
  });

  it('treats settlement and orthogonally adjacent tiles as reachable', () => {
    const state = createInitialState();
    expect(isTileReachableFromSettlement(state, 'red', '0-1')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '0-0')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '1-1')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '1-0')).toBe(false);
  });

  it('creates and moves an expedition', () => {
    const state = createInitialState();
    const formed = applyAction(state, { type: 'createGroup', playerId: 'red', survivors: 1 });
    expect(formed.players.red.survivors).toBe(4);
    expect(formed.groups[0]).toMatchObject({ id: 'G1', ownerId: 'red', tileId: '0-1', survivors: 1 });

    const blueTurn = applyAction(formed, { type: 'endTurn', playerId: 'red' });
    const redAgain = applyAction(blueTurn, { type: 'endTurn', playerId: 'blue' });
    const moved = applyAction(redAgain, { type: 'moveGroup', playerId: 'red', groupId: 'G1', destinationTileId: '1-1' });
    expect(moved.groups[0].tileId).toBe('1-1');
  });

  it('blocks basic expeditions from entering water', () => {
    const state = createInitialState();
    state.groups.push({ id: 'G1', ownerId: 'red', tileId: '0-1', survivors: 1 });
    state.players.red.survivors = 4;
    expect(() => applyAction(state, { type: 'moveGroup', playerId: 'red', groupId: 'G1', destinationTileId: '0-2' })).toThrow('cannot enter water');
  });

  it('scavenges a special location only when an expedition is present', () => {
    const state = createInitialState();
    expect(() => applyAction(state, { type: 'scavenge', playerId: 'red', groupId: 'G1', tileId: '1-1' })).toThrow('Group not found');

    state.groups.push({ id: 'G1', ownerId: 'red', tileId: '1-1', survivors: 1 });
    state.players.red.survivors = 4;
    const scavenged = applyAction(state, { type: 'scavenge', playerId: 'red', groupId: 'G1', tileId: '1-1' });

    expect(scavenged.players.red.resources.food).toBe(9);
    expect(scavenged.players.red.resources.water).toBe(7);
    expect(scavenged.tiles.find((tile) => tile.id === '1-1')?.specialLocation?.scavenged).toBe(true);
  });

  it('prevents a depleted location from being scavenged twice', () => {
    const state = createInitialState();
    state.groups.push({ id: 'G1', ownerId: 'red', tileId: '1-1', survivors: 1 });
    state.players.red.survivors = 4;
    const first = applyAction(state, { type: 'scavenge', playerId: 'red', groupId: 'G1', tileId: '1-1' });
    const blueTurn = applyAction(first, { type: 'endTurn', playerId: 'red' });
    const redAgain = applyAction(blueTurn, { type: 'endTurn', playerId: 'blue' });
    expect(() => applyAction(redAgain, { type: 'scavenge', playerId: 'red', groupId: 'G1', tileId: '1-1' })).toThrow('already been scavenged');
  });

  it('uses location-specific loot', () => {
    const state = createInitialState();
    state.groups.push({ id: 'G1', ownerId: 'red', tileId: '1-0', survivors: 1 });
    state.players.red.survivors = 4;
    const warehouse = applyAction(state, { type: 'scavenge', playerId: 'red', groupId: 'G1', tileId: '1-0' });
    expect(warehouse.players.red.resources.materials).toBe(4);

    const hospitalState = createInitialState();
    hospitalState.currentPlayerId = 'blue';
    hospitalState.groups.push({ id: 'G1', ownerId: 'blue', tileId: '2-2', survivors: 1 });
    hospitalState.players.blue.survivors = 4;
    const hospital = applyAction(hospitalState, { type: 'scavenge', playerId: 'blue', groupId: 'G1', tileId: '2-2' });
    expect(hospital.players.blue.resources.medicine).toBe(4);
  });

  it('builds a Farm and produces food before consumption', () => {
    const state = createInitialState();
    state.players.red.resources.materials = 2;
    const withFarm = applyAction(state, { type: 'buildFarm', playerId: 'red', tileId: '0-1' });
    const afterTurn = applyAction(withFarm, { type: 'endTurn', playerId: 'red' });
    expect(afterTurn.players.red.resources.food).toBe(2);
  });

  it('advances the round after blue ends the turn', () => {
    const afterRed = applyAction(createInitialState(), { type: 'endTurn', playerId: 'red' });
    const afterBlue = applyAction(afterRed, { type: 'endTurn', playerId: 'blue' });
    expect(afterBlue.round).toBe(2);
    expect(afterBlue.currentPlayerId).toBe('red');
  });
});
