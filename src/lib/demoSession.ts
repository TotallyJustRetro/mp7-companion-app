import type { PlayerState } from '../domain/protocol';

export const DEMO_SESSION_ID = 'harbor-demo-7F3A';

// Optional local-only Mario Party 7 handoff artwork. The folder is Git-ignored.
const localMp7Asset = (fileName: string) => `${import.meta.env.BASE_URL}assets/mp7-local/${fileName}`;

export const CHARACTER_PORTRAITS: Record<string, string> = {
  mario: localMp7Asset('Mario_Face_7.png'),
  luigi: localMp7Asset('Luigi_Face_7.png'),
  peach: localMp7Asset('Peach_Face_7.png'),
  yoshi: localMp7Asset('Yoshi_Face_7.png'),
  wario: localMp7Asset('Wario_Face_7.png'),
  waluigi: localMp7Asset('Waluigi_Face_7.png'),
  daisy: localMp7Asset('Daisy_Face_7.png'),
  toad: localMp7Asset('Toad_Face_7.png'),
};

export const PLAYER_SLOT_MARKERS: Record<string, string> = {
  P1: localMp7Asset('MP7_Character_Selection_P1_Text.png'),
  P2: localMp7Asset('MP7_Character_Selection_P2_Text.png'),
  P3: localMp7Asset('MP7_Character_Selection_P3_Text.png'),
  P4: localMp7Asset('MP7_Character_Selection_P4_Text.png'),
};

export const MP7_GAME_LOGO = localMp7Asset('MP7_In-game_logo.png');
export const MIC_CONTROL_ROOM_SPRITE = localMp7Asset('Mic_Control_Room_sprite.png');

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
