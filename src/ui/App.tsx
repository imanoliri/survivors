import { useMemo, useState } from 'react';
import { applyAction } from '../game/engine';
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
        <div className="turn-pill">{currentPlayer.name}'s turn</div>
      </header>

      <section className="layout">
        <div className="board-panel panel">
          <div className="board-heading">
            <div>
              <h2>District map</h2>
              <p>Select a tile, then gather from it.</p>
            </div>
            <button
              className="secondary"
              onClick={() => setGame(createInitialState())}
            >
              Restart
            </button>
          </div>

          <div className="board" role="grid" aria-label="Game map">
            {game.tiles.map((tile) => (
              <button
                key={tile.id}
                className={`tile terrain-${tile.terrain} ${selectedTile.id === tile.id ? 'selected' : ''}`}
                style={{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }}
                onClick={() => setSelectedTileId(tile.id)}
              >
                <span>{terrainLabel[tile.terrain]}</span>
                <small>{tile.id}</small>
                {tile.ownerId && <strong>{game.players[tile.ownerId].name}</strong>}
              </button>
            ))}
          </div>

          <div className="selected-tile">
            <div>
              <span className="label">Selected</span>
              <strong>{terrainLabel[selectedTile.terrain]} · {selectedTile.id}</strong>
            </div>
            <button
              onClick={() => runAction({
                type: 'gather',
                playerId: game.currentPlayerId,
                tileId: selectedTile.id,
              })}
            >
              Gather
            </button>
          </div>
        </div>

        <aside className="sidebar">
          <section className="panel player-card">
            <span className="label">Current community</span>
            <h2>{currentPlayer.name}</h2>
            <div className="stat-grid">
              <Stat label="Survivors" value={currentPlayer.survivors} />
              <Stat label="Wounded" value={currentPlayer.wounded} />
              <Stat label="Food" value={currentPlayer.resources.food} />
              <Stat label="Water" value={currentPlayer.resources.water} />
              <Stat label="Medicine" value={currentPlayer.resources.medicine} />
              <Stat label="Materials" value={currentPlayer.resources.materials} />
            </div>
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
