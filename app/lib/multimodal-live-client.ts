import { AudioData, AudioProcessingResult } from '../types/audio-processing';

interface MultimodalLiveClientConfig {
  url: string;
  apiKey: string;
}

export class MultimodalLiveClient {
  private config: MultimodalLiveClientConfig;
  private socket: WebSocket | null = null;
  private messageQueue: AudioData[] = [];
  private connected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 3;
  private connectionPromise: Promise<void> | null = null;

  constructor(config: MultimodalLiveClientConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      this.connected = true;
      return;
    }

    if (this.connectionPromise) {
      console.log('Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.connectionAttempts >= this.maxRetries) {
      throw new Error('Max connection retries exceeded');
    }
    
    this.connectionAttempts++;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket server at:', this.config.url);
        this.socket = new WebSocket(this.config.url);
        console.log('WebSocket instance created');
        
        this.socket.onopen = () => {
          console.log('Connected to multimodal server');
          this.connected = true;
          this.connectionPromise = null;
          this.connectionAttempts = 0;
          this.processQueue();
          console.log('WebSocket connection established');
          resolve();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          this.connectionPromise = null;
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('Disconnected from multimodal server');
          this.connected = false;
          this.connectionPromise = null;
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'error') {
              console.error('Server error:', data.error);
            } else if (data.type === 'gemini_response') {
              console.log('Received Gemini response:', data.content);
            } else if (data.type === 'connection_status') {
              console.log('Connection status:', data.status);
              this.connected = data.status === 'connected';
            }
          } catch (err) {
            console.error('Failed to parse server message:', err);
          }
        };
      } catch (err) {
        this.connectionPromise = null;
        console.error('Failed to create WebSocket:', err);
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  private async processQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.readyState === WebSocket.OPEN) {
        await this.sendMessage(message);
      }
    }
  }

  private async sendMessage(message: AudioData): Promise<void> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('Socket not ready, attempting reconnect...');
      await this.connect();
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Failed to establish connection');
    }

    return new Promise((resolve, reject) => {
      try {
        const data = JSON.stringify({
          ...message,
          api_key: this.config.apiKey,
          timestamp: new Date().toISOString()
        });
        this.socket.send(data);
        console.log('Message sent:', message.type);
        resolve();
      } catch (err) {
        console.error('Failed to send message:', err);
        reject(err);
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.connected = false;
      this.socket.close();
      this.socket = null;
    }
  }

  public async analyzeInput(input: AudioData): Promise<AudioProcessingResult> {
    try {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.messageQueue.push(input);
        await this.connect();
      }

      try {
        await this.sendMessage(input);
        console.log('Successfully sent input:', input.type);
      } catch (err) {
        console.error('Failed to send input:', err);
        throw err;
      }
      return {
        success: true,
        data: input
      };
    } catch (err) {
      console.error('Failed to send audio data:', err);
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        this.messageQueue.push(input);
      }
      return {
        success: false,
        error: {
          code: 'send_failed',
          message: 'Failed to send audio data',
          details: err
        }
      };
    }
  }
}