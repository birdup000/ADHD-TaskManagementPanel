declare module 'puter' {
  export interface PuterAI {
    chat: (prompt: string, options?: { model?: string; stream?: boolean }) => Promise<string>;
  }

  export interface PuterAuth {
    authenticate: () => Promise<void>;
    isSignedIn: () => boolean;
  }

  export interface Puter {
    ai: PuterAI;
    auth: PuterAuth;
  }

  export default Puter;
}

declare global {
  interface Window {
    puter: import('puter').Puter;
  }
}