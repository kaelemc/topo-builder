import { test, expect } from '@playwright/test';

import { canvasPane, getNodeCount, getEdgeCount, expectYamlEquals } from './utils';
import { addTwoNodesAndConnect } from './lag-utils';

test('Add two nodes and connect them with a link', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);

  expect(await getNodeCount(page)).toBe(2);
  expect(await getEdgeCount(page)).toBe(1);

  await expectYamlEquals(page, '02-two-nodes-isl-link.yaml');
});
