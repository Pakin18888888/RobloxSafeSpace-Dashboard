'use strict';
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const badge = (type) =>
  /* HTML */ `<span class="badge ${type}"
    >${{ seen: 'เห็นในคลิป', proposed: 'เสนอ Frontend', pending: 'ต้องยืนยัน' }[type]}</span
  >`;
const screens = [
  {
    id: 'overview',
    name: 'Overview',
    thai: 'ภาพรวมการใช้งาน',
    time: '00:03–00:09',
    fields:
      'จำนวน players, quizzes, submissions, unread alerts; Recent results, Players และ Activity',
    actions: 'อ่านภาพรวมและรายการล่าสุด; มี banner เปลี่ยนรหัสผ่านเริ่มต้น',
    permission: 'See the overview summary',
    boundary:
      'ไม่เพิ่มกราฟผลประเมินหรือ filter วันที่ที่คลิปไม่ได้แสดง; ความหมาย unread ต้องยืนยัน ไม่เท่ากับ unhandled โดยอัตโนมัติ',
    blocks: [
      'Recent results · เวลา / Player / Quiz / Result',
      'Players · รหัสนามแฝง / Region / Account age / Last seen',
      'Activity · เวลา / Event / Player',
    ],
  },
  {
    id: 'alerts',
    name: 'Alerts',
    thai: 'รับเรื่องจากผู้เล่น',
    time: '00:12',
    fields: 'รหัสนามแฝง, เวลา, ข้อความแจ้ง, สถานะ handled, team note และ reply',
    actions:
      'Refresh, Save note, Send reply, Delete; สิทธิ์/endpoint สำหรับ mark handled ปรากฏแยกใน Users/API catalog',
    permission: 'View player alerts; Add notes, mark handled, delete and reply to alerts',
    boundary: 'แยก “บันทึกทีม” กับ “ข้อความถึงผู้เล่น”; endpoint ส่งข้อความและหลักฐานการส่งถึง/อ่านยังไม่ยืนยัน',
    blocks: [
      'Alerts from players · Refresh',
      'p_demo_001 · สถานะคำขอ',
      'บันทึกภายในทีม → Save note',
      'ข้อความถึงผู้เล่นในเกม → Send',
    ],
  },
  {
    id: 'journeys',
    name: 'Journeys',
    thai: 'จัดการเส้นทางกิจกรรม',
    time: '00:15–00:18',
    fields:
      'ชื่อ journey, ข้อความ 3 สถานการณ์, value labels, show totals, CSV columns, NPC ID, steps, dialog/quiz',
    actions:
      'Create journey, Progress, Edit, Delete; การดาวน์โหลด CSV มีข้อความในฟอร์มและ permission แต่ไม่เห็นผล export',
    permission: 'View journeys/quizzes/dialogs; Create/edit/delete; View progress and download CSV',
    boundary:
      'ยืนยัน schema, quiz modes, ผลต่อผู้เล่นเดิมและความหมายคะแนนกับ Backend/ทีมเนื้อหา; ไม่ตีความเป็นผลสุขภาพจิต',
    blocks: [
      'Journeys · Title / Steps / Updated / Progress / Edit',
      'Journey name + ข้อความผิดลำดับ / ขั้นจบ / journey จบ',
      'Value labels + แสดง totals + CSV columns',
      'Step → NPC ID → Dialog / Quiz',
    ],
  },
  {
    id: 'codes',
    name: 'Codes',
    thai: 'จัดการรหัสเข้ากิจกรรม',
    time: '00:21',
    fields:
      'Journey, Custom code (optional), Expires in minutes, Max uses; Code/Opens/Status/Uses/Expires',
    actions: 'Create, Edit, Regenerate, Disable, Expire, Delete',
    permission: 'View join codes; Create, edit and delete join codes',
    boundary:
      'ยืนยันผลของ regenerate/expire/disable และ code เก่า; เสนอ dialog ยืนยันคำสั่งที่กระทบการเข้าเล่น',
    blocks: [
      'สร้าง join code · Journey / Custom code',
      'Expires in minutes / Max uses → Create',
      'Codes · Status / Uses / Expires',
      'Edit / Regenerate / Disable / Expire / Delete',
    ],
  },
  {
    id: 'players',
    name: 'Players',
    thai: 'ตรวจข้อมูลผู้เล่น',
    time: '00:24–00:30',
    fields:
      'Search by id or name, First/Last seen; Journey progress, Quiz attempts, Alerts และ Recent events',
    actions: 'Open, Set step, Mark done, Reset, Delete quiz attempt',
    permission: 'View players and their progress; Change/reset progress, delete player data',
    boundary:
      'เสนอใช้รหัสนามแฝงเป็นหลักและจำกัด Alerts ตามสิทธิ์เฉพาะ; ชื่อที่ค้นได้และ endpoint รายละเอียด/แก้ไขต้องยืนยัน',
    blocks: [
      'ค้นหาผู้เล่น → รายการ → Open',
      'Journey progress → Set step / Mark done / Reset',
      'Quiz attempts · Result / Delete',
      'Alerts ตามสิทธิ์ + Recent events',
    ],
  },
  {
    id: 'config',
    name: 'Config',
    thai: 'ตั้งค่าระบบเกม',
    time: '00:33',
    fields: 'Key, Value (JSON), Updated; ตัวอย่าง key alertCooldownSeconds',
    actions: 'Edit, Delete, Save',
    permission: 'View game config; Change game config',
    boundary:
      'Frontend ตรวจรูปแบบ JSON; Backend ตรวจ key/type/range และผลต่อเกม ต้องตกลง allowlist ของค่าที่แก้ได้',
    blocks: [
      'Game config · Key / Value / Updated',
      'Key · alertCooldownSeconds (ตัวอย่างในคลิป)',
      'Value (JSON) → Save',
      'Edit / Delete → ตรวจผลกระทบ',
    ],
  },
  {
    id: 'users',
    name: 'Users',
    thai: 'ผู้ใช้และสิทธิ์เจ้าหน้าที่',
    time: '00:36–00:42',
    fields:
      'Username, Role, Status, Last sign in; Temporary password; Role name และ permission groups',
    actions: 'Create user, เปลี่ยน role, Reset password, Disable, Delete, Create role',
    permission: 'Manage users and roles; admin built-in all permissions',
    boundary:
      'มี admin ที่ยืนยันได้; researcher เป็น placeholder เท่านั้น ยืนยัน policy ป้องกันลบ/ปิด admin คนสุดท้ายและการมอบสิทธิ์',
    blocks: [
      'Users · Role / Status / Last sign in',
      'Add user · Username / Temporary password / Role',
      'Roles and permissions · admin',
      'New role → เลือก permission → Create role',
    ],
  },
  {
    id: 'logs',
    name: 'Logs',
    thai: 'ตรวจเหตุการณ์และ API',
    time: '00:45–00:48',
    fields:
      'request method/path/status, API endpoints และการแบ่ง game/dashboard; มีสิทธิ์ดู logs/status/events/audit',
    actions: 'อ่านรายการและกรอง API endpoint; ตรวจชื่อ endpoint เพื่อเชื่อมระบบ',
    permission: 'View logs, status, events and the audit log',
    boundary:
      'ไม่แสดง secrets/token ใน Frontend; การปกปิดข้อมูลต้องทำที่ Server; audit event/schema และ retention ยังต้องยืนยัน',
    blocks: [
      'Request logs · เวลา / Method / Path / Status',
      'System health / Events / Audit · ตาม contract',
      'API endpoints · Filter',
      'Method / Path / Used by',
    ],
  },
];
const node = (title, type, detail, decision = false) => ({ title, type, detail, decision });
const flows = [
  {
    name: 'เข้าสู่ระบบ',
    title: 'F01 · เข้าสู่ Dashboard อย่างมีสิทธิ์',
    ref: 'API 00:48 · Banner 00:03 · Users 00:36',
    intro:
      'หน้า Login ไม่ปรากฏในคลิป ลำดับนี้เป็นข้อเสนอ โดยใช้ชื่อ API และสถานะ temporary password ที่เห็นเป็นฐาน',
    nodes: [
      node(
        'เปิดเว็บ / ตรวจ session',
        'proposed',
        'ตรวจ session ตามกลไกที่ Backend กำหนดก่อน render ข้อมูล ถ้าไม่มีให้เปิด Login; ถ้ามีให้ตรวจ auth/me',
        true,
      ),
      node(
        'Login',
        'proposed',
        'กรอก username/password → ตรวจช่องว่าง → ส่งครั้งเดียวระหว่าง loading; ใช้ POST /dashboard/auth/login ที่เห็นใน catalog',
      ),
      node(
        'ตรวจตัวตนและสิทธิ์',
        'pending',
        'เรียก GET /dashboard/auth/me ตาม contract เพื่อรับสิทธิ์และสถานะบัญชี ไม่แต่งชื่อ field หรือ permission key',
        true,
      ),
      node(
        'รหัสผ่านชั่วคราว?',
        'proposed',
        'ถ้าใช่ เสนอให้เปลี่ยนก่อนเข้าข้อมูลด้วย POST /dashboard/auth/change-password; คลิปยืนยันเพียง banner จึงต้องตกลง enforcement',
        true,
      ),
      node(
        'เปิดหน้าที่มีสิทธิ์',
        'proposed',
        'มี Overview → เปิด Overview; มีเฉพาะหน้าอื่น → เปิดหน้าที่อนุญาต; ไม่มีเลย → แสดงหน้าสิทธิ์ไม่เพียงพอ',
      ),
    ],
    branches: [
      ['ไม่มี session / Login ไม่ผ่าน', 'ไป Login → ข้อความทั่วไป → แก้ข้อมูล → ส่งใหม่; ไม่บอกว่าบัญชีใดมีอยู่'],
      ['รหัสผ่านชั่วคราว = ใช่', 'ไปเปลี่ยนรหัสผ่าน → Server ยืนยัน → ตรวจสิทธิ์อีกครั้ง → หน้าแรกที่มีสิทธิ์'],
      ['Session หมดอายุ / ไม่มีสิทธิ์', 'หมดอายุ → เคลียร์ข้อมูลหน้าจอ → Login; ไม่มีสิทธิ์ → หน้า 403 ตาม contract'],
      [
        'ออกจากระบบ',
        'Sign out → จบ session ตาม contract → ล้างข้อมูลหน้าจอ → Login; ไม่พบ logout endpoint ที่ยืนยันได้',
      ],
    ],
    contract:
      'POST /dashboard/auth/login · GET /dashboard/auth/me · POST /dashboard/auth/change-password — พบชื่อ API; schema, session, logout และ error mapping รอยืนยัน',
  },
  {
    name: 'ภาพรวม',
    title: 'F02 · อ่านภาพรวมและไปยังงาน',
    ref: '00:03–00:09',
    intro: 'รักษาหมวดและตัวชี้วัดตามคลิป ไม่เพิ่มข้อสรุปผลประเมินจากข้อมูลเดโม',
    nodes: [
      node(
        'ตรวจสิทธิ์ Overview',
        'pending',
        'สิทธิ์ See the overview summary ปรากฏในหน้า Users แต่ยังไม่ทราบ permission key',
        true,
      ),
      node(
        'โหลดข้อมูลภาพรวม',
        'proposed',
        'แสดง loading และอ่านข้อมูล summary/results/players/events ตาม contract; พบ GET stats/submissions/players/events ใน log 00:45',
      ),
      node(
        'อ่าน 4 ตัวเลข / 3 ตาราง',
        'seen',
        'players, quizzes, submissions, unread alerts; Recent results, Players และ Activity ที่ 00:03–00:09',
      ),
      node(
        'เลือกเมนูงาน',
        'seen',
        'มีเมนู Alerts, Journeys, Codes, Players, Config, Users, Logs; การซ่อนเมนูตามสิทธิ์เป็นข้อเสนอ',
      ),
      node('เปิดหน้าที่เลือก', 'proposed', 'ตรวจสิทธิ์หน้าปลายทางก่อนแสดงและโหลดเฉพาะข้อมูลที่อนุญาต'),
    ],
    branches: [
      ['API ส่งรายการว่าง', 'แสดง “ยังไม่มีข้อมูล” → คงเมนูให้ใช้ต่อ; แยกจากการโหลดล้มเหลว'],
      ['โหลดล้มเหลวบางส่วน', 'แจ้งเฉพาะส่วนที่ล้มเหลว → ลองใหม่; ข้อมูลเก่าต้องระบุว่าอาจไม่ล่าสุด'],
    ],
    contract:
      'GET /dashboard/stats · /dashboard/submissions · /dashboard/players · /dashboard/events — เห็นใน request log; โครงสร้างและความสดของข้อมูลรอยืนยัน',
  },
  {
    name: 'คำขอช่วยเหลือ',
    title: 'F03 · รับเรื่อง บันทึกทีม และตอบผู้เล่น',
    ref: 'Alerts 00:12 · Permission 00:36 · API 00:48',
    intro:
      'โน้ตทีมและข้อความถึงผู้เล่นเป็นคนละการกระทำ สถานะ handled ไม่เท่ากับการยืนยันว่าผู้เล่นได้รับความช่วยเหลือสำเร็จ',
    nodes: [
      node(
        'เปิด Alerts',
        'seen',
        'มีรายการคำขอ Refresh และข้อความ pseudonymous mode; ให้ API ส่งเฉพาะข้อมูลตามสิทธิ์',
      ),
      node('เลือกคำขอ', 'seen', 'อ่านรหัสนามแฝง เวลา ข้อความและสถานะของคำขอ; ยืนยันผู้รับจากรายการที่เลือก'),
      node(
        'เลือกการกระทำ',
        'seen',
        'Save note / Send reply / Delete เห็นที่ 00:12; mark handled มีใน permission และ /ack endpoint',
        true,
      ),
      node(
        'ตรวจและยืนยัน',
        'proposed',
        'แยกปุ่มบันทึกทีมกับตอบเข้าเกม; ก่อนตอบให้ตรวจผู้รับและข้อความ; ก่อนลบให้แสดงผลกระทบ',
      ),
      node(
        'แสดงผลตาม Server',
        'pending',
        'บันทึกสำเร็จเมื่อ Server ตอบรับ; reply ต้องแยก accepted/sent/delivered/read ตามที่ระบบรองรับจริง → refresh สถานะ',
      ),
    ],
    branches: [
      [
        'บันทึกภายในทีม / รับทราบ',
        'Save note → PATCH …/note; mark handled → PATCH …/ack; ต้องยืนยันความหมายและผู้ที่เห็นโน้ต',
      ],
      [
        'ตอบผู้เล่นในเกม',
        'Send → ตรวจผู้รับ/ข้อความ → API ที่ต้องยืนยัน → แสดง acknowledgement; ไม่สรุปว่าอ่านแล้ว',
      ],
      ['Delete / ยกเลิก', 'Delete → ยืนยันรหัสคำขอ → ยืนยันแล้วค่อย DELETE; ยกเลิก → กลับคำขอเดิม'],
      [
        'ส่งแล้ว timeout / ผู้เล่น offline',
        'แสดงว่ายังยืนยันผลไม่ได้ → ตรวจสถานะก่อนส่งซ้ำ; พฤติกรรม offline/queue ต้องตกลง',
      ],
    ],
    contract:
      'GET /dashboard/alerts · PATCH /dashboard/alerts/:id/note · PATCH /dashboard/alerts/:id/ack · DELETE /dashboard/alerts/:id — reply endpoint ยังไม่ยืนยัน',
  },
  {
    name: 'จัดการ Journey',
    title: 'F04 · สร้าง/แก้ Journey และตรวจความคืบหน้า',
    ref: '00:15–00:18 · Permission 00:36–00:42',
    intro: 'ใช้ส่วนประกอบ Journey ตามฟอร์มในคลิป ส่วน API schema และผลต่อเนื้อหาที่กำลังเล่นต้องให้ Backend ยืนยัน',
    nodes: [
      node('รายการ Journeys', 'seen', 'เลือก Create journey / Edit / Progress / Delete จากรายการ'),
      node(
        'เลือกงานตามสิทธิ์',
        'pending',
        'แยก read, content edit และ progress/export ตามกลุ่มสิทธิ์ที่เห็น; ต้องมี server enforcement',
        true,
      ),
      node(
        'จัดเนื้อหาและ steps',
        'seen',
        'ชื่อ, ข้อความผิดลำดับ/จบขั้น/จบ journey, value labels, show totals, CSV columns, NPC ID, dialog/quiz',
      ),
      node(
        'ตรวจฟอร์ม / บันทึก',
        'proposed',
        'ตรวจ required fields และความสัมพันธ์ step/NPC ตาม schema; ส่ง API แล้วรอผล; schema ยังไม่ยืนยัน',
      ),
      node(
        'ดูรายการ / Progress',
        'seen',
        'คลิปมีปุ่ม Progress และสิทธิ์ download CSV; เสนอ reload หลังบันทึก โดยยังไม่อ้างว่า export ใช้งานสำเร็จแล้ว',
      ),
    ],
    branches: [
      [
        'Progress / CSV',
        'เลือก Progress → แสดงข้อมูลตามสิทธิ์ → ขอ export ตาม contract; ตรวจชนิดข้อมูลและสิทธิ์ก่อนดาวน์โหลด',
      ],
      ['ฟอร์มผิด / บันทึกล้มเหลว', 'ชี้ช่องผิด → เก็บเนื้อหาที่กรอกไว้ในหน้าปัจจุบัน → แก้และลองใหม่; ไม่แจ้งสำเร็จล่วงหน้า'],
      ['ลบ Journey', 'ตรวจผลต่อ join codes / ผู้เล่นเดิม → dialog ยืนยัน → API → reload; ผลจริงรอยืนยัน'],
      [
        'แสดง totals ให้ผู้เล่น',
        'ใช้ตัวเลือกที่มีในฟอร์ม แต่ความหมายคะแนน/label และเนื้อหาต้องผ่านทีมเนื้อหา ไม่แปลเป็นสุขภาพจิตเอง',
      ],
    ],
    contract:
      'GET /dashboard/journeys พบใน log; GET /dashboard/dialogs และ PUT/DELETE /dashboard/dialogs/:key พบใน catalog; journey/quiz mutation และ CSV contract รอยืนยัน',
  },
  {
    name: 'รหัสเข้าเล่น',
    title: 'F05 · สร้างและจัดการ Join code',
    ref: '00:21 · API 00:48',
    intro: 'สร้างรหัสที่ผูกกับ Journey และจัดการอายุ/จำนวนใช้ตามฟิลด์ที่เห็น',
    nodes: [
      node('เปิด Codes', 'seen', 'มีรายการ Code, Opens, Status, Uses, Expires และการจัดการรหัส'),
      node(
        'เลือก Journey / ตั้งค่า',
        'seen',
        'Custom code ไม่บังคับ; expires in minutes; max uses; ค่า never/unlimited เป็นข้อความที่เห็น ต้องยืนยัน representation ใน API',
      ),
      node(
        'ตรวจเงื่อนไข',
        'proposed',
        'ตรวจค่าและรหัสซ้ำตาม contract; แยกการสร้างกับการเปลี่ยนรหัสเดิม',
        true,
      ),
      node(
        'Create / จัดการรหัส',
        'seen',
        'Create, Edit, Regenerate, Disable, Expire, Delete มีในคลิป; เสนอ confirmation ก่อนคำสั่งที่ตัดสิทธิ์การเข้าเล่น',
      ),
      node(
        'โหลดสถานะล่าสุด',
        'proposed',
        'รอ API ยืนยัน → reload status/uses/expires → แจ้งผล; ไม่เดาสถานะจากค่าที่กรอกอย่างเดียว',
      ),
    ],
    branches: [
      [
        'Regenerate / Disable / Expire / Delete',
        'เปิดรายการเดิม → แจ้งผลกระทบ → ยืนยัน → ส่ง API → โหลดใหม่; ยกเลิกไม่ส่งคำขอ',
      ],
      [
        'รหัสซ้ำ / หมดอายุ / ใช้ครบ',
        'Backend ตรวจและส่งผล → Frontend แสดงข้อความตาม contract; ห้ามสมมติว่ารหัสเก่ายังใช้ได้',
      ],
    ],
    contract:
      'GET/POST /dashboard/codes · PATCH/DELETE /dashboard/codes/:id · POST /dashboard/codes/:id/regenerate — payload สำหรับ disable/expire และผลต่อรหัสเก่ารอยืนยัน',
  },
  {
    name: 'ข้อมูลผู้เล่น',
    title: 'F06 · ตรวจผู้เล่นและปรับความคืบหน้า',
    ref: '00:24–00:30',
    intro: 'ค้นหาผู้เล่น เปิดข้อมูลรายบุคคล และจำกัดการเปลี่ยนข้อมูลไว้ตามสิทธิ์',
    nodes: [
      node(
        'ค้นหา / เลือกผู้เล่น',
        'seen',
        'มี Search by id or name และ Open; เสนอใช้รหัสนามแฝงเป็นหลัก ชื่อที่ค้นได้ต้องยืนยัน',
      ),
      node(
        'ดูรายละเอียด',
        'seen',
        'Journey progress, Quiz attempts, Alerts, Recent events ปรากฏในคลิป',
      ),
      node(
        'ตรวจสิทธิ์การแก้ไข',
        'pending',
        'แยกสิทธิ์ดู/เปลี่ยน/reset/delete; Alerts ในรายละเอียดต้องจำกัดข้อมูลด้วย',
        true,
      ),
      node(
        'เลือกคำสั่ง / ยืนยัน',
        'proposed',
        'Set step / Mark done / Reset / Delete attempt เป็นปุ่มที่เห็น; เสนอ dialog ระบุผู้เล่นและผลกระทบก่อนส่ง',
      ),
      node(
        'Server ยืนยัน / โหลดใหม่',
        'proposed',
        'คงข้อมูลเดิมหากล้มเหลว; เมื่อสำเร็จ reload progress/results และแสดงผลที่ตรวจสอบได้',
      ),
    ],
    branches: [
      ['ค้นหาไม่พบ', 'แสดง empty state → เปลี่ยนคำค้น; ไม่แสดงว่า Server เสีย'],
      [
        'Reset / Delete attempt',
        'ยืนยันรายการและผลกระทบ → ส่งคำขอ; ยกเลิก → กลับรายละเอียดโดยไม่เปลี่ยนข้อมูล',
      ],
      [
        '403 / ข้อมูลถูกเปลี่ยนแล้ว',
        'แจ้งไม่มีสิทธิ์หรือให้โหลดใหม่ตาม error contract; ไม่เขียนทับด้วยข้อมูลเก่าโดยอัตโนมัติ',
      ],
    ],
    contract:
      'GET /dashboard/players พบใน log; endpoint รายละเอียด, progress, reset, delete attempt และขอบเขตข้อมูลรอยืนยัน',
  },
  {
    name: 'ตั้งค่า / ผู้ใช้',
    title: 'F07 · จัดการ Config และบัญชีเจ้าหน้าที่',
    ref: 'Config 00:33 · Users 00:36–00:42',
    intro: 'รวมงานดูแลระบบในเส้นทางเดียว แต่แยกสิทธิ์ Config กับ Manage users and roles',
    nodes: [
      node(
        'เปิด Config หรือ Users',
        'seen',
        'Config มี key/value; Users มีตารางบัญชีและ Roles and permissions',
      ),
      node(
        'ตรวจสิทธิ์งาน',
        'pending',
        'Config: view/change; Users: manage users and roles; Backend ตรวจทุก request',
        true,
      ),
      node(
        'แก้ค่าหรือบัญชี',
        'seen',
        'Config: JSON; Users: username/temp password/role หรือสร้าง role จาก permission groups',
      ),
      node(
        'ตรวจ / ยืนยันผลกระทบ',
        'proposed',
        'ตรวจ JSON และ schema; ยืนยัน reset password/disable/delete/เปลี่ยน role; policy admin คนสุดท้ายรอยืนยัน',
      ),
      node(
        'บันทึก / โหลดสิทธิ์ใหม่',
        'proposed',
        'API ยืนยัน → โหลดข้อมูลใหม่; ถ้าสิทธิ์ผู้ใช้ปัจจุบันเปลี่ยน ต้องทบทวน session และหน้าที่เปิด',
      ),
    ],
    branches: [
      ['Config ไม่ใช่ JSON ที่ถูกต้อง', 'แจ้งจุดผิด → แก้ → บันทึกใหม่; type/range/allowed key ตรวจโดย Backend'],
      [
        'Users: สร้างบัญชี',
        'username + temporary password + role → API → ผลสำเร็จ; ไม่เก็บ/แสดงรหัสผ่านซ้ำใน log',
      ],
      [
        'Users: ลบ/ปิดบัญชีหรือ reset password',
        'dialog ยืนยัน → ส่งคำขอ → reload; นโยบายส่งมอบรหัสชั่วคราวและ revoke session รอยืนยัน',
      ],
    ],
    contract:
      'GET /dashboard/config · PUT/DELETE /dashboard/config/:key; GET /dashboard/users ใน log; user/role mutation, password policy และ session revoke รอยืนยัน',
  },
  {
    name: 'ตรวจ Logs',
    title: 'F08 · ตรวจเหตุการณ์และข้อมูล API',
    ref: '00:45–00:48',
    intro: 'งานตรวจสอบระบบสำหรับผู้ที่ได้รับสิทธิ์ Logs ไม่ใช่หน้ารายงานผลสุขภาวะ',
    nodes: [
      node('เปิด Logs', 'seen', 'มีรายการ request และ API endpoint catalog ในคลิป'),
      node(
        'ตรวจสิทธิ์ / ปกปิดข้อมูล',
        'pending',
        'permission ดู logs/status/events/audit มีใน Users; Backend ต้องไม่ส่ง secret/token หรือข้อมูลเกินสิทธิ์',
        true,
      ),
      node(
        'อ่าน request / status',
        'seen',
        'ตรวจ Method, Path, Status ตามรายการในคลิป; ใช้เวลา server ตาม schema ที่ยืนยัน',
      ),
      node(
        'กรองชื่อ endpoint',
        'seen',
        'ช่อง Filter เช่น journeys ปรากฏใน API catalog; เห็นการแยก Used by game/dashboard',
      ),
      node(
        'ส่งต่อทีมเทคนิค',
        'proposed',
        'บันทึกเวลาและชนิดปัญหาเท่าที่จำเป็น; ไม่คัดลอก credentials หรือข้อมูลเด็กไปในรายงาน',
      ),
    ],
    branches: [
      ['ไม่มีรายการ / กรองไม่พบ', 'แสดง empty state → ล้างตัวกรอง'],
      ['โหลดไม่ได้ / ไม่มีสิทธิ์', 'แสดง error หรือ forbidden ตาม contract; ไม่ fallback ไปข้อมูลที่ไม่มีสิทธิ์'],
    ],
    contract:
      'GET /dashboard/dev/logs · /dashboard/dev/health · /dashboard/dev/endpoints · /dashboard/audit; GET /dashboard/events ใน log — schema, redaction และ retention รอยืนยัน',
  },
];
const workflows = [
  {
    name: 'Login → Dashboard',
    title: 'W01 · การเข้าสู่ระบบและอ่านข้อมูล',
    note: 'ชื่อ auth API ยืนยันจาก 00:48; ลำดับตรวจ session/สิทธิ์/temporary password เป็นข้อเสนอ',
    rows: [
      ['เปิดเว็บ / กรอกข้อมูล', 'ตรวจฟอร์ม → แสดงกำลังเข้าสู่ระบบ', '—', '—'],
      ['—', 'ส่ง POST /dashboard/auth/login →', 'ตรวจตัวตนและสถานะบัญชี →', 'อ่านบัญชีตามระบบจริง'],
      ['—', '← รับผล; ถ้าผ่านเรียก auth/me →', 'ยืนยัน session / ส่งสิทธิ์ตาม contract', '—'],
      [
        'ถ้ารหัสชั่วคราว: เปลี่ยนรหัส',
        'ส่ง auth/change-password →',
        'ตรวจนโยบาย / บันทึก / ส่งผล →',
        'อัปเดตข้อมูลบัญชีตามระบบจริง',
      ],
      ['—', 'อ่านสิทธิ์ → ขอข้อมูลหน้าที่อนุญาต →', 'ตรวจสิทธิ์แต่ละ API →', 'อ่านข้อมูลที่อนุญาต'],
      [
        'เห็นข้อมูล / empty / error',
        '← แสดงข้อมูลเมื่อได้รับผล; ไม่มีสิทธิ์ให้หน้า 403',
        '← ส่งเฉพาะข้อมูลตามสิทธิ์',
        '← ส่งข้อมูลกลับ Backend',
      ],
    ],
    fallback:
      'Login ไม่ผ่าน → กลับฟอร์ม; session หมดอายุ → เคลียร์ข้อมูล → Login; รหัสผ่านชั่วคราวเปลี่ยนไม่สำเร็จ → คงหน้าเปลี่ยนรหัส',
  },
  {
    name: 'Alert → ตอบผู้เล่น',
    title: 'W02 · คำขอช่วยเหลือและการตอบกลับ',
    note: 'เห็นหน้าจอ Alerts 00:12; GET/note/ack/delete API ที่ 00:48; reply และการเชื่อมเกมยังไม่ยืนยัน',
    rows: [
      ['เปิด Alerts', 'GET /dashboard/alerts →', 'ตรวจสิทธิ์ / เลือกข้อมูล →', 'อ่านคำขอที่ผู้ใช้มีสิทธิ์'],
      ['เลือกคำขอจากรหัสนามแฝง', '← แสดงข้อความ / สถานะ / เวลา', '← ส่งรายการที่จำกัดข้อมูล', '← ข้อมูลคำขอ'],
      ['เลือก Save note หรือ Send', 'ตรวจช่อง / ผู้รับ; แยกสองคำสั่งชัดเจน', '—', '—'],
      [
        'ยืนยันการกระทำที่เลือก',
        'ส่ง note API หรือ reply API ที่รอยืนยัน →',
        'ตรวจสิทธิ์และข้อมูลอีกครั้ง →',
        'โน้ต: บันทึก; reply: ส่งผ่านกลไกเกมที่ต้องยืนยัน',
      ],
      [
        '—',
        '← แสดงผลตาม response เท่านั้น',
        '← ส่ง acknowledgement / ข้อผิดพลาด',
        '← ผลการบันทึกหรือส่งที่ระบบรองรับ',
      ],
      [
        'ติดตาม / รับทราบคำขอ',
        'PATCH …/ack ถ้ามีสิทธิ์ → reload',
        'ยืนยันการเปลี่ยนสถานะและ audit ตาม contract',
        'อัปเดตสถานะ; ไม่อนุมานผลการช่วยเหลือ',
      ],
    ],
    fallback:
      'ส่งแล้ว timeout → แสดง “ยังยืนยันผลไม่ได้” → ตรวจสถานะก่อน retry; offline/delivery ต้องตกลงกับทีมเกม; handled ไม่ใช่การยืนยันว่าผู้เล่นอ่านหรือปัญหาจบแล้ว',
  },
  {
    name: 'แก้ไข / ลบข้อมูล',
    title: 'W03 · การเปลี่ยนแปลงข้อมูลอย่างตรวจสอบได้',
    note: 'ปุ่ม mutation เห็นหลายหน้าในคลิป; validation/confirmation/audit policy และ recovery เป็นข้อเสนอที่ต้องตกลง',
    rows: [
      ['เลือก Edit / Reset / Delete ฯลฯ', 'ตรวจสิทธิ์การแสดงปุ่ม → เปิดข้อมูลเป้าหมาย', '—', '—'],
      ['กรอกข้อมูล / ตรวจรายการ', 'validate ตาม schema; แสดงผู้เล่น/รหัส/รายการและผลกระทบ', '—', '—'],
      [
        'ยืนยัน หรือ ยกเลิก',
        'ยกเลิก → จบ; ยืนยัน → ปิดปุ่มระหว่างส่ง →',
        'รับคำขอพร้อม session ตาม contract',
        '—',
      ],
      ['—', '—', 'ตรวจสิทธิ์ / validation / ข้อมูลเวอร์ชัน →', 'บันทึกเฉพาะเมื่อผ่าน; audit ตาม policy ที่ตกลง'],
      ['—', '← รับผลสำเร็จ หรือแสดงข้อผิดพลาด', '← ส่งผลที่ยืนยันได้', '← ผลบันทึก/ลบ'],
      ['เห็นข้อมูลล่าสุด', 'สำเร็จ → reload; ล้มเหลว → คงข้อมูลเดิม', 'ตอบข้อมูลใหม่ตามสิทธิ์ →', 'อ่านข้อมูลล่าสุด'],
    ],
    fallback:
      'ไม่แสดง success ก่อน Server ยืนยัน; timeout ไม่รู้ผล → อ่านสถานะก่อน retry; การป้องกันซ้ำ/concurrent edit ต้องมี contract ฝั่ง Backend',
  },
];
const permissions = [
  ['Overview', 'ดู summary', '—'],
  ['Journeys', 'ดู journeys, quizzes, dialogs', 'สร้าง/แก้ไข/ลบ; ดู progress และดาวน์โหลด CSV'],
  ['Codes', 'ดู join codes', 'สร้าง/แก้ไข/ลบ join codes'],
  ['Players', 'ดูผู้เล่นและ progress', 'เปลี่ยน/reset progress และลบข้อมูลผู้เล่น'],
  ['Alerts', 'ดู help requests', 'เพิ่มโน้ต, mark handled, ลบและตอบ'],
  ['Config', 'ดู game config', 'เปลี่ยน game config'],
  ['Logs', 'ดู logs, status, events, audit', 'ไม่มีสิทธิ์เขียนแสดงในกลุ่มนี้'],
  ['Users', 'จัดการ users and roles', 'สิทธิ์จัดการรวม; รายละเอียดย่อยรอยืนยัน'],
];
const apiRows = [
  [
    'Login / session',
    'POST /dashboard/auth/login\nGET /dashboard/auth/me\nPOST /dashboard/auth/change-password',
    'payload, expiry, logout/revoke, temporary password flag',
  ],
  [
    'Overview (log 00:45)',
    'GET /dashboard/stats\nGET /dashboard/submissions\nGET /dashboard/events\nGET /dashboard/players',
    'นิยามตัวเลข, response, pagination, timezone',
  ],
  [
    'Alerts',
    'GET /dashboard/alerts\nPATCH /dashboard/alerts/:id/note\nPATCH /dashboard/alerts/:id/ack\nDELETE /dashboard/alerts/:id',
    'reply endpoint, note visibility, ack semantics, delivery',
  ],
  [
    'Journeys / Dialogs',
    'GET /dashboard/journeys (log)\nGET /dashboard/dialogs\nPUT /dashboard/dialogs/:key\nDELETE /dashboard/dialogs/:key',
    'journey/quiz CRUD, progress, CSV และ schema',
  ],
  [
    'Codes',
    'GET, POST /dashboard/codes\nPATCH, DELETE /dashboard/codes/:id\nPOST /dashboard/codes/:id/regenerate',
    'disable/expire payload, duplicate code, code เก่า',
  ],
  [
    'Config',
    'GET /dashboard/config\nPUT, DELETE /dashboard/config/:key',
    'key/type/range allowlist และผลต่อเกม',
  ],
  [
    'Users / Players',
    'GET /dashboard/users (log)\nGET /dashboard/players (log)',
    'user/role mutations, player detail/reset และ permission keys',
  ],
  [
    'Logs / Audit',
    'GET /dashboard/dev/logs\nGET /dashboard/dev/health\nGET /dashboard/dev/endpoints\nGET /dashboard/audit',
    'redaction, audit events, retention, pagination',
  ],
];
const questions = [
  [
    'P0 · Auth',
    'token/session ใช้อย่างไร หมดอายุเมื่อไร และ logout/revoke ผ่านอะไร? temporary password บังคับเปลี่ยนหรือแค่เตือน?',
    'Backend',
  ],
  [
    'P0 · Permissions',
    'permission keys คืออะไร? ใครเห็น Alerts และ team note ใน Overview/Players/export/logs ได้บ้าง?',
    'Backend + เจ้าของข้อมูล/โครงการ',
  ],
  [
    'P0 · Reply',
    'API ตอบผู้เล่นคืออะไร? ผูกผู้รับกับ alert อย่างไร? offline/timeout/ส่งซ้ำ/ส่งถึง/อ่านแล้วแยกได้แค่ไหน?',
    'Backend + ทีมเกม',
  ],
  [
    'P0 · Contract',
    'ขอ OpenAPI หรือ request/response ตัวอย่างที่ไม่มีข้อมูลจริง พร้อม error codes และข้อมูลทดสอบ',
    'Backend',
  ],
  [
    'P1 · Content',
    'schema journey/quiz/CSV คืออะไร? แก้/ลบเนื้อหามีผลต่อผู้เล่นที่ค้างอยู่หรือไม่?',
    'Backend + ทีมเนื้อหา',
  ],
  [
    'P1 · Mutations',
    'regenerate/expire/disable/reset/delete ย้อนกลับได้หรือไม่? เก็บ audit อย่างไร?',
    'Backend + ผู้ดูแลโครงการ',
  ],
  [
    'P1 · Data',
    'ความหมาย unread/handled คืออะไร? pagination/filter/search/timezone และเวลาที่ข้อมูลอัปเดตล่าสุดคืออะไร?',
    'Backend',
  ],
  [
    'P1 · Accounts',
    'นโยบายรหัสผ่าน ส่งมอบรหัสชั่วคราว และการป้องกันปิด admin คนสุดท้ายเป็นอย่างไร?',
    'Backend + ผู้ดูแลระบบ',
  ],
];
const acceptance = [
  'ไม่มี session หรือ session หมดอายุ → ไม่แสดงข้อมูลเดิม และกลับ Login',
  'API ปฏิเสธผู้ไม่มีสิทธิ์ แม้เรียกตรงโดยไม่ผ่านปุ่ม Frontend',
  'temporary password และ password policy ทำงานตรงตาม contract ที่ยืนยัน',
  'แยกโน้ตทีมกับข้อความถึงผู้เล่นทั้งช่อง ปุ่ม และผลลัพธ์',
  'mutation แสดงสำเร็จหลัง Server ยืนยัน; timeout ตรวจผลก่อนส่งซ้ำ',
  'กดยกเลิก delete/reset/regenerate ไม่ส่งคำขอเปลี่ยนข้อมูล',
  'มี loading/empty/error/forbidden และใช้ keyboard/หน้าจอเล็กได้',
  'Overview/Players/export/logs ไม่เผยข้อมูลขอความช่วยเหลือเกินสิทธิ์',
];
const pages = {
  overview: 'ภาพรวม',
  userflow: 'User flow',
  workflow: 'Workflow',
  screens: 'หน้าจอ & สิทธิ์',
  prototype: 'ทดลอง Login',
  evidence: 'หลักฐาน & ส่งต่อ',
};
function showPage(id, scroll = true) {
  if (!pages[id]) id = 'overview';
  $$('.tab-panel').forEach((el) => (el.hidden = el.id !== id + '-section'));
  $$('.nav button').forEach((b) => {
    if (b.dataset.page === id) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  $('#breadcrumb').textContent = pages[id];
  try {
    history.replaceState(null, '', '#' + id);
  } catch {}
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
}
$$('.nav button').forEach((b) => b.addEventListener('click', () => showPage(b.dataset.page)));
$$('[data-go]').forEach((b) => b.addEventListener('click', () => showPage(b.dataset.go)));
$('#menu-map').innerHTML = screens
  .map(
    (s, i) =>
      /* HTML */ `<button class="menu-card" data-screen="${s.id}">
        <span class="num">0${i + 1} / MODULE</span><strong>${s.name}</strong><small>${s.thai}</small
        ><span class="time">${s.time} ↗</span>
      </button>`,
  )
  .join('');
$$('[data-screen]').forEach((b) =>
  b.addEventListener('click', () => {
    showScreen(screens.findIndex((s) => s.id === b.dataset.screen));
    showPage('screens');
  }),
);
function flowMarkup(f, print = false) {
  return /* HTML */ `<div class="${print ? 'flow-print' : ''}">
    <div class="flow-head">
      <div>
        <h3>${f.title}</h3>
        <p>${f.intro}</p>
      </div>
      <span class="badge seen">${f.ref}</span>
    </div>
    <div class="flow-chain">
      ${f.nodes.map((n, i) => `<${print ? 'div' : 'button'} class="flow-node ${n.decision ? 'decision' : ''}" ${print ? '' : `data-node="${i}" aria-pressed="${i === 0}"`}><span class="step">0${i + 1} ${n.decision ? '◇ DECISION' : ''}</span><strong>${n.title}</strong>${badge(n.type)}</${print ? 'div' : 'button'}>`).join('')}
    </div>
    ${
      print
        ? /* HTML */ `<ol class="plain-list">
            ${f.nodes.map((n) => /* HTML */ `<li><strong>${n.title}:</strong> ${n.detail}</li>`).join('')}
          </ol>`
        : '<div class="flow-detail" id="node-detail" aria-live="polite"></div>'
    }
    <div class="branches">
      ${f.branches.map((b) => /* HTML */ `<div class="branch"><strong>↳ ${b[0]}</strong>${b[1]}</div>`).join('')}
    </div>
    <div class="contract"><strong>API / Integration</strong><br />${esc(f.contract)}</div>
  </div>`;
}
function showFlow(i) {
  $('#flow-tabs').innerHTML = flows
    .map(
      (f, j) =>
        /* HTML */ `<button class="chip" aria-pressed="${i === j}" data-flow="${j}">
          ${String(j + 1).padStart(2, '0')} · ${f.name}
        </button>`,
    )
    .join('');
  $('#flow-content').innerHTML = flowMarkup(flows[i]);
  const setNode = (n) => {
    const item = flows[i].nodes[n];
    $$('#flow-content [data-node]').forEach((b) =>
      b.setAttribute('aria-pressed', b.dataset.node == n),
    );
    $('#node-detail').innerHTML = /* HTML */ `<div>
        <div class="eyebrow">STEP ${String(n + 1).padStart(2, '0')}</div>
        <strong>${item.title}</strong>
      </div>
      <p>${item.detail}</p>`;
  };
  setNode(0);
  $$('[data-flow]').forEach((b) => (b.onclick = () => showFlow(+b.dataset.flow)));
  $$('[data-node]').forEach((b) => (b.onclick = () => setNode(+b.dataset.node)));
}
function workflowMarkup(w, print = false) {
  return /* HTML */ `<div class="${print ? 'flow-print' : ''}">
    <div class="flow-head">
      <div>
        <h3>${w.title}</h3>
        <p>${w.note}</p>
      </div>
      ${badge('proposed')}
    </div>
    <div class="table-wrap">
      <table class="data-table lane-table">
        <thead>
          <tr>
            <th>#</th>
            <th>เจ้าหน้าที่</th>
            <th>Web Frontend</th>
            <th>Backend API</th>
            <th>ข้อมูล / ระบบเกม</th>
          </tr>
        </thead>
        <tbody>
          ${w.rows
            .map(
              (r, i) =>
                /* HTML */ `<tr>
                  <td>0${i + 1}</td>
                  ${r.map((v, j) => /* HTML */ `<td>${v === '—' ? '<span class="lane-none">—</span>' : /* HTML */ `<div class="lane-cell ${j === 1 ? 'active' : ''}">${esc(v)}</div>`}</td>`).join('')}
                </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="callout"><b>เส้นทางเมื่อไม่สำเร็จ</b>${w.fallback}</div>
  </div>`;
}
function showWorkflow(i) {
  $('#workflow-tabs').innerHTML = workflows
    .map(
      (w, j) =>
        /* HTML */ `<button class="chip" aria-pressed="${i === j}" data-work="${j}">
          ${w.name}
        </button>`,
    )
    .join('');
  $('#workflow-content').innerHTML = workflowMarkup(workflows[i]);
  $$('[data-work]').forEach((b) => (b.onclick = () => showWorkflow(+b.dataset.work)));
}
function specMarkup(s) {
  return /* HTML */ `<dl class="spec-list">
    <dt>ฟิลด์ / ส่วนแสดงผล</dt>
    <dd>${s.fields}</dd>
    <dt>การกระทำ</dt>
    <dd>${s.actions}</dd>
    <dt>สิทธิ์ที่เห็น</dt>
    <dd>${s.permission}</dd>
    <dt>ขอบเขต / ข้อยืนยัน</dt>
    <dd>${s.boundary}</dd>
  </dl>`;
}
function showScreen(i) {
  const s = screens[i];
  $('#screen-tabs').innerHTML = screens
    .map(
      (s, j) =>
        /* HTML */ `<button class="chip" aria-pressed="${i === j}" data-spec="${j}">
          ${s.name}
        </button>`,
    )
    .join('');
  $('#screen-detail').innerHTML = /* HTML */ `<div class="wire-shell">
      <div class="wire-sidebar">
        <b>SAFE SPACE</b
        >${screens.map((x, j) => /* HTML */ `<div class="${i === j ? 'on' : ''}">${x.name}</div>`).join('')}
      </div>
      <div class="wire-content">
        <div class="wire-top">
          <strong>${s.name}</strong><span class="badge proposed">Wireframe</span>
        </div>
        <div class="wire-banner">คำเตือนรหัสผ่านเริ่มต้น · เห็นในคลิป</div>
        ${i === 0 ? '<div class="wire-stat"><span><b>—</b>Players</span><span><b>—</b>Quizzes</span><span><b>—</b>Submissions</span><span><b>—</b>Unread alerts</span></div>' : ''}${s.blocks.map((b) => /* HTML */ `<div class="wire-block">${b}</div>`).join('')}
      </div>
    </div>
    <div class="flow-head">
      <h3>${s.name} · ${s.thai}</h3>
      <span class="badge seen">${s.time}</span>
    </div>
    ${specMarkup(s)}`;
  $$('[data-spec]').forEach((b) => (b.onclick = () => showScreen(+b.dataset.spec)));
}
$('#permission-rows').innerHTML = permissions
  .map(
    (r) =>
      /* HTML */ `<tr>
        ${r.map((c) => /* HTML */ `<td>${c}</td>`).join('')}
      </tr>`,
  )
  .join('');
$('#evidence-timeline').innerHTML =
  screens
    .map(
      (s) =>
        /* HTML */ `<article class="evidence-card">
          <div class="time">${s.time}</div>
          <h3>${s.name}</h3>
          <p>${s.actions}</p>
        </article>`,
    )
    .join('') +
  '<article class="evidence-card"><div class="time">00:48 · API CATALOG</div><h3>Login ไม่ได้ถูกสาธิต</h3><p>พบชื่อ auth/login, auth/me และ auth/change-password แต่ไม่เห็นหน้า Login หรือ schema ของคำตอบ</p></article>';
$('#api-rows').innerHTML = apiRows
  .map(
    (r) =>
      /* HTML */ `<tr>
        <td>${r[0]}</td>
        <td><code>${esc(r[1]).replace(/\n/g, '<br>')}</code></td>
        <td>${r[2]}</td>
      </tr>`,
  )
  .join('');
$('#question-rows').innerHTML = questions
  .map(
    (r) =>
      /* HTML */ `<tr>
        ${r.map((c) => /* HTML */ `<td>${c}</td>`).join('')}
      </tr>`,
  )
  .join('');
$('#acceptance-list').innerHTML = acceptance
  .map(
    (v, i) =>
      /* HTML */ `<label><input type="checkbox" data-check="${i}" /><span>${v}</span></label>`,
  )
  .join('');
$$('[data-check]').forEach(
  (c) =>
    (c.onchange = () =>
      ($('#review-status').textContent =
        `ทบทวนแล้ว ${$$('[data-check]:checked').length} / ${acceptance.length} ข้อ`)),
);
$('#all-flows-print').innerHTML = flows.map((f) => flowMarkup(f, true)).join('');
$('#all-workflows-print').innerHTML = workflows.map((w) => workflowMarkup(w, true)).join('');
$('#all-screens-print').innerHTML = screens
  .map(
    (s) =>
      /* HTML */ `<article class="screen-print">
        <h3>${s.name} · ${s.thai} <span class="badge seen">${s.time}</span></h3>
        ${specMarkup(s)}
      </article>`,
  )
  .join('');
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = $$('details').map((d) => d.open);
  $$('details').forEach((d) => (d.open = true));
});
window.addEventListener('afterprint', () =>
  $$('details').forEach((d, i) => (d.open = printDetails[i])),
);
$('#print-btn').onclick = () => window.print();
let demoTimer = null,
  demoVersion = 0;
function cancelDemo() {
  clearTimeout(demoTimer);
  demoVersion++;
}
const cover = /* HTML */ `<div class="proto-cover">
  <div>
    <div class="seal">ROBLOX SAFE SPACE / STAFF ACCESS</div>
    <h3>พื้นที่ปลอดภัย<br />เริ่มจากการดูแลที่ใส่ใจ</h3>
    <p>แดชบอร์ดสำหรับเจ้าหน้าที่ เพื่อจัดการกิจกรรมและติดตามข้อมูลตามสิทธิ์ที่ได้รับ</p>
    <div class="cover-drawing" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </div>
  <p class="cover-foot">สำหรับเจ้าหน้าที่ที่ได้รับอนุญาต<br />แบบหน้าจอที่เสนอ · ใช้ข้อมูลสมมติ</p>
</div>`;
function message(text, kind = 'error') {
  const el = $('#demo-message');
  el.className = 'proto-result ' + kind;
  el.textContent = text;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}
function renderLogin(expired = false) {
  cancelDemo();
  $('#prototype-view').innerHTML =
    cover +
    /* HTML */ `<div class="proto-card">
      <span class="badge proposed">ตัวอย่างหน้าจอ · ไม่เชื่อม Server</span>
      <h3 class="u-mt-14">เข้าสู่ระบบ</h3>
      <p>ใช้บัญชีจำลองสำหรับทดสอบเส้นทาง</p>
      <form id="login-form" novalidate>
        <label class="field-label" for="demo-user"
          >ชื่อผู้ใช้<input
            id="demo-user"
            name="demo-username"
            value="demo"
            autocomplete="off"
            spellcheck="false"
            aria-describedby="demo-message" /></label
        ><label class="field-label" for="demo-password"
          >รหัสผ่าน
          <div class="password-line">
            <input
              id="demo-password"
              name="demo-password"
              type="password"
              value="demo-only"
              autocomplete="off"
              aria-describedby="demo-message"
            /><button
              type="button"
              class="btn"
              id="toggle-password"
              aria-label="แสดงรหัสผ่าน"
              aria-pressed="false"
            >
              แสดง
            </button>
          </div></label
        ><button class="btn primary" id="login-submit" type="submit">เข้าสู่ระบบ →</button>
      </form>
      <div class="proto-result" id="demo-message" aria-live="polite"></div>
      <p class="small muted u-mt-18">หากเข้าใช้งานจริงไม่ได้ ให้ติดต่อผู้ดูแลบัญชีตามช่องทางที่โครงการกำหนด</p>
    </div>`;
  if (expired) message('Session จำลองหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
  $('#toggle-password').onclick = () => {
    const inp = $('#demo-password'),
      show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    $('#toggle-password').textContent = show ? 'ซ่อน' : 'แสดง';
    $('#toggle-password').setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
    $('#toggle-password').setAttribute('aria-pressed', String(show));
  };
  $('#login-form').onsubmit = (e) => {
    e.preventDefault();
    const user = $('#demo-user'),
      pass = $('#demo-password');
    if (!user.value.trim() || !pass.value) {
      message('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบ');
      (!user.value.trim() ? user : pass).focus();
      return;
    }
    if (user.value !== 'demo' || pass.value !== 'demo-only') {
      message('ต้นแบบนี้ใช้เฉพาะ demo / demo-only กรุณาอย่าใช้บัญชีจริง');
      return;
    }
    const scenario = $('#scenario').value,
      version = demoVersion;
    $('#login-submit').disabled = true;
    $('#login-submit').textContent = 'กำลังเข้าสู่ระบบ…';
    message('กำลังจำลองการตรวจสอบบัญชี', '');
    demoTimer = setTimeout(() => {
      if (version !== demoVersion) return;
      $('#login-submit').disabled = false;
      $('#login-submit').textContent = 'เข้าสู่ระบบ →';
      if (scenario === 'invalid') message('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง');
      else if (scenario === 'network') message('ยังเชื่อมต่อระบบไม่ได้ กรุณาลองอีกครั้ง');
      else if (scenario === 'temporary') renderChange();
      else if (scenario === 'forbidden') renderDenied();
      else renderHome(scenario === 'expired');
    }, 550);
  };
}
function renderChange() {
  cancelDemo();
  $('#prototype-view').innerHTML =
    cover +
    /* HTML */ `<div class="proto-card">
      <span class="badge pending">เสนอบังคับเปลี่ยนก่อนเข้าข้อมูล</span>
      <h3 class="u-mt-14">ตั้งรหัสผ่านใหม่</h3>
      <p>บัญชีนี้ใช้รหัสผ่านชั่วคราว ขั้นตอนนี้ต้องให้ Backend ยืนยันนโยบายและบังคับใช้</p>
      <form id="change-form" novalidate>
        <label class="field-label" for="new-password"
          >รหัสผ่านใหม่จำลอง<input
            id="new-password"
            type="password"
            autocomplete="off"
            placeholder="ใช้ demo-new-only"
            aria-describedby="demo-message" /></label
        ><label class="field-label" for="confirm-password"
          >ยืนยันรหัสผ่านจำลอง<input
            id="confirm-password"
            type="password"
            autocomplete="off"
            aria-describedby="demo-message" /></label
        ><button class="btn primary" type="submit" id="change-submit">บันทึกและเข้าสู่ Dashboard</button
        ><button class="btn" type="button" id="back-login">กลับหน้า Login</button>
      </form>
      <div class="proto-result" id="demo-message" aria-live="polite"></div>
    </div>`;
  $('#back-login').onclick = () => renderLogin();
  $('#change-form').onsubmit = (e) => {
    e.preventDefault();
    const a = $('#new-password').value,
      b = $('#confirm-password').value;
    if (!a || !b) {
      message('กรุณากรอกรหัสผ่านใหม่และยืนยันให้ครบ');
      return;
    }
    if (a !== b) {
      message('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    if (a !== 'demo-new-only') {
      message('ใช้ demo-new-only สำหรับต้นแบบนี้เท่านั้น นโยบายจริงรอทีมยืนยัน');
      return;
    }
    $('#change-submit').disabled = true;
    $('#back-login').disabled = true;
    message('กำลังจำลองการบันทึก…', '');
    const v = demoVersion;
    demoTimer = setTimeout(() => {
      if (v === demoVersion) renderHome(false, true);
    }, 550);
  };
}
function renderDenied() {
  cancelDemo();
  $('#prototype-view').innerHTML =
    cover +
    /* HTML */ `<div class="proto-card">
      <span class="badge pending">403 · สถานการณ์จำลอง</span>
      <h3 class="u-mt-14">ยังไม่มีสิทธิ์เข้าถึง</h3>
      <p>เข้าสู่ระบบได้ แต่บัญชีนี้ยังไม่มีสิทธิ์เปิดหน้าข้อมูล กรุณาติดต่อผู้ดูแลบัญชี</p>
      <button class="btn primary" id="denied-out">ออกจากระบบจำลอง</button>
      <p class="small muted u-mt-18">ไม่แสดงข้อมูล Dashboard ให้บัญชีที่ไม่มีสิทธิ์</p>
    </div>`;
  $('#denied-out').onclick = () => renderLogin();
}
function renderHome(expire = false, changed = false) {
  cancelDemo();
  $('#prototype-view').innerHTML = /* HTML */ `<div class="mock-home">
    <div class="mock-header">
      <div>
        <div class="eyebrow">DEMO / OVERVIEW</div>
        <h3>ภาพรวม Dashboard</h3>
        <p class="small muted">บัญชี demo · ข้อมูลด้านล่างเป็นตัวอย่างที่สร้างขึ้น</p>
      </div>
      <button class="btn" id="demo-signout">ออกจากระบบ</button>
    </div>
    <div class="proto-result success" role="status">
      ${changed ? 'จำลองการเปลี่ยนรหัสผ่านสำเร็จ → เข้าสู่หน้าที่มีสิทธิ์' : 'เข้าสู่ระบบจำลองสำเร็จ → ตรวจสิทธิ์ → เปิด Overview'}
    </div>
    <div class="mock-metrics">
      <div><strong>8</strong>Players · สมมติ</div>
      <div><strong>3</strong>Quizzes · สมมติ</div>
      <div><strong>24</strong>Submissions · สมมติ</div>
      <div><strong>2</strong>Unread alerts · สมมติ</div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Recent results</th>
            <th>Quiz</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>p_demo_001</td>
            <td>กิจกรรมตัวอย่าง</td>
            <td>answered</td>
          </tr>
          <tr>
            <td>p_demo_002</td>
            <td>แบบทดสอบตัวอย่าง</td>
            <td>1/2</td>
          </tr>
        </tbody>
      </table>
    </div>
    ${expire ? '<button class="btn primary" id="expire-session">จำลอง Session หมดอายุ →</button>' : '<button class="btn" id="go-screens">ดูแบบหน้าจอทั้ง 8 เมนู →</button>'}
    <p class="small muted u-mt-16">แสดงเฉพาะตัวอย่างปลายทาง Login ไม่มีข้อมูลผู้เล่นจริง และไม่ได้ส่งคำขอ API</p>
  </div>`;
  $('#demo-signout').onclick = () => renderLogin();
  if (expire) $('#expire-session').onclick = () => renderLogin(true);
  else $('#go-screens').onclick = () => showPage('screens');
}
$('#scenario').onchange = () => renderLogin();
$('#reset-demo').onclick = () => renderLogin();
showFlow(0);
showWorkflow(0);
showScreen(0);
renderLogin();
showPage(location.hash.slice(1) || 'overview', false);
window.addEventListener('hashchange', () => showPage(location.hash.slice(1), false));
