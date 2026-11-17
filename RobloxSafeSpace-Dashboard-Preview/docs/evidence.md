# หลักฐานและขอบเขตการตีความ

จัดทำ: 16 พฤศจิกายน 2026 · สถานะ: Draft for team review

แหล่งหลัก: `C:/Users/pakin/Downloads/2026-11-13 16-47-46.mp4` ระยะเวลา 50.15 วินาที ความละเอียด 2560 × 1600 ตรวจภาพ overview ทุก 3 วินาทีและภาพขยายของส่วนที่เกี่ยวข้อง เวลาในตารางเป็นจุดอ้างอิงโดยประมาณ ไม่ได้ยืนยันเวลาที่แต่ละหน้าปรากฏครั้งแรก

ภาพแนบงาน Asana ระบุ Dashboard Login Page และงานย่อย Userflow/Workflow กับ Dashboard ใช้เพื่อระบุบริบทของคำขอ ไม่มีการแก้ไข Asana หรือส่งข้อความให้บุคคลอื่น

## สิ่งที่เห็นในคลิป

| เวลา | หน้าจอ | หลักฐานที่สังเกตได้ | ข้อจำกัด |
|---|---|---|---|
| 00:03–00:09 | Overview | 8 เมนู, ตัวเลข players/quizzes/submissions/unread alerts, Recent results, Players, Activity, banner default password | ตัวเลขเป็นข้อมูลเดโมในคลิป ไม่ใช่ผลโครงการ; ไม่เห็น filter วันที่ |
| 00:12 | Alerts | ข้อความ pseudonymous mode; alert สถานะ handled; team note และ Save note; reply in game และ Send; Refresh; Delete | ข้อความระบุว่าทุกคนบน dashboard เห็น team note; ไม่เห็นการส่งจริง/การส่งถึงผู้เล่น; ไม่เห็นปุ่ม ack ในภาพนี้ แต่มี endpoint และ permission |
| 00:15–00:18 | Journeys | รายการ journey; Progress/Edit/Delete; New journey; ข้อความเมื่อคุย NPC ผิดลำดับ/จบขั้น/จบ journey; value labels; toggle แสดง totals; CSV columns; NPC ID และ dialog | เห็นแบบฟอร์มและสิทธิ์ quizzes/dialogs; ไม่เห็นการ create/update สำเร็จหรือดาวน์โหลด CSV จริง |
| 00:21 | Codes | Journey, custom code, expires in minutes, max uses; Create; Edit/Regenerate/Disable/Expire/Delete; live status และจำนวน uses | ไม่เห็น validation หรือผลของการแก้ไข; ห้ามสมมติว่า regenerate ยังคง code เก่าใช้ได้ |
| 00:24–00:30 | Players | Search by id or name; Open; Journey progress; Set step/Mark done/Reset; Quiz attempts และ Delete; Alerts; Recent events | การค้นหาชื่อมีอยู่บน UI แต่ความหมายชื่อและข้อมูลที่อนุญาตต้องยืนยัน; ไม่เห็น mutation สำเร็จ |
| 00:33 | Config | key/value JSON, alertCooldownSeconds, Edit/Delete, Save | ไม่เห็นผลต่อเกมจริง; ไม่ควรถือค่าตัวอย่างเป็นค่าที่ต้องใช้ใน production |
| 00:36–00:42 | Users | admin built-in all permissions; active/temporary password; Reset password/Disable/Delete; Add user; role selector; New role; permission groups | researcher เป็นเพียง placeholder ชื่อ role ไม่ใช่ role ที่มีอยู่แล้ว; ไม่ทราบ permission keys |
| 00:45 | Logs | รายการ method/path/status และ request ของ /dashboard/auth/login, /dashboard/auth/me, /dashboard/stats, /dashboard/players, /dashboard/submissions, /dashboard/events, /dashboard/alerts, /dashboard/journeys, /dashboard/users | การอ่านชื่อใน log ไม่ยืนยัน request/response schema |
| 00:48 | Logs / API endpoints | รายชื่อ method/path, แยก game กับ dashboard; ข้อความ dashboard ใช้ x-admin-token | ไม่เห็นอายุ token, storage, refresh, revoke, logout; ไม่ควรฝังค่า token ถาวรใน Frontend |

## API ที่อ่านได้ชัดจากภาพ 00:48

| Method | Path |
|---|---|
| POST | /dashboard/auth/login |
| GET | /dashboard/auth/me |
| POST | /dashboard/auth/change-password |
| GET | /dashboard/alerts |
| PATCH | /dashboard/alerts/:id/ack |
| PATCH | /dashboard/alerts/:id/note |
| DELETE | /dashboard/alerts/:id |
| GET | /dashboard/audit |
| GET, POST | /dashboard/codes |
| PATCH, DELETE | /dashboard/codes/:id |
| POST | /dashboard/codes/:id/regenerate |
| GET | /dashboard/config |
| PUT, DELETE | /dashboard/config/:key |
| GET | /dashboard/dev/endpoints |
| GET | /dashboard/dev/health |
| GET | /dashboard/dev/logs |
| GET | /dashboard/dialogs |
| PUT, DELETE | /dashboard/dialogs/:key |

มี `POST /auth/roblox/token` ระบุ used by game จึงไม่ใช้เป็น Login ของ Web Dashboard ส่วน `GET /` ระบุ other ไม่ใช่ flow หลักของงานนี้

endpoint ตอบผู้เล่น, รายละเอียดผู้เล่น, progress update/reset, journey mutations, users/roles mutations และ CSV export ยังไม่ได้ยืนยันจากหลักฐานที่อ่านได้ จึงไม่แต่ง path หรือ payload ขึ้นเอง

## PDF ใช้เป็นบริบท

- `C:/Users/pakin/Downloads/proposal_roblox_KMUTTxGDD.pdf` หน้า 31: การแบ่งหน้าที่ Dashboard → Backend API; Server ตรวจสิทธิ์; Frontend ไม่เข้าฐานข้อมูลตรง ตรวจข้อความและภาพหน้าจอของหน้าแล้ว
- เอกสารเดียวกัน หน้า 32: แยกสถานะเกม ข้อมูลประเมิน และคำขอช่วยเหลือ; คำขอช่วยเหลือจำกัดผู้รับเรื่องและไม่รวม Analytics ทั่วไป ตรวจข้อความและภาพหน้าแล้ว
- `C:/Users/pakin/Downloads/[FULL presentation] Roblox_safe_space.pdf` หน้า 89: Event ID, รหัสนามแฝง/Session ID, รุ่นข้อมูล/เนื้อหา, เวลาจาก Server ตรวจข้อความและภาพหน้าแล้ว

ข้อแตกต่างที่ต้องทบทวน: คลิปมี Alerts ภายใน Players และบอกว่า team note ทุกคนบน dashboard เห็น ขณะที่ proposal เสนอแยกคำขอช่วยเหลือตามสิทธิ์ แบบนี้จึงเสนอการควบคุมสิทธิ์ทั้ง API/หน้าจอ โดยไม่อ้างว่า Backend เดิมทำแล้ว

## ข้อเสนอที่ต้องอนุมัติร่วมกัน

- หน้า Login และ session check ก่อนเข้า Dashboard; ปลายทางตามสิทธิ์เมื่อไม่มี Overview
- บังคับเปลี่ยนรหัสผ่านชั่วคราวก่อนเข้าข้อมูล (คลิปแสดงเพียง banner และสถานะ)
- สถานะ loading/empty/error/forbidden/session expired, ป้องกัน submit ซ้ำ และ retry แบบไม่ทำ mutation ซ้ำโดยไม่รู้ผล
- ยืนยันก่อน delete/reset/regenerate/expire/disable พร้อมตรวจสิทธิ์ฝั่ง Server; ตกลง audit และ retention
- ไม่ถือ handled = เด็กได้รับความช่วยเหลือสำเร็จ; ส่งข้อความสำเร็จใน API ไม่เท่ากับผู้เล่นอ่านแล้ว
- ยังไม่เสนอระบบคัดกรองสุขภาพจิต คะแนน SEL ใหม่ ระบบแจ้งเหตุฉุกเฉิน หรือรายงานผลจริง เพราะคลิปไม่ได้ยืนยันความสามารถเหล่านี้

## รายการส่งต่อเพื่อเชื่อมต่อ

1. Auth response / me schema, transport/header, expiry, refresh/revoke/logout และวิธีป้องกัน route
2. ชื่อ flag รหัสผ่านชั่วคราว นโยบายรหัสผ่าน และการ enforce ที่ Backend
3. Permission keys และบทบาทที่โครงการอนุมัติ; ไม่ตั้ง researcher/ผู้รับเรื่องเป็น role จริงเอง
4. Error/status codes, pagination/search/filter, timezone และ freshness ของข้อมูล
5. Reply API, ผู้รับที่ผูกกับ alert, queue/offline/retry/idempotency/delivery state
6. สิทธิ์ของ team note/Alerts ในทุกหน้าจอรวม export/logs; ข้อมูลที่อนุญาตให้แสดง/ระยะเก็บรักษา
7. Schema journeys/quiz modes/value labels/CSV และแนวทางเปลี่ยนเนื้อหาที่ผู้เล่นใช้อยู่
8. ผลของ code regenerate/expire/disable, player reset/delete และการกู้คืน/audit

## เกณฑ์ตรวจรับที่เสนอ

- เข้า URL หน้าที่มีข้อมูลโดยไม่มี session ไม่แสดงข้อมูล; เมื่อ session หมดอายุเคลียร์ view และกลับ Login
- Server ปฏิเสธ request ที่ไม่มีสิทธิ์ แม้เรียก API เอง; Frontend แสดงสถานะที่เหมาะสม
- Login/เปลี่ยนรหัสผ่านผิดพลาดไม่แสดงข้อมูลภายใน และไม่เก็บค่ารหัสผ่านใน storage/log
- mutation แสดงสำเร็จเมื่อ Server ยืนยัน; timeout ที่ไม่รู้ผลต้องตรวจข้อมูลก่อนส่งซ้ำ
- โน้ตทีมและข้อความถึงผู้เล่นมีช่อง ปุ่ม และข้อความผลลัพธ์แยกกัน
- ยกเลิก dialog ของ delete/reset ไม่เรียก mutation; สำเร็จแล้ว refresh เฉพาะข้อมูลที่เกี่ยวข้อง
- ตัวเลข Overview แสดงตาม API ไม่อนุมาน unread alerts จาก handled และไม่สร้างผลประเมินสุขภาพจิตจาก quiz results
- ทดสอบ loading/empty/error/permission denied ด้วย keyboard และ viewport มือถือ
