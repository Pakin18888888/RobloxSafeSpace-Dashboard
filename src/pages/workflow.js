const workflows = [
  {
    title: '01 · Authentication',
    note: 'ชื่อ auth/login, auth/me และ change-password พบในคลิป; schema/session/enforcement ยังไม่ยืนยัน',
    rows: [
      ['กรอก Username / Password', 'ตรวจช่องกรอก → ปิด submit ซ้ำ', '—', '—'],
      ['—', 'POST auth/login →', 'ตรวจบัญชี/สถานะ/รหัสผ่าน →', 'อ่านบัญชีตามกลไกที่มีจริง'],
      [
        '—',
        '← รับผล; เรียก auth/me ตาม contract →',
        'ยืนยัน session และสิทธิ์ →',
        'อ่าน role/permission ที่อนุญาต',
      ],
      [
        'หากใช้รหัสชั่วคราว: เปลี่ยนรหัส',
        'แสดง change-password → ส่งคำขอ →',
        'ตรวจ policy; บันทึกเมื่อถูกต้อง →',
        'อัปเดตรหัสผ่านตามระบบจริง',
      ],
      [
        'เห็นหน้าแรกตามสิทธิ์',
        '← ตรวจสิทธิ์จาก response; render หน้าที่อนุญาต',
        '← ส่ง safe response; ไม่ส่ง secret',
        '← ยืนยันผล',
      ],
    ],
    error: 'Login ไม่ผ่าน → ฟอร์มและข้อความทั่วไป; ไม่มีสิทธิ์ → Access denied; เปลี่ยนรหัสล้มเหลว → คงหน้าเดิม',
  },
  {
    title: '02 · Dashboard data',
    note: 'stats/players/submissions/events พบใน request log; response fields และนิยามตัวเลขยังต้องยืนยัน',
    rows: [
      [
        'เปิด Overview',
        'แสดง loading → ขอข้อมูลตามสิทธิ์ →',
        'ตรวจ session/authorization →',
        'อ่านข้อมูลที่มีสิทธิ์',
      ],
      ['—', '—', 'คำนวณ/จำกัดข้อมูลตาม contract ←', '← ส่งข้อมูลกิจกรรม'],
      ['—', '← รับข้อมูล / normalize / ตรวจ shape', '← ส่ง summary/results/events ที่อนุญาต', '—'],
      [
        'อ่าน metrics / chart / tables',
        'render ค่าและ timestamp; กราฟใช้ dataset เดียวกับตาราง',
        '—',
        '—',
      ],
    ],
    error:
      'ไม่มีข้อมูล → Empty; โหลดล้มเหลว → Error + Retry; partial/stale data ต้องระบุชัด; ไม่แสดงเนื้อหา Alerts ใน Analytics',
  },
  {
    title: '03 · Search & filter',
    note: 'ในต้นแบบกรองข้อมูลในหน่วยความจำ; server query/pagination contract ยังรอยืนยัน',
    rows: [
      [
        'พิมพ์คำค้น / เลือกสถานะหรือวันที่',
        'validate ตัวกรอง; reset page/cursor →',
        'ตรวจสิทธิ์และ query ที่รองรับ →',
        'ค้นหาเฉพาะข้อมูลที่อนุญาต',
      ],
      [
        'เปลี่ยนคำค้นระหว่างรอ',
        'ยกเลิก/ไม่รับผลของคำขอเก่า',
        'ส่งผลตาม request ที่เกี่ยวข้อง ←',
        '← ส่งข้อมูลและ pagination metadata',
      ],
      ['อ่านผลลัพธ์', '← แสดงเฉพาะผลของคำขอล่าสุด', '← response ที่กรองแล้ว', '—'],
      ['ไม่พบข้อมูล: เปลี่ยนคำค้น', 'Empty state + คงตัวกรองที่ใช้', '—', '—'],
    ],
    error:
      'Request เก่าห้ามเขียนทับผลใหม่; error ไม่แสดงว่าไม่มีข้อมูล; mock filtering ไม่ใช่หลักฐานว่า API รองรับ filter เดียวกัน',
  },
  {
    title: '04 · Create / update / delete',
    note: 'UI มี confirmation และ mock mutation; payload/business rules/concurrency ต้องใช้ contract จริง',
    rows: [
      ['สร้าง / แก้ไขรายการ', 'validate ฟอร์ม; เก็บ draft ในหน้าปัจจุบัน', '—', '—'],
      [
        'ตรวจเป้าหมายและผลกระทบ',
        'เปิด confirmation → ยกเลิกจบ / ยืนยันส่งคำขอ →',
        'ตรวจสิทธิ์และ payload →',
        'ตรวจข้ออ้างอิง/เวอร์ชันตามระบบ',
      ],
      ['—', 'ปิด submit ระหว่างรอ', 'ถ้าผ่าน → บันทึกการเปลี่ยนแปลง →', 'บันทึกข้อมูล + audit ตาม policy'],
      ['—', '← รับ success ที่ยืนยันได้; reload รายการ', '← ส่งผลบันทึกหรือ safe error', '← ยืนยันผล'],
      ['เห็นข้อมูลใหม่ / แก้ไขข้อผิดพลาด', 'success เมื่อ Backend ยืนยัน; error คง draft', '—', '—'],
    ],
    error:
      'Validation ไม่ผ่าน → ชี้ฟิลด์; conflict → โหลดใหม่; Cancel ไม่ส่ง mutation; timeout ไม่ retry อัตโนมัติ',
  },
  {
    title: '05 · Permissions management',
    note: 'Admin พบในคลิป; role names อื่นและ UI permission keys เป็นข้อเสนอ ไม่ใช่ server schema',
    rows: [
      ['ผู้ดูแลเปิด Users', 'ขอ staff/role catalog →', 'ตรวจ Manage users and roles →', 'อ่านสิทธิ์ปัจจุบัน'],
      [
        'เลือกบัญชีและบทบาท',
        'แสดง permission matrix และผลกระทบ → ยืนยัน →',
        'ตรวจสิทธิ์ผู้กระทำ/การมอบสิทธิ์/ข้อจำกัด →',
        'ตรวจบัญชีและ role',
      ],
      [
        '—',
        'รอผล ไม่เปลี่ยน UI เป็นสำเร็จล่วงหน้า',
        'บันทึกบทบาท; audit; จัดการ sessions ตาม policy →',
        'อัปเดตบทบาทที่ยืนยัน',
      ],
      ['เห็นบทบาทใหม่', '← reload permissions และ route ที่ยังใช้ได้', '← response ตามสิทธิ์ใหม่', '← ยืนยันผล'],
    ],
    error:
      'ไม่มีสิทธิ์ → Forbidden; การซ่อนปุ่มไม่แทน authorization; self/last-admin/revoke policies ต้องให้ Backend ยืนยัน',
  },
  {
    title: '06 · Logout & session expiry',
    note: 'เห็น Sign out ในคลิป แต่ยังไม่พบ logout/revoke endpoint ที่ยืนยันได้',
    rows: [
      [
        'เลือก Logout',
        'มี draft → เตือน; ถ้ายืนยัน → จบ session ตาม contract →',
        'เพิกถอน/จบ session ตามวิธีที่ยืนยัน →',
        'อัปเดต session store ถ้ามี',
      ],
      ['—', '← ยกเลิกคำขอค้าง / ล้าง state และข้อมูลหน้าจอ', '← ส่งผลการจบ session', '← ยืนยันผล'],
      ['เห็นหน้า Login', 'เปลี่ยนเส้นทาง; Back ต้องไม่เผยข้อมูลเก่า', '—', '—'],
      [
        'Session หมดอายุระหว่างงาน',
        'รับ unauthenticated → ล้างข้อมูล → Login',
        'ตรวจ expiry ทุก request; ปฏิเสธคำขอหมดอายุ',
        'ไม่แก้ไขข้อมูลหากไม่ผ่านสิทธิ์',
      ],
    ],
    error:
      'ถ้าการ revoke ไม่สำเร็จ ต้องออกแบบผลลัพธ์ตาม contract; การล้าง state ฝั่ง client ไม่รับรองว่าถอน session ฝั่ง Server แล้ว',
  },
];
function markup(w) {
  return /* HTML */ `<article>
    <div class="row between u-m-20-0">
      <h2>${w.title}</h2>
      <span class="badge amber">Backend: Not Verified</span>
    </div>
    <p class="small muted u-mb-16">${w.note}</p>
    <div class="card">
      <div class="table-scroll">
        <table class="data-table workflow-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Admin</th>
              <th>Frontend</th>
              <th>Backend API</th>
              <th>Database</th>
            </tr>
          </thead>
          <tbody>
            ${w.rows
              .map(
                (r, i) =>
                  /* HTML */ `<tr>
                    <td>${i + 1}</td>
                    ${r.map((v) => /* HTML */ `<td>${v}</td>`).join('')}
                  </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="notice amber u-mt-16">${w.error}</div>
  </article>`;
}
function show(i) {
  document.getElementById('tabs').innerHTML = workflows
    .map(
      (w, j) =>
        /* HTML */ `<button class="filter-tab" aria-pressed="${i === j}" data-tab="${j}">
          ${w.title}
        </button>`,
    )
    .join('');
  document.getElementById('current').innerHTML = markup(workflows[i]);
  document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => show(+b.dataset.tab)));
}
show(0);
document.getElementById('all-print').innerHTML = workflows
  .map((w) => /* HTML */ `<div class="wf-print">${markup(w)}</div>`)
  .join('');
document.getElementById('print-workflows').addEventListener('click', () => window.print());
