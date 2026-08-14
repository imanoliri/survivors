import type { CardDeckState, CardDeckType, CardDefinition } from './model';

/**
 * The prototype workbook contains the real event/player card catalog, but its
 * binary contents are not yet recovered through the connector. These entries
 * intentionally exercise the recovered CardStack behavior without pretending
 * to reproduce original card text or effects.
 */
export const CARD_DEFINITIONS: CardDefinition[] = [
  {
    id: 'event-placeholder-1',
    deck: 'event',
    copies: 2,
    name: 'Prototype event card (text pending recovery)',
    description: 'Original event-card name, description and effect still need to be recovered from game.xlsx.',
    placeholder: true,
  },
  {
    id: 'event-placeholder-2',
    deck: 'event',
    copies: 1,
    name: 'Prototype event card (text pending recovery) II',
    description: 'This placeholder preserves deck flow only. It has no automated effect.',
    placeholder: true,
  },
  {
    id: 'player-placeholder-1',
    deck: 'player',
    copies: 2,
    name: 'Prototype player card (text pending recovery)',
    description: 'Original player-card name, description and effect still need to be recovered from game.xlsx.',
    placeholder: true,
  },
  {
    id: 'player-placeholder-2',
    deck: 'player',
    copies: 1,
    name: 'Prototype player card (text pending recovery) II',
    description: 'This placeholder preserves deck flow only. It has no automated effect.',
    placeholder: true,
  },
];

export const cardDefinitionMap = (): Record<string, CardDefinition> =>
  Object.fromEntries(CARD_DEFINITIONS.map((card) => [card.id, card]));

export function createDeck(deck: CardDeckType): CardDeckState {
  const drawPile = CARD_DEFINITIONS
    .filter((card) => card.deck === deck)
    .flatMap((card) => Array.from({ length: card.copies }, () => card.id));

  // The Python prototype shuffled each fresh deck. Until seeded randomness is
  // introduced, reverse the expanded catalog for deterministic tests while
  // retaining copies + draw/dealt/reshuffle semantics.
  return { drawPile: [...drawPile].reverse(), dealt: [] };
}

export function dealCard(deck: CardDeckState): { deck: CardDeckState; cardId?: string; reshuffled: boolean } {
  let drawPile = [...deck.drawPile];
  let dealt = [...deck.dealt];
  let reshuffled = false;

  if (drawPile.length === 0 && dealt.length > 0) {
    drawPile = [...dealt].reverse();
    dealt = [];
    reshuffled = true;
  }

  const cardId = drawPile.pop();
  if (!cardId) return { deck: { drawPile, dealt }, cardId: undefined, reshuffled };

  dealt.push(cardId);
  return { deck: { drawPile, dealt }, cardId, reshuffled };
}
