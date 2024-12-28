interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

interface ImageCapture {
  constructor(videoTrack: MediaStreamTrack): ImageCapture;
  grabFrame(): Promise<ImageBitmap>;
}