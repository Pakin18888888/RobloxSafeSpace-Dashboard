# โครงสร้าง Frontend และแนวทางแก้ไขโค้ด

อัปเดต 18 พฤศจิกายน 2026 · Frontend v0.4

โครงสร้างนี้เหมาะกับต้นแบบ Frontend แบบ buildless ที่ต้องเปิด `index.html` ได้โดยตรง ใช้ HTML/CSS/Vanilla JavaScript ไม่มี Backend ใน repository นี้ ไม่จำเป็นต้องย้าย framework เพื่อปรับ Journey Editor รอบนี้

## Source หลัก

```text
index.html                 จุดเริ่มต้น Login / Dashboard และลำดับโหลด assets
flow-review.html           HTML ของ User flow และหลักฐานเดิม
workflow.html              HTML ของ Sitemap / Workflow
design-system.html         HTML ตัวอย่าง Design System
src/
  app.js                   State, routing, Login, Overview และ application shell
  management.js            หน้าจัดการข้อมูลและประสาน action กับ service
  journey-editor.js        การ์ดฟอร์ม Journey, choices, draft binding และ focus
  journey-content.js       การ์ด Dialog/Quiz, บทพูด, คำถาม, ตัวเลือก และการจัดลำดับ
  journey-model.js         Migration ข้อมูลเดิม / validation ของโมเดล Mock
  journey-editor.css       Layout และ components เฉพาะ Journey Editor
  ui.js                    UI helpers, dialog, focus, escaping, CSV และ toast
  service.js               MockService และ transport ที่รอ verified contract
  fixtures.js              ข้อมูลสมมติและ role ตัวอย่าง
  styles.css               Design tokens, shared layout/components และ responsive
  utilities.css            Spacing / สี presentation ที่ใช้ร่วมกัน
  pages/
    flow-review.js/.css    พฤติกรรมและรูปแบบของหน้า Flow review
    workflow.js/.css       ข้อมูล/การสลับ Workflow และ print layout
    design-system.js       การสลับธีมหน้า Design System
scripts/
  serve.cjs                Local static server
  check.cjs                ตรวจ syntax และ external asset references
tests/
  service.test.cjs         Service behavior
  browser.cjs              Regression ทุกเมนู
  handoff.cjs              เอกสาร/keyboard/unsaved draft
  editor.cjs               Journey Editor และ backdrop dismissal
docs/                      Scope, inventory, contract และผลตรวจ
```

ไฟล์ ZIP และโฟลเดอร์ `RobloxSafeSpace-Dashboard-Preview/` ที่แตกจาก ZIP เดิมเป็น snapshot ส่งมอบ ไม่ใช่ source หลัก รอบนี้เก็บไว้ตามเดิม ไม่แก้สำเนาให้ปะปนกับ source ที่ root และ `src/` ใช้ ZIP v0.3 สำหรับส่งต่อรุ่นใหม่

## การแยกไฟล์ external

- HTML ทั้ง 4 หน้าไม่มี inline `<style>`, inline JavaScript, `onclick` หรือ static `style` attribute แล้ว
- โหลด CSS ด้วย `<link>` และ JavaScript ด้วย `<script src="…" defer>`
- `index.html` โหลด fixtures → Journey model → service → UI → Journey content → Journey Editor → management → app ตาม dependency
- JavaScript ใช้ factory/IIFE และ namespace `SafeSpace…` เพื่อจำกัด global state ขณะยังเปิดผ่าน `file://` ได้ ไม่ใช้ ES modules ซึ่งควรรันผ่าน HTTP server
- `app.js` ส่ง state/service/helpers ให้ Journey Editor ผ่าน context; Editor ไม่เรียก network โดยตรงและไม่สร้าง endpoint
- กราฟ/แถบ progress ยังมีค่า geometry ที่คำนวณจากข้อมูล เช่น inline width แบบเปอร์เซ็นต์ เป็นค่าขณะ render ไม่ใช่ stylesheet ที่ฝังซ้ำ
- เก็บ CSS ที่ไม่ใช้ของ Editor แบบแท็บเดิมออกแล้ว ส่วน shared form components ยังใช้ร่วมกับเมนูอื่น

## ขอบเขต Journey Editor v0.3 (ประวัติ ก่อน v0.4)

- การ์ดข้อมูลกิจกรรม → เลือกขั้นตอน → บทสนทนา → คำถาม → การตั้งค่าเพิ่มเติม
- ใช้ view-model เดิม: 1 dialog string และ 1 quiz ต่อ step ไม่สร้าง API หรืออ้างว่ารองรับ multiple questions/dialog blocks ของ Backend แล้ว
- ตัวเลือกเป็น input แยก 2–8 ช่อง; graded quiz เลือกคำตอบด้วย radio; เมื่อลบคำตอบที่ถูกต้องต้องเลือกคำตอบใหม่เอง
- สลับขั้นตอนไม่ทำร่างหาย; save ยังผ่าน service validation/version check และ confirmation เดิม
- การซ่อนคำถามที่มีอยู่ต้องยืนยัน; โหมดอ่านอย่างเดียวปิดการแก้ไขทุกช่อง
- Popup ปิดด้วย backdrop / Escape / ปุ่มปิดได้ ไม่ปิดเมื่อเริ่มลากจากเนื้อหาด้านใน และไม่ปิดระหว่าง submit ที่ยังรอผล

## รูปแบบโค้ดและคำสั่ง

Prettier เป็น **dev dependency เท่านั้น** มี version pin และ lockfile; เว็บไม่โหลดแพ็กเกจนี้ขณะใช้งาน

```sh
npm ci
npm run format
npm run format:check
npm run check
npm test
```

`.editorconfig` และ `.prettierrc.json` ใช้ indentation 2 spaces, UTF-8 และ LF; `.prettierignore` ข้ามไฟล์สร้างอัตโนมัติ, snapshot เก่า, node_modules และ tmp โดยไม่แก้สำเนาผลงานเก่า

เมื่อขยายงานต่อ สามารถแยกแต่ละเมนูจาก `management.js` เป็น feature factory เพิ่มตาม pattern ของ Journey Editor ได้ การเชื่อม Backend จริงควรเริ่มที่ `service.js` พร้อม schema mapping ตาม `api-requirements.md` ไม่ใส่ fetch ไว้ในส่วน render

## โครงสร้างปัจจุบัน v0.4

Step มี blocks เรียงลำดับ; Dialog มี lines และ Quiz มี questions/choices จึงรองรับหลายการ์ดและหลายคำถามแล้ว `journey-model.js` แปลง fixture เดิมและตรวจเนื้อหาก่อน MockService บันทึก `journey-content.js` จัดการ UI โดยไม่มี network call ดู `docs/journey-schema.md` สำหรับรายละเอียด
