import type { Puter } from '../types/puter';

let puterInstance: Puter | null = null;

export const loadPuter = async (): Promise<Puter> => {
  if (puterInstance) return puterInstance;

  return new Promise<Puter>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => {
      if (window.puter) {
        // Create Puter instance with available modules
        const instance: Puter = {
          ai: window.puter.ai,
          auth: (() => {
            if (!window.puter.auth) {
              throw new Error('Puter auth module not available');
            }
            const auth = window.puter.auth;
            return {
              signIn: () => auth.signIn(),
              signOut: () => auth.signOut(),
              isSignedIn: () => auth.isSignedIn(),
              getUser: () => auth.getUser(),
              authenticate: () => auth.signIn()
            };
          })()
        };
        puterInstance = instance;
        
        if (!puterInstance.auth) {
          console.warn('Using Puter.js without auth functionality');
        }
        
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
  if (!puter.auth) {
    throw new Error('Puter auth module not available. Please ensure you are using a version of Puter.js that includes authentication functionality.');
  }
  try {
    await puter.auth.signIn();
    return true;
  } catch (error) {
    console.error('Puter authentication failed:', error);
    return false;
  }
};