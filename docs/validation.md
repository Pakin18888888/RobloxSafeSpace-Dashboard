# ผลตรวจ Frontend v0.4

วันที่: 18 พฤศจิกายน 2026 · Mock เท่านั้น

- Service tests: **13 tests ผ่าน** รวม migration แบบไม่ทำข้อมูลเดิมหาย และ nested content/pass mark validation
- `tests/browser.cjs`: regression ทั้ง 8 เมนูผ่าน ไม่พบ JS errors, HTTP(S) request หรือ page overflow
- `tests/editor.cjs`: popup, choice mapping, save/reopen และ read-only ผ่าน
- `tests/content.cjs`: เพิ่มบทพูด/คำถาม/การ์ด/ขั้นตอน, เรียงลำดับ, ลบ/ยกเลิก, เกณฑ์ผ่านผิด, save/reopen ผ่าน
- Nested editor ตรวจ 1440/768/390/320 px ทั้ง Light/Dark ไม่มี page overflow
- ภาพและ JSON รายงานอยู่ใน `tmp/review/` ไม่รวมในชุดส่งมอบ

ยังไม่ทดสอบ Backend/Roblox จริง ไม่ใช่ security/accessibility audit เต็มรูปแบบ

## ประวัติผลตรวจ v0.3

# ผลตรวจ Frontend v0.3

วันที่: 18 พฤศจิกายน 2026

รอบนี้ปรับ Journey Editor / Popup และแยก external assets โดยยังใช้ MockService เท่านั้น

| รายการ                       | ผลล่าสุด                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Formatting / syntax / assets | `npm run format:check` และ `npm run check` ผ่าน                                   |
| Service tests                | 11 tests ผ่าน                                                                     |
| Dashboard browser regression | ทั้ง 8 เมนู / 4 ความกว้าง / 2 ธีม ผ่าน ไม่มี JS error, page overflow หรือ HTTP(S) request |
| Handoff checks               | Workflow 6 ชุด, Design System, mobile keyboard และ unsaved draft ผ่าน              |
| Editor checks                | ปิด backdrop, ไม่ปิดเมื่อคลิกด้านใน/ลากออก, คืน focus และ guard ระหว่าง submit ผ่าน        |
| Choice editing               | เพิ่ม/ลบ, ย้าย index คำตอบ, ยกเลิกนำ Quiz ออก, save/reopen และ read-only ผ่าน         |
| Editor responsive            | 1440 / 768 / 390 / 320 px ทั้ง Light/Dark ไม่มี page overflow                        |
| External Flow review         | สลับหน้าเอกสารเดิมครบ 6 ส่วนหลังย้าย script ผ่าน                                        |

ภาพและผล JSON อยู่ใน `tmp/review/` ไม่รวมข้อมูลต้นฉบับหรือข้อมูลจริงใน ZIP

## ขอบเขตและผลตรวจเดิมที่ยังเกี่ยวข้อง

วันที่: 16 พฤศจิกายน 2026

ตรวจ UI กับ **MockService และข้อมูลสมมติเท่านั้น** ไม่ได้เชื่อม Backend, Database หรือ Roblox จริง ใช้ Node.js และ Microsoft Edge แบบ headless ผ่าน Playwright เปิด HTML ในเครื่องโดยตรง

## ผลตรวจล่าสุด

| รายการ              | ผล / ขอบเขต                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `npm run check`     | ผ่าน syntax check ของ JavaScript ทั้ง 5 ไฟล์ใน src                                             |
| `npm test`          | ผ่าน 11 tests, ล้มเหลว 0                                                                     |
| `tests/browser.cjs` | ผ่าน regression ของ Login และทั้ง 8 เมนู                                                       |
| `tests/handoff.cjs` | ผ่าน Workflow/Design System และ keyboard/draft checks เพิ่มเติม                                |
| Responsive          | Dashboard 1440 / 768 / 390 / 320 px ทั้ง Light และ Dark; ไม่พบ page-level horizontal overflow |
| Runtime errors      | ไม่พบ JavaScript error ใน browser runs                                                      |
| Network             | Dashboard regression ไม่พบ HTTP(S) requests จึงไม่มีการส่งข้อมูลตัวอย่างออกไป                       |
| Local static server | Smoke test 6 เส้นทางผ่าน: HTML/JS/เอกสารตอบ 200; `.git` และ `tmp` ตอบ 404                    |
| Workflow            | สลับครบ 6 กระบวนการ, มี Admin / Frontend / Backend API / Database; print CSS แสดงครบ 6 ชุด    |
| Design System       | สลับ Light/Dark, ตรวจความกว้าง 1440 / 390 / 320 px                                           |
| Keyboard            | Dialog รับ focus และปิดด้วย Escape; drawer มือถือกัก Tab, ปิดด้วย Escape และคืน focus ให้ปุ่มเมนู       |
| Unsaved draft       | เปลี่ยนเมนูหรือเลือกเมนู Journeys ซ้ำต้องยืนยัน; Cancel คงร่างไว้                                      |

ตารางข้อมูลและ Workflow เลื่อนแนวนอนภายในกรอบบนจอแคบเพื่อคงความอ่านง่าย

## Functional regression ที่ตรวจ

- Login สำเร็จ, รหัสไม่ถูกต้อง, network error, temporary password, ไม่มีสิทธิ์, session expiry และ logout
- Overview คำนวณ metrics จาก fixture เดียวกับข้อมูลตาราง; ตัวกรองช่วงวันปรับจำนวน submissions และข้อมูลที่เกี่ยวข้อง
- Alerts บันทึก team note แยกจาก reply, ยืนยันก่อนทำงาน, แสดง reply เป็นบันทึกจำลองที่ไม่ได้ส่งเข้าเกม
- Journeys แก้รายละเอียด/Dialog/Quiz/Steps, สร้าง/ลบ, progress และ export CSV ตัวอย่าง
- Codes สร้าง/แก้/disable/regenerate/delete และยกเลิก confirmation
- Players set step/mark done/reset/delete attempt
- Config แก้ค่า; Users สร้าง/แก้/reset/disable/สร้าง role; Logs กรอง audit
- Empty/Error แยกกัน; observer ไม่มีเมนู Alerts และเปิด route โดยตรงไม่ได้; ไม่แสดง unread count เมื่อไม่มีสิทธิ์ care

## Service tests 11 กรณี

1. ปฏิเสธการอ่าน care/write สำหรับ anonymous และ observer
2. Overview ใช้ข้อมูลสอดคล้องกันและไม่มี care narrative
3. บังคับ temporary-password gate และ session expiry ใน mock
4. Logout ยกเลิก mutation ที่ยังรอโดยไม่เปลี่ยนข้อมูล
5. Notes/replies แยกกัน และ audit ไม่มีข้อความเนื้อหา
6. Code ซ้ำหรือ max uses ไม่ถูกต้องไม่เขียนทับข้อมูลเดิม
7. Journey ที่มีข้อมูลอ้างอิงลบไม่ได้; version เก่าเขียนทับไม่ได้
8. Player mutation ตรวจเจ้าของ attempt และแยก retention ของ care
9. Password ไม่ถูกเก็บใน staff records หรือ audit
10. API operation ที่ไม่มี verified contract ปฏิเสธก่อนเรียก network
11. Transport แปลง auth errors และไม่เผย raw server error body

## Visual review

ตรวจภาพ Login, Overview, Alerts, Journey Editor, Player, Users, Logs รวมทั้งรูปแบบมือถือและ Dark mode ระหว่างงาน และตรวจหน้า Sitemap/Workflow กับ Design System เพิ่มเติม ปรับกราฟมือถือให้ใช้ขนาด viewBox ตามพื้นที่, จัด focus หลัง dialog ปิด และกัน focus หลุดไปเนื้อหาหลัง mobile drawer

ภาพตรวจและ JSON รายงานอยู่ใน `tmp/review/` ซึ่งถูก gitignore และไม่รวมในชุด ZIP ภาพเป็นข้อมูลจำลองทั้งหมด ชุดทดสอบสร้างผลตรวจใหม่ได้ผ่าน `QA_OUTPUT`

## ข้อจำกัด

- ไม่ใช่ end-to-end verification ของ Backend; การตรวจสิทธิ์/รหัสผ่าน/ลบข้อมูล/ส่งข้อความจริงยัง Pending Backend
- ตรวจ Chromium/Edge เท่านั้น ยังไม่ได้ตรวจ Safari/Firefox หรืออุปกรณ์จริง
- ตรวจ keyboard และ responsive บางส่วน ไม่ใช่ WCAG audit เต็มรูปแบบหรือ screen-reader audit
- ตรวจ print CSS/จำนวน Workflow ไม่ได้ export PDF และตรวจทุกหน้ากระดาษ
- Mock data อยู่ในหน่วยความจำ รีโหลดแล้วรีเซ็ต ไม่ใช่ข้อมูลใช้งานจริง
- การอนุมัติเนื้อหา, policy รหัสผ่าน, server permission keys, retention และ API contracts ต้องยืนยันกับทีมก่อน production

ผลตรวจชุด Flow รุ่นเดิมเก็บแยกไว้ใน `docs/flow-validation-v1.md`
