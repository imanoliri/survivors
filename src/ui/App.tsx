import { useMemo, useRef, useState } from 'react';
import { BUILDINGS, TERRAIN } from '../game/data';
import { applyAction, createInitialState } from '../game/engine';
import { imageDataToTerrain } from '../game/mapConversion';
import { RESOURCE_KEYS, type Action, type BuildingType, type GameState } from '../game/model';

const SAVE='survivors-save-v1';
function load():GameState{try{const x=localStorage.getItem(SAVE);if(!x)return createInitialState();const s=JSON.parse(x) as GameState;for(const p of Object.values(s.players))p.workshopOutput??='tools';return s;}catch{return createInitialState();}}

export function App(){
 const [state,setState]=useState(load);const [error,setError]=useState('');const [selected,setSelected]=useState('0-0');const [scavengers,setScavengers]=useState(0);const [workers,setWorkers]=useState(1);const canvas=useRef<HTMLCanvasElement>(null);
 const current=state.players[state.currentPlayerId],event=state.currentEventId?state.cards[state.currentEventId]:undefined,card=current.currentCardId?state.cards[current.currentCardId]:undefined;
 const dispatch=(action:Action)=>{try{const next=applyAction(state,action);setState(next);localStorage.setItem(SAVE,JSON.stringify(next));setError('');}catch(e){setError(e instanceof Error?e.message:String(e));}};
 const cols=Math.max(...state.tiles.map(t=>t.x))+1;
 const selectedTile=state.tiles.find(t=>t.id===selected);
 const phaseAction=()=>{if(state.phase==='event')dispatch({type:'resolveEvent'});else if(state.phase==='declare')dispatch({type:'declareScavengers',count:scavengers});else if(state.phase==='card')dispatch({type:'resolvePlayerCard'});else if(state.phase==='production')dispatch({type:'produce'});else if(state.phase==='activities')dispatch({type:'endActivities'});else if(state.phase==='consumption')dispatch({type:'consumeAndEndTurn'});};
 const phaseLabel={event:'Resolve event',declare:'Confirm scavengers',card:'Resolve player card',production:'Run production',activities:'Finish activities',consumption:'Consume & end turn',gameOver:'Game over'}[state.phase];
 const onMap=async(file:File)=>{const img=new Image();img.src=URL.createObjectURL(file);await img.decode();const c=canvas.current!;c.width=img.width;c.height=img.height;const ctx=c.getContext('2d')!;ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;dispatch({type:'replaceMap',terrain:imageDataToTerrain(data,c.width,c.height)});URL.revokeObjectURL(img.src);};
 const buildings=useMemo(()=>Object.entries(BUILDINGS).filter(([k])=>!['base','bridge'].includes(k)) as [BuildingType,typeof BUILDINGS[BuildingType]][],[]);
 return <main>
  <header><div><p className="eyebrow">POST-COLLAPSE STRATEGY</p><h1>Survivors</h1></div><div className="round">ROUND <strong>{state.round}</strong><span>{current.name}</span></div></header>
  {error&&<div className="error">{error}</div>}
  <section className="layout">
   <div className="board-panel">
    <div className="map-title"><div><h2>San Sebastián</h2><p>Real terrain converted from the prototype map</p></div><label className="upload">Convert another map<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&onMap(e.target.files[0])}/></label></div>
    <div className="board" style={{gridTemplateColumns:`repeat(${cols}, minmax(28px,1fr))`}}>{state.tiles.map(t=><button key={t.id} title={`${t.id} · ${TERRAIN[t.terrain].label}`} className={`tile ${selected===t.id?'selected':''}`} style={{background:TERRAIN[t.terrain].color}} onClick={()=>setSelected(t.id)}><span>{TERRAIN[t.terrain].letter}</span>{t.buildings.map(b=><img key={b.id} src={`/icons/${b.type}.png`} alt={BUILDINGS[b.type].label}/>)}</button>)}</div>
    <div className="legend">{Object.entries(TERRAIN).map(([k,v])=><span key={k}><i style={{background:v.color}}/>{v.label}</span>)}</div>
   </div>
   <aside>
    <div className="phase"><span>TURN PHASE</span><h2>{state.phase.toUpperCase()}</h2>{state.phase==='event'&&event&&<CardView title="WORLD EVENT" name={event.name} text={event.description}/>} {state.phase==='card'&&card&&<CardView title="PLAYER CARD" name={card.name} text={card.description}/>} {state.phase==='declare'&&<label>Active scavengers<input type="number" min="0" max={current.survivors-current.wounded} value={scavengers} onChange={e=>setScavengers(+e.target.value)}/></label>}<button className="primary" disabled={state.phase==='gameOver'} onClick={phaseAction}>{phaseLabel}</button></div>
    <div className="party"><h3>{current.name}</h3><div className="people"><strong>{current.survivors}</strong> survivors · {current.wounded} wounded · {current.idlers} idle</div><div className="resources">{RESOURCE_KEYS.map(r=><div key={r}><span>{r}</span><strong>{current.resources[r]}</strong></div>)}</div></div>
    {state.phase==='activities'&&<div className="actions"><h3>Activities <small>{state.activityUsed}/{state.activityLimit}</small></h3><p>Selected: {selectedTile?`${TERRAIN[selectedTile.terrain].label} ${selected}`:'none'}</p>{current.pendingFoundBuilding&&<button className="found" onClick={()=>dispatch({type:'placeFoundBuilding',tileId:selected})}>Place free {BUILDINGS[current.pendingFoundBuilding].label}</button>}<label>Workers (1–3)<input type="number" min="1" max="3" value={workers} onChange={e=>setWorkers(+e.target.value)}/></label><button onClick={()=>dispatch({type:'gather',tileId:selected,survivors:workers})}>Gather</button><button onClick={()=>dispatch({type:'lookForSurvivors',food:4})}>Search (4 food)</button><select id="building">{buildings.map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select><button onClick={()=>dispatch({type:'build',tileId:selected,building:(document.getElementById('building') as HTMLSelectElement).value as BuildingType})}>Build</button><label>Workshop output<select value={current.workshopOutput} onChange={e=>dispatch({type:'setWorkshopOutput',resource:e.target.value as 'tools'|'weapons'})}><option value="tools">5 tools</option><option value="weapons">5 weapons</option></select></label></div>}
   </aside>
  </section>
  <section className="lower"><div><h3>Field log</h3>{state.log.slice(0,7).map((x,i)=><p key={i}>{x}</p>)}</div><div><h3>Prototype controls</h3><p>Seed <code>{state.seed}</code> · deterministic deck/RNG state <code>{state.rng}</code></p><button onClick={()=>{const s=createInitialState();setState(s);localStorage.setItem(SAVE,JSON.stringify(s));}}>New game</button></div></section>
  <canvas ref={canvas} hidden/>
 </main>;
}
function CardView({title,name,text}:{title:string;name:string;text:string}){return <article className="card"><span>{title}</span><h3>{name}</h3><p>{text}</p></article>}
