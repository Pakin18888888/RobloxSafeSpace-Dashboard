const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MockService, ContractApi } = require('../src/service.js');
const JourneyModel = require('../src/journey-model.js');
const fixtureData = require('../src/fixtures.js');

test('legacy journeys migrate without losing dialogue or question content', () => {
  const old = fixtureData.fixtures().journeys[0];
  const migrated = JourneyModel.normalize(old);
  assert.equal(migrated.steps[0].blocks[0].lines[0].text, old.steps[0].dialog);
  assert.equal(migrated.steps[0].blocks[1].questions[0].title, old.steps[0].quiz.title);
  assert.equal(old.steps[0].blocks, undefined);
  assert.deepEqual(JourneyModel.normalize(migrated), migrated);
  old.steps[0].quiz.title = 'Q'.repeat(300);
  const longQuestion = JourneyModel.normalize(old).steps[0].blocks[1];
  assert.equal(longQuestion.title.length, 120);
  assert.equal(longQuestion.questions[0].title.length, 300);
});

test('nested content persists in order and invalid pass marks cannot overwrite it', async () => {
  const s = await service();
  const j = (await s.read('journeys')).rows[0];
  const step = j.steps[0];
  step.blocks[0].lines.push({ text: 'Second line', speaker: 'Guide' });
  const quiz = step.blocks.find((b) => b.type === 'quiz');
  quiz.mode = 'graded';
  quiz.showCorrect = true;
  quiz.questions[0].answer = 0;
  quiz.questions.push({ title: 'Another question', choices: ['A', 'B'], answer: 1 });
  step.blocks.push({ ...JourneyModel.dialog(), lines: [{ text: 'After quiz', speaker: '' }] });
  step.passMark = 2;
  const saved = await s.mutate('journeys', 'save', j.id, j);
  assert.equal(saved.steps[0].blocks[0].lines[1].speaker, 'Guide');
  assert.equal(saved.steps[0].blocks[1].questions[1].answer, 1);
  assert.equal(saved.steps[0].blocks[2].lines[0].text, 'After quiz');
  const invalid = structuredClone(saved);
  invalid.steps[0].passMark = 3;
  await assert.rejects(s.mutate('journeys', 'save', j.id, invalid), { code: 'VALIDATION' });
  invalid.steps[0].passMark = 1;
  invalid.steps[0].blocks[1].questions[1].answer = -1;
  await assert.rejects(s.mutate('journeys', 'save', j.id, invalid), { code: 'VALIDATION' });
  assert.equal((await s.read('journeys')).rows[0].version, saved.version);
});
async function service(role = 'admin') {
  const s = new MockService({ delay: 0, now: () => Date.parse('2026-11-16T05:00:00Z') });
  await s.login('demo', 'demo-only', { role });
  return s;
}
test('anonymous and observer cannot read care requests or write content', async () => {
  const s = new MockService({ delay: 0 });
  await assert.rejects(s.read('alerts'), { code: 'UNAUTHENTICATED' });
  await s.login('demo', 'demo-only', { role: 'observer' });
  await assert.rejects(s.read('alerts'), { code: 'FORBIDDEN' });
  await assert.rejects(s.mutate('journeys', 'delete', 'j1'), { code: 'FORBIDDEN' });
  const d = await s.read('overview');
  assert.equal(d.unreadAlerts, null);
  assert.equal(d.alerts, undefined);
  assert.equal((await s.read('players')).alerts.length, 0);
});
test('overview is derived consistently and contains no care narrative', async () => {
  const s = await service();
  const d = await s.read('overview');
  assert.equal(d.players.length, 12);
  assert.equal(d.submissions.length, 36);
  assert.equal(d.quizCount, 6);
  assert.equal(d.unreadAlerts, 2);
  assert.ok(!JSON.stringify(d).includes('message'));
});
test('temporary password gate and expiry are enforced in mock', async () => {
  const s = new MockService({ delay: 0 });
  await s.login('demo', 'demo-only', { scenario: 'temporary' });
  await assert.rejects(s.read('overview'), { code: 'PASSWORD_REQUIRED' });
  await assert.rejects(s.changePassword('demo-new', 'different'), { code: 'VALIDATION' });
  await s.changePassword('demo-new', 'demo-new');
  await s.read('overview');
  s.expire();
  await assert.rejects(s.read('overview'), { code: 'UNAUTHENTICATED' });
});
test('logout cancels a pending mutation without altering data', async () => {
  const s = await service();
  s.delay = 20;
  const pending = s.mutate('alerts', 'note', 'a1', { note: 'must not save' });
  s.logout();
  await assert.rejects(pending, { code: 'CANCELLED' });
  assert.equal(s.db.alerts[0].note, '');
});
test('notes and replies are distinct; audit never includes body', async () => {
  const s = await service();
  await s.mutate('alerts', 'note', 'a1', { note: 'private note' });
  await s.mutate('alerts', 'reply', 'a1', { message: 'private reply' });
  const a = s.db.alerts[0];
  assert.equal(a.note, 'private note');
  assert.equal(a.replies[0].status, 'mock_accepted');
  assert.equal(a.status, 'open');
  assert.ok(!JSON.stringify(s.db.logs).includes('private'));
});
test('code duplication and maximum uses validation preserve old data', async () => {
  const s = await service();
  const before = JSON.stringify(s.db.codes);
  await assert.rejects(
    s.mutate('codes', 'save', 'c1', {
      code: 'LEARN26',
      journeyId: 'j1',
      maxUses: 30,
      expires: null,
    }),
    { code: 'CONFLICT' },
  );
  await assert.rejects(
    s.mutate('codes', 'save', 'c1', {
      code: 'SPACE26',
      journeyId: 'j1',
      maxUses: 1,
      expires: null,
    }),
    { code: 'VALIDATION' },
  );
  assert.equal(JSON.stringify(s.db.codes), before);
});
test('linked journey cannot be deleted; stale draft cannot overwrite', async () => {
  const s = await service();
  await assert.rejects(s.mutate('journeys', 'delete', 'j1'), { code: 'CONFLICT' });
  const j = JSON.parse(JSON.stringify(s.db.journeys[0]));
  await s.mutate('journeys', 'save', j.id, j);
  await assert.rejects(s.mutate('journeys', 'save', j.id, j), { code: 'CONFLICT' });
});
test('player mutations scope attempts; privacy retention remains separate', async () => {
  const s = await service();
  await assert.rejects(s.mutate('players', 'deleteAttempt', 'p_demo_001', { attemptId: 'q2' }), {
    code: 'VALIDATION',
  });
  const count = s.db.alerts.length;
  await s.mutate('players', 'delete', 'p_demo_003');
  assert.equal(s.db.alerts.length, count);
  assert.ok(!s.db.submissions.some((q) => q.playerId === 'p_demo_003'));
});
test('staff credentials never persist in records or audit', async () => {
  const s = await service();
  await s.mutate('users', 'save', null, {
    username: 'new.staff',
    password: 'test-password',
    role: 'observer',
  });
  assert.ok(!JSON.stringify(s.db).includes('test-password'));
  await assert.rejects(s.mutate('users', 'delete', 'u1'), { code: 'CONFLICT' });
});
test('unverified API operations fail closed, without network calls', async () => {
  let calls = 0;
  const api = new ContractApi({
    baseUrl: 'https://invalid.example',
    fetchImpl: () => {
      calls++;
    },
  });
  await assert.rejects(api.call('reply', {}), { code: 'PENDING_BACKEND' });
  assert.equal(calls, 0);
});
test('verified adapter maps auth errors and does not expose server error bodies', async () => {
  const api = new ContractApi({
    baseUrl: 'https://invalid.example',
    operations: {
      test: {
        verified: true,
        method: 'GET',
        path: '/test',
        encode: () => undefined,
        decode: (x) => x,
      },
    },
    fetchImpl: async () => ({ status: 401, ok: false }),
  });
  await assert.rejects(api.call('test'), { code: 'UNAUTHENTICATED' });
});
