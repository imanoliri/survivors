import { describe, expect, it } from 'vitest';
import { BUILDINGS } from './buildings';
import { createDeck, dealCard } from './cards';
import { applyAction } from './engine';
import { createInitialState } from './initialState';

describe('Survivors game engine — prototype parity', () => {
  it('uses the eight-resource prototype economy', () => {
    const state = createInitialState();
    expect(state.players.red.resources).toEqual({ water: 5, food: 5, wood: 0, rock: 0, medicines: 1, tools: 0, weapons: 0, information: 0 });
  });

  it('starts each player with a Base structure', () => {
    const state = createInitialState();
    expect(state.tiles.find((tile) => tile.id === '0-1')?.buildings).toContainEqual({ type: 'base', ownerId: 'red' });
    expect(state.tiles.find((tile) => tile.id === '3-2')?.buildings).toContainEqual({ type: 'base', ownerId: 'blue' });
  });

  it('contains the recovered prototype building catalog and known effects', () => {
    expect(Object.keys(BUILDINGS)).toEqual(expect.arrayContaining([
      'base', 'bridge', 'farm', 'hunterCamp', 'lumberCamp', 'quarry', 'well', 'waterCleaner', 'pharmacy', 'workshop', 'radio', 'watchtower',
    ]));
    expect(BUILDINGS.radio.survivorSearchBonus).toBe(1);
    expect(BUILDINGS.watchtower.combatDieBonus).toBe(1);
  });

  it('models cards with copies, name and description and tracks dealt cards', () => {
    const deck = createDeck('event');
    expect(deck.drawPile).toHaveLength(3);
    const first = dealCard(deck);
    expect(first.cardId).toBeDefined();
    expect(first.deck.drawPile).toHaveLength(2);
    expect(first.deck.dealt).toHaveLength(1);
  });

  it('deals an event card at round start and a player card at player turn start', () => {
    const state = createInitialState();
    expect(state.currentEventCardId).toBeDefined();
    expect(state.players.red.currentCardId).toBeDefined();
    expect(state.players.blue.currentCardId).toBeUndefined();

    const blueTurn = applyAction(state, { type: 'endTurn', playerId: 'red' });
    expect(blueTurn.players.blue.currentCardId).toBeDefined();

    const nextRound = applyAction(blueTurn, { type: 'endTurn', playerId: 'blue' });
    expect(nextRound.round).toBe(2);
    expect(nextRound.currentEventCardId).toBeDefined();
    expect(nextRound.players.red.currentCardId).toBeDefined();
  });

  it('reshuffles a deck after all cards have been dealt', () => {
    let deck = createDeck('event');
    deck = dealCard(deck).deck;
    deck = dealCard(deck).deck;
    deck = dealCard(deck).deck;
    const reshuffled = dealCard(deck);
    expect(reshuffled.reshuffled).toBe(true);
    expect(reshuffled.cardId).toBeDefined();
    expect(reshuffled.deck.dealt).toHaveLength(1);
  });

  it('declares scavengers separately from attack parties', () => {
    const state = applyAction(createInitialState(), { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 2 });
    expect(state.players.red.scavengers).toEqual([{ tileId: '0-0', survivors: 2 }]);
    expect(state.players.red.survivors).toBe(5);
    expect(state.attackParties).toHaveLength(0);
  });

  it('requires declared scavengers before gathering', () => {
    const initial = createInitialState();
    expect(() => applyAction(initial, { type: 'gather', playerId: 'red', tileId: '0-0' })).toThrow('Declare scavengers');
    const declared = applyAction(initial, { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 1 });
    const gathered = applyAction(declared, { type: 'gather', playerId: 'red', tileId: '0-0' });
    expect(gathered.players.red.resources.wood).toBeGreaterThan(0);
  });

  it('allows multiple activities in the same turn', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-0', survivors: 1 });
    state = applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-0' });
    expect(() => applyAction(state, { type: 'createAttackParty', playerId: 'red', survivors: 1 })).not.toThrow();
  });

  it('builds Farm only on grass/farmland and applies its gathering relationship', () => {
    let state = createInitialState();
    expect(() => applyAction(state, { type: 'build', playerId: 'red', tileId: '0-0', buildingType: 'farm' })).toThrow('not supported');
    state = applyAction(state, { type: 'build', playerId: 'red', tileId: '0-1', buildingType: 'farm' });
    state = applyAction(state, { type: 'declareScavengers', playerId: 'red', tileId: '0-1', survivors: 1 });
    const gathered = applyAction(state, { type: 'gather', playerId: 'red', tileId: '0-1' });
    expect(gathered.players.red.resources.food).toBeGreaterThan(8);
  });

  it('runs production buildings at end turn', () => {
    let state = createInitialState();
    state = applyAction(state, { type: 'build', playerId: 'red', tileId: '0-1', buildingType: 'well' });
    state.players.red.resources.water = 5;
    const next = applyAction(state, { type: 'endTurn', playerId: 'red' });
    expect(next.players.red.resources.water).toBe(1);
  });

  it('creates attack parties without changing total community survivors', () => {
    const next = applyAction(createInitialState(), { type: 'createAttackParty', playerId: 'red', survivors: 2 });
    expect(next.players.red.survivors).toBe(5);
    expect(next.attackParties[0]).toMatchObject({ id: 'A1', ownerId: 'red', survivors: 2 });
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
});
