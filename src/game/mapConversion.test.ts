import { describe,expect,it } from 'vitest';
import { closestTerrain,gridDimensions,imageDataToTerrain } from './mapConversion';
describe('real map conversion',()=>{
 it('matches prototype reference colors',()=>expect(closestTerrain(154,192,255)).toBe('lake'));
 it('uses the prototype aspect-ratio grid rule',()=>expect(gridDimensions(1200,1600,200)).toEqual({cols:12,rows:16}));
 it('classifies image cells by pixel majority',()=>{const pixels=new Uint8ClampedArray([154,192,255,255,154,192,255,255,231,235,238,255,231,235,238,255]);expect(imageDataToTerrain(pixels,2,2,1)).toEqual([['lake']]);});
});
