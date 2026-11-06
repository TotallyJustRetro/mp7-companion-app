import type { PlayerState } from './domain/protocol';

export const DEMO_SESSION_ID = 'harbor-demo-7F3A';

// ── ASSET PATHS ──────────────────────────────────────────────────────────────
// All files live in /public/assets/ — Vite serves them at /assets/<name>

export const MP7_LOGO     = '/assets/logo.png';
export const MP7_LOGO_ALT = '/assets/logo-alt.png';
export const MP7_SHIP     = '/assets/ship.png';
export const MP7_COIN     = '/assets/coin.png';
export const MP7_STAR     = '/assets/star.png';
export const MP7_TOADSWORTH = '/assets/toadsworth-portrait.png';
export const MP7_TITLE_SCREEN = '/assets/title-screen.png';
export const MP7_MAIN_MENU    = '/assets/main-menu.png';
export const MP7_BOARD_SELECTION = '/assets/board-selection-screen.png';
export const MP7_CHAR_SELECT  = '/assets/char-select-screen.png';
export const MP7_BOWSER_TIME  = '/assets/icon-bowser-time.png';
export const MP7_MIC_ICON     = '/assets/icon-mic.png';

// Player slot badge overlays (use as <img> overlays on player cards, top-left)
export const PLAYER_BADGES: Record<string, string> = {
  P1:  '/assets/badge-p1.png',
  P2:  '/assets/badge-p2.png',
  P3:  '/assets/badge-p3.png',
  P4:  '/assets/badge-p4.png',
  CPU: '/assets/badge-cpu.png',
};

// Character face portraits (circular headshots from the game)
export const CHARACTER_PORTRAITS: Record<string, string> = {
  mario:    '/assets/face-mario.png',
  luigi:    '/assets/face-luigi.png',
  peach:    '/assets/face-peach.png',
  yoshi:    '/assets/face-yoshi.png',
  wario:    '/assets/face-wario.png',
  waluigi:  '/assets/face-waluigi.png',
  toad:     '/assets/face-toad.png',
  daisy:    '/assets/face-daisy.png',
  birdo:    '/assets/face-birdo.png',
  drybones: '/assets/face-drybones.png',
  toadette: '/assets/face-toadette.png',
  boo:      '/assets/face-boo.png',
};

// Character full-body artwork (transparent PNGs, good for hero sections)
export const CHARACTER_ART: Record<string, string> = {
  mario:    '/assets/art-mario.png',
  luigi:    '/assets/art-luigi.png',
  peach:    '/assets/art-peach.png',
  yoshi:    '/assets/art-yoshi.png',
  wario:    '/assets/art-wario.png',
  waluigi:  '/assets/art-waluigi.png',
  toad:     '/assets/art-toad.png',
  dk:       '/assets/art-dk.png',
  birdo:    '/assets/art-birdo.png',
  drybones: '/assets/art-drybones.png',
  boo:      '/assets/art-boo.png',
  toadette: '/assets/art-toadette.png',
};

// Board logos (official text logos from the game)
export const BOARD_LOGOS: Record<string, string> = {
  'pagoda-peak':     '/assets/board-pagoda-peak.png',
  'grand-canal':     '/assets/board-grand-canal.png',
  'neon-heights':    '/assets/board-neon-heights.png',
  'windmillville':   '/assets/board-windmillville.png',
  'pyramid-park':    '/assets/board-pyramid-park.png',
  'bowser-inferno':  '/assets/board-bowser-inferno.png',
};

// Board selection panels (in-game thumbnails shown on the board picker screen)
export const BOARD_PANELS: Record<string, string> = {
  'pagoda-peak':    '/assets/panel-pagoda-peak.png',
  'grand-canal':    '/assets/panel-grand-canal.png',
  'neon-heights':   '/assets/panel-neon-heights.png',
  'windmillville':  '/assets/panel-windmillville.png',
  'pyramid-park':   '/assets/panel-pyramid-park.png',
  'bowser-inferno': '/assets/panel-bowser-inferno.png',
};

// Minigame type panels
export const MINIGAME_PANELS: Record<string, string> = {
  '4p':  '/assets/panel-minigame-4p.png',
  '1v3': '/assets/panel-minigame-1v3.png',
  '2v2': '/assets/panel-minigame-2v2.png',
};

// Board metadata (name, id, theme color)
export const BOARDS = [
  { id: 'pagoda-peak',    name: 'Pagoda Peak',               color: '#CC4400' },
  { id: 'neon-heights',   name: 'Neon Heights',              color: '#6600CC' },
  { id: 'windmillville',  name: 'Windmillville',             color: '#00AA44' },
  { id: 'grand-canal',    name: 'Grand Canal',               color: '#0066CC' },
  { id: 'pyramid-park',   name: 'Pyramid Park',              color: '#CC9900' },
  { id: 'bowser-inferno', name: "Bowser's Enchanted Inferno!", color: '#CC2200' },
] as const;

export type BoardId = typeof BOARDS[number]['id'];

// ── DEMO PLAYERS ─────────────────────────────────────────────────────────────
export const DEMO_PLAYERS: PlayerState[] = [
  {
    playerId: 'P1', displayName: 'HarborHero', characterId: 'mario', characterName: 'Mario',
    coins: 28, stars: 2, position: 14, currentTurn: 7, totalTurns: 15,
    inventory: [
      { id: 'mushroom', name: 'Mushroom', icon: '🍄', quantity: 1 },
      { id: 'warp-pipe', name: 'Warp Pipe', icon: '🌀', quantity: 1 },
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
  return DEMO_PLAYERS.map((p) => ({ ...p, inventory: p.inventory.map((i) => ({ ...i })) }));
}
