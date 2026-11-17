const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
(async () => {
  const b = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  });
  const p = await b.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [],
    external = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('request', (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
  });
  const url =
    process.env.DASHBOARD_URL || 'file:///' + process.cwd().replace(/\\/g, '/') + '/index.html';
  const check = (v, m) => {
    if (!v) throw new Error(m);
  };
  const nav = async (id) => {
    await p.locator(`[data-nav="${id}"]`).click();
    await p.locator('.loading-sr').waitFor({ state: 'hidden' });
  };
  const act = (a, id) => p.locator(`[data-action="${a}"]${id ? `[data-id="${id}"]` : ''}`).first();
  const submit = async () => {
    await p.locator('#modal-form [type=submit]').click();
    await p.locator('#modal').waitFor({ state: 'hidden' });
  };
  const screenshot = async (name) => {
    if (process.env.QA_OUTPUT) {
      await p.screenshot({ path: process.env.QA_OUTPUT + '/' + name + '.png', fullPage: true });
    }
  };
  await p.goto(url);
  await act('fill-demo').click();
  await p.locator('#login-form [type=submit]').click();
  await p.locator('.metric-value').first().waitFor();
  check(
    (await p.locator('.metric-value').allTextContents()).join(',') === '12,6,36,2',
    'derived metrics',
  );
  await p.locator('#range').selectOption('3');
  check((await p.locator('.metric-value').nth(2).textContent()) === '15', 'date filter');
  await p.locator('#range').selectOption('7');
  await nav('alerts');
  await p.locator('#team-note').fill('QA team note <script>not executable</script>');
  await act('save-note').click();
  await submit();
  check(
    (await p.locator('#team-note').inputValue()) === 'QA team note <script>not executable</script>',
    'note persisted',
  );
  await p.locator('#reply-message').fill('ข้อความทดสอบเท่านั้น');
  await act('reply-alert').click();
  await submit();
  await p.getByText('บันทึกจำลอง · ไม่ได้ส่งเข้าเกม', { exact: true }).waitFor();
  await act('handle-alert').click();
  await submit();
  await screenshot('alerts');
  await nav('codes');
  const before = await p.locator('tbody tr').count();
  await act('create-code').click();
  await p.locator('#modal [name=code]').fill('QA-CODE');
  await p.locator('#modal [name=maxUses]').fill('20');
  await submit();
  check((await p.locator('tbody tr').count()) === before + 1, 'create code');
  await p.locator('#search').fill('QA-CODE');
  const codeId = await act('edit-code').getAttribute('data-id');
  await act('edit-code').click();
  await p.locator('#modal [name=maxUses]').fill('25');
  await submit();
  await act('manage-code', codeId).click();
  await act('code-disable').click();
  await submit();
  await p.locator('#filter').selectOption('disabled');
  check((await p.locator('tbody tr').count()) === 1, 'disable code');
  await act('manage-code', codeId).click();
  await act('code-regenerate').click();
  await submit();
  await p.locator('#search').fill('');
  await p.locator('#filter').selectOption('all');
  await act('manage-code', codeId).click();
  await act('code-delete').click();
  await p.locator('#modal [data-modal-close]').last().click();
  check((await p.locator('tbody tr').count()) === before + 1, 'delete cancellation');
  await act('manage-code', codeId).click();
  await act('code-delete').click();
  await submit();
  check((await p.locator('tbody tr').count()) === before, 'delete code');
  await nav('journeys');
  await screenshot('journeys');
  await act('edit-journey', 'j1').click();
  await p.locator('[data-edit=title]').fill('พื้นที่ของเรา · QA');
  await act('save-journey').click();
  await submit();
  await p.locator('[data-action=editor-tab][data-tab=dialog]').click();
  await p.locator('[data-line-edit=text]').fill('บทสนทนาจำลองสำหรับทดสอบ');
  await p.locator('[data-action=editor-tab][data-tab=quiz]').click();
  await p.locator('[data-quiz-edit=mode]').selectOption('graded');
  while ((await p.locator('[data-choice]').count()) < 3) await act('add-choice').click();
  await p.locator('[data-choice="0"]').fill('ตัวเลือก A');
  await p.locator('[data-choice="1"]').fill('ตัวเลือก B');
  await p.locator('[data-choice="2"]').fill('ตัวเลือก C');
  await p.locator('[data-choice-answer="2"]').check();
  await act('save-journey').click();
  await submit();
  await screenshot('editor');
  await act('add-step').click();
  await p.locator('[data-step-edit=name]').fill('ขั้นตอน QA');
  await p.locator('[data-step-edit=npc]').fill('qa_npc');
  await p.locator('[data-line-edit=text]').fill('ข้อความ QA');
  await act('save-journey').click();
  await submit();
  await act('remove-step').click();
  await submit();
  await act('save-journey').click();
  await submit();
  await act('exit-editor').click();
  await act('journey-progress', 'j1').click();
  const download = p.waitForEvent('download');
  await submit();
  check((await download).suggestedFilename() === 'mock-journey-j1.csv', 'export CSV');
  await act('new-journey').click();
  await p.locator('[data-edit=title]').fill('Journey QA');
  await p.locator('[data-edit=description]').fill('เนื้อหาจำลอง');
  await p.locator('[data-action=editor-tab][data-tab=dialog]').click();
  await p.locator('[data-step-edit=npc]').fill('qa_guide');
  await p.locator('[data-line-edit=text]').fill('ข้อความตัวอย่าง');
  await act('save-journey').click();
  await submit();
  await act('exit-editor').click();
  await p.locator('#search').fill('Journey QA');
  await act('delete-journey').click();
  await submit();
  check((await p.locator('.journey-card').count()) === 0, 'journey create/delete');
  await nav('players');
  await act('open-player', 'p_demo_001').click();
  await act('player-done').click();
  await submit();
  await act('player-step').click();
  await p.locator('#modal [name=step]').selectOption('1');
  await submit();
  await act('player-reset').click();
  await submit();
  await act('delete-attempt').click();
  await submit();
  await screenshot('player');
  await nav('config');
  await act('edit-config').click();
  await p.locator('#modal [name=value]').fill('45');
  await submit();
  check((await p.locator('.config-value').textContent()) === '45', 'config edit');
  await nav('users');
  await act('create-user').click();
  await p.locator('#modal [name=username]').fill('qa.staff');
  await p.locator('#modal [name=password]').fill('not-a-real-password');
  await submit();
  await p.locator('#search').fill('qa.staff');
  await act('manage-user').click();
  await act('user-reset').click();
  await p.locator('#modal [name=password]').fill('new-demo-password');
  await submit();
  await act('edit-user').click();
  await p.locator('#modal [name=role]').selectOption('support');
  await submit();
  await act('manage-user').click();
  await act('user-disable').click();
  await submit();
  await act('create-role').click();
  await p.locator('#modal [name=name]').fill('QA viewer');
  await p.locator('#modal [value="overview.read"]').check();
  await submit();
  await screenshot('users');
  await nav('logs');
  await p.locator('#filter').selectOption('audit');
  check((await p.locator('tbody').textContent()).includes('mock'), 'audit entries');
  check(
    !(await p.locator('tbody').textContent()).includes('not-a-real-password'),
    'no password in log',
  );
  await screenshot('logs');
  // States and permissions through the visible testing panel.
  const qa = async (behavior, role = 'admin') => {
    await act('qa').click();
    await p.locator('#modal [name=behavior]').selectOption(behavior);
    await p.locator('#modal [name=role]').selectOption(role);
    await submit();
    await p.locator('.loading-sr').waitFor({ state: 'hidden' });
  };
  await qa('empty');
  check((await p.locator('.metric-value').first().textContent()) === '0', 'empty');
  await qa('error');
  await p.getByRole('heading', { name: 'โหลดข้อมูลไม่สำเร็จ' }).waitFor();
  await qa('normal', 'observer');
  check((await p.locator('[data-nav=alerts]').count()) === 0, 'restricted navigation');
  check((await p.locator('.metric-value').nth(3).textContent()) === '—', 'care aggregate hidden');
  await p.evaluate(() => {
    history.pushState(null, '', '#/alerts');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await p.getByRole('heading', { name: 'สิทธิ์ไม่เพียงพอ' }).waitFor();
  await qa('normal');
  // Responsive and themes: viewport overflow is never allowed outside table scrollers.
  const overflow = [];
  for (const width of [1440, 768, 390, 320]) {
    await p.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      if ((await p.locator('html').getAttribute('data-theme')) !== theme)
        await act('theme').click();
      await p.waitForTimeout(180);
      for (const id of [
        'overview',
        'alerts',
        'journeys',
        'codes',
        'players',
        'config',
        'users',
        'logs',
      ]) {
        if (width <= 760) await act('menu').click();
        await nav(id);
        if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
          overflow.push(`${width}:${theme}:${id}`);
        if (width === 390 && theme === 'light' && id === 'overview') await screenshot('mobile');
      }
    }
  }
  await p.setViewportSize({ width: 1440, height: 1050 });
  await nav('overview');
  await screenshot('overview-dark');
  await act('theme').click();
  await p.waitForTimeout(180);
  await screenshot('overview-light');
  // Native dialog keyboard trap and Escape.
  await act('qa').click();
  await p.keyboard.press('Tab');
  check(
    await p.evaluate(() => document.querySelector('#modal').contains(document.activeElement)),
    'dialog keyboard focus',
  );
  await p.keyboard.press('Escape');
  check(!(await p.locator('#modal').isVisible()), 'Escape closes dialog');
  await act('qa').click();
  await act('expire').click();
  await p.locator('#login-form').waitFor();
  check((await p.locator('.metric-value').count()) === 0, 'expiry clears view');
  for (const scenario of ['invalid', 'network', 'temporary', 'forbidden', 'success']) {
    await p.locator('.auth-demo summary').click();
    await p.locator('[name=loginScenario]').selectOption(scenario);
    await act('fill-demo').click();
    await p.locator('#login-form [type=submit]').click();
    if (['invalid', 'network'].includes(scenario)) {
      await p.locator('#login-error').waitFor();
      await p.locator('.auth-demo summary').click();
      continue;
    }
    if (scenario === 'temporary') {
      await p.locator('#password-form').waitFor();
      await p.locator('#password-form [name=password]').fill('new-demo-password');
      await p.locator('#password-form [name=confirm]').fill('new-demo-password');
      await p.locator('#password-form [type=submit]').click();
    }
    if (scenario === 'forbidden') await p.getByRole('heading', { name: 'สิทธิ์ไม่เพียงพอ' }).waitFor();
    else await p.locator('.metric-value').first().waitFor();
    await act('logout').click();
    await p.locator('#login-form').waitFor();
  }
  check(errors.length === 0, 'JS errors: ' + errors.join(','));
  check(external.length === 0, 'unexpected HTTP requests');
  check(overflow.length === 0, 'overflow: ' + overflow.join(','));
  const result = {
    passed: true,
    errors,
    external,
    overflow,
    viewports: [1440, 768, 390, 320],
    themes: ['light', 'dark'],
    coverage:
      'login/session/permissions, all 8 pages, notes/reply, Journey/Dialog/Quiz/Steps/export, codes CRUD/manage, player progress/attempts, config, users/roles, logs, empty/error, keyboard dialog',
  };
  if (process.env.QA_OUTPUT)
    fs.writeFileSync(process.env.QA_OUTPUT + '/dashboard-qa.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
