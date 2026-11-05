import type { PlayerState } from '../domain/protocol';

export const DEMO_SESSION_ID = 'harbor-demo-7F3A';

// Character face portraits from the Mario Party 7 asset collection.
export const CHARACTER_PORTRAITS: Record<string, string> = {
  mario: 'https://mario.wiki.gallery/images/thumb/e/e9/Mario_Face_7.png/120px-Mario_Face_7.png',
  luigi: 'https://mario.wiki.gallery/images/thumb/5/5c/Luigi_Face_7.png/120px-Luigi_Face_7.png',
  peach: 'https://mario.wiki.gallery/images/thumb/9/92/Peach_Face_7.png/120px-Peach_Face_7.png',
  yoshi: 'https://mario.wiki.gallery/images/thumb/a/a5/Yoshi_Face_7.png/120px-Yoshi_Face_7.png',
  wario: 'https://mario.wiki.gallery/images/thumb/d/db/Wario_Face_7.png/120px-Wario_Face_7.png',
  waluigi: 'https://mario.wiki.gallery/images/thumb/9/9a/Waluigi_Face_7.png/120px-Waluigi_Face_7.png',
  daisy: 'https://mario.wiki.gallery/images/thumb/2/2f/Daisy_Face_7.png/120px-Daisy_Face_7.png',
  birdo: 'https://mario.wiki.gallery/images/thumb/6/6e/Birdo_Face_7.png/120px-Birdo_Face_7.png',
  toad: 'https://mario.wiki.gallery/images/thumb/e/e3/Toad_Face_7.png/120px-Toad_Face_7.png',
  boo: 'https://mario.wiki.gallery/images/thumb/a/af/Boo_MP_7.png/120px-Boo_MP_7.png',
  drybones: 'https://mario.wiki.gallery/images/thumb/c/c3/Dry_Bones_Face_7.png/120px-Dry_Bones_Face_7.png',
  dk: 'https://mario.wiki.gallery/images/thumb/9/92/DK_Face_7.png/120px-DK_Face_7.png',
};

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
