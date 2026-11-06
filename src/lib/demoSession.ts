import type { PlayerState } from '../domain/protocol';

export const DEMO_SESSION_ID = 'harbor-demo-7F3A';

// All handoff artwork lives in public/assets. Vite serves it from /assets/.
const asset = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

export const MP7_LOGO = asset('logo.png');
export const MP7_LOGO_ALT = asset('logo-alt.png');
export const MP7_SHIP = asset('ship.png');
export const MP7_SHIP_SETSAIL = asset('ship-setsail.png');
export const MP7_COIN = asset('coin.png');
export const MP7_STAR = asset('star.png');
export const MP7_TOADSWORTH = asset('toadsworth-portrait.png');
export const MP7_TITLE_SCREEN = asset('title-screen.png');
export const MP7_MAIN_MENU = asset('main-menu.png');
export const MP7_BOARD_SELECTION = asset('board-selection-screen.png');
export const MP7_CHAR_SELECT = asset('char-select-screen.png');
export const MP7_CHAR_SELECT_ALT = asset('char-select-screen2.png');
export const MP7_BOWSER_TIME = asset('icon-bowser-time.png');
export const MP7_MIC_ICON = asset('icon-mic.png');
export const MP7_CONTROL_ROOM_ICON = asset('icon-control-room.png');

// Backward-compatible aliases for app components that still use the older names.
export const MP7_GAME_LOGO = MP7_LOGO;
export const MIC_CONTROL_ROOM_SPRITE = MP7_MIC_ICON;

export const CHARACTER_PORTRAITS: Record<string, string> = {
  mario: asset('face-mario.png'),
  luigi: asset('face-luigi.png'),
  peach: asset('face-peach.png'),
  yoshi: asset('face-yoshi.png'),
  wario: asset('face-wario.png'),
  waluigi: asset('face-waluigi.png'),
  toad: asset('face-toad.png'),
  daisy: asset('face-daisy.png'),
  birdo: asset('face-birdo.png'),
  drybones: asset('face-drybones.png'),
  toadette: asset('face-toadette.png'),
  boo: asset('face-boo.png'),
  // The handoff does not include a dedicated DK face crop; use his supplied full-body art.
  dk: asset('art-dk.png'),
};

export const CHARACTER_ART: Record<string, string> = {
  mario: asset('art-mario.png'),
  luigi: asset('art-luigi.png'),
  peach: asset('art-peach.png'),
  yoshi: asset('art-yoshi.png'),
  wario: asset('art-wario.png'),
  waluigi: asset('art-waluigi.png'),
  toad: asset('art-toad.png'),
  dk: asset('art-dk.png'),
  birdo: asset('art-birdo.png'),
  drybones: asset('art-drybones.png'),
  boo: asset('art-boo.png'),
  toadette: asset('art-toadette.png'),
};

export const PLAYER_BADGES: Record<string, string> = {
  P1: asset('badge-p1.png'),
  P2: asset('badge-p2.png'),
  P3: asset('badge-p3.png'),
  P4: asset('badge-p4.png'),
  CPU: asset('badge-cpu.png'),
};
export const PLAYER_SLOT_MARKERS = PLAYER_BADGES;

export const BOARD_LOGOS: Record<string, string> = {
  'pagoda-peak': asset('board-pagoda-peak.png'),
  'grand-canal': asset('board-grand-canal.png'),
  'neon-heights': asset('board-neon-heights.png'),
  windmillville: asset('board-windmillville.png'),
  'pyramid-park': asset('board-pyramid-park.png'),
  'bowser-inferno': asset('board-bowser-inferno.png'),
};

export const BOARD_PANELS: Record<string, string> = {
  'pagoda-peak': asset('panel-pagoda-peak.png'),
  'grand-canal': asset('panel-grand-canal.png'),
  'neon-heights': asset('panel-neon-heights.png'),
  windmillville: asset('panel-windmillville.png'),
  'pyramid-park': asset('panel-pyramid-park.png'),
  'bowser-inferno': asset('panel-bowser-inferno.png'),
};

export const MINIGAME_PANELS: Record<'4p' | '1v3' | '2v2', string> = {
  '4p': asset('panel-minigame-4p.png'),
  '1v3': asset('panel-minigame-1v3.png'),
  '2v2': asset('panel-minigame-2v2.png'),
};

export const ORB_IMAGES: Record<string, string> = {
  mushroom: asset('orb-mushroom.jpg'),
  orb: asset('orb-warp-pipe.jpg'),
  'warp-pipe': asset('orb-warp-pipe.jpg'),
  coin: MP7_COIN,
  cannon: asset('orb-cannon.jpg'),
  fireball: asset('orb-fireball.jpg'),
};

export const BOARD_SPACE_ART: Record<string, string> = {
  red: asset('space-red.png'),
  blue: asset('space-blue.png'),
  bowser: asset('space-bowser.png'),
  dk: asset('space-dk.png'),
  mic: asset('space-mic.png'),
};

export const BOARDS = [
  { id: 'pagoda-peak', name: 'Pagoda Peak', color: '#CC4400' },
  { id: 'neon-heights', name: 'Neon Heights', color: '#6600CC' },
  { id: 'windmillville', name: 'Windmillville', color: '#00AA44' },
  { id: 'grand-canal', name: 'Grand Canal', color: '#0066CC' },
  { id: 'pyramid-park', name: 'Pyramid Park', color: '#CC9900' },
  { id: 'bowser-inferno', name: "Bowser's Enchanted Inferno!", color: '#CC2200' },
] as const;

export type BoardId = typeof BOARDS[number]['id'];

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
