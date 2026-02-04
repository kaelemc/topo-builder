import { test, expect } from '@playwright/test';
import { EMPTY_POS, NODE1_POS, addContextMenuItem, nodeByLabel } from './lag-utils';
import { getYamlContent, loadExpectedYaml } from './utils';

test('Copy/paste nodes', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addContextMenuItem(page, NODE1_POS, 'Add Node');
  await nodeByLabel(page, 'leaf1').click();

  await page.mouse.move(EMPTY_POS.x, EMPTY_POS.y);
  await page.keyboard.press('ControlOrMeta+c');
  await page.keyboard.press('ControlOrMeta+v');

  await page.getByRole('tab', { name: 'YAML' }).click();
  const yaml = await getYamlContent(page);

  expect(yaml).toBe(loadExpectedYaml('08-copy-paste-nodes.yaml'));
});
