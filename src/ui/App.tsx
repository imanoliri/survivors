import { useMemo, useState } from 'react';
import {
  applyAction,
  canGatherFromTile,
  getBuildFarmError,
  getMoveAttackPartyError,
} from '../game/engine';
import { createInitialState } from '../game/initialState';
import type { AttackParty, GameState, Tile } from '../game/model';

const terrainLabel: Record<Tile['terrain'], string> = {
  urban: 'Urban',
  forest: 'Forest',
  water: 'Water',
  farmland: 'Grass / Farmland',
};

export function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const [selectedTileId, setSelectedTileId] = useState('0-1');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [error, setError] = useState('');

  const currentPlayer = game.players[game.currentPlayerId];
  const selectedTile = useMemo(
    () => game.tiles.find((tile) => tile.id === selectedTileId) ?? game.tiles[0],
    [game.tiles, selectedTileId],
  );
  const playerParties = game.attackParties.filter((party) => party.ownerId === game.currentPlayerId);
  const selectedParty = playerParties.find((party) => party.id === selectedPartyId);
  const scavengersHere = currentPlayer.scavengers.find((assignment) => assignment.tileId === selectedTile.id)?.survivors ?? 0;
  const canGather = canGatherFromTile(game, game.currentPlayerId, selectedTile.id);
  const canBuildFarm = getBuildFarmError(game, game.currentPlayerId, selectedTile.id) === null;
  const canMoveParty = selectedParty
    ? getMoveAttackPartyError(game, game.currentPlayerId, selectedParty.id, selectedTile.id) === null
    : false;

  const runAction = (action: Parameters<typeof applyAction>[1]) => {
    try {
      setGame((state) => applyAction(state, action));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action failed.');
    }
  };

  const reset = () => {
    setGame(createInitialState());
    setSelectedTileId('0-1');
    setSelectedPartyId('');
    setError('');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SURVIVORS</p>
          <h1>Round {game.round}</h1>
        </div>
        <div className="turn-pill">{currentPlayer.name}'s turn</div>
      </header>

      <section className="layout">
        <div className="board-panel panel">
          <div className="board-heading">
            <div>
              <h2>District map</h2>
              <p>Declare scavengers for resource gathering. Attack parties are a separate system.</p>
            </div>
            <button className="secondary" onClick={reset}>Restart</button>
          </div>

          <div className="board" role="grid" aria-label="Game map">
            {game.tiles.map((tile) => {
              const parties = game.attackParties.filter((party) => party.tileId === tile.id);
              const scavengers = currentPlayer.scavengers.find((assignment) => assignment.tileId === tile.id)?.survivors ?? 0;
              return (
                <button
                  key={tile.id}
                  className={`tile terrain-${tile.terrain} ${selectedTile.id === tile.id ? 'selected' : ''} ${scavengers ? 'reachable' : ''}`}
                  style={{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }}
                  onClick={() => setSelectedTileId(tile.id)}
                >
                  <span>{terrainLabel[tile.terrain]}</span>
                  <small>{tile.id}</small>
                  {tile.ownerId && <strong>Base · {game.players[tile.ownerId].name}</strong>}
                  {tile.buildings.map((building, index) => (
                    <strong key={`${building.type}-${index}`}>Farm · {game.players[building.ownerId].name}</strong>
                  ))}
                  {scavengers > 0 && <strong>Scavengers · {scavengers}</strong>}
                  {parties.map((party) => (
                    <PartyBadge key={party.id} party={party} active={party.id === selectedPartyId} />
                  ))}
                </button>
              );
            })}
          </div>

          <div className="selected-tile">
            <div>
              <span className="label">Selected</span>
              <strong>{terrainLabel[selectedTile.terrain]} · {selectedTile.id}</strong>
              <small>{scavengersHere} scavenger(s) currently declared here</small>
            </div>
            <div className="action-row">
              <button onClick={() => runAction({
                type: 'declareScavengers',
                playerId: game.currentPlayerId,
                tileId: selectedTile.id,
                survivors: scavengersHere === 0 ? 1 : 0,
              })}>
                {scavengersHere ? 'Remove scavengers' : 'Assign 1 scavenger'}
              </button>
              <button
                disabled={!canGather}
                onClick={() => runAction({ type: 'gather', playerId: game.currentPlayerId, tileId: selectedTile.id })}
              >
                Gather
              </button>
              <button
                disabled={!canBuildFarm}
                onClick={() => runAction({ type: 'buildFarm', playerId: game.currentPlayerId, tileId: selectedTile.id })}
              >
                Build Farm
              </button>
              <button
                disabled={!canMoveParty || !selectedParty}
                onClick={() => selectedParty && runAction({
                  type: 'moveAttackParty',
                  playerId: game.currentPlayerId,
                  partyId: selectedParty.id,
                  destinationTileId: selectedTile.id,
                })}
              >
                Move attack party
              </button>
            </div>
          </div>
        </div>

        <aside className="sidebar">
          <section className="panel player-card">
            <span className="label">Current community</span>
            <h2>{currentPlayer.name}</h2>
            <div className="stat-grid">
              <Stat label="Survivors" value={currentPlayer.survivors} />
              <Stat label="Wounded" value={currentPlayer.wounded} />
              <Stat label="Water" value={currentPlayer.resources.water} />
              <Stat label="Food" value={currentPlayer.resources.food} />
              <Stat label="Wood" value={currentPlayer.resources.wood} />
              <Stat label="Rock" value={currentPlayer.resources.rock} />
              <Stat label="Medicines" value={currentPlayer.resources.medicines} />
              <Stat label="Tools" value={currentPlayer.resources.tools} />
              <Stat label="Weapons" value={currentPlayer.resources.weapons} />
              <Stat label="Information" value={currentPlayer.resources.information} />
            </div>

            <div className="expedition-controls">
              <span className="label">Attack parties</span>
              <button onClick={() => runAction({
                type: 'createAttackParty',
                playerId: game.currentPlayerId,
                survivors: 1,
              })}>
                Create 1-survivor attack party
              </button>
              {playerParties.length === 0 && <p className="hint">No attack parties.</p>}
              {playerParties.map((party) => (
                <div key={party.id} className="party-row">
                  <button
                    className={party.id === selectedPartyId ? 'group-button selected-group' : 'group-button'}
                    onClick={() => setSelectedPartyId(party.id)}
                  >
                    {party.id} · {party.survivors} survivor · tile {party.tileId}
                  </button>
                  <button className="secondary" onClick={() => runAction({
                    type: 'disbandAttackParty',
                    playerId: game.currentPlayerId,
                    partyId: party.id,
                  })}>
                    Disband
                  </button>
                </div>
              ))}
            </div>

            <p className="hint">Farm costs and gather yields are currently marked provisional until the original balance tables are recovered.</p>
            <button className="end-turn" onClick={() => runAction({ type: 'endTurn', playerId: game.currentPlayerId })}>
              End turn
            </button>
            {error && <p className="error">{error}</p>}
          </section>

          <section className="panel">
            <span className="label">Game log</span>
            <div className="log">
              {[...game.log].reverse().map((entry) => <p key={entry.id}>{entry.text}</p>)}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function PartyBadge({ party, active }: { party: AttackParty; active: boolean }) {
  return <strong className={active ? 'group-badge active-group' : 'group-badge'}>{party.id} · {party.survivors}</strong>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}
