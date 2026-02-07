import { test } from '@playwright/test';
import { canvasPane, expectYamlEquals } from './utils';
import { NODE1_POS, SIM_POS, addContextMenuItem, connectNodes, nodeByLabel } from './lag-utils';

test('Local LAG between node and SimNode', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addContextMenuItem(page, NODE1_POS, 'Add Node');
  await nodeByLabel(page, 'leaf1').waitFor();

  await addContextMenuItem(page, SIM_POS, 'Add SimNode');
  await nodeByLabel(page, 'testman1').waitFor();

  await connectNodes(page, 'leaf1', 'testman1');
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 1);

  // Add second member link and create LAG via store
  // (copy/paste on SimNode edges copies the node, not the link)
  await page.evaluate(async () => {
    // @ts-expect-error - Vite serves source files at this path in dev mode
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();

    const edge = state.edges.find(
      (e: { data?: { sourceNode?: string; targetNode?: string } }) =>
        (e.data?.sourceNode === 'leaf1' && e.data?.targetNode === 'testman1') ||
        (e.data?.sourceNode === 'testman1' && e.data?.targetNode === 'leaf1'),
    );
    if (!edge?.data?.memberLinks?.[0]) throw new Error('Could not find edge');

    const firstLink = edge.data.memberLinks[0];
    state.addMemberLink(edge.id, {
      name: `${edge.data.sourceNode}-${edge.data.targetNode}-2`,
      template: firstLink.template,
      sourceInterface: 'ethernet-1-2',
      targetInterface: 'eth2',
    });

    state.createLagFromMemberLinks(edge.id, [0, 1]);
  });

  await expectYamlEquals(page, '27-lag-simnode-local.yaml');
});
