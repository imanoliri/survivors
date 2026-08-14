import { useMemo, useState } from 'react';
import {
  applyAction,
  canGatherFromTile,
  getBuildFarmError,
  getMoveGroupError,
} from '../game/engine';
import { createInitialState } from '../game/initialState';
import type { GameState, SurvivorGroup, Tile } from '../game/model';

const terrainLabel: Record<Tile['terrain'], string> = {
  urban: 'Urban',
  forest: 'Forest',
  water: 'Water',
  farmland: 'Farmland',
};

export function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState());
  const [selectedTileId, setSelectedTileId] = useState<string>('0-1');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentPlayer = game.players[game.currentPlayerId];
  const selectedTile = useMemo(
    () => game.tiles.find((tile) => tile.id === selectedTileId) ?? game.tiles[0],
    [game.tiles, selectedTileId],
  );
  const playerGroups = game.groups.filter((group) => group.ownerId === game.currentPlayerId);
  const selectedGroup = playerGroups.find((group) => group.id === selectedGroupId);
  const canGather = game.actionsRemaining > 0 && canGatherFromTile(game, game.currentPlayerId, selectedTile.id);
  const canBuildFarm = getBuildFarmError(game, game.currentPlayerId, selectedTile.id) === null;
  const canMoveGroup = selectedGroup
    ? getMoveGroupError(game, game.currentPlayerId, selectedGroup.id, selectedTile.id) === null
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
    setSelectedGroupId('');
    setError('');
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
              <p>Create expeditions, move them across land, and gather where you have reach.</p>
            </div>
            <button className="secondary" onClick={reset}>Restart</button>
          </div>

          <div className="board" role="grid" aria-label="Game map">
            {game.tiles.map((tile) => {
              const groups = game.groups.filter((group) => group.tileId === tile.id);
              const reachable = canGatherFromTile(game, game.currentPlayerId, tile.id);
              return (
                <button
                  key={tile.id}
                  className={`tile terrain-${tile.terrain} ${selectedTile.id === tile.id ? 'selected' : ''} ${reachable ? 'reachable' : ''}`}
                  style={{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }}
                  onClick={() => setSelectedTileId(tile.id)}
                >
                  <span>{terrainLabel[tile.terrain]}</span>
                  <small>{tile.id}</small>
                  {tile.ownerId && <strong>Settlement · {game.players[tile.ownerId].name}</strong>}
                  {tile.buildings.map((building, index) => (
                    <strong key={`${building.type}-${index}`}>Farm · {game.players[building.ownerId].name}</strong>
                  ))}
                  {groups.map((group) => (
                    <GroupBadge key={group.id} group={group} active={group.id === selectedGroupId} />
                  ))}
                </button>
              );
            })}
          </div>

          <div className="selected-tile">
            <div>
              <span className="label">Selected</span>
              <strong>{terrainLabel[selectedTile.terrain]} · {selectedTile.id}</strong>
            </div>
            <div className="action-row">
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
                disabled={!canMoveGroup || !selectedGroup}
                onClick={() => selectedGroup && runAction({
                  type: 'moveGroup',
                  playerId: game.currentPlayerId,
                  groupId: selectedGroup.id,
                  destinationTileId: selectedTile.id,
                })}
              >
                Move group
              </button>
            </div>
          </div>
        </div>

        <aside className="sidebar">
          <section className="panel player-card">
            <span className="label">Current community</span>
            <h2>{currentPlayer.name}</h2>
            <div className="stat-grid">
              <Stat label="Settlement survivors" value={currentPlayer.survivors} />
              <Stat label="Wounded" value={currentPlayer.wounded} />
              <Stat label="Food" value={currentPlayer.resources.food} />
              <Stat label="Water" value={currentPlayer.resources.water} />
              <Stat label="Medicine" value={currentPlayer.resources.medicine} />
              <Stat label="Materials" value={currentPlayer.resources.materials} />
            </div>

            <div className="expedition-controls">
              <span className="label">Expeditions</span>
              <button
                disabled={game.actionsRemaining === 0 || currentPlayer.survivors <= 1}
                onClick={() => runAction({ type: 'createGroup', playerId: game.currentPlayerId, survivors: 1 })}
              >
                Form 1-survivor expedition
              </button>
              {playerGroups.length === 0 && <p className="hint">No expeditions yet.</p>}
              {playerGroups.map((group) => (
                <button
                  key={group.id}
                  className={group.id === selectedGroupId ? 'group-button selected-group' : 'group-button'}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  {group.id} · {group.survivors} survivor · tile {group.tileId}
                </button>
              ))}
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
              {[...game.log].reverse().map((entry) => <p key={entry.id}>{entry.text}</p>)}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function GroupBadge({ group, active }: { group: SurvivorGroup; active: boolean }) {
  return <strong className={active ? 'group-badge active-group' : 'group-badge'}>{group.id} · {group.survivors}</strong>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
