import type { Puter as PuterType } from '../types/puter';
export type Puter = PuterType;

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
            if (!window.puter?.auth) {
              throw new Error('Puter auth module not available');
            }
            const auth = window.puter.auth;
            return {
              signIn: async () => {
                try {
                  await auth.signIn();
                } catch (error) {
                  console.error('Failed to sign in:', error);
                  throw error;
                }
              },
              signOut: async () => {
                try {
                  await auth.signOut();
                } catch (error) {
                  console.error('Failed to sign out:', error);
                  throw error;
                }
              },
              isSignedIn: () => {
                try {
                  return auth.isSignedIn();
                } catch (error) {
                  console.error('Failed to check sign in status:', error);
                  return false;
                }
              },
              getUser: async () => {
                try {
                  const user = await auth.getUser();
                  if (!user) throw new Error('No user found');
                  return user;
                } catch (error) {
                  console.error('Failed to get user:', error);
                  throw error;
                }
              },
              authenticate: async () => {
                try {
                  if (!auth.isSignedIn()) {
                    await auth.signIn();
                  }
                } catch (error) {
                  console.error('Failed to authenticate:', error);
                  throw error;
                }
              }
            };
          })(),
          kv: (() => {
            if (!window.puter.kv) {
              throw new Error('Puter kv module not available');
            }
            const kv = window.puter.kv;
            return {
              set: (key: string, value: string | number | boolean) => kv.set(key, value),
              get: (key: string) => kv.get(key),
              incr: (key: string, amount?: number) => kv.incr(key, amount),
              decr: (key: string, amount?: number) => kv.decr(key, amount),
              del: (key: string) => kv.del(key),
              list: (pattern?: string, returnValues?: boolean) => kv.list(pattern, returnValues),
              flush: () => kv.flush(),
            };
          })()
        };
        puterInstance = instance;
        
        if (!puterInstance.auth) {
          console.warn('Using Puter.js without auth functionality');
        }
        if (!puterInstance.kv) {
          console.warn('Using Puter.js without kv functionality');
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