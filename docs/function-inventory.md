# Function Inventory — 16 พฤศจิกายน 2026

## Repository audit

- ณ เวลาตรวจเริ่มต้น Local `main` ยังไม่มี commit; ก่อนพัฒนารอบนี้มี `index.html` ชุด Flow, docs และ ZIP จากงานก่อน ไม่มี Backend, migrations, package manifest หรือ production Dashboard (เป็นผลตรวจ ณ จุดเริ่มต้น ไม่ใช่สถานะ Git หลังพัฒนา)
- `origin`: `https://github.com/Pakin18888888/RobloxSafeSpace-Dashboard.git` ตรวจด้วย `git ls-remote --heads origin` สำเร็จ แต่ไม่มี heads ส่งกลับมา
- ไม่มี AGENTS.md ใน workspace/parent ที่ตรวจ และไม่มี server authentication, request DTO, response schema หรือ permission definitions ให้ตรวจ
- เทคโนโลยีเดิม: HTML/CSS/Vanilla JavaScript ในไฟล์เดียว จึงต่อยอดแบบ Vanilla JavaScript แยกไฟล์ โดยไม่เพิ่ม framework/build dependency
- ผู้ใช้ยืนยันให้ทำเวอร์ชันชั่วคราวก่อน ขณะยังไม่มี Backend repo/API contract
- ชุด Flow เดิมเก็บทั้งไฟล์ไว้ที่ `flow-review.html` ก่อนแทนหน้าหลัก `index.html` ไม่แก้ Backend/Database/เกม

## ความหมายสถานะ

- **Implemented**: UI และการโต้ตอบฝั่ง Frontend มีโค้ดทำงานแล้ว
- **Mock**: มีข้อมูล/การเปลี่ยนสถานะในหน่วยความจำเพื่อทดลอง ไม่มีการเรียก Backend
- **Pending Backend**: ต้องได้รับ contract/ความสามารถก่อนเชื่อมจริง
- **Not Verified**: ยังไม่มีหลักฐานจากโค้ดหรือการเรียก API จริง

ทุกเมนูด้านล่างมี Frontend Implemented + data adapter Mock; Backend integration ทั้งหมด Pending Backend / Not Verified สถานะเหล่านี้เป็นคนละมิติ ไม่ควรตีความว่า UI ที่ทำแล้วคือ Backend ที่ทำแล้ว

| เมนู      | พบในคลิป                                                                            | พบในโค้ดก่อนเริ่ม                | Frontend รอบนี้                                                                                                           | API ที่เกี่ยวข้อง / หลักฐาน                                                                    | สถานะ Backend                                                                 |
| -------- | ---------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Login    | auth/login, me, change-password ใน catalog 00:48; ไม่เห็นฟอร์ม                        | มีเฉพาะ Login demo ของชุด Flow | Username/password, toggle, native validation, loading/error, temporary password, no access, expiry, logout              | POST /dashboard/auth/login; GET /dashboard/auth/me; POST /dashboard/auth/change-password | Pending Backend; body/response/logout Not Verified                            |
| Overview | 4 metrics, Recent results, Players, Activity 00:03–09                              | มี wireframe ใน Flow เท่านั้น    | metrics คำนวณจาก fixture, กราฟ submissions, participation, ช่วงวันที่, 3 ตาราง/รายการ, empty/error                          | GET stats/submissions/players/events ใน log 00:45                                        | Response/pagination Not Verified                                              |
| Alerts   | คำขอ, handled, note, reply, Refresh/Delete 00:12                                   | มีข้อกำหนดใน Flow              | inbox/detail, search/status, note, reply preview, acknowledgement จำลอง, handled/delete confirmation                    | GET alerts; PATCH alerts/:id/note, /ack; DELETE alerts/:id 00:48                         | Reply endpoint/visibility/delivery Pending Backend                            |
| Journeys | list/create/edit/delete/progress; NPC/dialog/labels/CSV 00:15–18                   | มีข้อกำหนดใน Flow              | cards, details, Step Editor, reorder/add/remove, Dialog/Quiz editor, draft/review, validation, progress modal, CSV mock | GET journeys ใน log; GET dialogs และ PUT/DELETE dialogs/:key ใน catalog                  | Journey/quiz schema, scored weights, publish/approval/export Pending Backend  |
| Codes    | create/expiry/max uses/Edit/Regenerate/Disable/Expire/Delete 00:21                 | มีข้อกำหนดใน Flow              | form, duplicate validation, table/filter, confirmations, mutations mock                                                 | GET/POST codes; PATCH/DELETE codes/:id; POST codes/:id/regenerate                        | Payload/expiry/redeem semantics Not Verified                                  |
| Players  | search/open/progress/quiz/history/Set step/Mark done/Reset/delete attempt 00:24–30 | มีข้อกำหนดใน Flow              | list/detail, search ID, progress, quiz attempts, event metadata, confirmations, player delete mock                      | GET players ใน log; รายละเอียด/mutations ยังไม่มี path ยืนยัน                                  | Player delete พบใน permission text; API/retention Not Verified                |
| Config   | key/value(JSON)/Edit/Save/Delete 00:33                                             | มีข้อกำหนดใน Flow              | typed edit สำหรับ fixture key ที่มี, JSON validation, save/delete confirmation                                              | GET config; PUT/DELETE config/:key                                                       | key/type/range allowlist Pending Backend                                      |
| Users    | users/roles/permission groups/create/reset/disable/delete 00:36–42                 | มีข้อกำหนดใน Flow              | staff table, role badges, create/edit/manage, create role, matrix, prevent current-user disable/delete                  | GET users ใน log; mutations ยังไม่มี path ยืนยัน                                              | All roles/keys except observed admin are proposed; server checks Not Verified |
| Logs     | request/status/catalog และ permission audit/events/status 00:45–48                 | มีข้อกำหนดใน Flow              | API Mock + Database Not connected badges, search/type/error filters, refresh, metadata-only table                       | GET dev/logs, dev/health, dev/endpoints, audit; events ใน log                            | Actual health response, audit schema, redaction Not Verified                  |

## ข้อขัดแย้งและการตัดสินใจชั่วคราว

1. **Team note visibility**: คลิปบอกทุกคนบน Dashboard เห็นโน้ต; proposal หน้า 32 จำกัดคำขอช่วยเหลือเฉพาะผู้รับเรื่อง จึงทำ UI/mock permission แยก Alerts และไม่ใส่รายละเอียดใน Overview/analytics ต้องให้โครงการและ Backend ยืนยันจริง
2. **Player detail มี Alerts**: ต้นแบบใหม่แสดงเฉพาะจำนวนและลิงก์ไปพื้นที่รับเรื่องสำหรับบัญชีที่มี alerts.read ไม่คัดลอกข้อความช่วยเหลือในหน้า Players
3. **Default password**: คลิปมี banner; ต้นแบบเสนอ gate เปลี่ยนรหัสก่อนเข้าข้อมูล แต่ไม่อ้างว่า Backend บังคับแล้ว
4. **Approval**: user ขอคำนึงถึงอนุมัติเนื้อหา แต่ยังไม่พบ API จึงมี Draft/In review เป็นสถานะ mock ไม่มี Publish หรือปุ่มที่อ้างว่าอนุมัติจริง
5. **Personal identifiers**: คลิปมี search by id or name; ต้นแบบค้นรหัสนามแฝงเท่านั้น ไม่สร้างชื่อจริงเด็กเพิ่ม ต้องยืนยันว่าฟิลด์ชื่อใน Backend หมายถึงอะไร
6. **Role keys / quiz types / code rules**: ชื่อภายในและกติกา mock ไม่ใช่หลักฐานของ schema Backend ต้อง map หลังได้ contract
7. **Database health**: ไม่แสดง healthy/connected เพราะไม่ได้เชื่อมฐานข้อมูล แสดง Not connected อย่างชัดเจน

อ้างอิง PDF หน้า 30–34 ตรวจทั้งข้อความและภาพหน้าที่มี diagram/dashboard (31–34); คลิปตรวจภาพตามลำดับเวลารวมภาพขยายในงานก่อน ไม่ได้ถอดเสียงหรือทดสอบ Backend

## UI revision v0.3 — 18 พฤศจิกายน 2026

Journey Editor เปลี่ยนจากแท็บเป็นการ์ดฟอร์มต่อเนื่อง พร้อมตัวเลือกคำตอบแยกช่องและ radio คำตอบที่ถูกต้อง ข้อมูลที่ส่งให้ MockService ยังคง schema เดิม; ความสามารถจริงของ Backend ทุกเมนูยังเป็น Pending Backend / Not Verified ตามเดิม รายละเอียดโครงสร้าง external assets อยู่ใน `docs/architecture.md`
