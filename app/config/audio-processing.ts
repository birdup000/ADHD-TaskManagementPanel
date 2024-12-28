export const AUDIO_PROCESSING_CONFIG = {
  websocket: {
    url: process.env.NEXT_PUBLIC_MULTIMODAL_API_ENDPOINT || 'ws://localhost:3001',
    reconnectInterval: 5000,
    maxRetries: 3,
  },
  audio: {
    sampleRate: 44100,
    channels: 1,
    bufferSize: 1024,
  }
};