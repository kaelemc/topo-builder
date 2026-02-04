import { test, expect } from '@playwright/test';
import {
  NODE1_POS,
  NODE2_POS,
  addContextMenuItem,
  clickEdgeBetween,
  connectNodes,
  copySelected,
  openEdgeContextMenu,
  pasteSelected,
} from './lag-utils';
import { getYamlContent, loadExpectedYaml } from './utils';

test('Copy/paste links', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addContextMenuItem(page, NODE1_POS, 'Add Node');
  await addContextMenuItem(page, NODE2_POS, 'Add Node');

  await connectNodes(page, 'leaf1', 'leaf2');
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 1);

  await clickEdgeBetween(page, 'leaf1', 'leaf2');
  await openEdgeContextMenu(page, 'leaf1', 'leaf2');
  await copySelected(page);
  await openEdgeContextMenu(page, 'leaf1', 'leaf2');
  await pasteSelected(page);

  await page.getByRole('tab', { name: 'YAML' }).click();
  const yaml = await getYamlContent(page);

  expect(yaml).toBe(loadExpectedYaml('09-copy-paste-links.yaml'));
});
