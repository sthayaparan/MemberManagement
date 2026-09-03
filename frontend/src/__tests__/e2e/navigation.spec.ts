import { test, expect } from '@playwright/test';

test.describe('Member Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to members page', async ({ page }) => {
    await page.click('text=View Members');
    await expect(page).toHaveURL('/members');
  });

  test('should navigate to add member page', async ({ page }) => {
    await page.click('text=Add Member');
    await expect(page).toHaveURL('/members/new');
  });
});
