export interface AudioData {
  taskId: string;
  userId: string;
  timestamp: string;
  type: 'audio_data' | 'tracking_start' | 'tracking_stop';
  data?: number[];
}

export interface AudioProcessingError {
  code: string;
  message: string;
  details?: any;
}

export interface AudioProcessingResult {
  success: boolean;
  data?: AudioData;
  error?: AudioProcessingError;
}