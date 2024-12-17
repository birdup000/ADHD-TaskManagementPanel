import { test, expect, type Page } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    // Use without authentication for testing
    await page.getByLabel('Use without authentication').check();
    await page.getByRole('button', { name: 'Continue' }).click();
    // Wait for the main page to load
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
  });

  test('should create a new task', async ({ page }: { page: Page }) => {
    // Click the Add Task button
    await page.getByRole('button', { name: 'Add Task' }).click();
    
    // Fill in task details
    await page.getByLabel('Task Title').fill('Test Task');
    await page.getByLabel('Description').fill('Test Description');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify task was created
    const taskTitle = await page.getByText('Test Task');
    await expect(taskTitle).toBeVisible();
  });

  test('should mark task as complete', async ({ page }: { page: Page }) => {
    // Create a task first
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Complete This Task');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Find and click the complete checkbox
    await page.getByRole('checkbox', { name: 'Mark task as complete' }).click();
    
    // Verify task is marked as complete
    const completedTask = await page.getByText('Complete This Task');
    await expect(completedTask).toHaveCSS('text-decoration', /line-through/);
  });

  test('should delete a task', async ({ page }: { page: Page }) => {
    // Create a task first
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Delete This Task');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Click delete button
    await page.getByRole('button', { name: 'Delete task' }).click();
    
    // Verify task is deleted
    const deletedTask = await page.getByText('Delete This Task');
    await expect(deletedTask).not.toBeVisible();
  });

  test('should edit a task', async ({ page }: { page: Page }) => {
    // Create a task first
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Edit This Task');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Click edit button
    await page.getByRole('button', { name: 'Edit task' }).click();
    
    // Edit task details
    await page.getByLabel('Task Title').fill('Edited Task');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify task was edited
    const editedTask = await page.getByText('Edited Task');
    await expect(editedTask).toBeVisible();
    const originalTask = await page.getByText('Edit This Task');
    await expect(originalTask).not.toBeVisible();
  });
});
