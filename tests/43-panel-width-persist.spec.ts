import { test, expect } from '@playwright/test';
import { canvasPane } from './utils';

test('Side panel width persists across reload', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  // Ensure the side panel is open (drawer paper visible)
  const paper = page.locator('.MuiDrawer-paper');
  await paper.waitFor();

  const box = (await paper.boundingBox())!;
  expect(box).toBeTruthy();

  // Drag the left edge of the drawer ~100px to the left to widen the panel
  const startX = box.x + 1;
  const startY = box.y + box.height / 2;
  const dragDelta = 100;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - dragDelta, startY, { steps: 5 });
  await page.mouse.up();

  // Measure the new width
  const widened = (await paper.boundingBox())!;
  expect(widened.width).toBeGreaterThan(box.width + 50);

  // Reload and verify the width was restored from localStorage
  await page.reload();
  await canvasPane(page).waitFor();
  await paper.waitFor();

  const restored = (await paper.boundingBox())!;
  expect(restored.width).toBeCloseTo(widened.width, -1);
});
