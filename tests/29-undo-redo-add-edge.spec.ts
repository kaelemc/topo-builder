import { test, expect } from '@playwright/test';

import { canvasPane, getNodeCount, getEdgeCount } from './utils';
import { addTwoNodesAndConnect, undoViaContextMenu, redoViaContextMenu } from './lag-utils';

test('Undo/redo add edge', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);
  expect(await getEdgeCount(page)).toBe(1);

  // Undo the addEdge — nodes remain, edge disappears
  await undoViaContextMenu(page);
  await expect.poll(() => getEdgeCount(page)).toBe(0);
  expect(await getNodeCount(page)).toBe(2);

  // Redo brings the edge back
  await redoViaContextMenu(page);
  await expect.poll(() => getEdgeCount(page)).toBe(1);
});
