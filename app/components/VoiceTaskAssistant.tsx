import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types/task';
import { TranscriptionResult, VoiceCommand, ScreenCaptureData } from '../types/recognition';
import AudioPulse from './audio-pulse/AudioPulse';
import { MultimodalLiveClient } from '../lib/multimodal-live-client';
import { AGiXT as AGiXTSDK } from '../utils/agixt';

interface VoiceTaskAssistantProps {
  onTaskUpdate: (task: Task) => void;
  onNewTask: (task: Task) => void;
  geminiApiKey: string;
  selectedTask: Task | undefined;
  agixtConfig: {
    backendUrl: string;
    authToken: string;
  };
}

const VoiceTaskAssistant: React.FC<VoiceTaskAssistantProps> = ({
  onTaskUpdate,
  onNewTask,
  geminiApiKey,
  selectedTask,
  agixtConfig
}) => {
  const recognitionRef = useRef<any | null>(null);
  const agixtClientRef = useRef<AGiXTSDK | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const clientRef = useRef<MultimodalLiveClient | null>(null);

  useEffect(() => {
    // Initialize the multimodal client and AGiXT client
    if (geminiApiKey && agixtConfig.backendUrl && agixtConfig.authToken) {
      clientRef.current = new MultimodalLiveClient({
        url: 'https://generativelanguage.googleapis.com',
        apiKey: geminiApiKey
      });

      agixtClientRef.current = new AGiXTSDK({
        baseUri: agixtConfig.backendUrl,
        apiKey: agixtConfig.authToken
      });

      // Initialize Web Speech API recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          const transcriptionResult: TranscriptionResult = {
            text: result[0].transcript,
            confidence: result[0].confidence,
            isFinal: result.isFinal
          };
          
          setTranscription(transcriptionResult.text);
          if (result.isFinal) {
            processVoiceCommand(transcriptionResult);
          }
        };
      }
    }
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [geminiApiKey, agixtConfig]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsListening(true);
      
      // Initialize audio processing for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      source.connect(analyzer);
      
      // Update volume visualization
      const updateVolume = () => {
        if (isListening) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(average / 255);
          requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const processVoiceCommand = async (transcription: TranscriptionResult) => {
    try {
      if (!agixtClientRef.current) return;

      // Use AGiXT to process the voice command
      const response = await agixtClientRef.current.command({
        command: transcription.text,
        context: {
          currentTask: selectedTask,
          isScreenSharing,
          confidence: transcription.confidence
        }
      } as any);

      // Handle the AGiXT response
      if (response.action === 'CREATE_TASK') {
        onNewTask({
          id: Date.now().toString(),
          title: response.data.title,
          description: response.data.description || '',
          priority: response.data.priority || 'medium',
          status: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
          listId: 'default',
          progress: 0,
          owner: 'current-user',
          collaborators: [],
          activityLog: [],
          comments: [],
          version: 1,
        });
      } else if (response.action === 'UPDATE_TASK' && selectedTask) {
        onTaskUpdate({
          ...selectedTask,
          ...response.data,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    }
  };

  const stopVoiceRecording = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setMediaStream(stream);
      setIsScreenSharing(true);
      
      // Process screen capture
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(videoTrack);
      
      // Periodically capture and process screens
      const captureInterval = setInterval(async () => {
        if (!isScreenSharing) {
          clearInterval(captureInterval);
          return;
        }

        try {
          const bitmap = await imageCapture.grabFrame();
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext('2d');
          context?.drawImage(bitmap, 0, 0);
          
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          const screenData: ScreenCaptureData = {
            timestamp: Date.now(),
            imageData
          };

          // Send to AGiXT for processing if needed
          if (agixtClientRef.current && selectedTask) {
            const contextResponse = await agixtClientRef.current.analyzeScreen({
              image: imageData,
              taskContext: selectedTask
            } as any);

            if (contextResponse.needsUpdate) {
              onTaskUpdate({
                ...selectedTask,
                ...contextResponse.updates,
                updatedAt: new Date()
              });
            }
          }
        } catch (error) {
          console.error('Error processing screen capture:', error);
        }
      }, 5000); // Capture every 5 seconds
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopScreenSharing = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsScreenSharing(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4">
        <button
          onClick={isListening ? stopVoiceRecording : startVoiceRecording}
          className={`p-3 rounded-full ${
            isListening ? 'bg-red-600' : 'bg-blue-600'
          } hover:opacity-80 transition-opacity`}
        >
          {isListening ? '⏹️' : '🎤'}
        </button>
        
        <AudioPulse active={isListening} volume={volume} />
        
        <button
          onClick={isScreenSharing ? stopScreenSharing : startScreenSharing}
          className={`p-3 rounded-full ${
            isScreenSharing ? 'bg-red-600' : 'bg-green-600'
          } hover:opacity-80 transition-opacity`}
        >
          {isScreenSharing ? '⏹️' : '🖥️'}
        </button>
      </div>
      
      {transcription && (
        <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
          {transcription}
        </div>
      )}
    </div>
  );
};

export default VoiceTaskAssistant;