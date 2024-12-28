import { useState, useEffect, useCallback } from 'react';

interface AudioContextState {
  audioContext: AudioContext | null;
  stream: MediaStream | null;
  source: MediaStreamAudioSourceNode | null;
  processor: ScriptProcessorNode | null;
}

export const useAudioContext = () => {
  const [state, setState] = useState<AudioContextState>({
    audioContext: null,
    stream: null,
    source: null,
    processor: null,
  });

  const cleanup = useCallback(() => {
    if (state.processor) {
      state.processor.disconnect();
    }
    if (state.source) {
      state.source.disconnect();
    }
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }
    if (state.audioContext) {
      state.audioContext.close();
    }
    setState({
      audioContext: null,
      stream: null,
      source: null,
      processor: null,
    });
  }, [state]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const initialize = useCallback(async () => {
    try {
      console.log('Initializing audio context...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      console.log('Got media stream');
      
      const audioContext = new AudioContext({
        sampleRate: 44100,
        latencyHint: 'interactive'
      });
      console.log('Created audio context');
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      
      setState({
        audioContext,
        stream,
        source,
        processor,
      });

      return { audioContext, stream, source, processor };
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    initialize,
    cleanup,
  };
};