import { test } from '@playwright/test';
import { canvasPane, expectYamlEquals } from './utils';
import { addTwoNodesAndConnect } from './lag-utils';

test('Rename node updates link references', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addTwoNodesAndConnect(page);

  await page.evaluate(async () => {
    // @ts-expect-error - Vite serves source files at this path in dev mode
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    const node = state.nodes.find((n: { data: { name: string } }) => n.data.name === 'leaf1');
    if (!node) throw new Error('Could not find leaf1');
    state.updateNode(node.id, { name: 'router1' });
  });

  await expectYamlEquals(page, '18-rename-node-updates-links.yaml');
});
