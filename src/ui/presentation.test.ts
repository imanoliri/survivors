import {describe,expect,it} from 'vitest';
import {appearanceLayerStyle,DEFAULT_MAP_APPEARANCE,parseMapAppearance,terrainGlyphStyle,terrainPresentationColor} from './presentation';
describe('map appearance preferences',()=>{
 it('defaults to 50/60/20',()=>expect(parseMapAppearance(null)).toEqual({mapOpacity:50,terrainEmojiOpacity:60,terrainOverlayOpacity:20}));
 it('recovers invalid and missing values',()=>{expect(parseMapAppearance('{"mapOpacity":"nope","terrainEmojiOpacity":25}')).toEqual({...DEFAULT_MAP_APPEARANCE,terrainEmojiOpacity:25});expect(parseMapAppearance('broken')).toEqual(DEFAULT_MAP_APPEARANCE)});
 it('clamps and rounds stored percentages',()=>expect(parseMapAppearance('{"mapOpacity":-8,"terrainEmojiOpacity":101,"terrainOverlayOpacity":19.6}')).toEqual({mapOpacity:0,terrainEmojiOpacity:100,terrainOverlayOpacity:20}));
 it('normalizes independent layer variables',()=>expect(appearanceLayerStyle({mapOpacity:25,terrainEmojiOpacity:75,terrainOverlayOpacity:10})).toEqual({'--map-opacity':.25,'--terrain-emoji-opacity':.75,'--terrain-overlay-opacity':.1}));
 it('keeps terrain glyph styling free of per-terrain background badges',()=>{expect(terrainGlyphStyle('buildings')).toEqual({});expect(terrainGlyphStyle('swamp')).toEqual({color:'#e09aff',textShadow:'0 0 2px #fff'});expect(terrainGlyphStyle('swamp')).not.toHaveProperty('background')});
 it('uses a UI-only pale mountain tint without changing other terrain colors',()=>{expect(terrainPresentationColor('mountain','#6e7274')).toBe('#d9dde2');expect(terrainPresentationColor('rocks','#a77b68')).toBe('#a77b68')});
});
