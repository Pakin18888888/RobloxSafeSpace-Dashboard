/* Ordered Dialog/Quiz cards, scoped to the selected step. No network calls. */
window.SafeSpaceJourneyContent = function ({ state, writable, draw, dirty }) {
  const U = SafeSpaceUI,
    M = SafeSpaceJourneyModel;
  const { escape: E, btn: B, input: field, textarea, select } = U;
  const current = () => state.editor?.steps[state.step];
  const move = (items, index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
  };
  function controls(kind, index, length, readOnly, minimum = 1) {
    if (readOnly) return '';
    if (kind === 'block')
      return `<div class="row content-controls">${B('ทำสำเนา', 'duplicate-block', { kind: 'small', disabled: length >= 30 })}${B('ลบ', 'remove-block', { kind: 'danger small' })}</div>`;
    return `<div class="row content-controls"><button type="button" class="btn small nested-grip" aria-label="ลากจัดลำดับ หรือใช้ปุ่มลูกศรขึ้นลง">⠿</button>${B('ทำสำเนา', `duplicate-${kind}`, { kind: 'small', disabled: length >= (kind === 'line' ? 50 : 30) })}${B('ลบ', `remove-${kind}`, { kind: 'danger small', disabled: length <= minimum })}</div>`;
  }
  function questionView(q, qi, block, bi, off, readOnly) {
    return /* HTML */ `<section class="question-card" data-question="${qi}">
      <div class="row between">
        <h3 tabindex="-1">คำถาม ${qi + 1} / ${block.questions.length}</h3>
        ${controls('question', qi, block.questions.length, readOnly)}
      </div>
      ${field('คำถาม', 'question', q.title, 'text', `data-question-edit="title" data-quiz-edit="title" maxlength="300" ${off}`)}
      <fieldset class="choice-list">
        <legend>
          ตัวเลือกคำตอบ · ${block.mode === 'graded' ? 'เลือกวงกลมหน้าคำตอบที่ถูกต้อง' : 'ไม่มีคำตอบถูกหรือผิด'}
        </legend>
        ${q.choices.map((c, ci) => `<div class="choice-row">${block.mode === 'graded' ? `<input type="radio" name="answer-${bi}-${qi}" data-choice-answer="${ci}" aria-label="ตัวเลือก ${ci + 1} เป็นคำตอบที่ถูกต้อง" ${q.answer === ci ? 'checked' : ''} ${off}>` : '<span class="choice-dot" aria-hidden="true"></span>'}<label class="sr-only" for="choice-${bi}-${qi}-${ci}">ตัวเลือก ${ci + 1}</label><input id="choice-${bi}-${qi}-${ci}" data-choice="${ci}" value="${E(c)}" maxlength="300" placeholder="ตัวเลือก ${ci + 1}" ${off}>${!readOnly ? B('ลบ', 'remove-choice', { kind: 'ghost small', extra: `data-choice-index="${ci}" aria-label="ลบตัวเลือก ${ci + 1}"`, disabled: q.choices.length <= 2 }) : ''}</div>`).join('')}
      </fieldset>
      ${!readOnly ? B('เพิ่มตัวเลือก', 'add-choice', { kind: 'ghost small', icon: 'plus', disabled: q.choices.length >= 8 }) : ''}
    </section>`;
  }
  function blockView(block, bi, step, readOnly) {
    const off = readOnly ? 'disabled' : '';
    return /* HTML */ `<section
      class="card form-card content-block ${block.type === 'dialog' ? 'step-form' : 'question-form'}"
      data-block="${bi}"
      data-kind="${block.type}"
    >
      <div class="row between">
        <div>
          <span class="form-eyebrow"
            >CARD ${bi + 1} / ${block.type === 'dialog' ? 'DIALOG' : 'QUIZ'}</span
          >
          <h2 tabindex="-1">${block.type === 'dialog' ? 'บทสนทนา' : 'แบบทดสอบ'}</h2>
        </div>
        ${controls('block', bi, step.blocks.length, readOnly, 0)}
      </div>
      ${!readOnly ? '<span class="card-grip" title="ลากเพื่อจัดลำดับการ์ด" aria-hidden="true">⠿</span>' : ''}
      ${field('ชื่อการ์ด', 'blockTitle', block.title, 'text', `data-block-edit="title" maxlength="120" ${off}`)}
      ${
        block.type === 'dialog'
          ? `
        ${field('ชื่อ NPC ที่แสดงเหนือข้อความ', 'npcName', block.npcName, 'text', `data-block-edit="npcName" maxlength="120" ${off}`)}
        ${block.lines.map((l, li) => `<section class="dialog-line" data-line="${li}"><div class="row between"><h3 tabindex="-1">บทพูด ${li + 1} / ${block.lines.length}</h3>${controls('line', li, block.lines.length, readOnly)}</div>${SafeSpaceJourneyTools.lineField(l, readOnly)}${field('ชื่อผู้พูดเฉพาะบทนี้ (ไม่บังคับ)', 'speaker', l.speaker, 'text', `data-line-edit="speaker" maxlength="120" placeholder="เว้นว่างเพื่อใช้ชื่อ NPC ด้านบน" ${off}`)}</section>`).join('')}
        ${!readOnly ? B('เพิ่มบทพูด', 'add-line', { icon: 'plus', kind: 'ghost small', disabled: block.lines.length >= 50 }) : ''}
      `
          : `
        ${textarea('คำอธิบายแบบทดสอบ (ไม่บังคับ)', 'quizDescription', block.description, `data-block-edit="description" rows="2" maxlength="1000" ${off}`)}
        ${select(
          'ประเภทแบบทดสอบ',
          'mode',
          [
            { value: 'survey', label: 'Survey · ไม่มีถูกหรือผิด' },
            { value: 'graded', label: 'Graded · มีคำตอบถูก' },
          ],
          block.mode,
          `data-block-edit="mode" data-quiz-edit="mode" ${off}`,
        )}
        <label class="check"><input type="checkbox" data-block-edit="showCorrect" ${block.showCorrect ? 'checked' : ''} ${off} ${block.mode === 'survey' ? 'disabled' : ''}><span>แสดงเฉลยหลังส่งคำตอบ (เฉพาะ Graded)</span></label>
        ${block.questions.map((q, qi) => questionView(q, qi, block, bi, off, readOnly)).join('')}
        ${!readOnly ? B('เพิ่มคำถาม', 'add-question', { icon: 'plus', kind: 'ghost small', disabled: block.questions.length >= 30 }) : ''}
      `
      }
    </section>`;
  }
  function render(step, readOnly) {
    const off = readOnly ? 'disabled' : '';
    const graded = step.blocks
      .filter((b) => b.type === 'quiz' && b.mode === 'graded')
      .reduce((n, b) => n + b.questions.length, 0);
    return /* HTML */ `<section class="card form-card" id="journey-content">
        <div class="form-card-heading">
          <div class="row between">
            <span class="form-eyebrow">STEP ${state.step + 1}</span
            >${!readOnly ? B('ลบขั้นตอน', 'remove-step', { kind: 'danger small', disabled: state.editor.steps.length === 1 }) : ''}
          </div>
          <h2 tabindex="-1">จัดเนื้อหาภายในขั้นตอน</h2>
          <p>ผู้เล่นจะพบการ์ดตามลำดับจากบนลงล่าง เพิ่ม Dialog และ Quiz สลับกันได้</p>
        </div>
        <div class="form-grid">
          ${field('ชื่อขั้นตอน', 'stepName', step.name, 'text', `data-step-edit="name" maxlength="120" ${off}`)}${field('รหัสตัวละคร (NPC ID)', 'npc', step.npc, 'text', `data-step-edit="npc" maxlength="60" ${off}`)}
        </div>
      </section>
      ${step.blocks.map((b, i) => blockView(b, i, step, readOnly)).join('') || '<div class="quiz-empty">ยังไม่มีการ์ด เพิ่ม Dialog หรือ Quiz เพื่อเริ่มต้น</div>'}
      <details class="card form-card">
        <summary>เกณฑ์ผ่านของขั้นตอน</summary>

        ${field('เกณฑ์ผ่าน: จำนวนคำตอบถูกที่ต้องได้ (ไม่บังคับ)', 'passMark', step.passMark ?? '', 'number', `data-step-edit="passMark" min="1" max="${graded}" step="1" placeholder="เว้นว่าง = ทำกิจกรรมครบ" ${off}`)}
        <p class="field-hint">
          มี ${graded} คำถามแบบ Graded ในขั้นนี้ · เกณฑ์ผ่านและการแสดงเฉลยเป็นการตั้งค่าจำลอง
          ยังไม่บังคับใช้ในเกมจริง
        </p>
      </details>`;
  }
  function locate(element) {
    const step = current();
    const bi = Number(element.closest('[data-block]')?.dataset.block);
    const block = step?.blocks[bi];
    const qi = Number(element.closest('[data-question]')?.dataset.question);
    const li = Number(element.closest('[data-line]')?.dataset.line);
    return { step, bi, block, qi, li, question: block?.questions?.[qi], line: block?.lines?.[li] };
  }
  function repaint(selector) {
    dirty();
    draw();
    const target = document.querySelector(selector);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  function bind() {
    if (!state.editor || !writable('journeys')) return;
    document.querySelectorAll('[data-step-edit]').forEach(
      (el) =>
        (el.oninput = () => {
          const key = el.dataset.stepEdit;
          current()[key] =
            key === 'passMark' ? (el.value === '' ? null : Number(el.value)) : el.value;
          dirty();
        }),
    );
    for (const [attribute, part] of [
      ['blockEdit', 'block'],
      ['lineEdit', 'line'],
      ['questionEdit', 'question'],
    ]) {
      const selector = '[data-' + attribute.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ']';
      document.querySelectorAll(selector).forEach((el) => {
        if (el.isContentEditable) return;
        el.oninput = () => {
          locate(el)[part][el.dataset[attribute]] = el.type === 'checkbox' ? el.checked : el.value;
          dirty();
        };
        if (el.dataset[attribute] === 'mode')
          el.onchange = () => {
            const { bi } = locate(el);
            el.oninput();
            repaint(`[data-block="${bi}"] [data-block-edit=mode]`);
          };
      });
    }
    document.querySelectorAll('[data-choice]').forEach(
      (el) =>
        (el.oninput = () => {
          locate(el).question.choices[Number(el.dataset.choice)] = el.value;
          dirty();
        }),
    );
    document.querySelectorAll('[data-choice-answer]').forEach(
      (el) =>
        (el.onchange = () => {
          locate(el).question.answer = Number(el.dataset.choiceAnswer);
          dirty();
        }),
    );
  }
  function action(name, button) {
    if (
      !/^(insert-(dialog|quiz)|duplicate-(block|line|question)|add-(dialog|quiz|line|question|choice)|remove-(block|line|question|choice)|move-(block|line|question))$/.test(
        name,
      )
    )
      return false;
    if (!state.editor || !writable('journeys')) return true;
    const { step, bi, block, qi, li, question } = locate(button);
    let selector = '#journey-content h2';
    if (name.startsWith('insert-') || name === 'duplicate-block') {
      if (!block || step.blocks.length >= 30) return true;
      const item =
        name === 'duplicate-block'
          ? structuredClone(block)
          : name === 'insert-dialog'
            ? M.dialog()
            : M.quiz();
      step.blocks.splice(bi + 1, 0, item);
      repaint(`[data-block="${bi + 1}"] [data-block-edit=title]`);
      return true;
    }
    if (name === 'add-dialog' || name === 'add-quiz') {
      if (step.blocks.length >= 30) return true;
      step.blocks.push(name === 'add-dialog' ? M.dialog() : M.quiz());
      repaint(`[data-block="${step.blocks.length - 1}"] [data-block-edit=title]`);
      return true;
    }
    if (!block) return true;
    if (name === 'add-line' && block.lines?.length < 50) {
      block.lines.push(M.line());
      selector = `[data-block="${bi}"] [data-line="${block.lines.length - 1}"] [data-line-edit=text]`;
    }
    if (name === 'add-question' && block.questions?.length < 30) {
      block.questions.push(M.question());
      selector = `[data-block="${bi}"] [data-question="${block.questions.length - 1}"] [data-question-edit=title]`;
    }
    if (name === 'add-choice' && question?.choices.length < 8) {
      question.choices.push('');
      selector = `[data-block="${bi}"] [data-question="${qi}"] [data-choice="${question.choices.length - 1}"]`;
    }
    if (name === 'remove-choice') {
      const ci = Number(button.dataset.choiceIndex);
      if (
        !question ||
        question.choices.length <= 2 ||
        !Number.isInteger(ci) ||
        ci < 0 ||
        ci >= question.choices.length
      )
        return true;
      question.choices.splice(ci, 1);
      if (question.answer > ci) question.answer--;
      else if (question.answer === ci) question.answer = -1;
      selector = `[data-block="${bi}"] [data-question="${qi}"] [data-choice="${Math.min(ci, question.choices.length - 1)}"]`;
    }
    const kind = name.split('-')[1];
    const list =
      kind === 'block'
        ? step.blocks
        : kind === 'line'
          ? block.lines
          : kind === 'question'
            ? block.questions
            : null;
    const index = kind === 'block' ? bi : kind === 'line' ? li : qi;
    if (name.startsWith('duplicate-') && list) {
      if (list.length >= (kind === 'line' ? 50 : 30)) return true;
      list.splice(index + 1, 0, structuredClone(list[index]));
      repaint(`[data-block="${bi}"] [data-${kind}="${index + 1}"] h3`);
      return true;
    }
    if (name.startsWith('move-') && list) {
      move(list, index, Number(button.dataset.direction));
      const next = Math.max(0, Math.min(list.length - 1, index + Number(button.dataset.direction)));
      selector =
        kind === 'block'
          ? `[data-block="${next}"] h2`
          : `[data-block="${bi}"] [data-${kind}="${next}"] h3`;
    }
    if (name.startsWith('remove-') && list) {
      if (list.length <= (kind === 'block' ? 0 : 1)) return true;
      U.confirm(
        'นำรายการนี้ออกจากร่าง?',
        `ลบ${kind === 'block' ? 'การ์ดและเนื้อหาทั้งหมดภายในการ์ด' : kind === 'line' ? 'บทพูดนี้' : 'คำถามและตัวเลือกของคำถามนี้'} เฉพาะร่างปัจจุบัน จนกดบันทึกร่าง`,
        async () => {
          list.splice(index, 1);
          repaint('#journey-content h2');
        },
        { danger: true, label: 'ลบออกจากร่าง' },
      );
      return true;
    }
    repaint(selector);
    return true;
  }
  return { render, bind, action };
};
