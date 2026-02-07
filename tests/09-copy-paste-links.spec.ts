import { test } from '@playwright/test';
import {
  addTwoNodesAndConnect,
  clickEdgeBetween,
  copySelected,
  openEdgeContextMenu,
  pasteSelected,
} from './lag-utils';
import { expectYamlEquals } from './utils';

test('Copy/paste links', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addTwoNodesAndConnect(page);

  await clickEdgeBetween(page, 'leaf1', 'leaf2');
  await openEdgeContextMenu(page, 'leaf1', 'leaf2');
  await copySelected(page);
  await openEdgeContextMenu(page, 'leaf1', 'leaf2');
  await pasteSelected(page);

  await expectYamlEquals(page, '09-copy-paste-links.yaml');
});
