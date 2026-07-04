// WebSocket-based Real-time Sync Client

export interface SyncEvent {
  eventType: string;
  data: any;
  timestamp: number;
  source: 'admin' | 'customer';
}

export type SyncEventListener = (event: SyncEvent) => void;

export class SyncClient {
  private ws?: WebSocket;
  private url: string;
  private listeners = new Map<string, Set<SyncEventListener>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

  constructor(url?: string) {
    this.url = url || import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: any) {
    if (message.eventType) {
      const event: SyncEvent = {
        eventType: message.eventType,
        data: message.data,
        timestamp: message.timestamp || Date.now(),
        source: message.source || 'admin',
      };
      this.emit(message.eventType, event);
      this.emit('*', event); // Wildcard listener
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('disconnected', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  send(eventType: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    const message = {
      eventType,
      data,
      timestamp: Date.now(),
      source: 'customer',
    };

    this.ws.send(JSON.stringify(message));
  }

  on(eventType: string, listener: SyncEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  off(eventType: string, listener: SyncEventListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  private emit(eventType: string, event: any): void {
    this.listeners.get(eventType)?.forEach(listener => listener(event));
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const syncClient = new SyncClient();
