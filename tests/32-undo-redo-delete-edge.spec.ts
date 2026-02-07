import { test, expect } from '@playwright/test';

import { canvasPane, getEdgeCount } from './utils';
import { addTwoNodesAndConnect, openEdgeContextMenu, undoViaContextMenu, redoViaContextMenu } from './lag-utils';

test('Undo/redo delete edge', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);
  expect(await getEdgeCount(page)).toBe(1);

  // Delete edge
  await openEdgeContextMenu(page, 'leaf1', 'leaf2');
  await page.getByRole('menuitem', { name: 'Delete Link' }).click();
  await expect.poll(() => getEdgeCount(page)).toBe(0);

  // Undo restores edge
  await undoViaContextMenu(page);
  await expect.poll(() => getEdgeCount(page)).toBe(1);

  // Redo deletes again
  await redoViaContextMenu(page);
  await expect.poll(() => getEdgeCount(page)).toBe(0);
});
