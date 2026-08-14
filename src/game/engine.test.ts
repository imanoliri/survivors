import { describe, expect, it } from 'vitest';
import { applyAction, canGatherFromTile, isTileReachableFromSettlement } from './engine';
import { createInitialState } from './initialState';


describe('Survivors game engine', () => {
  it('gathers terrain resources from a tile adjacent to the settlement', () => {
    const state = createInitialState();
    const next = applyAction(state, { type: 'gather', playerId: 'red', tileId: '1-1' });

    expect(next.players.red.resources.materials).toBe(2);
    expect(next.actionsRemaining).toBe(0);
    expect(state.players.red.resources.materials).toBe(0);
  });

  it('treats the settlement and orthogonally adjacent tiles as reachable', () => {
    const state = createInitialState();

    expect(isTileReachableFromSettlement(state, 'red', '0-1')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '0-0')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '1-1')).toBe(true);
    expect(isTileReachableFromSettlement(state, 'red', '1-0')).toBe(false);
    expect(isTileReachableFromSettlement(state, 'red', '3-0')).toBe(false);
  });

  it('rejects gathering outside settlement reach when no expedition is present', () => {
    const state = createInitialState();

    expect(() =>
      applyAction(state, { type: 'gather', playerId: 'red', tileId: '3-0' }),
    ).toThrow('outside settlement reach');
  });

  it('rejects a second action in the same turn', () => {
    const state = applyAction(createInitialState(), {
      type: 'gather',
      playerId: 'red',
      tileId: '1-1',
    });

    expect(() =>
      applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-0' }),
    ).toThrow('No actions remaining');
  });

  it('builds a Farm on the settlement and spends materials', () => {
    const state = createInitialState();
    state.players.red.resources.materials = 2;

    const next = applyAction(state, { type: 'buildFarm', playerId: 'red', tileId: '0-1' });

    expect(next.players.red.resources.materials).toBe(0);
    expect(next.tiles.find((tile) => tile.id === '0-1')?.buildings).toEqual([
      { type: 'farm', ownerId: 'red' },
    ]);
    expect(next.actionsRemaining).toBe(0);
  });

  it('rejects a Farm outside the player settlement', () => {
    const state = createInitialState();
    state.players.red.resources.materials = 2;

    expect(() =>
      applyAction(state, { type: 'buildFarm', playerId: 'red', tileId: '3-0' }),
    ).toThrow('only be built in your settlement');
  });

  it('produces Farm food before end-turn consumption', () => {
    const state = createInitialState();
    state.players.red.resources.materials = 2;
    const withFarm = applyAction(state, { type: 'buildFarm', playerId: 'red', tileId: '0-1' });
    const afterTurn = applyAction(withFarm, { type: 'endTurn', playerId: 'red' });

    expect(afterTurn.players.red.resources.food).toBe(2);
    expect(afterTurn.players.red.survivors).toBe(5);
    expect(afterTurn.log.some((entry) => entry.text.includes('Farm produced 2 food'))).toBe(true);
  });

  it('creates an expedition by moving survivors out of the settlement', () => {
    const state = createInitialState();
    const next = applyAction(state, { type: 'createGroup', playerId: 'red', survivors: 2 });

    expect(next.players.red.survivors).toBe(3);
    expect(next.groups).toEqual([
      { id: 'G1', ownerId: 'red', tileId: '0-1', survivors: 2 },
    ]);
    expect(next.actionsRemaining).toBe(0);
  });

  it('requires at least one survivor to remain at the settlement', () => {
    const state = createInitialState();

    expect(() =>
      applyAction(state, { type: 'createGroup', playerId: 'red', survivors: 5 }),
    ).toThrow('At least 1 survivor must remain');
  });

  it('moves a controlled expedition one orthogonal land tile', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'createGroup', playerId: 'red', survivors: 1 });
    state = applyAction(state, { type: 'endTurn', playerId: 'red' });
    state = applyAction(state, { type: 'endTurn', playerId: 'blue' });

    const next = applyAction(state, {
      type: 'moveGroup',
      playerId: 'red',
      groupId: 'G1',
      destinationTileId: '1-1',
    });

    expect(next.groups[0].tileId).toBe('1-1');
    expect(next.actionsRemaining).toBe(0);
  });

  it('rejects moving a basic expedition into water', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'createGroup', playerId: 'red', survivors: 1 });
    state = applyAction(state, { type: 'endTurn', playerId: 'red' });
    state = applyAction(state, { type: 'endTurn', playerId: 'blue' });

    expect(() => applyAction(state, {
      type: 'moveGroup',
      playerId: 'red',
      groupId: 'G1',
      destinationTileId: '0-2',
    })).toThrow('cannot enter water');
  });

  it('allows gathering on a distant tile occupied by an expedition', () => {
    const state = createInitialState();
    state.groups.push({ id: 'G1', ownerId: 'red', tileId: '2-1', survivors: 1 });

    expect(canGatherFromTile(state, 'red', '2-1')).toBe(true);
    const next = applyAction(state, { type: 'gather', playerId: 'red', tileId: '2-1' });
    expect(next.players.red.resources.materials).toBe(2);
    expect(next.players.red.resources.food).toBe(6);
  });

  it('consumes food and water and advances to the next player', () => {
    const next = applyAction(createInitialState(), { type: 'endTurn', playerId: 'red' });

    expect(next.currentPlayerId).toBe('blue');
    expect(next.players.red.resources.food).toBe(0);
    expect(next.players.red.resources.water).toBe(0);
    expect(next.players.red.survivors).toBe(5);
    expect(next.actionsRemaining).toBe(1);
  });

  it('advances the round after blue ends the turn', () => {
    const afterRed = applyAction(createInitialState(), { type: 'endTurn', playerId: 'red' });
    const afterBlue = applyAction(afterRed, { type: 'endTurn', playerId: 'blue' });

    expect(afterBlue.round).toBe(2);
    expect(afterBlue.currentPlayerId).toBe('red');
  });
});
