import { test } from '@playwright/test';

import { canvasPane, expectYamlEquals, loadExpectedYaml } from './utils';

test('Import YAML with annotations round-trips', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  const yamlInput = loadExpectedYaml('47-annotation-import.yaml');

  await page.evaluate(async (yamlStr: string) => {
    // @ts-expect-error Vite dev path
    const mod = await import('/src/lib/store/index.ts');
    const state = mod.useTopologyStore.getState();
    state.importFromYaml(yamlStr);
    state.triggerYamlRefresh();
  }, yamlInput);

  await page.getByRole('tab', { name: 'YAML' }).click();
  await page.waitForTimeout(500);

  await expectYamlEquals(page, '47-annotation-export.yaml');
});
