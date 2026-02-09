import { test } from '@playwright/test';

import { expectYamlEquals } from './utils';
import { addTwoNodesAndConnect, createLocalLagBetween, firstLagByLabels } from './lag-utils';

test('Add a link to an existing LAG', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addTwoNodesAndConnect(page);
  await createLocalLagBetween(page, 'leaf1', 'leaf2');

  await firstLagByLabels(page, 'leaf1', 'leaf2').click({ force: true });
  const endpointsHeader = page.getByText(/^Endpoints/).first();
  await endpointsHeader.locator('..').getByRole('button', { name: 'Add' }).click();

  await expectYamlEquals(page, '05-add-link-to-lag.yaml');
});
