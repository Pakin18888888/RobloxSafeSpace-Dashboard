/* Local authoring model only. Backend payload mapping still requires a contract. */
(function (root) {
  'use strict';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const line = () => ({ text: '', speaker: '' });
  const question = () => ({ title: '', choices: ['', ''], answer: -1 });
  const dialog = () => ({ type: 'dialog', title: 'บทสนทนาใหม่', npcName: '', lines: [line()] });
  const quiz = () => ({
    type: 'quiz',
    title: 'แบบทดสอบใหม่',
    description: '',
    mode: 'survey',
    showCorrect: false,
    questions: [question()],
  });
  function normalize(journey) {
    const j = clone(journey);
    j.steps = j.steps.map((step) => {
      if (!Object.hasOwn(step, 'blocks')) {
        step.blocks = [];
        if (typeof step.dialog === 'string')
          step.blocks.push({ ...dialog(), lines: [{ text: step.dialog, speaker: '' }] });
        if (step.quiz)
          step.blocks.push({
            ...quiz(),
            title: step.quiz.title.slice(0, 120),
            mode: step.quiz.mode,
            questions: [clone(step.quiz)],
          });
      }
      if (!Object.hasOwn(step, 'passMark')) step.passMark = null;
      delete step.dialog;
      delete step.quiz;
      return step;
    });
    return j;
  }
  const quizCount = (j) =>
    j.steps.reduce(
      (n, s) =>
        n + (s.blocks ? s.blocks.filter((b) => b.type === 'quiz').length : Number(Boolean(s.quiz))),
      0,
    );
  function validateStep(step, required, fail) {
    if (!Array.isArray(step.blocks) || step.blocks.length < 1 || step.blocks.length > 30)
      fail('VALIDATION', 'แต่ละขั้นต้องมี 1–30 การ์ด');
    let graded = 0;
    for (const [i, block] of step.blocks.entries()) {
      const label = `การ์ด ${i + 1}`;
      required(block.title, `${label}: ชื่อ`, 120);
      if (block.type === 'dialog') {
        if (typeof block.npcName !== 'string' || block.npcName.length > 120)
          fail('VALIDATION', `${label}: ชื่อผู้พูดยาวเกินกำหนด`);
        if (!Array.isArray(block.lines) || block.lines.length < 1 || block.lines.length > 50)
          fail('VALIDATION', `${label}: ต้องมี 1–50 บทพูด`);
        block.lines.forEach((l, k) => {
          required(l.text, `${label}: บทพูด ${k + 1}`, 3000);
          if (typeof l.speaker !== 'string' || l.speaker.length > 120)
            fail('VALIDATION', `${label}: ชื่อผู้พูดไม่ถูกต้อง`);
        });
      } else if (block.type === 'quiz') {
        if (!['survey', 'graded'].includes(block.mode))
          fail('VALIDATION', `${label}: รูปแบบ Quiz ไม่ถูกต้อง`);
        if (
          typeof block.description !== 'string' ||
          block.description.length > 1000 ||
          typeof block.showCorrect !== 'boolean'
        )
          fail('VALIDATION', `${label}: คำอธิบายหรือการแสดงเฉลยไม่ถูกต้อง`);
        if (
          !Array.isArray(block.questions) ||
          block.questions.length < 1 ||
          block.questions.length > 30
        )
          fail('VALIDATION', `${label}: ต้องมี 1–30 คำถาม`);
        for (const [k, q] of block.questions.entries()) {
          required(q.title, `${label}: คำถาม ${k + 1}`, 300);
          if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 8)
            fail('VALIDATION', `${label}: คำถาม ${k + 1} ต้องมี 2–8 ตัวเลือก`);
          q.choices.forEach((c) => required(c, 'ตัวเลือก', 300));
          if (
            block.mode === 'graded' &&
            (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length)
          )
            fail('VALIDATION', `${label}: เลือกคำตอบที่ถูกต้องของคำถาม ${k + 1}`);
        }
        if (block.mode === 'graded') graded += block.questions.length;
      } else fail('VALIDATION', 'ชนิดการ์ดไม่รองรับ');
    }
    if (
      step.passMark !== null &&
      (!Number.isInteger(step.passMark) || step.passMark < 1 || step.passMark > graded)
    )
      fail('VALIDATION', `เกณฑ์ผ่านต้องเป็น 1–${graded} ตามจำนวนคำถาม Graded หรือเว้นว่าง`);
  }
  const api = { normalize, quizCount, validateStep, line, question, dialog, quiz };
  root.SafeSpaceJourneyModel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
