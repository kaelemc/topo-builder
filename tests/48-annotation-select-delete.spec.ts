import { test, expect } from '@playwright/test';

import { canvasPane, expectYamlEquals } from './utils';

test('Select all annotations and Delete removes them', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    state.addAnnotation({ type: 'text', position: { x: 100, y: 100 }, text: 'Test', fontSize: 14, fontColor: '#7d33f2' });
    state.addAnnotation({ type: 'shape', position: { x: 300, y: 300 }, shapeType: 'rectangle', width: 200, height: 100, strokeColor: '#7d33f2', strokeWidth: 2, strokeStyle: 'solid' });
  });

  const countBefore = await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    return mod.useTopologyStore.getState().annotations.length;
  });
  expect(countBefore).toBe(2);

  await canvasPane(page).click({ position: { x: 1, y: 1 } });

  await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    const ids = new Set((state.annotations as Array<{ id: string }>).map(a => a.id));
    state.selectAnnotations(ids);
  });

  await page.keyboard.press('Delete');

  const countAfter = await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    return mod.useTopologyStore.getState().annotations.length;
  });
  expect(countAfter).toBe(0);

  await expectYamlEquals(page, '21-clear-all.yaml');
});
