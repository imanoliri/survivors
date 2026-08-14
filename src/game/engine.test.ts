import { describe, expect, it } from 'vitest';
import { applyAction } from './engine';
import { createInitialState } from './initialState';


describe('Survivors game engine', () => {
  it('gathers terrain resources and spends the turn action', () => {
    const state = createInitialState();
    const next = applyAction(state, { type: 'gather', playerId: 'red', tileId: '3-0' });

    expect(next.players.red.resources.food).toBe(8);
    expect(next.actionsRemaining).toBe(0);
    expect(state.players.red.resources.food).toBe(5);
  });

  it('rejects a second gather action in the same turn', () => {
    const state = applyAction(createInitialState(), {
      type: 'gather',
      playerId: 'red',
      tileId: '3-0',
    });

    expect(() =>
      applyAction(state, { type: 'gather', playerId: 'red', tileId: '2-0' }),
    ).toThrow('No actions remaining');
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
