/** Shared game <-> companion protocol. The game remains authoritative for all gameplay state. */
export type ConnectionMode = 'local' | 'online';
export type PhoneStatus = 'connected' | 'not_connected' | 'disconnected' | 'reconnecting';
export type MinigameKind = 'draw' | 'trivia' | 'rhythm' | 'tilt' | 'microphone';

export interface PlayerInventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
}

export interface PlayerState {
  playerId: string;
  displayName: string;
  characterId: string;
  characterName: string;
  coins: number;
  stars: number;
  position: number;
  currentTurn: number;
  totalTurns: number;
  inventory: PlayerInventoryItem[];
  phoneStatus: PhoneStatus;
}

export interface MinigameDescriptor {
  id: string;
  title: string;
  kind: MinigameKind;
  description: string;
  supportsTraditionalController: boolean;
  supportedPhoneInputs: MinigameKind[];
}

export type CompanionMessage =
  | { type: 'PLAYER_STATE'; sessionId: string; player: PlayerState; sentAt: number }
  | { type: 'MINIGAME_START'; sessionId: string; playerId: string; minigame: MinigameDescriptor; sentAt: number }
  | { type: 'MINIGAME_INPUT'; sessionId: string; playerId: string; minigameId: string; input: Record<string, unknown>; sentAt: number }
  | { type: 'MINIGAME_END'; sessionId: string; playerId: string; minigameId: string; result?: string; sentAt: number }
  | { type: 'PLAYER_NOTIFICATION'; sessionId: string; playerId: string; title: string; message: string; sentAt: number }
  | { type: 'PHONE_STATUS'; sessionId: string; playerId: string; status: PhoneStatus; sentAt: number };

export interface CompanionTransport {
  readonly mode: ConnectionMode;
  connect(endpoint: string, pairingCode: string): Promise<void>;
  send(message: CompanionMessage): void;
  disconnect(): void;
}

export const MINIGAMES: MinigameDescriptor[] = [
  { id: 'canvas-crew', title: 'Canvas Crew', kind: 'draw', description: 'Draw the prompt on your touchscreen.', supportsTraditionalController: true, supportedPhoneInputs: ['draw'] },
  { id: 'quick-quiz', title: 'Quick Quiz', kind: 'trivia', description: 'Choose an answer privately on your phone.', supportsTraditionalController: true, supportedPhoneInputs: ['trivia'] },
  { id: 'star-beat', title: 'Star Beat', kind: 'rhythm', description: 'Tap along with the beat.', supportsTraditionalController: true, supportedPhoneInputs: ['rhythm'] },
  { id: 'tilt-the-ship', title: 'Tilt the Ship', kind: 'tilt', description: 'Steer by tilting your phone.', supportsTraditionalController: true, supportedPhoneInputs: ['tilt'] },
  { id: 'toad-caller', title: 'Toad Caller', kind: 'microphone', description: 'Use your microphone when you choose to enable it.', supportsTraditionalController: true, supportedPhoneInputs: ['microphone'] },
];

export function makeMessage(message: CompanionMessage): CompanionMessage {
  return { ...message, sentAt: Date.now() } as CompanionMessage;
}
