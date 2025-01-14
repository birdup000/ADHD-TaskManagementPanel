import type { Puter as PuterType } from '../types/puter';
export type Puter = PuterType;

let puterInstance: Puter | null = null;
let puterScript: HTMLScriptElement | null = null;

export const loadPuter = async (): Promise<Puter> => {
  if (puterInstance) return puterInstance;

  return new Promise<Puter>(async (resolve, reject) => {
    try {
      const response = await fetch('https://js.puter.com/v2/');
      const text = await response.text();
      eval(text);
      if (window.puter) {
        const auth = window.puter.auth;
        const kv = window.puter.kv;
        const instance: Puter = {
          ai: window.puter.ai,
          auth: {
            signIn: async () => {
              try {
                if(window.puter && window.puter.ui) await window.puter.ui.authenticateWithPuter();
              } catch (error) {
                console.error('Failed to sign in:', error);
                throw error;
              }
            },
            signInWithPopup: async () => {
              try {
                if(window.puter && window.puter.ui) await window.puter.ui.authenticateWithPuter();
              } catch (error) {
                console.error('Failed to sign in with popup:', error);
                throw error;
              }
            },
            signOut: async () => {
              try {
                if(auth) await auth.signOut();
              } catch (error) {
                console.error('Failed to sign out:', error);
                throw error;
              }
            },
            isSignedIn: () => {
              try {
                return auth ? auth.isSignedIn() : false;
              } catch (error) {
                console.error('Failed to check sign in status:', error);
                return false;
              }
            },
            getUser: async () => {
              try {
                const user = auth ? await auth.getUser() : null;
                if (!user) throw new Error('No user found');
                return user;
              } catch (error) {
                console.error('Failed to get user:', error);
                throw error;
              }
            },
            authenticate: async () => {
              try {
                if (window.puter && window.puter.ui && auth && !auth.isSignedIn()) {
                  await window.puter.ui.authenticateWithPuter();
                }
              } catch (error) {
                console.error('Failed to authenticate:', error);
                throw error;
              }
            },
            showAuth: async () => {
              try {
                if (window.puter && window.puter.ui) {
                  await window.puter.ui.authenticateWithPuter();
                }
              } catch (error) {
                console.error('Failed to show auth:', error);
                throw error;
              }
            }
          },
          ui: {
            authenticateWithPuter: async () => {
              if (window.puter && window.puter.ui) {
                return await window.puter.ui.authenticateWithPuter();
              } else {
                throw new Error('Puter UI module not available.');
              }
            }
          },
          kv:  window.puter.kv ? {
            set: (key: string, value: string | number | boolean) => window.puter.kv!.set(key, value),
            get: (key: string) => window.puter.kv!.get(key),
            incr: (key: string, amount?: number) => window.puter.kv!.incr(key, amount),
            decr: (key: string, amount?: number) => window.puter.kv!.decr(key, amount),
            del: (key: string) => window.puter.kv!.del(key),
            list: (pattern?: string, returnValues?: boolean) => window.puter.kv!.list(pattern, returnValues),
            flush: () => window.puter.kv!.flush(),
          } : undefined
        };
        puterInstance = instance;
        if (!puterInstance.auth) {
          console.warn('Using Puter.js without auth functionality');
        }
        if (!puterInstance.kv) {
          console.warn('Using Puter.js without kv functionality');
        }
        if (window.puter && window.puter.ui) {
          await window.puter.ui.authenticateWithPuter();
        }
        resolve(puterInstance);
      } else {
        reject(new Error('Failed to load Puter.js'));
      }
    } catch (error) {
      console.error('Failed to load Puter.js using fetch:', error);
      reject(new Error('Failed to load Puter.js'));
    }
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
  if (!puter.ui) {
    throw new Error('Puter UI module not available. Please ensure you are using a version of Puter.js that includes authentication functionality.');
  }
  try {
    
      return await puter.ui.authenticateWithPuter();
    
  } catch (error) {
    console.error('Puter authentication failed:', error);
    return false;
  }
};

export const testPuterKV = async () => {
  const puter = getPuter();
  if (!puter.kv) {
    throw new Error('Puter kv module not available. Please ensure you are using a version of Puter.js that includes key-value storage functionality.');
  }
  try {
    const setSuccess = await puter.kv.set('testKey', 'testValue');
    console.log('Set success:', setSuccess);
    const value = await puter.kv.get('testKey');
    console.log('Value:', value);
    const deleteSuccess = await puter.kv.del('testKey');
    console.log('Delete success:', deleteSuccess);
    const valueAfterDelete = await puter.kv.get('testKey');
    console.log('Value after delete:', valueAfterDelete);
  } catch (error) {
    console.error('Puter kv test failed:', error);
  }
};