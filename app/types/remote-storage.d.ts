declare module '@frigade/remote-storage' {
  export interface RemoteStorageOptions {
    apiKey: string;
    userId: string;
  }

  export class RemoteStorage {
    constructor(options: RemoteStorageOptions);
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  }
}
