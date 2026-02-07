import { test, expect } from '@playwright/test';

import { canvasPane, getNodeCount, getEdgeCount } from './utils';
import { EMPTY_POS, addTwoNodesAndConnect, undoViaContextMenu, redoViaContextMenu } from './lag-utils';

test('Undo/redo clear all', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);
  expect(await getNodeCount(page)).toBe(2);
  expect(await getEdgeCount(page)).toBe(1);

  // Clear All
  await canvasPane(page).click({ button: 'right', position: EMPTY_POS });
  await page.getByRole('menuitem', { name: 'Clear All' }).click();
  expect(await getNodeCount(page)).toBe(0);
  expect(await getEdgeCount(page)).toBe(0);

  // Undo restores everything
  await undoViaContextMenu(page);
  expect(await getNodeCount(page)).toBe(2);
  await expect.poll(() => getEdgeCount(page)).toBe(1);

  // Redo clears again
  await redoViaContextMenu(page);
  expect(await getNodeCount(page)).toBe(0);
  expect(await getEdgeCount(page)).toBe(0);
});
