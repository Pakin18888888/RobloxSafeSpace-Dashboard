# API Integration Requirements

สถานะ: Pending Backend — UI ทำงานผ่าน MockService เท่านั้น

## ขอบเขตและจุดเชื่อม

- `src/fixtures.js`: fixture ไม่มีข้อมูลจริง
- `src/service.js`: `MockService` มี UI-facing operations `login`, `changePassword`, `read`, `mutate`, `journeyProgress`, `logout`; ชื่อเหล่านี้ไม่ใช่ HTTP paths
- `ContractApi`: HTTP transport พร้อม cancellation/timeout, generic error, 401/403/409 mapping; **ไม่ถูกสร้างหรือเรียกจากแอปปัจจุบัน**
- ต้องส่ง operation mapping ที่มี `verified: true`, method/path ที่ยืนยัน, `encode` และ `decode` ครบ จึงจะอนุญาต network call ไม่ fallback ไป Mock เมื่อ live request ล้มเหลว
- `observedEndpoints`: catalog อ้างอิงชื่อที่อ่านจากคลิปเท่านั้น ไม่ผูก payload ที่เดาขึ้น
- ไม่มี live-mode switch, secrets, embedded token, cookie policy หรือ auth header ที่เดาขึ้น

## P0 ก่อนเชื่อมจริง

| เรื่อง              | ต้องได้จาก Backend                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Auth              | request/response ของ login/me, identifier fields, default/temporary flag, password policy, rate limits, disabled-account behavior |
| Session           | header/cookie mechanism, expiry, revoke/logout, refresh policy, CSRF/CORS, approved client token handling                         |
| Permissions       | server permission keys, role responses, protected read/write/export routes; Alerts visibility ข้าม Overview/Players/Logs/CSV       |
| Error contract    | actual status codes / safe messages / field errors / request ID; distinguish 401/403/validation/conflict/network                  |
| Pagination/search | cursor/page rules, query filters, supported sort fields, timezone/date boundaries, stale response handling                        |
| Sensitive data    | pseudonym fields, note visibility, retention, minimum-data response projection; token/body redaction at Server                    |

## ความสามารถรายเมนู

1. **Overview** — stats definition, scope/date range, unread semantics, quizzes count, results/events schema. ไม่คำนวณคะแนนสุขภาพจิตจาก activity
2. **Alerts** — list/note/ack/delete contracts; reply path, receiver binding to alert, queue/offline/idempotency/accepted-delivered-read distinctions. ห้ามแสดง read จาก HTTP success อย่างเดียว
3. **Journeys** — CRUD with version/concurrency, ordered NPC steps, multiple dialog lines, quiz modes/choices/scored weights, value labels, CSV column allowlist, progress and export schemas. Content approval/publish must be separate confirmed capability
4. **Codes** — representation of unlimited/never; expiry timezone, duplicate constraints, regenerate old-code invalidation, disable vs expire; join code consumption remains Backend/game
5. **Players** — detail, set step/done/reset/delete attempt/player delete endpoints, affected records, retention and recovery, concurrency. Care records must not cascade-delete without approved policy
6. **Config** — allowed keys, types and ranges from server metadata; mock only implements the observed example key
7. **Users/roles** — list/create/update/disable/delete/reset, role permission catalog, self/last-admin protections, temporary password delivery and session invalidation
8. **Logs** — actual API/DB health, log/event/audit schemas and safe fields, filters/retention; no raw tokens, passwords or care message bodies

## Integration sequence

1. รับ sanitized OpenAPI + examples + sandbox accounts/data
2. เขียน contract mapping และ response validators โดยไม่เปลี่ยน public UI view-model โดยไม่จำเป็น
3. เพิ่ม live service ที่ตรง interface และใช้ transport; อย่าเปลี่ยน UI ให้ถือ mock rules เป็น business rules ของจริง
4. ตรวจ unauthorized/expired/forbidden/partial data/empty/error/concurrent update กับ sandbox
5. ตรวจ mutations, cancellation, uncertain timeout และ audit/retention กับทีม Backend; ไม่ retry mutation อัตโนมัติ
6. ตรวจ content approval และข้อมูลคำขอช่วยเหลือกับเจ้าของโครงการ
7. จึงทำ deployment และ end-to-end acceptance; งานปัจจุบันยังไม่ผ่านขั้นนี้
