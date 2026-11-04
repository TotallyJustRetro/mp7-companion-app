import type { PlayerState } from '../domain/protocol';

export const DEMO_SESSION_ID = 'harbor-demo-7F3A';

export const DEMO_PLAYERS: PlayerState[] = [
  {
    playerId: 'P1', displayName: 'HarborHero', characterId: 'mario', characterName: 'Mario',
    coins: 28, stars: 2, position: 14, currentTurn: 7, totalTurns: 15,
    inventory: [
      { id: 'mushroom', name: 'Mushroom', icon: '🍄', quantity: 1 },
      { id: 'orb', name: 'Warp Pipe', icon: '🌀', quantity: 1 },
    ], phoneStatus: 'connected',
  },
  {
    playerId: 'P2', displayName: 'ShellShocked', characterId: 'luigi', characterName: 'Luigi',
    coins: 41, stars: 1, position: 9, currentTurn: 7, totalTurns: 15,
    inventory: [{ id: 'coin', name: 'Coin Bag', icon: '💰', quantity: 1 }], phoneStatus: 'not_connected',
  },
  {
    playerId: 'P3', displayName: 'StarGazer', characterId: 'peach', characterName: 'Peach',
    coins: 16, stars: 3, position: 21, currentTurn: 7, totalTurns: 15,
    inventory: [{ id: 'mushroom', name: 'Mushroom', icon: '🍄', quantity: 2 }], phoneStatus: 'connected',
  },
  {
    playerId: 'P4', displayName: 'BlueShell', characterId: 'yoshi', characterName: 'Yoshi',
    coins: 52, stars: 0, position: 5, currentTurn: 7, totalTurns: 15,
    inventory: [], phoneStatus: 'disconnected',
  },
];

export function cloneDemoPlayers(): PlayerState[] {
  return DEMO_PLAYERS.map((player) => ({ ...player, inventory: player.inventory.map((item) => ({ ...item })) }));
}
