const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  });
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(
      process.env.DASHBOARD_URL || 'file:///' + process.cwd().replace(/\\/g, '/') + '/index.html',
    );
    const act = (name, scope = p) => scope.locator(`[data-action=${name}]`).first();
    const block = (i) => p.locator(`[data-block="${i}"]`);
    const question = (bi, qi) => block(bi).locator(`[data-question="${qi}"]`);
    const confirm = async () => {
      await p.locator('#modal-form [type=submit]').click();
      await p.locator('#modal').waitFor({ state: 'hidden' });
    };
    const save = async () => {
      await act('save-journey').click();
      await confirm();
    };
    await act('fill-demo').click();
    await p.locator('#login-form [type=submit]').click();
    await p.locator('.metric-value').first().waitFor();
    await p.locator('[data-nav=journeys]').click();
    await p.locator('[data-action=edit-journey][data-id=j1]').click();
    await act('add-line', block(0)).click();
    await block(0).locator('[data-line="1"] [data-line-edit=text]').fill('บทพูดที่สอง');
    await block(0).locator('[data-line="1"] [data-line-edit=speaker]').fill('ผู้ช่วย');
    await block(0).locator('[data-line="1"] .nested-grip').press('ArrowUp');
    assert.equal(
      await block(0).locator('[data-line="0"] [data-line-edit=text]').innerText(),
      'บทพูดที่สอง',
    );
    await block(1).locator('[data-block-edit=mode]').selectOption('graded');
    await question(1, 0).locator('[data-choice-answer="0"]').check();
    await act('add-question', block(1)).click();
    await question(1, 1).locator('[data-question-edit=title]').fill('คำถามเพิ่มเติม');
    await question(1, 1).locator('[data-choice="0"]').fill('คำตอบ ก');
    await question(1, 1).locator('[data-choice="1"]').fill('คำตอบ ข');
    await question(1, 1).locator('[data-choice-answer="1"]').check();
    await question(1, 1).locator('.nested-grip').press('ArrowUp');
    assert.ok(await question(1, 0).locator('[data-choice-answer="1"]').isChecked());
    await act('add-dialog').click();
    await block(2).locator('[data-block-edit=title]').fill('บทสรุป');
    await block(2).locator('[data-line-edit=text]').fill('บทสนทนาหลังแบบทดสอบ');
    await act('add-quiz').click();
    await block(3).locator('[data-block-edit=title]').fill('แบบทดสอบที่สอง');
    await block(3).locator('[data-block-edit=description]').fill('คำอธิบายตัวอย่าง');
    await block(3).locator('[data-block-edit=mode]').selectOption('graded');
    await block(3).locator('[data-block-edit=showCorrect]').check();
    await question(3, 0).locator('[data-question-edit=title]').fill('คำถามสุดท้าย');
    await question(3, 0).locator('[data-choice="0"]').fill('ใช่');
    await question(3, 0).locator('[data-choice="1"]').fill('ไม่ใช่');
    await question(3, 0).locator('[data-choice-answer="0"]').check();
    await p.setViewportSize({ width: 1440, height: 6000 });
    await block(3).locator('.card-grip').dragTo(block(2).locator('h2'));
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p
      .locator('details')
      .filter({ has: p.locator('[data-step-edit=passMark]') })
      .evaluate((el) => (el.open = true));
    await p.locator('[data-step-edit=passMark]').fill('2');
    await save();
    await act('exit-editor').click();
    await p.locator('[data-action=edit-journey][data-id=j1]').click();
    assert.equal(await p.locator('[data-block]').count(), 4);
    assert.equal(await block(0).locator('[data-line]').count(), 2);
    assert.equal(
      await block(0).locator('[data-line="0"] [data-line-edit=speaker]').inputValue(),
      'ผู้ช่วย',
    );
    assert.equal(
      await question(1, 0).locator('[data-question-edit=title]').inputValue(),
      'คำถามเพิ่มเติม',
    );
    assert.equal(await block(2).locator('[data-block-edit=title]').inputValue(), 'แบบทดสอบที่สอง');
    assert.ok(await block(2).locator('[data-block-edit=showCorrect]').isChecked());
    assert.equal(await p.locator('[data-step-edit=passMark]').inputValue(), '2');
    // Reject an impossible pass mark without losing the editor's draft.
    await p
      .locator('details')
      .filter({ has: p.locator('[data-step-edit=passMark]') })
      .evaluate((el) => (el.open = true));
    await p.locator('[data-step-edit=passMark]').fill('4');
    await act('save-journey').click();
    await p.locator('#modal-form [type=submit]').click();
    await p.locator('#modal-error').waitFor({ state: 'visible' });
    await p.keyboard.press('Escape');
    await p
      .locator('details')
      .filter({ has: p.locator('[data-step-edit=passMark]') })
      .evaluate((el) => (el.open = true));
    await p.locator('[data-step-edit=passMark]').fill('2');
    await act('remove-line', block(0).locator('[data-line="0"]')).click();
    await p.keyboard.press('Escape');
    assert.equal(await block(0).locator('[data-line]').count(), 2);
    await act('remove-line', block(0).locator('[data-line="1"]')).click();
    await confirm();
    await act('remove-question', question(1, 1)).click();
    await confirm();
    await act('remove-block', block(3)).click();
    await confirm();
    await save();
    for (const width of [1440, 768, 390, 320]) {
      await p.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        if ((await p.locator('html').getAttribute('data-theme')) !== theme)
          await act('theme').click();
        assert.ok(
          await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `nested overflow ${width}:${theme}`,
        );
        if (process.env.QA_OUTPUT && [1440, 390].includes(width)) {
          await block(1).scrollIntoViewIfNeeded();
          await p.waitForTimeout(250);
          await p.screenshot({ path: `${process.env.QA_OUTPUT}/content-${width}-${theme}.png` });
        }
      }
    }
    await p.setViewportSize({ width: 1440, height: 1000 });
    await act('add-step').click();
    await p.locator('[data-step-edit=name]').fill('ขั้นเพิ่มเติม');
    await p.locator('[data-step-edit=npc]').fill('extra_npc');
    await p.locator('[data-line-edit=text]').fill('บทพูดของขั้นเพิ่มเติม');
    await p.locator('.step-pills button').last().dragTo(p.locator('.step-pills button').nth(2));
    assert.equal(await p.locator('[data-step-edit=name]').inputValue(), 'ขั้นเพิ่มเติม');
    await save();
    await act('exit-editor').click();
    await p.locator('[data-action=edit-journey][data-id=j1]').click();
    await p.locator('[data-action=select-step][data-index="2"]').click();
    assert.equal(await p.locator('[data-step-edit=npc]').inputValue(), 'extra_npc');
    const pills = p.locator('.step-pills button');
    await pills.nth(2).dragTo(pills.first());
    assert.equal(await pills.first().getAttribute('aria-pressed'), 'true');
    assert.equal(await p.locator('[data-step-edit=npc]').inputValue(), 'extra_npc');
    const speech = block(0).locator('.rich-dialog').first();
    await speech.fill('ทดสอบรูปแบบ');
    await speech.press('Control+a');
    await block(0).locator('[data-format=bold]').first().click();
    assert.equal(await speech.locator('b, strong').innerText(), 'ทดสอบรูปแบบ');
    await act('duplicate-block', block(0)).click();
    assert.equal(
      await block(1).locator('.rich-dialog b, .rich-dialog strong').innerText(),
      'ทดสอบรูปแบบ',
    );
    await block(1).locator('[data-block-edit=title]').fill('สำเนาบทสนทนา');
    await block(1).locator('.card-grip').dragTo(block(0).locator('h2'));
    assert.equal(await block(0).locator('[data-block-edit=title]').inputValue(), 'สำเนาบทสนทนา');
    await act('add-quiz').click();
    await block(2).locator('.card-grip').dragTo(block(1).locator('h2'));
    assert.equal(await block(1).getAttribute('data-kind'), 'quiz');
    await act('duplicate-block', block(1)).click();
    assert.equal(await block(2).getAttribute('data-kind'), 'quiz');
    for (const index of [2, 1]) {
      await act('remove-block', block(index)).click();
      await confirm();
    }
    await save();
    await act('exit-editor').click();
    await p.locator('[data-action=edit-journey][data-id=j1]').click();
    assert.equal(
      await block(0).locator('.rich-dialog b, .rich-dialog strong').innerText(),
      'ทดสอบรูปแบบ',
    );
    assert.deepEqual(errors, []);
    const result = {
      passed: true,
      errors,
      coverage:
        'Add line/choice/question/Dialog/Quiz/step; reordering; delete/cancel; answer ownership; pass mark validation; save/reopen; 4 sizes/2 themes',
    };
    if (process.env.QA_OUTPUT)
      fs.writeFileSync(`${process.env.QA_OUTPUT}/content-qa.json`, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
