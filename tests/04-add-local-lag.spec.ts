import { test } from '@playwright/test';
import { expectYamlEquals } from './utils';
import { addTwoNodesAndConnect, createLocalLagBetween } from './lag-utils';

test('Add a local LAG from bundled links', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addTwoNodesAndConnect(page);
  await createLocalLagBetween(page, 'leaf1', 'leaf2');

  await expectYamlEquals(page, '04-add-local-lag.yaml');
});
