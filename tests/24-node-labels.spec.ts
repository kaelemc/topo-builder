import { test } from '@playwright/test';

import { canvasPane, expectYamlEquals } from './utils';
import { NODE1_POS, addContextMenuItem } from './lag-utils';

test('Add labels to a node', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addContextMenuItem(page, NODE1_POS, 'Add Node');

  // Add labels via store
  await page.evaluate(async () => {
    // @ts-expect-error - Vite serves source files at this path in dev mode
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    const node = state.nodes.find((n: { data: { name: string } }) => n.data.name === 'leaf1');
    if (!node) throw new Error('Could not find leaf1');
    state.updateNode(node.id, {
      labels: {
        'eda.nokia.com/custom-label': 'test-value',
        'eda.nokia.com/env': 'staging',
      },
    });
  });

  await expectYamlEquals(page, '24-node-labels.yaml');
});
