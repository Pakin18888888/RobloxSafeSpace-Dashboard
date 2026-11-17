const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const base = new URL(
      '.',
      process.env.DASHBOARD_URL || 'file:///' + process.cwd().replace(/\\/g, '/') + '/index.html',
    ).href;
    const act = (name) => page.locator(`[data-action="${name}"]`).first();
    const modal = page.locator('#modal');
    const shot = async (name) => {
      await page.waitForTimeout(250);
      if (process.env.QA_OUTPUT)
        await page.screenshot({ path: `${process.env.QA_OUTPUT}/${name}.png`, fullPage: true });
    };
    await page.goto(base + 'index.html');
    await act('fill-demo').click();
    await page.locator('#login-form [type=submit]').click();
    await page.locator('.metric-value').first().waitFor();
    await page.locator('[data-nav=journeys]').click();
    await act('journey-progress').click();
    await modal.waitFor({ state: 'visible' });
    await page.locator('#modal-title').click();
    assert.ok(await modal.isVisible(), 'inside click does not dismiss');
    const rect = await modal.boundingBox();
    await page.mouse.move(rect.x + 50, rect.y + 20);
    await page.mouse.down();
    await page.mouse.move(5, 5);
    await page.mouse.up();
    assert.ok(await modal.isVisible(), 'drag starting inside does not dismiss');
    await page.mouse.click(5, 5);
    assert.equal(await modal.isVisible(), false, 'backdrop dismisses progress');
    assert.equal(
      await page.evaluate(() => document.activeElement.dataset.action),
      'journey-progress',
    );

    // A controlled pending submit checks dismissal without relying on timing.
    await page.evaluate(() =>
      SafeSpaceUI.modal({
        title: 'Pending submit test',
        body: 'Mock only',
        onSubmit: () =>
          new Promise((resolve) => {
            window.finishTestSubmit = resolve;
          }),
      }),
    );
    await page.locator('#modal-form [type=submit]').click();
    await page.mouse.click(5, 5);
    await page.keyboard.press('Escape');
    assert.ok(await modal.isVisible(), 'pending submit cannot be dismissed');
    await page.evaluate(() => {
      window.finishTestSubmit();
      delete window.finishTestSubmit;
    });
    await modal.waitFor({ state: 'hidden' });

    await page.locator('[data-action=edit-journey][data-id=j1]').click();
    await page.locator('[data-quiz-edit=mode]').selectOption('graded');
    while ((await page.locator('[data-choice]').count()) > 2) await act('remove-choice').click();
    await page.locator('[data-choice="0"]').fill('A');
    await page.locator('[data-choice="1"]').fill('B');
    await act('add-choice').click();
    await page.locator('[data-choice="2"]').fill('C');
    await page.locator('[data-choice-answer="2"]').check();
    await page.locator('[data-action=remove-choice][data-choice-index="0"]').click();
    assert.ok(
      await page.locator('[data-choice-answer="1"]').isChecked(),
      'correct answer follows removed earlier choice',
    );
    await page.locator('[data-action=select-step][data-index="1"]').click();
    await page.locator('[data-action=select-step][data-index="0"]').click();
    assert.equal(await page.locator('[data-choice="0"]').inputValue(), 'B');
    assert.ok(await page.locator('[data-choice-answer="1"]').isChecked());
    await act('add-choice').click();
    await page.locator('[data-choice="2"]').fill('Temporary choice');
    await page.locator('[data-choice-answer="2"]').check();
    await page.locator('[data-action=remove-choice][data-choice-index="2"]').click();
    assert.equal(
      await page.locator('[data-choice-answer]:checked').count(),
      0,
      'removing the correct choice requires an explicit new answer',
    );
    await page.locator('[data-choice-answer="1"]').check();
    await page.locator('[data-block="1"] [data-action=remove-block]').click();
    await modal.waitFor({ state: 'visible' });
    await page.mouse.click(5, 5);
    assert.ok(
      await page.locator('[data-block="1"][data-kind=quiz]').isVisible(),
      'cancel removal preserves quiz',
    );
    await act('save-journey').click();
    await page.locator('#modal-form [type=submit]').click();
    await modal.waitFor({ state: 'hidden' });
    await act('exit-editor').click();
    await page.locator('[data-action=edit-journey][data-id=j1]').click();
    assert.equal(await page.locator('[data-choice="0"]').inputValue(), 'B');
    assert.equal(await page.locator('[data-choice="1"]').inputValue(), 'C');
    assert.ok(await page.locator('[data-choice-answer="1"]').isChecked(), 'choice edits persisted');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').getAttribute('data-theme')) !== theme)
          await act('theme').click();
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `editor overflow ${width}:${theme}`,
        );
        if ([1440, 390].includes(width)) await shot(`editor-v03-${width}-${theme}`);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await act('qa').click();
    await page.locator('#modal [name=role]').selectOption('observer');
    await page.locator('#modal-form [type=submit]').click();
    await modal.waitFor({ state: 'hidden' });
    await page.locator('[data-nav=journeys]').click();
    await page.locator('[data-action=edit-journey][data-id=j1]').click();
    assert.equal(
      await page
        .locator(
          '.journey-form input:not(:disabled), .journey-form textarea:not(:disabled), .journey-form select:not(:disabled)',
        )
        .count(),
      0,
    );
    assert.equal(await page.locator('[data-action=save-journey]').count(), 0, 'read-only editor');

    await page.goto(base + 'flow-review.html');
    for (const id of ['userflow', 'workflow', 'screens', 'prototype', 'evidence', 'overview']) {
      await page.locator(`.nav [data-page="${id}"]`).click();
      assert.equal(
        await page.locator(`.nav [data-page="${id}"]`).getAttribute('aria-current'),
        'page',
      );
    }
    assert.deepEqual(errors, []);
    const result = {
      passed: true,
      errors,
      coverage:
        'backdrop/inside/drag/busy/focus; choices and correct-answer mapping; quiz removal cancellation; save/reopen; readonly; editor 4 sizes and 2 themes; external Flow review scripts',
    };
    if (process.env.QA_OUTPUT)
      fs.writeFileSync(`${process.env.QA_OUTPUT}/editor-qa.json`, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
