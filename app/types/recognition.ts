export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceCommand {
  command: string;
  args?: {
    [key: string]: any;
  };
  confidence: number;
}

export interface ScreenCaptureData {
  timestamp: number;
  imageData: string;
  contextDescription?: string;
}