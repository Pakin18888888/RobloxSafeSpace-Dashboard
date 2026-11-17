/* Journey metadata and step navigation. Nested content uses a local mock schema. */
window.SafeSpaceJourneyEditor = function (ctx) {
  'use strict';
  const { state, writable, pageHead, draw } = ctx;
  const U = SafeSpaceUI;
  const { escape: E, btn: B, input: field, textarea, select } = U;
  const $ = (selector) => document.querySelector(selector);

  function dirty() {
    state.dirty = true;
    const note = $('.page-head p');
    if (note) note.textContent = 'มีการแก้ไขที่ยังไม่บันทึก · ร่างจำลอง';
    const saveState = $('#editor-save-state');
    if (saveState) saveState.textContent = 'ยังไม่ได้บันทึกการแก้ไข';
  }

  function focusSection(section) {
    const target =
      section === 'details'
        ? $('#journey-details')
        : $(`[data-kind="${section}"]`) || $('#journey-content');
    if (!target) return;
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    target.querySelector('h2, h3')?.focus({ preventScroll: true });
  }

  function render() {
    const j = state.editor;
    const step = j.steps[state.step];
    const readOnly = !writable('journeys');
    const off = readOnly ? 'disabled' : '';

    return (
      pageHead(
        j.id ? 'Journey editor' : 'สร้าง Journey',
        readOnly
          ? 'ดูเนื้อหากิจกรรม · โหมดอ่านอย่างเดียว'
          : `${state.dirty ? 'มีการแก้ไขที่ยังไม่บันทึก' : 'เรียงเนื้อหาทีละขั้น เหมือนสร้างแบบฟอร์ม'} · ร่างจำลอง`,
        B('กลับรายการ', 'exit-editor', { icon: 'back' }),
        'CONTENT STUDIO / EDITOR',
      ) +
      /* HTML */ ` <div class="journey-form">
        <nav class="form-section-nav" aria-label="ไปยังส่วนของแบบฟอร์ม">
          ${[
            ['details', '1', 'ข้อมูลกิจกรรม'],
            ['dialog', '2', 'บทสนทนา'],
            ['quiz', '3', 'คำถาม'],
          ]
            .map(
              ([id, n, label]) =>
                /* HTML */ `<button type="button" data-action="editor-tab" data-tab="${id}">
                  <span>${n}</span>${label}
                </button>`,
            )
            .join('')}
        </nav>
        <section class="card form-card form-intro" id="journey-details">
          <div class="form-card-heading">
            <span class="form-eyebrow">เริ่มต้นที่นี่</span>
            <h2 tabindex="-1">กิจกรรมนี้เกี่ยวกับอะไร?</h2>
            <p>ตั้งชื่อและอธิบายสั้น ๆ เพื่อให้ทีมเข้าใจตรงกัน</p>
          </div>
          ${field('ชื่อ Journey', 'title', j.title, 'text', `data-edit="title" maxlength="120" placeholder="เช่น พื้นที่ของเรา" ${off}`)}
          ${textarea('คำอธิบายกิจกรรม', 'description', j.description, `data-edit="description" maxlength="1000" rows="3" placeholder="ผู้เล่นจะได้ทำอะไรในกิจกรรมนี้" ${off}`)}
          ${select(
            'สถานะเนื้อหา',
            'status',
            [
              { value: 'draft', label: 'Draft · กำลังร่าง' },
              { value: 'review', label: 'In review · รอตรวจเนื้อหา' },
            ],
            j.status,
            `data-edit="status" ${off}`,
          )}
          <p class="field-hint">สถานะจำลองสำหรับรีวิวเนื้อหา · ยังไม่มีการเผยแพร่เข้าเกม</p>
        </section>

        <section class="step-selector card" aria-label="ขั้นตอนของกิจกรรม">
          <div class="row between">
            <div>
              <span class="form-eyebrow">ลำดับการเล่น</span>
              <h2>ขั้นตอน ${state.step + 1} จาก ${j.steps.length}</h2>
            </div>
            ${!readOnly ? B('เพิ่มขั้นตอน', 'add-step', { icon: 'plus', kind: 'small', disabled: j.steps.length >= 30 }) : ''}
          </div>
          <div class="step-pills">
            ${j.steps.map((s, i) => /* HTML */ `<button type="button" data-action="select-step" data-index="${i}" aria-pressed="${i === state.step}"><span>${i + 1}</span>${E(s.name || 'ขั้นตอนใหม่')}</button>`).join('')}
          </div>
          <p class="field-hint">
            ${readOnly ? 'เลือกขั้นตอนเพื่อดูเนื้อหา' : 'คลิกเพื่อแก้ไข หรือลากขั้นตอนไปวางบนขั้นตอนอื่นเพื่อเปลี่ยนลำดับการเล่น'}
          </p>
        </section>

        ${step ? content.render(step, readOnly) : ''}

        <details class="card advanced-settings">
          <summary>การตั้งค่าเพิ่มเติม <span>ข้อความของระบบ · ผลรวม · Export</span></summary>
          <div class="advanced-body">
            ${field('ข้อความเมื่อคุย NPC ผิดลำดับ', 'outOfOrder', j.outOfOrder, 'text', `data-edit="outOfOrder" ${off}`)}
            ${field('ข้อความเมื่อกลับมาขั้นที่จบแล้ว', 'revisited', j.revisited, 'text', `data-edit="revisited" ${off}`)}
            ${field('ข้อความเมื่อจบ Journey', 'completed', j.completed, 'text', `data-edit="completed" ${off}`)}
            ${textarea('Value labels (key:ชื่อ · หนึ่งรายการต่อบรรทัด)', 'labels', j.labels.map((l) => `${l.key}:${l.label}`).join('\n'), `data-edit="labels" ${off}`)}
            ${field('CSV columns', 'csvColumns', j.csvColumns, 'text', `data-edit="csvColumns" ${off}`)}
            <label class="check"
              ><input
                type="checkbox"
                data-edit="showTotals"
                ${j.showTotals ? 'checked' : ''}
                ${off}
              /><span>แสดงผลรวมให้ผู้เล่นเมื่อจบ · ให้ทีมเนื้อหายืนยันความหมายคะแนนก่อน</span></label
            >
            <p class="field-hint">
              คอลัมน์จำลอง: playerId, journeyId, progress, status, updated · schema จริงยังรอยืนยัน
            </p>
          </div>
        </details>
        <div class="editor-save-bar">
          <div>
            <strong id="editor-save-state" role="status"
              >${state.dirty ? 'ยังไม่ได้บันทึกการแก้ไข' : readOnly ? 'โหมดอ่านอย่างเดียว' : 'พร้อมแก้ไขร่าง'}</strong
            ><span>ข้อมูลจำลอง · ไม่มีการเผยแพร่เข้าเกม</span>
          </div>
          ${!readOnly ? B('บันทึกร่าง', 'save-journey', { kind: 'primary', icon: 'check' }) : ''}
        </div>
      </div>`
    );
  }

  function bind() {
    if (!state.editor) return;
    SafeSpaceJourneyTools.bind({ state, dirty, draw, readOnly: !writable('journeys') });
    if (!writable('journeys')) return;
    const j = state.editor;
    const step = j.steps[state.step];
    document.querySelectorAll('[data-edit]').forEach((el) => {
      el.oninput = () => {
        const key = el.dataset.edit;
        j[key] =
          key === 'showTotals'
            ? el.checked
            : key === 'labels'
              ? el.value
                  .split('\n')
                  .filter(Boolean)
                  .map((value) => {
                    const colon = value.indexOf(':');
                    return {
                      key: colon >= 0 ? value.slice(0, colon).trim() : value.trim(),
                      label: colon >= 0 ? value.slice(colon + 1).trim() : value.trim(),
                    };
                  })
              : el.value;
        dirty();
      };
    });
    content.bind();
  }
  const content = SafeSpaceJourneyContent({ ...ctx, dirty });
  const action = (name, button) => content.action(name, button);

  return { render, bind, action, focusSection };
};
