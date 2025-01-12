import { useState, useEffect } from 'react';

export const useNotificationVolume = () => {
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('notificationVolume');
    return savedVolume ? Number(savedVolume) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem('notificationVolume', String(volume));
  }, [volume]);

  const setNotificationVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return { volume, setNotificationVolume };
};