import { test } from '@playwright/test';

import {
  NODE1_POS,
  NODE2_POS,
  NODE3_POS,
  SIM_POS,
  addContextMenuItem,
  connectNodes,
  openEdgeContextMenu,
  selectEdgesByNames,
} from './lag-utils';
import { expectYamlEquals } from './utils';

test('Add a link to an existing ESI LAG', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addContextMenuItem(page, SIM_POS, 'Add SimNode');
  await addContextMenuItem(page, NODE1_POS, 'Add Node');
  await addContextMenuItem(page, NODE2_POS, 'Add Node');

  await connectNodes(page, 'testman1', 'leaf1');
  await connectNodes(page, 'testman1', 'leaf2');
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 2);

  await selectEdgesByNames(page, [
    ['testman1', 'leaf1'],
    ['testman1', 'leaf2'],
  ]);
  await openEdgeContextMenu(page, 'testman1', 'leaf2');
  await page.getByRole('menuitem', { name: 'Create ESI-LAG' }).click();

  await addContextMenuItem(page, NODE3_POS, 'Add Node');
  await connectNodes(page, 'testman1', 'leaf3');
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 2);

  await selectEdgesByNames(page, [
    ['testman1', 'leaf1'],
    ['testman1', 'leaf3'],
  ]);
  await openEdgeContextMenu(page, 'testman1', 'leaf3');
  await page.getByRole('menuitem', { name: 'Merge into ESI-LAG' }).click();

  await expectYamlEquals(page, '07-add-link-to-esi-lag.yaml');
});
