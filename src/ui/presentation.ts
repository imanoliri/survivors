import type { CSSProperties } from 'react';
import type { Terrain } from '../game/model';

export const APPEARANCE_SAVE = 'survivors-appearance-v1';
export interface MapAppearance { mapOpacity:number; terrainEmojiOpacity:number; terrainOverlayOpacity:number }
export const DEFAULT_MAP_APPEARANCE:MapAppearance={mapOpacity:50,terrainEmojiOpacity:60,terrainOverlayOpacity:20};
const percent=(value:unknown,fallback:number)=>{const parsed=typeof value==='number'?value:typeof value==='string'&&value.trim()?Number(value):NaN;return Number.isFinite(parsed)?Math.min(100,Math.max(0,Math.round(parsed))):fallback};
export function parseMapAppearance(value:string|null):MapAppearance{if(!value)return {...DEFAULT_MAP_APPEARANCE};try{const stored=JSON.parse(value) as Record<string,unknown>|null;if(!stored||typeof stored!=='object')return {...DEFAULT_MAP_APPEARANCE};return {mapOpacity:percent(stored.mapOpacity,50),terrainEmojiOpacity:percent(stored.terrainEmojiOpacity,60),terrainOverlayOpacity:percent(stored.terrainOverlayOpacity,20)}}catch{return {...DEFAULT_MAP_APPEARANCE}}}
export function appearanceLayerStyle(a:MapAppearance){return {'--map-opacity':a.mapOpacity/100,'--terrain-emoji-opacity':a.terrainEmojiOpacity/100,'--terrain-overlay-opacity':a.terrainOverlayOpacity/100} as CSSProperties}
export function terrainGlyphStyle(terrain:Terrain):CSSProperties{return terrain==='swamp'?{color:'#e09aff',textShadow:'0 0 2px #fff'}:{}}
export function terrainPresentationColor(terrain:Terrain,canonicalColor:string){return terrain==='mountain'?'#d9dde2':canonicalColor}
