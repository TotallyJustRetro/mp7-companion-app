import type { CompanionMessage, CompanionTransport, ConnectionMode } from '../../domain/protocol';

export type TransportStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Reusable WebSocket transport for the future local bridge / online relay.
 * No endpoint is configured in the v0.1 demo, so the UI currently uses its
 * in-memory simulator instead of opening a network connection.
 */
export class WebSocketCompanionTransport implements CompanionTransport {
  private socket: WebSocket | null = null;

  constructor(
    readonly mode: ConnectionMode,
    private readonly onMessage: (message: unknown) => void,
    private readonly onStatus?: (status: TransportStatus) => void,
  ) {}

  connect(endpoint: string, pairingCode: string): Promise<void> {
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) {
      return Promise.reject(new Error('This companion transport is already connected or connecting.'));
    }

    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      return Promise.reject(new Error('Enter a valid WebSocket endpoint.'));
    }

    const isLocalDevelopmentHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol !== 'wss:' && !(url.protocol === 'ws:' && isLocalDevelopmentHost)) {
      return Promise.reject(new Error('Use WSS for remote sessions. Unencrypted WS is allowed only for local development.'));
    }
    if (!pairingCode.trim()) {
      return Promise.reject(new Error('A short-lived pairing code is required.'));
    }

    this.onStatus?.('connecting');
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url.toString());
      this.socket = socket;
      let settled = false;

      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'PAIR_REQUEST', pairingCode }));
        this.onStatus?.('connected');
        settled = true;
        resolve();
      }, { once: true });

      socket.addEventListener('message', (event) => {
        try {
          this.onMessage(JSON.parse(String(event.data)) as unknown);
        } catch {
          this.onStatus?.('error');
        }
      });

      socket.addEventListener('error', () => {
        this.onStatus?.('error');
        if (!settled) reject(new Error('Could not connect to the companion session endpoint.'));
      }, { once: true });

      socket.addEventListener('close', () => {
        this.onStatus?.('disconnected');
        if (!settled) reject(new Error('The companion session closed before pairing completed.'));
      }, { once: true });
    });
  }

  send(message: CompanionMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('The companion session is not connected.');
    }
    this.socket.send(JSON.stringify(message));
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState < WebSocket.CLOSING) {
      this.socket.close(1000, 'Player disconnected');
    }
    this.socket = null;
    this.onStatus?.('disconnected');
  }
}
