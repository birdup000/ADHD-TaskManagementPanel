import { Puter } from 'puter';

let puterInstance: Puter | null = null;

export const loadPuter = async (): Promise<Puter> => {
  if (puterInstance) return puterInstance;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter) {
        puterInstance = window.puter;
        resolve(puterInstance);
      } else {
        reject(new Error('Failed to load Puter.js'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Puter.js'));
    };
    document.head.appendChild(script);
  });
};

export const getPuter = (): Puter => {
  if (!puterInstance) {
    throw new Error('Puter.js not loaded. Call loadPuter() first.');
  }
  return puterInstance;
};

export const authenticateWithPuter = async (): Promise<boolean> => {
  const puter = getPuter();
  try {
    await puter.auth.authenticate();
    return true;
  } catch (error) {
    console.error('Puter authentication failed:', error);
    return false;
  }
};