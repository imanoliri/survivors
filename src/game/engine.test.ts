import { describe, expect, it } from 'vitest';
import { applyAction } from './engine';
import { createInitialState } from './initialState';

describe('Survivors game engine — prototype parity', () => {
  it('uses the eight-resource prototype economy', () => {
    const state = createInitialState();
    expect(state.players.red.resources).toEqual({
      water: 5,
      food: 5,
      wood: 0,
      rock: 0,
      medicines: 1,
      tools: 0,
      weapons: 0,
      information: 0,
    });
  });

  it('declares scavengers separately from attack parties', () => {
    const state = createInitialState();
    const declared = applyAction(state, {
      type: 'declareScavengers',
      playerId: 'red',
      tileId: '0-0',
      survivors: 2,
    });

    expect(declared.players.red.scavengers).toEqual([{ tileId: '0-0', survivors: 2 }]);
    expect(declared.players.red.survivors).toBe(5);
    expect(declared.attackParties).toHaveLength(0);
  });

  it('requires declared scavengers before gathering', () => {
    const state = createInitialState();
    expect(() => applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-0' }))
      .toThrow('Declare scavengers');

    const declared = applyAction(state, {
      type: 'declareScavengers',
      playerId: 'red',
      tileId: '0-0',
      survivors: 1,
    });
    const gathered = applyAction(declared, { type: 'gather', playerId: 'red', tileId: '0-0' });
    expect(gathered.players.red.resources.wood).toBeGreaterThan(0);
  });

  it('does not impose the invented one-action-per-turn limit', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 1 });
    state = applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-0' });
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-1', survivors: 1 });
    expect(() => applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-1' })).not.toThrow();
  });

  it('creates an attack party without changing total community survivors', () => {
    const state = createInitialState();
    const next = applyAction(state, { type: 'createAttackParty', playerId: 'red', survivors: 2 });

    expect(next.players.red.survivors).toBe(5);
    expect(next.attackParties[0]).toMatchObject({ id: 'A1', ownerId: 'red', survivors: 2 });
  });

  it('prevents double-assigning more survivors than exist', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 4 });
    expect(() => applyAction(state, { type: 'createAttackParty', playerId: 'red', survivors: 2 }))
      .toThrow('Not enough unassigned survivors');
  });

  it('supports attack-party creation, movement and disbanding as separate actions', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'createAttackParty', playerId: 'red', survivors: 1 });
    state = applyAction(state, { type: 'moveAttackParty', playerId: 'red', partyId: 'A1', destinationTileId: '1-1' });
    expect(state.attackParties[0].tileId).toBe('1-1');
    state = applyAction(state, { type: 'disbandAttackParty', playerId: 'red', partyId: 'A1' });
    expect(state.attackParties).toHaveLength(0);
  });

  it('consumes one food and one water per survivor at end turn', () => {
    const next = applyAction(createInitialState(), { type: 'endTurn', playerId: 'red' });
    expect(next.players.red.resources.food).toBe(0);
    expect(next.players.red.resources.water).toBe(0);
    expect(next.players.red.survivors).toBe(5);
  });

  it('consumes medicine for wounded survivors and causes deaths if medicine is short', () => {
    const state = createInitialState();
    state.players.red.wounded = 2;
    state.players.red.resources.medicines = 1;
    const next = applyAction(state, { type: 'endTurn', playerId: 'red' });
    expect(next.players.red.survivors).toBe(4);
    expect(next.players.red.resources.medicines).toBe(0);
  });

  it('clears scavenger declarations at end of the player turn', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 1 });
    state = applyAction(state, { type: 'endTurn', playerId: 'red' });
    expect(state.players.red.scavengers).toEqual([]);
  });

  it('advances the round after blue ends the turn', () => {
    const afterRed = applyAction(createInitialState(), { type: 'endTurn', playerId: 'red' });
    const afterBlue = applyAction(afterRed, { type: 'endTurn', playerId: 'blue' });
    expect(afterBlue.round).toBe(2);
    expect(afterBlue.currentPlayerId).toBe('red');
  });
});
