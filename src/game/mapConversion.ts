import { TERRAIN } from './data';
import type { Terrain } from './model';

export function gridDimensions(width:number,height:number,target=200):{cols:number;rows:number}{
  const ratio=width/height;
  const cols=Math.max(1,Math.floor(Math.sqrt(target*ratio)));
  return {cols,rows:Math.max(1,Math.floor(target/cols))};
}

export function closestTerrain(r:number,g:number,b:number):Terrain{
  let best:Terrain='buildings', distance=Infinity;
  for(const [terrain,def] of Object.entries(TERRAIN) as [Terrain,typeof TERRAIN[Terrain]][]){
    const d=(r-def.rgb[0])**2+(g-def.rgb[1])**2+(b-def.rgb[2])**2;
    if(d<distance){distance=d;best=terrain;}
  }
  return best;
}

/** Faithful to the prototype's effective majority classifier, with subsampling for browser speed. */
export function imageDataToTerrain(data:Uint8ClampedArray,width:number,height:number,target=200):Terrain[][]{
  const {cols,rows}=gridDimensions(width,height,target);
  const cellW=width/cols,cellH=height/rows;
  return Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>{
    const counts=new Map<Terrain,number>();
    const step=Math.max(1,Math.floor(Math.min(cellW,cellH)/8));
    for(let py=Math.floor(y*cellH);py<Math.floor((y+1)*cellH);py+=step){
      for(let px=Math.floor(x*cellW);px<Math.floor((x+1)*cellW);px+=step){
        const i=(py*width+px)*4,t=closestTerrain(data[i],data[i+1],data[i+2]);
        counts.set(t,(counts.get(t)??0)+1);
      }
    }
    return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]??'buildings';
  }));
}

