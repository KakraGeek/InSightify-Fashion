import { test, expect } from '@playwright/test'

test('orders page shows table', async ({ page }) => {
  await page.goto('http://localhost:3000/(routes)/orders')
  await expect(page.getByText(/Recent Orders/i)).toBeVisible()
})