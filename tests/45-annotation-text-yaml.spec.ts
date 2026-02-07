import { test } from '@playwright/test';

import { EMPTY_POS, addContextMenuItem } from './lag-utils';
import { canvasPane, expectYamlEquals } from './utils';

test('Add text annotation appears in YAML', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await addContextMenuItem(page, EMPTY_POS, 'Add Text');

  await expectYamlEquals(page, '45-annotation-text-yaml.yaml');
});
