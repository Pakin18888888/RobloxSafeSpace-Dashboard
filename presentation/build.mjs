import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const toolPath = process.env.ARTIFACT_TOOL_PATH;
if (!toolPath) throw new Error('Set ARTIFACT_TOOL_PATH to the bundled artifact_tool.mjs');
const { Presentation, PresentationFile } = await import(pathToFileURL(toolPath).href);

const out = path.join(here, '.build');
await fs.mkdir(out, { recursive: true });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = {
  navy: '#10263c',
  deep: '#0b1725',
  ink: '#182b43',
  muted: '#52677d',
  teal: '#087f78',
  mint: '#6bdbcc',
  pale: '#f4f7fa',
  white: '#ffffff',
  line: '#dbe5ec',
};
const font = 'Leelawadee UI';

function addText(slide, value, x, y, w, h, size = 22, color = C.ink, bold = false) {
  const shape = slide.shapes.add({
    geometry: 'textbox',
    position: { left: x, top: y, width: w, height: h },
    fill: 'none',
    line: { style: 'solid', fill: 'none', width: 0 },
  });
  shape.text = value;
  shape.text.style = { typeface: font, fontSize: `${size}pt`, bold, color };
  return shape;
}
function base(title, page, dark = false) {
  const s = deck.slides.add();
  s.background.fill = dark ? C.navy : C.pale;
  if (title) addText(s, title, 70, 43, 1135, 76, 32, dark ? C.white : C.ink, true);
  addText(
    s,
    'Roblox Safe Space  •  Frontend Dashboard  •  ข้อมูลจำลอง',
    72,
    675,
    990,
    22,
    11,
    dark ? '#c2d4e3' : C.muted,
  );
  addText(s, String(page).padStart(2, '0'), 1160, 675, 45, 22, 11, dark ? '#c2d4e3' : C.muted);
  return s;
}
function body(slide, lines, x, y, w, gap = 75, size = 21, color = C.ink) {
  lines.forEach((line, i) => addText(slide, line, x, y + i * gap, w, gap - 8, size, color));
}
function addImage(slide, name, x, y, w, h, alt) {
  const bytes = imageBytes.get(name);
  slide.images.add({
    blob: bytes,
    contentType: 'image/png',
    position: { left: x, top: y, width: w, height: h },
    fit: 'contain',
    alt,
  });
}
function note(slide, text) {
  slide.speakerNotes.text = text;
}
const imageBytes = new Map();
for (const name of ['login.png', 'overview.png', 'journey-content.png', 'alerts.png']) {
  const bytes = await fs.readFile(path.join(here, 'assets', name));
  imageBytes.set(name, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}

// 1 — cover
{
  const s = base('', 1, true);
  addText(s, 'Roblox Safe Space', 70, 110, 590, 88, 47, C.white, true);
  addText(s, 'Admin Dashboard', 70, 202, 570, 75, 42, C.mint, true);
  addText(s, 'สรุปงาน Frontend สำหรับทีม สสส.', 74, 318, 555, 75, 25, C.white);
  addText(s, '18 พฤศจิกายน 2026', 74, 410, 470, 37, 19, '#c2d4e3');
  addImage(s, 'login.png', 690, 120, 520, 430, 'หน้าจอเข้าสู่ระบบของต้นแบบ Frontend');
  note(s, 'นำเสนอสิ่งที่ทำในฝั่ง Web Dashboard ณ 18 พฤศจิกายน 2026 ภาพหน้าจอเป็นข้อมูลจำลอง ไม่มีข้อมูลเยาวชนจริง');
}

// 2 — scope
{
  const s = base('ขอบเขตงาน Frontend', 2);
  addText(s, 'Web Dashboard สำหรับเจ้าหน้าที่', 72, 145, 620, 62, 29, C.teal, true);
  body(
    s,
    [
      'ออกแบบหน้าจอ Login และการนำทาง',
      'แสดงข้อมูล จัดการฟอร์ม และสถานะการทำงาน',
      'เตรียมชั้น Service สำหรับต่อ API ของทีม',
    ],
    74,
    242,
    660,
    83,
    22,
  );
  addText(s, 'Backend ตรวจตัวตน สิทธิ์ ข้อมูลจริง และการเชื่อมเกม', 74, 540, 1050, 65, 21, C.muted);
  note(
    s,
    'หน้าที่ของผู้พัฒนาคือ UI และการเรียก API เมื่อได้ contract จริง Backend และ Database ไม่ได้อยู่ใน repository ชุดนี้',
  );
}

// 3 — flow
{
  const s = base('เส้นทางใช้งานของเจ้าหน้าที่', 3);
  const steps = [
    ['01', 'เปิดเว็บและ Login'],
    ['02', 'ตรวจตัวตนและสิทธิ์'],
    ['03', 'ดู Overview'],
    ['04', 'เลือกเมนูและทำงาน'],
    ['05', 'Logout'],
  ];
  steps.forEach((row, i) => {
    const y = 156 + i * 94;
    addText(s, row[0], 88, y, 72, 48, 25, C.teal, true);
    addText(s, row[1], 183, y, 825, 48, 25, C.ink, i === 0 || i === 4);
    if (i < steps.length - 1) addText(s, '↓', 95, y + 50, 45, 45, 21, C.muted);
  });
  addText(
    s,
    'กรณีผิดพลาด: Login ไม่ผ่าน • ไม่มีสิทธิ์ • โหลดล้มเหลว • Session หมดอายุ',
    78,
    620,
    1100,
    41,
    18,
    C.muted,
  );
  note(
    s,
    'ใช้ flow-review.html และ workflow.html เป็นเอกสารรายละเอียด เส้นทางนี้สื่อว่ามีเงื่อนไขหลายกรณี ไม่ใช่การรับรองว่า Backend จริงเชื่อมแล้ว',
  );
}

// 4 — overview
{
  const s = base('Dashboard Overview', 4);
  addImage(s, 'overview.png', 50, 145, 800, 500, 'ภาพหน้าจอ Overview ของต้นแบบ');
  addText(s, 'เห็นภาพรวมในหน้าเดียว', 875, 156, 325, 45, 24, C.teal, true);
  body(
    s,
    [
      'จำนวน Players, Quizzes และ Submissions',
      'Unread Alerts ตามสิทธิ์ที่แสดง',
      'กราฟกิจกรรมและรายการล่าสุด',
      'กรองช่วงวันได้',
    ],
    875,
    233,
    325,
    83,
    18,
  );
  note(
    s,
    'ข้อมูลบนหน้าจอเป็น fixture จำลอง ไม่ตีความสุขภาพจิตจากพฤติกรรมการเล่น และไม่แสดงข้อความขอความช่วยเหลือใน Analytics',
  );
}

// 5 — menus
{
  const s = base('เมนูที่พัฒนาแล้ว', 5);
  const left = [
    ['Overview', 'ภาพรวม ตัวกรอง และรายการล่าสุด'],
    ['Alerts', 'รับเรื่อง บันทึกทีม และข้อความตอบจำลอง'],
    ['Journeys', 'จัดกิจกรรม Dialog และ Quiz'],
    ['Codes', 'สร้างและจัดการรหัสเข้าร่วม'],
  ];
  const right = [
    ['Players', 'ความคืบหน้าและประวัติ Quiz'],
    ['Config', 'แก้ไขค่าตามชนิดข้อมูล'],
    ['Users', 'เจ้าหน้าที่ บทบาท และสิทธิ์'],
    ['Logs', 'สถานะและประวัติระบบ'],
  ];
  [
    [left, 74],
    [right, 664],
  ].forEach(([items, x]) =>
    items.forEach(([name, detail], i) => {
      const y = 156 + i * 113;
      addText(s, name, x, y, 530, 43, 24, C.teal, true);
      addText(s, detail, x, y + 42, 540, 52, 18, C.ink);
    }),
  );
  note(s, 'ทั้ง 8 เมนูมี UI และ mock behavior ให้ทดลองได้ สถานะบริการจริงยังรอ API contract');
}

// 6 — editor
{
  const s = base('Journey Editor', 6);
  addText(s, 'สร้างเนื้อหาตามลำดับ Step → Dialog / Quiz', 72, 125, 1135, 45, 21, C.teal, true);
  addImage(
    s,
    'journey-content.png',
    50,
    188,
    760,
    430,
    'ภาพหน้าจอ Journey Editor พร้อม Quiz หลายคำถาม',
  );
  body(
    s,
    [
      'Add line: หลายบทพูดต่อ Dialog',
      'Add question / choice: หลายคำถามต่อ Quiz',
      'เพิ่ม Dialog และ Quiz หลายการ์ดต่อ Step',
      'จัดลำดับและยืนยันก่อนลบ',
    ],
    840,
    218,
    350,
    93,
    18,
  );
  note(
    s,
    'อธิบายว่า Editor เป็นฟอร์มแบบการ์ด ข้อมูลเดิมถูกแปลงเป็นรูปแบบใหม่ใน MockService มีการตรวจเกณฑ์ผ่านที่ระดับต้นแบบเท่านั้น',
  );
}

// 7 — care
{
  const s = base('Alerts และการคุ้มครองข้อมูล', 7);
  addImage(s, 'alerts.png', 48, 145, 800, 500, 'หน้าจอ Alerts ที่ใช้ข้อมูลจำลอง');
  body(
    s,
    [
      'แยกข้อความผู้เล่นกับบันทึกภายในทีม',
      'แสดงข้อมูลตามสิทธิ์ของหน้าจอ',
      'ข้อความตอบยังไม่ถูกส่งเข้า Roblox',
      'ข้อมูลคำขอไม่ไปรวมในกราฟภาพรวม',
    ],
    875,
    177,
    330,
    100,
    18,
  );
  note(s, 'ในงานจริง Backend ต้องบังคับใช้สิทธิ์และนโยบายการเก็บข้อมูล สิ่งที่เห็นในภาพเป็นการจำลองเพื่อรีวิว UX เท่านั้น');
}

// 8 — architecture
{
  const s = base('การทำงานของ Frontend', 8);
  addText(s, 'Admin', 73, 176, 150, 50, 26, C.teal, true);
  addText(s, '→', 227, 176, 80, 50, 26, C.muted);
  addText(s, 'หน้าจอ Dashboard', 315, 176, 325, 50, 26, C.ink, true);
  addText(s, '→', 658, 176, 80, 50, 26, C.muted);
  addText(s, 'Service layer', 742, 176, 375, 50, 26, C.teal, true);
  addText(s, 'ปัจจุบัน', 74, 302, 155, 45, 22, C.muted, true);
  addText(s, 'MockService + ข้อมูลสมมติในหน่วยความจำ', 243, 302, 930, 55, 23, C.ink);
  addText(s, 'เมื่อได้รับ API', 74, 408, 185, 45, 22, C.muted, true);
  addText(
    s,
    'ยืนยัน contract → map request/response → ทดสอบกับ Backend',
    243,
    408,
    930,
    70,
    23,
    C.ink,
  );
  addText(
    s,
    'Frontend ซ่อนปุ่มตามสิทธิ์ที่ได้รับ • Backend ต้องตรวจสิทธิ์ทุกคำขอจริง',
    74,
    557,
    1115,
    70,
    20,
    C.teal,
  );
  note(
    s,
    'ขณะนี้ ContractApi เป็น transport ที่ไม่ถูกเปิดใช้งาน และจะไม่เดา endpoint หรือถือว่า mock success คือผลจาก Backend',
  );
}

// 9 — QA/status
{
  const s = base('สถานะงานและการตรวจสอบ', 9);
  addText(s, 'ทำแล้ว', 76, 156, 210, 53, 29, C.teal, true);
  body(
    s,
    [
      'Login และ 8 เมนูพร้อมทดลอง',
      'Light / Dark, รองรับ 320–1440 px',
      'Loading / Error / Empty / ยืนยัน',
      'Service tests ผ่าน 13 กรณี',
    ],
    76,
    226,
    590,
    85,
    20,
  );
  addText(s, 'รอเชื่อมจริง', 733, 156, 385, 53, 29, C.ink, true);
  body(
    s,
    ['Login และสิทธิ์จาก Server', 'ข้อมูลจาก API จริง', 'การส่งข้อความเข้าเกม', 'ทดสอบร่วมกับทีม Backend'],
    733,
    226,
    460,
    85,
    20,
  );
  note(
    s,
    'Service tests มี 13 กรณีและ browser regression ผ่านตาม docs/validation.md เป็นการทดสอบ Mock UI ไม่ใช่ end-to-end acceptance ของระบบจริง',
  );
}

// 10 — handoff
{
  const s = base('สิ่งที่ต้องรับก่อนเชื่อม Backend', 10, true);
  body(
    s,
    [
      '1  API contract และตัวอย่างข้อมูลที่ลบข้อมูลอ่อนไหวแล้ว',
      '2  วิธีจัดการ Session และสิทธิ์ของแต่ละบทบาท',
      '3  ข้อตกลงเรื่อง Alerts, การตอบกลับ และการเก็บข้อมูล',
      '4  รูปแบบ Journey / Quiz และขั้นอนุมัติเนื้อหา',
    ],
    79,
    155,
    1090,
    100,
    24,
    C.white,
  );
  addText(
    s,
    'หลังได้ข้อมูลครบ จะเชื่อม Service และทดสอบกับระบบจริงร่วมกัน',
    79,
    584,
    1095,
    60,
    22,
    C.mint,
    true,
  );
  note(
    s,
    'ขอให้ทีม Backend ส่ง OpenAPI หรือเอกสาร request/response และ sandbox ที่อนุญาตให้ทดสอบ จากนั้นจึงเชื่อมจริงโดยไม่เปลี่ยน UX หลักหากไม่จำเป็น',
  );
}

for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(
    path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`),
    new Uint8Array(await png.arrayBuffer()),
  );
}
const draft = path.join(out, 'candidate.pptx');
await (await PresentationFile.exportPptx(deck)).save(draft);
console.log(JSON.stringify({ draft, slideCount: deck.slides.items.length, renderDir: out }));
