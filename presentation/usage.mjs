import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const toolPath = process.env.ARTIFACT_TOOL_PATH;
if (!toolPath) throw new Error('Set ARTIFACT_TOOL_PATH to the bundled artifact_tool.mjs');
const { Presentation, PresentationFile } = await import(pathToFileURL(toolPath).href);

const out = path.join(here, '.usage-build');
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
    'Roblox Safe Space  •  คู่มือการทำงานสำหรับทีม สสส.  •  ระบบสาธิต',
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

function textSlide(title, page, lines, notes='') {
 const s=base(title,page);
 body(s,lines,76,160,1120,95,24);
 note(s,notes);
 return s;
}
function flow(s, labels, y) {
 const width=238, gap=47;
 labels.forEach((label,i)=>{
  const x=70+i*(width+gap);
  const box=s.shapes.add({geometry:'roundRect',position:{left:x,top:y,width,height:105},fill:C.white,line:{fill:C.teal,width:2}});
  addText(s,label,x+15,y+18,width-30,78,21,C.ink,true);
  if(i<labels.length-1) addText(s,'→',x+width+6,y+26,35,50,26,C.teal);
 });
}
{
 const s=base('',1,true);
 addText(s,'Roblox Safe Space',75,125,1120,90,46,C.white,true);
 addText(s,'การใช้งานระบบดูแลกิจกรรม',75,245,1120,85,36,C.white,true);
 addText(s,'หน้าที่ของแต่ละหน้า และขั้นตอนการทำงานของทีม',75,365,1100,90,25,C.mint);
 addText(s,'สำหรับการนำเสนอและหารือกับทีม สสส.',75,535,1100,60,23,C.white);
 note(s,'นำเสนอจากมุมผู้ดูแลโครงการ ภาพและการทำงานในชุดนี้เป็นระบบสาธิตที่ใช้ข้อมูลจำลอง การเชื่อมกับเกมและระบบจริงยังรอยืนยันร่วมกับทีม');
}
textSlide('ระบบนี้ช่วยทีมดูแลงานอะไรบ้าง',2,[
 'เตรียมเนื้อหากิจกรรมและกำหนดลำดับที่ผู้เล่นจะพบ',
 'จัดรหัสเข้าร่วมกิจกรรม และติดตามความคืบหน้าของผู้เล่น',
 'เปิดดูคำขอความช่วยเหลือตามสิทธิ์ของเจ้าหน้าที่',
 'กำหนดผู้เข้าถึงข้อมูล และตรวจสอบประวัติการดำเนินงาน'
]);
{
 const s=base('เส้นทางการใช้งานของผู้ดูแล (Userflow)',3);
 flow(s,['เปิดเว็บไซต์\nเข้าสู่ระบบ','ตรวจสอบบัญชี\nและสิทธิ์','ดูภาพรวม\nเลือกเมนู','ทำงานตามสิทธิ์\nออกจากระบบ'],170);
 body(s,['เข้าสู่ระบบไม่สำเร็จ — ตรวจข้อมูลแล้วลองใหม่',
 'ไม่มีสิทธิ์ — ติดต่อผู้ดูแลบัญชีเพื่อขอสิทธิ์ที่เหมาะสม',
 'หมดเวลาใช้งาน — เข้าสู่ระบบอีกครั้ง'],80,340,1110,80,23);
 note(s,'ลูกศรแสดงลำดับหลัก การตรวจบัญชีและสิทธิ์จริงเป็นหน้าที่ของระบบส่วนกลาง ปัจจุบันสาธิตด้วยบัญชีจำลอง');
}
{
 const s=base('เมนูและหน้าที่ของแต่ละหน้า',4);
 body(s,['Overview  ภาพรวมการเข้าร่วมและกิจกรรมล่าสุด',
 'Journeys  เนื้อหากิจกรรม บทสนทนา และแบบทดสอบ',
 'Codes  รหัสเข้าร่วมและเงื่อนไขการใช้รหัส',
 'Players  ค้นหาผู้เล่นและดูความคืบหน้า'],75,165,1130,110,24);
}
{
 const s=base('เมนูสำหรับดูแลข้อมูลและสิทธิ์',5);
 body(s,['Alerts  คำขอความช่วยเหลือและบันทึกการติดตาม',
 'Users  บัญชีเจ้าหน้าที่ บทบาท และสิทธิ์การทำงาน',
 'Config  ค่าตั้งต้นที่ระบบใช้กับกิจกรรม',
 'Logs  ประวัติการดำเนินงานและสถานะระบบ'],75,165,1130,110,24);
 note(s,'เจ้าหน้าที่เปิดดูและดำเนินการได้ตามสิทธิ์ที่ได้รับ การตั้งค่าระบบควรดำเนินการโดยผู้รับผิดชอบที่กำหนด');
}
{
 const s=base('ภาพรวมช่วยให้ทีมเลือกงานที่จะติดตาม',6);
 addImage(s,'overview.png',60,145,780,460,'ภาพหน้า Overview ของระบบสาธิต');
 body(s,['จำนวนผู้เล่น\nและแบบทดสอบ','ผลกิจกรรมล่าสุด\nและรายการแจ้งเตือน','เลือกเปิดรายละเอียด\nในเมนูที่เกี่ยวข้อง'],870,170,340,145,22);
 note(s,'ใช้ตัวเลขเพื่อดูการเข้าร่วมและความคืบหน้าของกิจกรรม การประเมินสุขภาพจิตต้องใช้กระบวนการที่ผู้เชี่ยวชาญและโครงการกำหนด ตัวเลขในภาพเป็นข้อมูลตัวอย่าง');
}
{
 const s=base('การเตรียมกิจกรรม (Workflow)',7);
 flow(s,['ตั้งชื่อกิจกรรม\nและคำอธิบาย','กำหนดขั้นตอน\nและตัวละคร','เพิ่มบทสนทนา\nและคำถาม','ตรวจเนื้อหา\nบันทึกร่าง'],175);
 body(s,['ผู้จัดทำเนื้อหาเรียงลำดับให้สอดคล้องกับประสบการณ์ของผู้เล่น',
 'ผู้รับผิดชอบเนื้อหาตรวจความเหมาะสมก่อนใช้งานกับเยาวชน',
 'ขั้นอนุมัติและการเผยแพร่เข้าเกมต้องตกลงร่วมกับทีมโครงการ'],75,340,1130,90,23);
 note(s,'ในระบบสาธิตมีสถานะร่างและรอตรวจเนื้อหา การเปลี่ยนสถานะยังไม่ใช่กระบวนการอนุมัติจริงหรือการเผยแพร่เข้า Roblox');
}
textSlide('การแก้ไขบทสนทนาและคำถาม',8,[
 'แต่ละขั้นตอนประกอบด้วยบทสนทนาและแบบทดสอบ',
 'ใช้แถบด้านข้างเพิ่มเนื้อหา และทำสำเนารายการที่ใช้ซ้ำ',
 'ลากขั้นตอนหรือการ์ดเพื่อเปลี่ยนลำดับการเล่น',
 'ช่องที่มีดาวแดงต้องกรอกให้ครบก่อนบันทึก'
],'บทสนทนาจัดรูปแบบข้อความได้ คำถามเพิ่มตัวเลือกและกำหนดคำตอบได้ตามชนิดแบบทดสอบ การลากมีสีแสดงรายการและตำแหน่งวาง การแสดงรูปแบบในเกมยังต้องตรวจร่วมกับทีม Roblox');
{
 const s=base('รหัสเข้าร่วมและการติดตามผู้เล่น',9);
 flow(s,['เลือกกิจกรรม\nในหน้า Codes','ตั้งรหัส อายุรหัส\nและจำนวนการใช้','ผู้เล่นเข้าร่วม\nด้วยรหัสกิจกรรม','ดูความคืบหน้า\nในหน้า Players'],185);
 addText(s,'ทีมใช้ประวัติการทำกิจกรรมเพื่อดูว่าผู้เล่นอยู่ขั้นใดและทำแบบทดสอบใดแล้ว',75,370,1120,110,25);
 addText(s,'การรับรหัสและส่งผลจากเกมเป็นส่วนเชื่อมต่อที่ยังต้องทดสอบกับระบบจริง',75,535,1120,70,21,C.teal);
 note(s,'แผนภาพแสดงการทำงานที่ตั้งใจใช้เมื่อเชื่อมครบ หน้า Codes และ Players ปัจจุบันใช้ข้อมูลจำลอง การรีเซ็ตหรือการลบข้อมูลต้องตรวจสิทธิ์และยืนยัน');
}
{
 const s=base('การติดตามคำขอความช่วยเหลือ',10);
 flow(s,['เปิดรายการ\nในหน้า Alerts','อ่านรายละเอียด\nตามสิทธิ์','บันทึกทีม\nหรือตอบกลับ','ปรับสถานะ\nและติดตามต่อ'],165);
 body(s,['บันทึกทีมช่วยให้เจ้าหน้าที่รับช่วงงานต่อกันได้',
 'การตอบกลับใช้แนวทางและผู้รับผิดชอบที่โครงการกำหนด',
 'ข้อมูลละเอียดอ่อนเปิดดูเฉพาะผู้ได้รับสิทธิ์'],75,345,1120,85,24);
 note(s,'เป็นเส้นทางการใช้งานสาธิต การแจ้งเตือนจริง การส่งคำตอบกลับผู้เล่น ผู้รับผิดชอบ และขั้นส่งต่อความช่วยเหลือต้องยืนยันกับโครงการ หลีกเลี่ยงการแสดงข้อความคำขอจริงในการนำเสนอ');
}
{
 const s=base('ระบบรับคำสั่งและส่งผลอย่างไร (Workflow)',11);
 flow(s,['เจ้าหน้าที่\nเลือกและยืนยัน','หน้าเว็บไซต์\nส่งคำขอ','ตรวจสิทธิ์\nและบันทึกข้อมูล','หน้าเว็บไซต์\nแสดงผลกลับ'],170);
 body(s,['สำเร็จ — แสดงข้อมูลที่อัปเดตแล้ว',
 'ข้อมูลว่าง — แจ้งว่าไม่มีรายการตามเงื่อนไขที่ค้นหา',
 'ล้มเหลว — แสดงข้อความให้แก้ข้อมูลหรือลองอีกครั้ง'],75,335,1130,85,23);
 note(s,'ระบบส่วนกลางหมายถึง Backend API และฐานข้อมูล ซึ่งรับผิดชอบการตรวจสิทธิ์ ความถูกต้อง และประวัติการทำรายการ แผนภาพนี้อธิบายการเชื่อมที่ต้องมี ปัจจุบันเว็บไซต์สาธิตผลผ่านข้อมูลจำลอง');
}
textSlide('การทดลองใช้งานและข้อตกลงร่วมกับทีม',12,[
 'ชุดสาธิตใช้ข้อมูลตัวอย่างเพื่อทดลองเส้นทางการทำงาน',
 'ร่างที่บันทึกอยู่ในหน้าเว็บจะกลับเป็นข้อมูลตัวอย่างเมื่อรีโหลด',
 'ทีมโครงการร่วมกำหนดผู้เข้าถึงข้อมูลและผู้รับผิดชอบคำขอ',
 'ทีมร่วมยืนยันขั้นตรวจเนื้อหาและทดสอบการเชื่อมเกมก่อนใช้จริง'
],'ชวนผู้เข้าร่วมทดลองตามสถานการณ์ เช่น สร้างกิจกรรมหนึ่งชุด ค้นหาความคืบหน้าผู้เล่น และติดตามคำขอหนึ่งรายการ แล้วหารือว่าบทบาทและลำดับงานตรงกับการทำงานของทีม สสส. หรือไม่');
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
