// Local storage service to replace Puter KV store
export interface StorageService {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<void>;
  del: (key: string) => Promise<void>;
}

class LocalStorageService implements StorageService {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async del(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

export const storageService = new LocalStorageService();