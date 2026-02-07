import { test } from '@playwright/test';
import { canvasPane, expectYamlEquals } from './utils';
import { addTwoNodesAndConnect, clickEdgeBetween } from './lag-utils';

test('Delete edge via context menu', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);

  // Select edge, right-click, delete
  await clickEdgeBetween(page, 'leaf1', 'leaf2');
  await clickEdgeBetween(page, 'leaf1', 'leaf2', { button: 'right' });
  await page.getByRole('menuitem', { name: 'Delete Link' }).click();

  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 0);

  await expectYamlEquals(page, '20-delete-edge.yaml');
});
