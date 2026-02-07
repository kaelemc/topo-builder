import { test } from '@playwright/test';

import { EMPTY_POS } from './lag-utils';
import { canvasPane, expectYamlEquals } from './utils';

test('Add shape annotation appears in YAML', async ({ page }) => {
  await page.goto('/');
  await canvasPane(page).waitFor();

  await canvasPane(page).click({ button: 'right', position: EMPTY_POS });
  await page.getByText('Add Shape').hover();
  await page.getByRole('menuitem', { name: 'Rectangle' }).click();

  await expectYamlEquals(page, '46-annotation-shape-yaml.yaml');
});
