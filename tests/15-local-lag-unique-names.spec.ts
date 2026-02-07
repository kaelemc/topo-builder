import { test } from '@playwright/test';
import { addTwoNodesAndConnect, createLocalLagBetween } from './lag-utils';
import { expectYamlEquals } from './utils';

test('Multiple LAGs between same nodes get unique names', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow__pane');

  await addTwoNodesAndConnect(page);
  await createLocalLagBetween(page, 'leaf1', 'leaf2');

  // Create second edge (different handles) + LAG via store to avoid testid collisions
  await page.evaluate(async () => {
    // @ts-expect-error - Vite serves source files at this path in dev mode
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();

    const leaf1 = state.nodes.find((n: { data: { name: string } }) => n.data.name === 'leaf1');
    const leaf2 = state.nodes.find((n: { data: { name: string } }) => n.data.name === 'leaf2');
    if (!leaf1 || !leaf2) throw new Error('Could not find leaf nodes');

    // Add second edge at different handles
    state.addEdge({
      source: leaf1.id,
      target: leaf2.id,
      sourceHandle: 'bottom',
      targetHandle: 'top-target',
    });

    // Find the new non-LAG edge between the pair
    const updatedState = mod.useTopologyStore.getState();
    const edge2 = updatedState.edges.find(
      (e: { data?: { edgeType?: string; sourceNode?: string; targetNode?: string } }) =>
        e.data?.edgeType !== 'lag' &&
        ((e.data?.sourceNode === 'leaf1' && e.data?.targetNode === 'leaf2') ||
          (e.data?.sourceNode === 'leaf2' && e.data?.targetNode === 'leaf1')),
    );
    if (!edge2?.data?.memberLinks?.[0]) throw new Error('Could not find second edge');

    // Add a second member link
    const firstLink = edge2.data.memberLinks[0];
    state.addMemberLink(edge2.id, {
      name: `${edge2.data.targetNode}-${edge2.data.sourceNode}-extra`,
      template: firstLink.template,
      sourceInterface: 'ethernet-1-99',
      targetInterface: 'ethernet-1-99',
    });

    // Create LAG from both member links on edge 2
    state.createLagFromMemberLinks(edge2.id, [0, 1]);
  });

  await expectYamlEquals(page, '15-local-lag-unique-names.yaml');
});
