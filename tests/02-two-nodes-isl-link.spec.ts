import { test, expect } from '@playwright/test';
import { canvasPane, getNodeCount, getEdgeCount, getYamlContent, loadExpectedYaml } from './utils';

const NODE1_POS = { x: 200, y: 300 };
const NODE2_POS = { x: 600, y: 300 };
const EMPTY_POS = { x: 50, y: 50 };

test('Add two nodes and connect them with a link', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await canvasPane(page).click({ button: 'right', position: NODE1_POS });
  await page.getByRole('menuitem', { name: 'Add Node' }).click();

  await page.getByTestId('topology-node-leaf1').waitFor();
  await canvasPane(page).click({ position: EMPTY_POS });

  await canvasPane(page).click({ button: 'right', position: NODE2_POS });
  await page.getByRole('menuitem', { name: 'Add Node' }).click();

  await page.getByTestId('topology-node-leaf2').waitFor();

  expect(await getNodeCount(page)).toBe(2);

  const firstNode = page.getByTestId('topology-node-leaf1');
  const secondNode = page.getByTestId('topology-node-leaf2');

  const firstBounds = await firstNode.boundingBox();
  const secondBounds = await secondNode.boundingBox();

  if (!firstBounds || !secondBounds) {
    throw new Error('Could not get node bounds');
  }

  const sourceX = firstBounds.x + firstBounds.width;
  const sourceY = firstBounds.y + firstBounds.height / 2;
  const targetX = secondBounds.x;
  const targetY = secondBounds.y + secondBounds.height / 2;

  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();

  expect(await getEdgeCount(page)).toBe(1);

  await page.getByRole('tab', { name: 'YAML' }).click();
  const yaml = await getYamlContent(page);

  expect(yaml).toBe(loadExpectedYaml('02-two-nodes-isl-link.yaml'));
});

test('Change link endpoint', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await canvasPane(page).click({ button: 'right', position: NODE1_POS });
  await page.getByRole('menuitem', { name: 'Add Node' }).click();

  await page.getByTestId('topology-node-leaf1').waitFor();
  await canvasPane(page).click({ position: EMPTY_POS });

  await canvasPane(page).click({ button: 'right', position: NODE2_POS });
  await page.getByRole('menuitem', { name: 'Add Node' }).click();

  await page.getByTestId('topology-node-leaf2').waitFor();

  const firstNode = page.getByTestId('topology-node-leaf1');
  const secondNode = page.getByTestId('topology-node-leaf2');

  const firstBounds = await firstNode.boundingBox();
  const secondBounds = await secondNode.boundingBox();

  if (!firstBounds || !secondBounds) {
    throw new Error('Could not get node bounds');
  }

  const sourceX = firstBounds.x + firstBounds.width;
  const sourceY = firstBounds.y + firstBounds.height / 2;
  const targetX = secondBounds.x;
  const targetY = secondBounds.y + secondBounds.height / 2;

  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();

  expect(await getEdgeCount(page)).toBe(1);

  // Selection switches to the "Edit" tab automatically; update the (leaf1) endpoint explicitly.
  await page.getByTestId('link-endpoint-a-0').fill('ethernet-1-3');

  await page.getByRole('tab', { name: 'YAML' }).click();
  const yaml = await getYamlContent(page);

  expect(yaml).toBe(loadExpectedYaml('02-change-link-endpoint.yaml'));
});
