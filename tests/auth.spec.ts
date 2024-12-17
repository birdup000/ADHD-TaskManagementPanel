import { test, expect, type Page } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow using without authentication', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Check if login form is visible
    const loginForm = await page.getByRole('heading', { name: 'Sign In' });
    await expect(loginForm).toBeVisible();

    // Click "Use without authentication" checkbox
    await page.getByLabel('Use without authentication').check();
    
    // Click Continue button
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify we're on the main page
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });

  test('should handle AGiXT login', async ({ page }: { page: Page }) => {
    await page.goto('/');
    
    // Check if login form is visible
    const loginForm = await page.getByRole('heading', { name: 'Sign In' });
    await expect(loginForm).toBeVisible();

    // Fill in login credentials
    await page.getByLabel('Username').fill('test_user');
    await page.getByLabel('Password').fill('test_password');
    
    // Click Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for error message (since we're using test credentials)
    const errorMessage = await page.getByText('Login failed');
    await expect(errorMessage).toBeVisible();
  });
});
