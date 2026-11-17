(function (root) {
  'use strict';
  const data = root.SafeSpaceData || (typeof require === 'function' ? require('./fixtures.js') : null);
  class ServiceError extends Error { constructor(code, message) { super(message); this.name = 'ServiceError'; this.code = code; } }
  const fail = (code, msg) => { throw new ServiceError(code, msg) };
  const required = (value, label, max = 200) => { if (typeof value !== 'string' || !value.trim() || value.length > max) fail('VALIDATION', `${label} ต้องมีข้อมูลและไม่เกิน ${max} ตัวอักษร`); return value.trim() };
  const copy = data.clone;
  const validDate = value => !value || Number.isFinite(Date.parse(value));
  class MockService {
    constructor({ delay = 240, now = () => Date.now() } = {}) { this.delay = delay; this.now = now; this.db = data.fixtures(); this.session = null; this.epoch = 0; this.behavior = 'normal'; this.sequence = 100; this.mode = 'mock'; }
    async wait() { if (this.delay) await new Promise(r => setTimeout(r, this.delay)); }
    id(prefix) { return `${prefix}${++this.sequence}`; }
    check(permission) { if (!this.session || this.session.expiresAt <= this.now()) { this.session = null; fail('UNAUTHENTICATED', 'Session หมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'); } if (this.session.temporary) fail('PASSWORD_REQUIRED', 'กรุณาเปลี่ยนรหัสผ่านชั่วคราวก่อน'); if (permission && !this.session.permissions.includes(permission)) fail('FORBIDDEN', 'คุณไม่มีสิทธิ์ดำเนินการนี้'); }
    async gate(permission) { this.check(permission); const version = this.epoch; await this.wait(); if (version !== this.epoch) fail('CANCELLED', 'คำขอเดิมถูกยกเลิก'); this.check(permission); if (this.behavior === 'error') fail('NETWORK', 'เชื่อมต่อบริการจำลองไม่ได้ ลองใหม่อีกครั้ง'); }
    async login(username, password, { scenario = 'success', role = 'admin' } = {}) { const version = this.epoch; await this.wait(); if (version !== this.epoch) fail('CANCELLED', 'ยกเลิกคำขอ'); if (scenario === 'network') fail('NETWORK', 'ยังเชื่อมต่อระบบไม่ได้ กรุณาลองใหม่'); if (username !== 'demo' || password !== 'demo-only' || scenario === 'invalid') fail('AUTH_FAILED', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); const preset = this.db.roles.find(r => r.id === (scenario === 'forbidden' ? 'none' : role)) || this.db.roles[0]; this.session = { id: 'u1', username: 'demo', role: preset.id, roleName: preset.name, permissions: copy(preset.permissions), temporary: scenario === 'temporary', expiresAt: this.now() + 20 * 60 * 1000 }; this.epoch++; return copy(this.session); }
    async changePassword(value, confirm) { if (!this.session || this.session.expiresAt <= this.now()) fail('UNAUTHENTICATED', 'กรุณาเข้าสู่ระบบอีกครั้ง'); if (value.length < 8 || value.length > 128) fail('VALIDATION', 'รหัสผ่านจำลองต้องยาว 8–128 ตัวอักษร'); if (value !== confirm) fail('VALIDATION', 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'); if (value === 'demo-only') fail('VALIDATION', 'รหัสผ่านใหม่ต้องต่างจากรหัสเดิม'); const epoch = this.epoch; await this.wait(); if (epoch !== this.epoch || !this.session) fail('CANCELLED', 'ยกเลิกคำขอ'); if(this.session.expiresAt<=this.now())fail('UNAUTHENTICATED','Session หมดอายุ'); this.session.temporary = false; return copy(this.session); }
    logout() { this.session = null; this.epoch++; }
    expire() { if (this.session) this.session.expiresAt = 0; this.epoch++; }
    setRole(id) { const r = this.db.roles.find(r => r.id === id); if (!r || !this.session) return; this.session.role = r.id; this.session.roleName = r.name; this.session.permissions = copy(r.permissions); this.epoch++; return copy(this.session); }
    listPermissions() { return copy(data.permissions) }
    async read(resource) {
      const permission = resource === 'overview' ? 'overview.read' : `${resource}.read`; await this.gate(permission); if (resource === 'overview') {
        const empty = this.behavior === 'empty'; return { players: empty ? [] : copy(this.db.players), journeys: empty ? [] : copy(this.db.journeys.map(j => ({ id: j.id, title: j.title }))), quizCount: empty ? 0 : this.db.journeys.reduce((n, j) => n + j.steps.filter(s => s.quiz).length, 0), submissions: empty ? [] : copy(this.db.submissions), events: empty ? [] : copy(this.db.events), unreadAlerts: this.session.permissions.includes('alerts.read') ? (empty ? 0 : this.db.alerts.filter(a => a.unread).length) : null };
      } if (!['alerts', 'journeys', 'codes', 'players', 'config', 'users', 'logs'].includes(resource)) fail('NOT_FOUND', 'ไม่พบรายการ'); const rows = this.behavior === 'empty' ? [] : copy(this.db[resource]);
      if (resource === 'players') return { rows, journeys: copy(this.db.journeys.map(j => ({ id: j.id, title: j.title, steps: j.steps.map(s => ({ id: s.id, name: s.name })) }))), submissions: this.behavior === 'empty' ? [] : copy(this.db.submissions), events: this.behavior === 'empty' ? [] : copy(this.db.events), alerts: this.session.permissions.includes('alerts.read') ? (this.behavior === 'empty' ? [] : copy(this.db.alerts)) : [] };
      if (resource === 'codes') return { rows, journeys: copy(this.db.journeys.map(j => ({ id: j.id, title: j.title }))) };
      if (resource === 'users') return { rows, roles: copy(this.db.roles) };
      if (resource === 'logs') return { rows, health: { api: 'mock', database: 'not_connected' } };
      return { rows };
    }
    audit(action) { this.db.logs.unshift({ id: this.id('log'), at: new Date(this.now()).toISOString(), kind: 'audit', action, status: 200, duration: 0 }); }
    find(resource, id) { const item = this.db[resource].find(x => (x.id || x.key) === id); if (!item) fail('NOT_FOUND', 'รายการนี้ไม่มีอยู่แล้ว กรุณาโหลดใหม่'); return item; }
    async mutate(resource, action, id, payload = {}) {
      await this.gate(`${resource}.write`); let result; const stamp = new Date(this.now()).toISOString();
      if (resource === 'alerts') {
        const a = this.find('alerts', id);
        if (action === 'note') { a.note = required(payload.note, 'บันทึกทีม', 2000); result = a; }
        else if (action === 'reply') { const body = required(payload.message, 'ข้อความ', 1000); a.replies.push({ id: this.id('reply'), message: body, at: stamp, status: 'mock_accepted' }); result = a; }
        else if (action === 'handle') { a.status = 'handled'; a.unread = false; result = a; }
        else if (action === 'delete') { this.db.alerts = this.db.alerts.filter(x => x.id !== id); result = { id }; }
        else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง');
      } else if (resource === 'journeys') {
        if (action === 'save') {
          const title = required(payload.title, 'ชื่อ Journey', 120); required(payload.description, 'คำอธิบาย', 1000);
          if (!Array.isArray(payload.steps) || !payload.steps.length) fail('VALIDATION', 'ต้องมีอย่างน้อย 1 step');
          if (payload.steps.length > 30) fail('VALIDATION', 'รองรับไม่เกิน 30 steps ในต้นแบบ');
          const ids = new Set(); payload.steps.forEach((s, i) => { required(s.npc, `NPC ID ขั้น ${i + 1}`, 60); if (ids.has(s.npc)) fail('VALIDATION', 'NPC ID ใน Journey ต้องไม่ซ้ำ (กติกาจำลอง)'); ids.add(s.npc); required(s.name, 'ชื่อ step', 120); required(s.dialog, 'บทสนทนา', 3000); if (s.quiz) { required(s.quiz.title, 'คำถาม', 300); if (!['survey', 'graded'].includes(s.quiz.mode)) fail('VALIDATION', 'รูปแบบ Quiz ไม่ถูกต้อง'); if (!Array.isArray(s.quiz.choices) || s.quiz.choices.length < 2 || s.quiz.choices.length > 8) fail('VALIDATION', 'Quiz ต้องมี 2–8 ตัวเลือก'); s.quiz.choices.forEach(c => required(c, 'ตัวเลือก', 300)); if (s.quiz.mode === 'graded' && (!Number.isInteger(s.quiz.answer) || s.quiz.answer < 0 || s.quiz.answer >= s.quiz.choices.length)) fail('VALIDATION', 'เลือกคำตอบให้ตรงกับตัวเลือก'); } });
          if (!['draft', 'review'].includes(payload.status)) fail('VALIDATION', 'ต้นแบบรองรับเฉพาะ Draft และ In review ยังไม่มีการ Publish');
          const csv = String(payload.csvColumns||'').split(',').map(c=>c.trim()).filter(Boolean);
          const allowedColumns=['playerId','journeyId','progress','status','updated'];
          if(csv.some(c=>!allowedColumns.includes(c))||new Set(csv).size!==csv.length)fail('VALIDATION','CSV columns ต้องเป็นคอลัมน์ที่รองรับและไม่ซ้ำ');
          if(!Array.isArray(payload.labels)||payload.labels.some(l=>!l.key||!l.label)||new Set(payload.labels.map(l=>l.key)).size!==payload.labels.length)fail('VALIDATION','Value labels ต้องมี key/ชื่อครบและ key ไม่ซ้ำ');
          const original = id ? this.find('journeys', id) : null;
          if (original && payload.version !== original.version) fail('CONFLICT', 'Journey ถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลใหม่');
          result = { ...copy(payload), title, id: original?.id || this.id('j'), updated: stamp, version: (original?.version || 0) + 1 }; if (original) this.db.journeys = this.db.journeys.map(x => x.id === id ? result : x); else this.db.journeys.push(result);
        } else if (action === 'delete') {
          this.find('journeys', id); if (this.db.codes.some(c => c.journeyId === id) || this.db.players.some(p => p.progress.some(g => g.journeyId === id))) fail('CONFLICT', 'Journey นี้มีรหัสเข้าเล่นหรือความคืบหน้าผูกอยู่ ต้นแบบไม่ลบข้อมูลที่ยังอ้างอิง'); this.db.journeys = this.db.journeys.filter(j => j.id !== id); result = { id };
        } else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง');
      } else if (resource === 'codes') {
        if (action === 'save') {
          const original = id ? this.find('codes', id) : null; this.find('journeys', payload.journeyId);
          const code = (payload.code || `SS${this.id('C')}`).trim().toUpperCase(); if (!/^[A-Z0-9_-]{3,24}$/.test(code)) fail('VALIDATION', 'Code ใช้ A–Z, 0–9, _ หรือ - ความยาว 3–24'); if (this.db.codes.some(c => c.code === code && c.id !== id)) fail('CONFLICT', 'รหัสนี้มีอยู่แล้ว');
          const max = payload.maxUses === null ? null : Number(payload.maxUses); if (max !== null && (!Number.isInteger(max) || max < 1 || max < (original?.uses || 0))) fail('VALIDATION', 'จำนวนใช้สูงสุดต้องเป็นจำนวนเต็มบวก และไม่น้อยกว่าที่ใช้แล้ว');
          if (!validDate(payload.expires) || (payload.expires && payload.expires !== original?.expires && Date.parse(payload.expires) <= this.now())) fail('VALIDATION', 'วันหมดอายุต้องอยู่ในอนาคต');
          result = { id: original?.id || this.id('c'), code, journeyId: payload.journeyId, maxUses: max, expires: payload.expires || null, uses: original?.uses || 0, status: original?.status || 'live' }; if (original) this.db.codes = this.db.codes.map(c => c.id === id ? result : c); else this.db.codes.push(result);
        } else { const c = this.find('codes', id); if (action === 'regenerate') c.code = `SS${this.id('R')}`; else if (action === 'disable') c.status = 'disabled'; else if (action === 'expire') { c.status = 'expired'; c.expires = stamp; } else if (action === 'delete') this.db.codes = this.db.codes.filter(x => x.id !== id); else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง'); result = c; }
      } else if (resource === 'players') {
        const p = this.find('players', id);
        if (action === 'delete') { this.db.players = this.db.players.filter(x => x.id !== id); this.db.submissions = this.db.submissions.filter(x => x.playerId !== id); this.db.events = this.db.events.filter(x => x.playerId !== id);/* Alerts remain in restricted care workflow; retention is independent. */result = { id }; }
        else if (action === 'deleteAttempt') { const q = this.find('submissions', payload.attemptId); if (q.playerId !== id) fail('VALIDATION', 'ผลแบบทดสอบไม่ใช่ของผู้เล่นนี้'); this.db.submissions = this.db.submissions.filter(x => x.id !== q.id); result = { id: q.id }; }
        else { const g = p.progress.find(x => x.journeyId === payload.journeyId); if (!g) fail('NOT_FOUND', 'ไม่พบความคืบหน้า'); const j = this.find('journeys', g.journeyId); if (action === 'reset') { g.step = 0; g.done = false; } else if (action === 'done') { g.step = j.steps.length; g.done = true; } else if (action === 'step') { if (!Number.isInteger(payload.step) || payload.step < 0 || payload.step > j.steps.length) fail('VALIDATION', 'Step ไม่ถูกต้อง'); g.step = payload.step; g.done = payload.step === j.steps.length; } else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง'); g.updated = stamp; result = p; }
      } else if (resource === 'config') {
        const c = this.find('config', id); if (action === 'delete') { this.db.config = this.db.config.filter(x => x.key !== id); result = { id }; } else if (action === 'save') { if (typeof payload.value !== c.type) fail('VALIDATION', `ค่าต้องเป็น ${c.type}`); if (c.type === 'number' && (!Number.isFinite(payload.value) || payload.value < 0)) fail('VALIDATION', 'ค่าตัวเลขต้องไม่ติดลบ'); c.value = copy(payload.value); c.updated = stamp; result = c; } else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง');
      } else if (resource === 'users') {
        if (action === 'role') {
          const name = required(payload.name, 'ชื่อบทบาท', 60); const all = Object.values(data.permissions).flat(); if (!Array.isArray(payload.permissions) || payload.permissions.some(p => !all.includes(p))) fail('VALIDATION', 'สิทธิ์ไม่ถูกต้อง'); if (this.db.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) fail('CONFLICT', 'ชื่อบทบาทซ้ำ'); result = { id: this.id('role'), name, description: 'บทบาทจำลองที่สร้างในรอบนี้', permissions: [...new Set(payload.permissions)] }; this.db.roles.push(result);
        } else if (action === 'save') {
          const original = id ? this.find('users', id) : null; const username = required(payload.username, 'ชื่อผู้ใช้', 60); if (!/^[a-zA-Z0-9._-]+$/.test(username)) fail('VALIDATION', 'ชื่อผู้ใช้ใช้ตัวอักษรอังกฤษ ตัวเลข . _ -'); if (this.db.users.some(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== id)) fail('CONFLICT', 'ชื่อผู้ใช้ซ้ำ'); if (!this.db.roles.some(r => r.id === payload.role)) fail('VALIDATION', 'ไม่พบบทบาท'); if (!original && (!payload.password || payload.password.length < 8 || payload.password.length > 128)) fail('VALIDATION', 'รหัสผ่านชั่วคราวจำลองต้องยาว 8–128 ตัวอักษร');
          if (original?.id === this.session.id && payload.role !== original.role) fail('CONFLICT', 'ต้นแบบไม่ให้เปลี่ยนบทบาทของตนเอง ใช้แผงทดสอบสิทธิ์แทน');
          result = { id: original?.id || this.id('u'), username, role: payload.role, active: original?.active ?? true, temporary: original?.temporary ?? true, lastSignIn: original?.lastSignIn || null }; if (original) this.db.users = this.db.users.map(u => u.id === id ? result : u); else this.db.users.push(result);
        } else { const u = this.find('users', id); if (u.id === this.session.id && ['disable', 'delete'].includes(action)) fail('CONFLICT', 'ไม่สามารถปิดหรือลบบัญชีที่กำลังใช้งาน'); if (action === 'reset') { required(payload.password, 'รหัสผ่านชั่วคราว', 128); if (payload.password.length < 8) fail('VALIDATION', 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร'); u.temporary = true; } else if (action === 'disable') { u.active = !u.active; } else if (action === 'delete') this.db.users = this.db.users.filter(x => x.id !== id); else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง'); result = u; }
      } else fail('UNSUPPORTED', 'ไม่รองรับคำสั่ง');
      this.audit(`${resource}.${action} · mock`); return copy(result);
    }
    async journeyProgress(id) { await this.gate('journeys.export'); this.find('journeys', id); return copy(this.db.players.flatMap(p => p.progress.filter(g => g.journeyId === id).map(g => ({ playerId: p.id, journeyId: id, progress: g.step, status: g.done ? 'complete' : 'in_progress', updated: g.updated })))); }
  }
  /* Observed endpoint names are reference-only, never bound to unverified payloads. */
  const observedEndpoints = Object.freeze({ login: { method: 'POST', path: '/dashboard/auth/login' }, me: { method: 'GET', path: '/dashboard/auth/me' }, changePassword: { method: 'POST', path: '/dashboard/auth/change-password' }, stats: { method: 'GET', path: '/dashboard/stats' }, alerts: { method: 'GET', path: '/dashboard/alerts' }, journeys: { method: 'GET', path: '/dashboard/journeys' }, players: { method: 'GET', path: '/dashboard/players' }, users: { method: 'GET', path: '/dashboard/users' }, codes: { method: 'GET', path: '/dashboard/codes' }, config: { method: 'GET', path: '/dashboard/config' }, logs: { method: 'GET', path: '/dashboard/dev/logs' }, audit: { method: 'GET', path: '/dashboard/audit' } });
  class ContractApi {
    constructor({ baseUrl, operations = {}, getHeaders = () => ({}), credentials = 'omit', fetchImpl = root.fetch, timeoutMs = 15000 } = {}) { this.baseUrl = baseUrl; this.operations = operations; this.getHeaders = getHeaders; this.credentials = credentials; this.fetchImpl = fetchImpl; this.timeoutMs = timeoutMs; this.mode = 'pending-backend'; }
    async call(name, input, { signal } = {}) {
      const op = this.operations[name]; if (!op || op.verified !== true || typeof op.encode !== 'function' || typeof op.decode !== 'function') fail('PENDING_BACKEND', 'ต้องมี API contract ที่ยืนยันและตัวแปลงข้อมูลก่อนเรียกใช้งาน');
      const url = new URL(op.path, this.baseUrl); if (url.origin !== new URL(this.baseUrl).origin) fail('VALIDATION', 'API ต้องอยู่ origin ที่กำหนด'); const controller = new AbortController(); const abort = () => controller.abort(); if (signal?.aborted) controller.abort(); signal?.addEventListener('abort', abort, { once: true }); const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try { const body = op.encode(input); const response = await this.fetchImpl(url, { method: op.method, headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...this.getHeaders() }, credentials: this.credentials, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal }); if (response.status === 401) fail('UNAUTHENTICATED', 'Session หมดอายุ'); if (response.status === 403) fail('FORBIDDEN', 'ไม่มีสิทธิ์'); if (response.status === 409) fail('CONFLICT', 'ข้อมูลมีการเปลี่ยนแปลง กรุณาโหลดใหม่'); if (!response.ok) fail('API_ERROR', 'ระบบไม่สามารถดำเนินการได้'); return op.decode(response.status === 204 ? null : await response.json()); } catch (e) { if (e instanceof ServiceError) throw e; if (controller.signal.aborted) fail('CANCELLED', 'คำขอถูกยกเลิกหรือเกินเวลารอ ผลการแก้ไขยังไม่ยืนยัน'); fail('NETWORK', 'ไม่สามารถเชื่อมต่อระบบได้'); } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
    }
  }
  const exports = { MockService, ContractApi, ServiceError, observedEndpoints }; root.SafeSpaceService = exports; if (typeof module !== 'undefined') module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : window);
