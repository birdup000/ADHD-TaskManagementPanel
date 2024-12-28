import { useState, useEffect, useCallback } from 'react';
import { useAudioContext } from './useAudioContext';
import { Task } from '../types/task';
import { MultimodalLiveClient } from '../lib/multimodal-live-client';

interface UseTaskTrackingProps {
  task: Task;
  onUpdateTask: (task: Task) => void;
}

const client = new MultimodalLiveClient({
  url: process.env.NEXT_PUBLIC_MULTIMODAL_API_ENDPOINT || 'ws://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MULTIMODAL_API_KEY || '',
});

export const useTaskTracking = ({ task, onUpdateTask }: UseTaskTrackingProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextHook = useAudioContext();

  const checkPermissions = useCallback(async () => {
    try {
      const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const isGranted = permissions.state === 'granted';
      setHasPermission(isGranted);
      setError(null);
      
      if (!isGranted) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasPermission(true);
        } catch (mediaErr) {
          console.error('Failed to get microphone access:', mediaErr);
          setError('Microphone access denied');
          setHasPermission(false);
        }
      }
    } catch (err) {
      console.error('Failed to check permissions:', err);
      setError('Failed to check permissions');
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissions.state === 'granted') {
          setHasPermission(true);
          setError(null);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.error('Failed to check initial permissions:', err);
        setHasPermission(false);
        setError('Failed to check microphone permissions');
      }
    };
    checkInitialPermissions();
    
    // Cleanup WebSocket on unmount
    return () => {
      client.disconnect();
    };
  }, []);

  const startTracking = useCallback(async () => {
    console.log('Starting task tracking...');
    setError(null);
    setIsTracking(false);
    if (!hasPermission) {
      setError('Microphone permission is required for task tracking');
      return;
    }

    try {
      // Initialize audio context first
      console.log('Initializing audio context...');
      const { source, processor, audioContext } = await audioContextHook.initialize();
      
      // Then connect to WebSocket
      console.log('Connecting to WebSocket...');
      await client.connect();
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      await client.analyzeInput({
        taskId: task.id,
        userId: 'current-user',
        timestamp: new Date().toISOString(),
        type: 'tracking_start'
      });

      processor.onaudioprocess = async (e) => {
        if (!isTracking) return;
        
        try {
          // Get and downsample the audio data
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampledData = new Float32Array(Math.floor(inputData.length / 4));
          for (let i = 0; i < downsampledData.length; i++) {
            downsampledData[i] = inputData[i * 4];
          }
          
          // Prepare audio data for sending
          const audioData = {
            taskId: task.id,
            userId: 'current-user',
            timestamp: new Date().toISOString(),
            type: 'audio_data' as const,
            data: Array.from(downsampledData)
          };
          
          // Send to server
          const result = await client.analyzeInput(audioData);
          if (!result.success) {
            console.error('Failed to send audio data:', result.error);
          }
        } catch (err) {
          console.error('Failed to process audio:', err);
        }
      };
      
      setIsTracking(true);
      setError(null);
      console.log('Tracking started successfully');
    } catch (err) {
      console.error('Failed to start tracking:', err);
      setError('Failed to start tracking');
      setIsTracking(false);
      await audioContextHook.cleanup();
    }
  }, [hasPermission, task.id, audioContextHook]);

  const stopTracking = useCallback(async () => {
    try {
      await client.analyzeInput({
        taskId: task.id,
        userId: 'current-user',
        timestamp: new Date().toISOString(),
        type: 'tracking_stop'
      });
      await audioContextHook.cleanup();
      client.disconnect();
      setIsTracking(false);
      setError(null);
    } catch (err) {
      console.error('Failed to stop tracking:', err);
      setError('Failed to stop tracking');
      audioContextHook.cleanup();
    }
  }, [audioContextHook, task.id]);

  return {
    isTracking,
    hasPermission,
    error,
    startTracking,
    stopTracking,
    checkPermissions,
    setError
  };
};