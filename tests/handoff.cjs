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
    const shot = async (name) => {
      await page.waitForTimeout(300);
      if (process.env.QA_OUTPUT)
        await page.screenshot({ path: `${process.env.QA_OUTPUT}/${name}.png`, fullPage: false });
    };
    for (const file of ['workflow.html', 'design-system.html']) {
      await page.goto(base + file);
      if (file === 'workflow.html') {
        assert.equal(await page.locator('#tabs button').count(), 6);
        for (let i = 0; i < 6; i++) {
          await page.locator('#tabs button').nth(i).click();
          assert.equal(
            await page
              .locator('#current th')
              .allTextContents()
              .then((v) => v.join('|')),
            '#|Admin|Frontend|Backend API|Database',
          );
          assert.equal(await page.locator('#tabs button[aria-pressed=true]').count(), 1);
        }
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('#all-print .wf-print:visible').count(), 6);
        assert.equal(await page.locator('#current:visible').count(), 0);
        await page.emulateMedia({ media: 'screen' });
      }
      for (const width of [1440, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${file} overflow at ${width}`,
        );
      }
      await shot(file.replace('.html', '-mobile'));
      await page.setViewportSize({ width: 1440, height: 1000 });
      if (file === 'design-system.html') {
        await page.locator('#theme-toggle').click();
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      }
      await shot(file.replace('.html', '-desktop'));
    }
    await page.goto(base + 'index.html');
    await shot('handoff-login');
    await page.locator('[data-action=fill-demo]').click();
    await page.locator('#login-form [type=submit]').click();
    await page.locator('.metric-value').first().waitFor();
    await shot('handoff-overview');
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(180);
    assert.ok(await page.locator('#sidebar').evaluate((el) => el.inert));
    await page.locator('[data-action=menu]').click();
    assert.ok(await page.locator('.workspace').evaluate((el) => el.inert));
    for (let i = 0; i < 16; i++) {
      await page.keyboard.press('Tab');
      assert.ok(
        await page.evaluate(() =>
          document.querySelector('#sidebar').contains(document.activeElement),
        ),
        'drawer traps Tab',
      );
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-action=menu]').getAttribute('aria-expanded'), 'false');
    assert.ok(
      await page.locator('[data-action=menu]').evaluate((el) => el === document.activeElement),
    );
    assert.equal(await page.locator('.workspace').evaluate((el) => el.inert), false);
    await shot('handoff-mobile');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-nav=journeys]').click();
    await page.locator('[data-action=edit-journey][data-id=j1]').click();
    await page.locator('[data-edit=title]').fill('Unsaved draft');
    await page.locator('[data-nav=journeys]').click();
    await page.locator('#modal').waitFor({ state: 'visible' });
    await page.locator('#modal [data-modal-close]').last().click();
    assert.equal(await page.locator('[data-edit=title]').inputValue(), 'Unsaved draft');
    await page.locator('[data-nav=overview]').click();
    await page.locator('#modal-form [type=submit]').click();
    await page.locator('.metric-value').first().waitFor();
    assert.equal(await page.locator('#modal').isVisible(), false);
    assert.deepEqual(errors, []);
    const result = {
      passed: true,
      errors,
      coverage:
        '6 workflows, print visibility, design-system theme, 1440/390/320 layouts, mobile keyboard drawer, unsaved draft navigation',
    };
    if (process.env.QA_OUTPUT)
      fs.writeFileSync(`${process.env.QA_OUTPUT}/handoff-qa.json`, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
