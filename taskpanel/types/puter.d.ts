export interface PuterAI {
  chat: (prompt: string, options?: { model?: string; stream?: boolean }) => Promise<string>;
}

export interface PuterAuth {
  signIn: () => Promise<void> | undefined;
  signOut: () => Promise<void> | undefined;
  isSignedIn: () => boolean;
  getUser: () => Promise<{ id: string; username: string }> | undefined;
  authenticate: () => Promise<void> | undefined;
}

export interface Puter {
  ai: PuterAI;
  auth?: PuterAuth;
  kv?: PuterKV;
}

export interface PuterKV {
  set: (key: string, value: string | number | boolean) => Promise<boolean>;
  get: (key: string) => Promise<string | null>;
  incr: (key: string, amount?: number) => Promise<number>;
  decr: (key: string, amount?: number) => Promise<number>;
  del: (key: string) => Promise<boolean>;
  list: (pattern?: string, returnValues?: boolean) => Promise<string[] | { key: string, value: string }[]>;
  flush: () => Promise<boolean>;
}

declare global {
  interface Window {
    puter: Puter;
  }
}