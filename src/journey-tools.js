/* Local Journey authoring controls. Formatting is a draft-only companion to plain text. */
window.SafeSpaceJourneyTools = (() => {
  const E = SafeSpaceUI.escape;
  const formats = [
    ['bold', 'B', 'ตัวหนา'],
    ['italic', 'I', 'ตัวเอียง'],
    ['underline', 'U', 'ขีดเส้นใต้'],
    ['createLink', '↗', 'แทรกลิงก์'],
    ['insertUnorderedList', '• ≡', 'รายการหัวข้อ'],
    ['insertOrderedList', '1 ≡', 'รายการลำดับเลข'],
    ['removeFormat', 'Tx', 'ล้างรูปแบบ'],
  ];
  const tags = new Set('b strong i em u ul ol li div p br a'.split(' '));
  function webLink(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }
  function clean(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    function serialize(node) {
      if (node.nodeType === Node.TEXT_NODE) return E(node.data);
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.localName;
      if (tag === 'br') return '<br>';
      const children = Array.from(node.childNodes, serialize).join('');
      if (!tags.has(tag)) return children;
      if (tag === 'a') {
        const href = webLink(node.getAttribute('href'));
        return href ? '<a href="' + E(href) + '">' + children + '</a>' : children;
      }
      return '<' + tag + '>' + children + '</' + tag + '>';
    }
    return Array.from(template.content.childNodes, serialize).join('');
  }
  function lineField(line, readOnly) {
    const buttons = formats
      .map(
        ([command, icon, label]) =>
          '<button type="button" data-format="' +
          command +
          '" aria-label="' +
          label +
          '" title="' +
          label +
          '">' +
          icon +
          '</button>',
      )
      .join('');
    return (
      '<div class="field">ตัวละครพูดว่าอะไร?<div class="dialog-composer">' +
      (readOnly
        ? ''
        : '<div class="format-bar" role="group" aria-label="จัดรูปแบบบทพูด">' + buttons + '</div>') +
      '<div class="rich-dialog" role="textbox" aria-label="ตัวละครพูดว่าอะไร?" aria-multiline="true" aria-readonly="' +
      readOnly +
      '" data-line-edit="text" contenteditable="' +
      !readOnly +
      '">' +
      (line.formatted ? clean(line.formatted) : E(line.text)) +
      '</div></div></div>'
    );
  }
  function cardTools(count) {
    const buttons = [
      ['insert-dialog', '＋', 'Dialog', 'เพิ่มบทสนทนาถัดจากการ์ดนี้'],
      ['insert-quiz', '＋', 'Quiz', 'เพิ่มแบบทดสอบถัดจากการ์ดนี้'],
      ['duplicate-block', '⧉', 'ทำสำเนา', 'ทำสำเนาการ์ดนี้'],
    ]
      .map(
        ([action, icon, caption, label]) =>
          '<button type="button" data-action="' +
          action +
          '" title="' +
          label +
          '" aria-label="' +
          label +
          '" ' +
          (count >= 30 ? 'disabled' : '') +
          '><b aria-hidden="true">' +
          icon +
          '</b>' +
          caption +
          '</button>',
      )
      .join('');
    return (
      '<span class="card-grip" title="ลากเพื่อจัดลำดับการ์ด" aria-hidden="true">⠿</span><aside class="card-rail" aria-label="เครื่องมือการ์ด">' +
      buttons +
      '</aside>'
    );
  }
  function bindRich(editor, line, dirty) {
    const sync = () => {
      line.text = editor.innerText;
      line.formatted = clean(editor.innerHTML);
      dirty();
    };
    editor.oninput = sync;
    editor.ondrop = (e) => e.preventDefault();
    editor.onpaste = (e) => {
      e.preventDefault();
      document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    };
    const toolbar = editor.previousElementSibling;
    let saved;
    const remember = () => {
      const selection = getSelection();
      if (selection.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer))
        saved = selection.getRangeAt(0).cloneRange();
    };
    editor.addEventListener('focusout', remember);
    toolbar.onmousedown = (e) => e.preventDefault();
    toolbar.onclick = (e) => {
      const command = e.target.closest('[data-format]')?.dataset.format;
      if (!command) return;
      remember();
      editor.focus();
      if (saved) {
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(saved);
      }
      let value = null;
      if (command === 'createLink') {
        const input = window.prompt('ที่อยู่ลิงก์ (https:// หรือ http://)');
        if (!input) return;
        value = webLink(input);
        if (!value) {
          window.alert('กรุณากรอกที่อยู่ที่ขึ้นต้นด้วย https:// หรือ http://');
          return;
        }
        if (getSelection().isCollapsed) {
          document.execCommand(
            'insertHTML',
            false,
            '<a href="' + E(value) + '">' + E(value) + '</a>',
          );
          sync();
          return;
        }
      }
      document.execCommand('styleWithCSS', false, false);
      document.execCommand(command, false, value);
      sync();
    };
  }
  function sortable(items, handleFor, place) {
    let target;
    function mark(next) {
      target?.classList.remove('sort-target');
      target = next;
      target?.classList.add('sort-target');
    }
    let source;
    for (const item of items) {
      const handle = handleFor(item);
      handle.draggable = true;
      handle.ondragstart = (e) => {
        source = item;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'journey-order');
      };
      item.ondragover = (e) => {
        if (!source) return;
        e.preventDefault();
        mark(item);
      };
      item.ondrop = (e) => {
        if (!source) return;
        e.preventDefault();
        mark(null);
        if (source !== item) place(items.indexOf(source), items.indexOf(item));
        source = null;
      };
      handle.ondragend = () => {
        source = null;
        mark(null);
      };
      let start;
      handle.onpointerdown = (e) => {
        if (e.pointerType === 'mouse') return;
        start = [e.clientX, e.clientY];
        handle.setPointerCapture(e.pointerId);
      };
      handle.onpointermove = (e) => {
        if (!start || Math.hypot(e.clientX - start[0], e.clientY - start[1]) < 6) return;
        const node = document.elementFromPoint(e.clientX, e.clientY);
        mark(items.find((other) => other.contains(node)));
        if (e.clientY < 65 || e.clientY > innerHeight - 65)
          window.scrollBy(0, e.clientY < 65 ? -24 : 24);
      };
      handle.onpointerup = () => {
        const to = target;
        start = null;
        mark(null);
        if (to && to !== item) place(items.indexOf(item), items.indexOf(to));
      };
      handle.onpointercancel = () => {
        start = null;
        mark(null);
      };
    }
  }
  function bind({ state, draw, dirty, readOnly }) {
    if (readOnly) return;
    const steps = state.editor.steps;
    const step = steps[state.step];
    function reorder(list, from, to, selector) {
      list.splice(to, 0, list.splice(from, 1)[0]);
      if (list === steps) state.step = steps.indexOf(step);
      dirty();
      draw();
      document.querySelector(selector)?.focus();
    }
    const pills = Array.from(document.querySelectorAll('.step-pills button'));
    sortable(
      pills,
      (item) => item,
      (from, to) => reorder(steps, from, to, '.step-pills [aria-pressed=true]'),
    );
    const cards = Array.from(document.querySelectorAll('[data-block]'));
    sortable(
      cards,
      (item) => item.querySelector('.card-grip'),
      (from, to) => reorder(step.blocks, from, to, '[data-block="' + to + '"] h2'),
    );
    function activate(card) {
      cards.forEach((item) => item.classList.toggle('editing-card', item === card));
    }
    cards.forEach((card, index) => {
      card.addEventListener('focusin', () => activate(card));
      card.addEventListener('pointerdown', () => activate(card));
      card
        .querySelectorAll('.rich-dialog')
        .forEach((el, i) => bindRich(el, step.blocks[index].lines[i], dirty));
    });
    activate(cards[0]);
  }
  return { bind, cardTools, lineField };
})();
