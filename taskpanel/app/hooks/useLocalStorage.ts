import { useState, useEffect } from 'react';

function useLocalStorage(key: string, initialValue: string | null): [string | null, (value: string | null) => void] {
  // Always initialize with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<string | null>(initialValue);

  // After hydration, sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== storedValue) {
          setStoredValue(item ? item : initialValue);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const setValue = (value: string | null) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value || '');
        window.dispatchEvent(new StorageEvent('storage', { key: key, newValue: value || '' }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? item : initialValue);
        } catch (error) {
          console.error(error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
