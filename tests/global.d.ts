import type { Page } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface TestFixtures {
      page: Page;
    }
  }
}

export {};
