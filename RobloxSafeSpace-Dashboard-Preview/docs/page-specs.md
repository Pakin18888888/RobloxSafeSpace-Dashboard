# Page specifications

เอกสารนี้อธิบายพฤติกรรม Frontend ที่ Implemented โดยใช้ Mock adapter ทั้งหมด ดูสถานะ Backend แยกใน function-inventory.md

| หน้า | จุดเข้าและงานหลัก | Form / data | เงื่อนไขและการย้อนกลับ |
|---|---|---|---|
| Login | เปิดเว็บหรือ session หมดอายุ | Username/password; แสดง/ซ่อน; loading/error | สำเร็จตรวจสิทธิ์ เปิดหน้าแรกที่อนุญาต; temporary → เปลี่ยนรหัส; ไม่มีสิทธิ์ → denied; ข้อผิดพลาดกลับฟอร์ม |
| Overview | overview.read | Players/Quizzes/Submissions/Unread alerts; chart; results; players; activity | ช่วงวันเปลี่ยน chart/submission count/results; metrics อื่นแสดงทั้งชุด; unread ซ่อนหากไม่มี alerts.read |
| Alerts | alerts.read | รายการ/สถานะ, detail, team note, reply | note/reply แยก; mutation ต้อง alerts.write และ confirmation; reply แสดง mock accepted ไม่ใช่ delivered/read |
| Journeys | journeys.read | list/details/steps/dialog/quiz/labels/CSV | journeys.write สำหรับแก้; unsaved draft เตือนก่อนออก; save ตรวจฟอร์ม/version; linked journey ปฏิเสธ delete แบบจำลอง; export ต้อง journeys.export |
| Codes | codes.read | Journey/custom code/minutes/max uses/list | codes.write; code ซ้ำหรือ max ต่ำกว่าที่ใช้แล้วไม่บันทึก; ยืนยัน regenerate/disable/expire/delete; เปิด Edit มีตัวเลือกคง expiry เดิม |
| Players | players.read | Search pseudonym/detail/progress/attempts/events | players.write; set step/done/reset/delete มี confirmation; Alerts แสดงเพียงจำนวน+ลิงก์หากมีสิทธิ์ ไม่ดึง narrative มาไว้ใน analytics |
| Config | config.read | key/type/value/update | config.write; JSON/type validation; save/delete ต้องยืนยัน; ไม่สร้าง arbitrary config key ขึ้นมาเอง |
| Users | users.read | Staff list/create/edit/manage; role creation/matrix | users.write; ไม่มีรหัสผ่านใน records/log; ป้องกันปิด/ลบบัญชีปัจจุบัน; role ที่สร้างเป็นตัวอย่างในหน่วยความจำ |
| Logs | logs.read | Mock API/Not connected DB, metadata logs | Search/type/error filters; refresh; ไม่แสดง request body, token, password หรือ care text |

## Shared states

- Loading ระหว่าง async read; submit/mutation dialog ปิดปุ่มซ้ำระหว่างรอ
- Empty แยกจาก Error และใช้คำค้น/ตัวกรองปัจจุบัน
- Error มีข้อความและ Retry; draft form ไม่หายเมื่อ validation/mutation error
- Forbidden ไม่แสดงข้อมูลหน้าที่ไม่มีสิทธิ์
- Session หมดอายุยกเลิก view/draft และกลับ Login; mock session อายุ 20 นาที
- Logout ล้าง state/view และยกเลิกคำขอที่ยังรอ ไม่อ้างว่ามี server revoke จริง
- Confirm ระบุรายการเป้าหมาย ผลกระทบ และโหมดจำลอง; ยกเลิกไม่เรียก mutation
- Light/Dark ใช้ semantic CSS variables; Responsive ย้าย sidebar เป็น drawer; ตารางที่กว้างเลื่อนภายในกรอบ
- Dialog มี keyboard focus และ Escape; mobile drawer กัน focus เข้าพื้นหลังขณะเปิด

## รายละเอียดที่รอ Backend

ทุกหน้ารอ actual API shape/permission keys/error codes/pagination ส่วน Journey รองรับเพียง schema ตัวอย่าง survey/graded กับ dialog string; scored weights, multiple dialog entity relationships, content approval/publishing ยังต้องออกแบบตาม contract จริง ไม่อ้างว่าส่งเข้าเกมแล้ว
