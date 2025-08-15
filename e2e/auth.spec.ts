import { test, expect } from '@playwright/test'

test('@smoke homepage renders dashboard cards', async ({ page }) => {
  // Go to login page first
  await page.goto('http://localhost:3000/login')
  
  // Fill in login form
  await page.fill('input[name="email"]', 'owner@example.com')
  await page.fill('input[name="password"]', 'Password123!')
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL('http://localhost:3000/')
  
  // Check that dashboard page loads completely
  await expect(page.getByRole('heading', { name: 'dashboard' })).toBeVisible()
  
  // Check that navigation buttons are visible
  await expect(page.getByRole('link', { name: 'Customers' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible()
  
  // Check that at least one metric card is visible
  await expect(page.locator('.grid.gap-3').first()).toBeVisible()
  
  // Check that operational awareness sections are present
  await expect(page.getByRole('heading', { name: '⚠️ Due Soon (≤48h)' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '🚨 Overdue Orders' })).toBeVisible()
  await expect(page.getByText('Recent Activity')).toBeVisible()
})