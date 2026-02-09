import { test } from '@playwright/test';

import { canvasPane, expectYamlEquals } from './utils';
import { NODE1_POS, SIM_POS, addContextMenuItem, connectNodes, nodeByLabel } from './lag-utils';

test('SimNode connected to node via edge', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addContextMenuItem(page, NODE1_POS, 'Add Node');
  await nodeByLabel(page, 'leaf1').waitFor();

  await addContextMenuItem(page, SIM_POS, 'Add SimNode');
  await nodeByLabel(page, 'testman1').waitFor();

  await connectNodes(page, 'leaf1', 'testman1');
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 1);

  await expectYamlEquals(page, '19-simnode-edge-connection.yaml');
});
