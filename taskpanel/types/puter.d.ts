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
}

declare global {
  interface Window {
    puter: Puter;
  }
}