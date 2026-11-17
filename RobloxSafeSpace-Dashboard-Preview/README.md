# Roblox Safe Space — Frontend Admin Dashboard

Frontend v0.2 สำหรับรีวิวกับทีม · HTML / CSS / Vanilla JavaScript · Light & Dark mode

**สถานะปัจจุบัน: UI ทำงานกับ Mock data เท่านั้น ยังไม่ได้เชื่อม Backend, Database หรือ Roblox จริง** ผู้ใช้ยืนยันให้ทำเวอร์ชันชั่วคราวก่อนขณะยังไม่มี API contract

## เริ่มใช้งาน

เปิด `index.html` ด้วย Chrome หรือ Edge ได้โดยตรง โดยเก็บโฟลเดอร์ `src` ไว้ข้างไฟล์ HTML ไม่ต้องติดตั้งแพ็กเกจหรือใช้อินเทอร์เน็ต

บัญชีจำลอง: **demo / demo-only** หรือกด **กรอกให้** บนหน้า Login

สำหรับพัฒนาผ่าน local server ใช้ Node.js 18 ขึ้นไป:

```sh
npm start
```

เปิด `http://127.0.0.1:4173` ใช้ `PORT` เปลี่ยนพอร์ตได้ ตัว server เป็น static file server สำหรับ development เท่านั้น ไม่ใช่ Backend ของโครงการ

## ผลงานที่เปิดดูได้

| ไฟล์ | เนื้อหา |
|---|---|
| `index.html` | Login และ Admin Dashboard ใหม่ครบ 8 เมนู |
| `flow-review.html` | ชุด User flow, หลักฐานจากคลิป และแบบหน้าจอจากงานก่อน เก็บไฟล์เดิมก่อนแทนหน้าหลัก |
| `workflow.html` | Sitemap และ Workflow 6 ชุด: Authentication, Dashboard data, Search/filter, Mutation, Permissions, Logout |
| `design-system.html` | สี ฟอนต์ ระยะห่าง Components และสถานะการโต้ตอบ พร้อมสลับ Light/Dark |
| `docs/flows.mmd` / `docs/sitemap.mmd` / `docs/workflows.md` | แผนภาพ Mermaid ที่ทีมแก้ไขต่อได้ |
| `docs/function-inventory.md` | การตรวจ repo, ฟังก์ชันจากคลิป/โค้ด, สถานะ และข้อขัดแย้ง |
| `docs/api-requirements.md` | Contract และความสามารถที่ต้องได้รับก่อนเชื่อม Backend |
| `docs/page-specs.md` | ขอบเขตและพฤติกรรมแต่ละหน้า |
| `docs/validation.md` | ผลตรวจล่าสุดและข้อจำกัด |
| `docs/delivery.md` | สรุปไฟล์ส่งมอบและงานที่ต้องทำเมื่อได้รับ Backend |

`workflow.html` และ `flow-review.html` มีปุ่มพิมพ์/Save as PDF ผ่านเบราว์เซอร์ งานนี้ส่ง HTML ไม่ได้อ้างว่ามีไฟล์ PDF ที่ export และตรวจทุกหน้าแล้ว

## ฟังก์ชันที่ลองได้

- **Login**: validation, show/hide password, loading/error, temporary password, ไม่มีสิทธิ์, expiry และ logout
- **Overview**: 4 metrics, กราฟ submissions จากข้อมูลที่ใช้ในตาราง, ตัวกรองช่วงวัน, participation, recent results, players และ activity ไม่แสดงข้อความขอความช่วยเหลือใน analytics
- **Alerts**: ค้นหา/กรองสถานะ, อ่านคำขอ, บันทึกทีม, ตรวจข้อความก่อนตอบจำลอง, mark handled และยืนยันก่อนลบ
- **Journeys**: list/editor, details, steps เพิ่ม/ลบ/ย้าย, dialog, quiz แบบ survey/graded, value labels, CSV columns, progress และ export CSV จำลอง
- **Codes**: create/edit, expiry, maximum uses, duplicate validation, regenerate/disable/expire/delete พร้อมยืนยัน
- **Players**: ค้นหารหัสนามแฝง, detail, progress, quiz attempts/events, set step/done/reset และลบข้อมูลจำลอง
- **Config**: ค้นหา key, typed value/JSON validation, save/delete ตามสิทธิ์
- **Users**: create/edit/manage, reset temporary password, disable/delete, create role และ permission matrix
- **Logs**: request/event/audit search/filter, error filter, refresh; แสดง Backend เป็น Mock และ Database เป็น Not connected

บนแถบด้านบนมีปุ่มรูปขวดทดลอง **แผงทดสอบสถานะ** เพื่อทดลอง Empty/Error, บทบาทจำลอง และ Session หมดอายุ หน้า Login มีตัวเลือกสถานการณ์ในส่วนขยาย

การเปลี่ยนแปลงอยู่ในหน่วยความจำและหายเมื่อ reload หน้าเว็บ การออกจากระบบจบ session และล้าง view/draft แต่ไม่ reset ฐานข้อมูลจำลองของรอบนั้น เพื่อให้ลองกลับเข้ามาดูการเปลี่ยนแปลงได้ ใช้ reload เมื่อต้องการเริ่ม fixture ใหม่

เก็บเฉพาะค่าธีมใน `localStorage` ไม่มีรหัสผ่าน/token/ข้อมูลผู้เล่นใน storage ไม่ส่งข้อความถึงผู้เล่นจริง ไม่แก้ Backend หรือ Database และไม่เผยแพร่ข้อมูลอ้างอิงขึ้นบริการภายนอก

## Architecture และสถานะ

```text
index.html
  ├─ src/styles.css       Design tokens / components / responsive / themes
  ├─ src/fixtures.js      Synthetic fixtures + proposed internal permissions
  ├─ src/service.js       MockService + fail-closed ContractApi transport
  ├─ src/ui.js            Escaping, form/table primitives, native dialogs, CSV
  ├─ src/management.js    Management views and forms
  └─ src/app.js           Login/session, routing, shell, overview, state handling
```

- **Implemented**: UI, interactions, validation, navigation, states, themes และ responsive
- **Mock**: Authentication, permissions, data reads/writes, audit และ export ที่ลองใช้ในหน้าเว็บ
- **Pending Backend**: API payload/response, session/logout, permission mapping, delivery, approval/publish, schemas และ business rules
- **Not Verified**: การทำงานจริงของ Backend, Database, Roblox, server authorization และ health

`ContractApi` ไม่ถูกสร้างหรือเรียกจากแอป มีไว้เป็น transport สำหรับการเชื่อมในอนาคต และปฏิเสธ operation ที่ไม่มี verified contract, encoder และ decoder ไม่มีการเดา endpoint ที่ไม่พบในหลักฐาน และไม่มีการ fallback จาก live failure เป็น mock success

Roles นอกเหนือจาก admin, permission keys, quiz schema และกติกา validation เป็นตัวอย่างภายใน ไม่ใช่สัญญา API ของทีม `Draft/In review` เป็นข้อเสนอสำหรับตรวจเนื้อหา ยังไม่มีการ Publish/approve จริง

## การตรวจสอบ

ไม่ต้องติดตั้ง dependencies สำหรับคำสั่งต่อไปนี้:

```sh
npm run check
npm test
```

Browser regression อยู่ที่ `tests/browser.cjs` ใช้ Playwright จากเครื่องมือทดสอบที่มีอยู่:

```sh
node tests/browser.cjs
node tests/handoff.cjs
```

หาก Playwright/Chromium ไม่อยู่ใน environment ให้กำหนด `PLAYWRIGHT_MODULE_PATH` เป็น path ของโมดูล Playwright และ `BROWSER_PATH` เป็น executable ของ Chromium/Chrome/Edge ที่ใช้ทดสอบ เลือก `DASHBOARD_URL` เพื่อทดสอบ localhost แทน file URL และ `QA_OUTPUT` เพื่อบันทึกภาพ/ผลตรวจ

ไม่มี browser runtime เป็น dependency ของแอป production หรืองาน Mock UI

`tests/handoff.cjs` ตรวจ Workflow/Design System, print visibility, keyboard บน mobile drawer และการยืนยันก่อนทิ้งร่างเพิ่มเติม

ชุดส่งต่อ `RobloxSafeSpace-Dashboard-Preview.zip` รวม HTML, source, เอกสาร และ tests ให้แตก ZIP ทั้งโฟลเดอร์ก่อนเปิด `index.html` ไม่รวมวิดีโอ/PDF ต้นฉบับหรือข้อมูลจริง

## ก่อนต่อกับ Backend จริง

อ่าน `docs/api-requirements.md` และ `docs/function-inventory.md` รับ OpenAPI/ตัวอย่าง sanitized data/บัญชี sandbox ก่อนเขียน mapping ตรวจ 401/403, การเพิกถอน session, concurrency และ mutation timeout กับทีมจริง โดยเฉพาะสิทธิ์ Alerts และข้อมูลส่งออก

Frontend นี้เป็นงาน UI ที่พร้อมให้ทีมรีวิวและพัฒนาต่อ ยังไม่ใช่ production release ที่ผ่าน end-to-end, security review หรือ acceptance ขององค์กรแล้ว
