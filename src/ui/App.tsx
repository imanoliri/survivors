import { useMemo, useState } from 'react';
import { applyAction, getBuildFarmError, getGatherError, isTileReachableFromSettlement } from '../game/engine';
import { createInitialState } from '../game/initialState';
import type { GameState, Tile } from '../game/model';

const terrainLabel: Record<Tile['terrain'], string> = {
  urban: 'Urban',
  forest: 'Forest',
  water: 'Water',
  farmland: 'Farmland',
};

export function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const [selectedTileId, setSelectedTileId] = useState<string>('0-1');
  const [error, setError] = useState<string>('');

  const currentPlayer = game.players[game.currentPlayerId];
  const selectedTile = useMemo(
    () => game.tiles.find((tile) => tile.id === selectedTileId) ?? game.tiles[0],
    [game.tiles, selectedTileId],
  );
  const gatherError = getGatherError(game, game.currentPlayerId, selectedTile.id);
  const farmError = getBuildFarmError(game, game.currentPlayerId, selectedTile.id);
  const selectedIsReachable = isTileReachableFromSettlement(game, game.currentPlayerId, selectedTile.id);

  const runAction = (action: Parameters<typeof applyAction>[1]) => {
    try {
      setGame((state) => applyAction(state, action));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action failed.');
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SURVIVORS</p>
          <h1>Round {game.round}</h1>
        </div>
        <div className="turn-pill">{currentPlayer.name}'s turn · {game.actionsRemaining} action</div>
      </header>

      <section className="layout">
        <div className="board-panel panel">
          <div className="board-heading">
            <div>
              <h2>District map</h2>
              <p>Gather from your settlement or an adjacent tile. Build a Farm on your farmland settlement.</p>
            </div>
            <button
              className="secondary"
              onClick={() => {
                setGame(createInitialState());
                setSelectedTileId('0-1');
                setError('');
              }}
            >
              Restart
            </button>
          </div>

          <div className="board" role="grid" aria-label="Game map">
            {game.tiles.map((tile) => {
              const reachable = isTileReachableFromSettlement(game, game.currentPlayerId, tile.id);
              return (
                <button
                  key={tile.id}
                  className={`tile terrain-${tile.terrain} ${selectedTile.id === tile.id ? 'selected' : ''} ${reachable ? 'reachable' : ''}`}
                  style={{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }}
                  onClick={() => setSelectedTileId(tile.id)}
                >
                  <span>{terrainLabel[tile.terrain]}</span>
                  <small>{tile.id}{reachable ? ' · in range' : ''}</small>
                  {tile.ownerId && <strong>{game.players[tile.ownerId].name}</strong>}
                  {tile.buildings.map((building, index) => (
                    <strong key={`${building.type}-${index}`}>Farm</strong>
                  ))}
                </button>
              );
            })}
          </div>

          <div className="selected-tile">
            <div>
              <span className="label">Selected</span>
              <strong>{terrainLabel[selectedTile.terrain]} · {selectedTile.id}</strong>
              <small>{selectedIsReachable ? 'Within settlement range' : 'Outside settlement range'}</small>
            </div>
            <div className="action-row">
              <button
                disabled={Boolean(gatherError)}
                title={gatherError ?? 'Gather resources'}
                onClick={() => runAction({
                  type: 'gather',
                  playerId: game.currentPlayerId,
                  tileId: selectedTile.id,
                })}
              >
                Gather
              </button>
              <button
                className="secondary"
                disabled={Boolean(farmError)}
                title={farmError ?? 'Build Farm for 2 materials'}
                onClick={() => runAction({
                  type: 'buildFarm',
                  playerId: game.currentPlayerId,
                  tileId: selectedTile.id,
                })}
              >
                Build Farm (2 materials)
              </button>
            </div>
          </div>
        </div>

        <aside className="sidebar">
          <section className="panel player-card">
            <span className="label">Current community</span>
            <h2>{currentPlayer.name}</h2>
            <p>Settlement: {currentPlayer.settlementTileId}</p>
            <div className="stat-grid">
              <Stat label="Survivors" value={currentPlayer.survivors} />
              <Stat label="Wounded" value={currentPlayer.wounded} />
              <Stat label="Food" value={currentPlayer.resources.food} />
              <Stat label="Water" value={currentPlayer.resources.water} />
              <Stat label="Medicine" value={currentPlayer.resources.medicine} />
              <Stat label="Materials" value={currentPlayer.resources.materials} />
            </div>
            <p className="label">Farms produce 2 food before consumption.</p>
            <button
              className="end-turn"
              onClick={() => runAction({ type: 'endTurn', playerId: game.currentPlayerId })}
            >
              End turn
            </button>
            {error && <p className="error">{error}</p>}
          </section>

          <section className="panel">
            <span className="label">Game log</span>
            <div className="log">
              {[...game.log].reverse().map((entry) => (
                <p key={entry.id}>{entry.text}</p>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
