import { test, expect } from '@playwright/test';

import { EMPTY_POS } from './lag-utils';
import { canvasPane } from './utils';

test('Copy/paste annotations', async ({ page, browserName }) => {
  test.skip(!!process.env.CI, 'Keyboard clipboard events unreliable in headless CI');
  test.skip(browserName === 'webkit', 'WebKit clipboard paste unreliable');

  await page.goto('/');
  await canvasPane(page).waitFor();

  await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    state.addAnnotation({ type: 'text', position: { x: 200, y: 200 }, text: 'CopyMe', fontSize: 14, fontColor: '#7d33f2' });
  });

  await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    const ids = new Set((state.annotations as Array<{ id: string }>).map(a => a.id));
    state.selectAnnotations(ids);
  });

  await canvasPane(page).click();
  await page.mouse.move(EMPTY_POS.x, EMPTY_POS.y);
  await page.keyboard.press('ControlOrMeta+c');
  await page.keyboard.press('ControlOrMeta+v');

  await expect.poll(async () => {
    return page.evaluate(async () => {
      // @ts-expect-error Vite dev path
      const mod = await import('/src/lib/store/index.ts');
      return mod.useTopologyStore.getState().annotations.length;
    });
  }, { timeout: 5000 }).toBe(2);

  const annotations = await page.evaluate(async () => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    return mod.useTopologyStore.getState().annotations;
  });

  const ids = (annotations as Array<{ id: string }>).map(a => a.id);
  expect(new Set(ids).size).toBe(2);

  const texts = (annotations as Array<{ text?: string }>).map(a => a.text).filter(Boolean);
  expect(texts).toEqual(['CopyMe', 'CopyMe']);
});
