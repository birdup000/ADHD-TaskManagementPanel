import React from 'react';

interface AudioPulseProps {
  active: boolean;
  volume: number;
}

const AudioPulse: React.FC<AudioPulseProps> = ({ active, volume }) => {
  if (!active) return null;

  const pulseSize = Math.max(20, Math.min(60, volume * 100));
  
  return (
    <div className="relative w-8 h-8">
      <div
        className="absolute inset-0 bg-blue-500 rounded-full opacity-50"
        style={{
          transform: `scale(${1 + volume})`,
          transition: 'transform 150ms ease-out'
        }}
      />
      <div className="absolute inset-0 bg-blue-400 rounded-full" />
    </div>
  );
};

export default AudioPulse;