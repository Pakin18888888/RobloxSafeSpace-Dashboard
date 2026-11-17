# Frontend handoff — v0.2

สถานะ: **พร้อมรีวิว UI ด้วยข้อมูลจำลอง** · ยังไม่เชื่อม Backend จริง

## ส่งมอบแล้ว

| ส่วน | ไฟล์หลัก | สถานะ |
|---|---|---|
| User flow และหลักฐานจากคลิป | `flow-review.html`, `docs/flows.mmd`, `docs/evidence.md` | เก็บงานเดิมไว้เปิดดูได้ |
| Sitemap / Workflow 6 กระบวนการ | `workflow.html`, `docs/sitemap.mmd`, `docs/workflows.md` | HTML + Mermaid; Backend เป็นขั้นตอนรอยืนยัน |
| Design System | `design-system.html`, `src/styles.css` | Tokens, components, Light/Dark, responsive |
| Login / Layout / Overview | `index.html`, `src/app.js`, `src/ui.js` | UI และสถานการณ์จำลองทำงาน |
| หน้าจัดการข้อมูล / ระบบ | `src/management.js` | Alerts, Journeys, Codes, Players, Config, Users, Logs |
| Data / Service boundary | `src/fixtures.js`, `src/service.js` | In-memory Mock; transport จริงยังไม่ถูกใช้ |
| Contract / Scope | `docs/function-inventory.md`, `docs/api-requirements.md`, `docs/page-specs.md` | แยก Implemented / Mock / Pending Backend / Not Verified |
| วิธีรัน / QA | `README.md`, `package.json`, `scripts/serve.cjs`, `tests/`, `docs/validation.md` | Syntax, 11 service tests, browser regression และ handoff checks ผ่าน |

## สิ่งที่ต้องดำเนินการเมื่อมี Backend

1. รับ Repository/API contract และ sandbox ที่ได้รับอนุญาต
2. ยืนยันรูปแบบ session, permissions, request/response และ policy ของแต่ละ mutation
3. ต่อ live service เข้ากับ UI view-model พร้อมตรวจ response และ error states
4. ทดสอบการส่งข้อความ, การลบ/แก้ไขข้อมูล, session revoke, concurrency และ audit กับระบบจริง
5. ให้ทีมโครงการตรวจสิทธิ์ข้อมูลช่วยเหลือ, retention และขั้นอนุมัติเนื้อหา ก่อน acceptance และ deployment

ไม่มีการแก้ Backend, Database หรือ Roblox และไม่มีการเผยแพร่เว็บไซต์ออกสาธารณะในงานนี้

ZIP สำหรับส่งต่อ: `RobloxSafeSpace-Dashboard-Preview.zip` — แตกไฟล์ทั้งหมดก่อนเปิด `index.html`; บัญชีตัวอย่าง `demo / demo-only` ใช้กับ Mock เท่านั้น
