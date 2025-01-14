export interface PuterAI {
  chat: (prompt: string, options?: { 
    model?: string; 
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    stop?: string[];
    presence_penalty?: number;
    frequency_penalty?: number;
  }) => Promise<string>;
  
  // Enhanced capabilities
  analyze: (content: string, type: 'sentiment' | 'entities' | 'keywords' | 'summary') => Promise<any>;
  complete: (prompt: string, options?: { temperature?: number; max_tokens?: number }) => Promise<string>;
  embed: (text: string) => Promise<number[]>;
  moderate: (content: string) => Promise<{ flagged: boolean; categories: string[] }>;
  txt2speech: (text: string, language?: string, testMode?: boolean) => Promise<HTMLAudioElement>;
}

export interface PuterAuth {
  signIn: () => Promise<void>;
  signInWithPopup: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: () => boolean;
  getUser: () => Promise<{ id: string; username: string }>;
  authenticate: () => Promise<void>;
  showAuth: () => Promise<void>;
}

export interface Puter {
  ai: PuterAI;
  auth?: PuterAuth;
  kv?: PuterKV;
  ui?: PuterUI;
}

export interface PuterUI {
  authenticateWithPuter: () => Promise<boolean>;
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