import type { BuildingType, Resources, TerrainType } from './model';

export type BuildingDefinition = {
  type: BuildingType;
  label: string;
  evidence: 'confirmed' | 'partial';
  placement?: TerrainType[] | 'any';
  gatheringBonus?: Partial<Resources>;
  production?: Partial<Resources>;
  survivorSearchBonus?: number;
  combatDieBonus?: number;
  movementRole?: 'bridge';
  notes: string;
};

/**
 * Prototype building graph reconstructed from documentation/economy.svg and
 * the original icon set. Numeric gather/production values are deliberately
 * provisional unless the old documentation states the value directly.
 */
export const BUILDINGS: Record<BuildingType, BuildingDefinition> = {
  base: {
    type: 'base',
    label: 'Base',
    evidence: 'confirmed',
    notes: 'Prototype structure confirmed by icon/economy assets; settlement/base rules still need exact recovery.',
  },
  bridge: {
    type: 'bridge',
    label: 'Bridge',
    evidence: 'partial',
    movementRole: 'bridge',
    notes: 'Bridge icon is present in the prototype. Exact crossing and construction rules are not yet recovered.',
  },
  farm: {
    type: 'farm',
    label: 'Farm',
    evidence: 'confirmed',
    placement: ['farmland'],
    gatheringBonus: { food: 1 },
    notes: 'Economy diagram links Farm to Food through gathering-with-building from Grass. +1 is provisional.',
  },
  hunterCamp: {
    type: 'hunterCamp',
    label: 'Hunter Camp',
    evidence: 'confirmed',
    placement: ['forest'],
    gatheringBonus: { food: 1 },
    notes: 'Economy diagram links Hunter Camp to Food through gathering-with-building from Wood. +1 is provisional.',
  },
  lumberCamp: {
    type: 'lumberCamp',
    label: 'Lumber Camp',
    evidence: 'confirmed',
    placement: ['forest'],
    gatheringBonus: { wood: 1 },
    notes: 'Economy diagram links Lumber Camp to Wood through gathering-with-building from Wood. +1 is provisional.',
  },
  quarry: {
    type: 'quarry',
    label: 'Quarry',
    evidence: 'confirmed',
    placement: 'any',
    gatheringBonus: { rock: 1 },
    notes: 'Economy diagram says Quarry gathers Rock from any Tile. +1 is provisional.',
  },
  well: {
    type: 'well',
    label: 'Well',
    evidence: 'confirmed',
    production: { water: 1 },
    notes: 'Well is on the production side of the economy graph and produces Water. Amount is provisional.',
  },
  waterCleaner: {
    type: 'waterCleaner',
    label: 'Water Cleaner',
    evidence: 'confirmed',
    production: { water: 1 },
    notes: 'Cleaner is on the production side of the economy graph and produces Water. Amount is provisional.',
  },
  pharmacy: {
    type: 'pharmacy',
    label: 'Pharmacy',
    evidence: 'confirmed',
    production: { medicines: 1 },
    notes: 'Pharmacy produces Medicines in the prototype economy graph. Amount is provisional.',
  },
  workshop: {
    type: 'workshop',
    label: 'Workshop',
    evidence: 'confirmed',
    production: { tools: 1 },
    notes: 'Workshop participates in Tools/Weapons economy. Tools +1 is a provisional minimal implementation until the exact conversion rule is recovered.',
  },
  radio: {
    type: 'radio',
    label: 'Radio',
    evidence: 'confirmed',
    survivorSearchBonus: 1,
    notes: 'Economy diagram explicitly shows +1 found survivor.',
  },
  watchtower: {
    type: 'watchtower',
    label: 'Watchtower',
    evidence: 'confirmed',
    combatDieBonus: 1,
    notes: 'Economy diagram explicitly shows +1 to one die in combat.',
  },
};

export const BUILDABLE_TYPES = (Object.keys(BUILDINGS) as BuildingType[]).filter(
  (type) => type !== 'base',
);
