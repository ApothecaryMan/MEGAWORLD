/**
 * محرك شريط الأدوات الموحد (Unified Toolbar Engine)
 * مصمم ليكون مرناً، قابلاً لإعادة الاستخدام، وقائماً على المكونات.
 */
const Toolbar = {
  /**
   * تهيئة بار جديد في حاوية معينة
   * @param {string} containerId - معرف الحاوية في الـ HTML
   * @param {Array} schema - مصفوفة تصف المكونات
   */
  init(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    schema.forEach(item => {
      const el = this.createItem(item);
      if (el) container.appendChild(el);
    });
    
    // بعد بناء البار، نقوم ببناء العناصر التفاعلية الإضافية
    if (typeof buildSwatches === 'function') buildSwatches();
  },

  /**
   * مصنع المكونات (Component Factory)
   */
  createItem(item) {
    switch (item.type) {
      case 'button':
        return this.makeButton(item);
      case 'input':
        return this.makeInput(item);
      case 'sep':
        return this.makeElement('div', 'sep');
      case 'spacer':
        return this.makeElement('div', 'spacer');
      case 'label':
        return this.makeLabel(item);
      case 'custom':
        return this.makeCustom(item);
      case 'group':
        return this.makeGroup(item);
      default:
        return null;
    }
  },

  makeElement(tag, className, id) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (id) el.id = id;
    return el;
  },

  makeButton(item) {
    const btn = this.makeElement('button', item.className || 'btn-flat', item.id);
    if (item.label) btn.textContent = item.label;
    if (item.icon) btn.innerHTML = `${item.label || ''} <i class="ti ${item.icon}"></i>`;
    if (item.title) btn.title = item.title;
    if (item.action) btn.onclick = item.action;
    return btn;
  },

  makeInput(item) {
    const input = this.makeElement('input', item.className || 'input-flat', item.id);
    input.type = 'text';
    if (item.placeholder) input.placeholder = item.placeholder;
    if (item.action) input.oninput = (e) => item.action(e.target.value);
    return input;
  },

  makeLabel(item) {
    const span = this.makeElement('span', 'lbl', item.id);
    span.textContent = item.label;
    return span;
  },

  makeGroup(item) {
    const div = this.makeElement('div', 'toolbar-group');
    if (item.items) {
      item.items.forEach(sub => {
        const subEl = this.createItem(sub);
        if (subEl) div.appendChild(subEl);
      });
    }
    return div;
  },

  makeCustom(item) {
    const div = this.makeElement('div', item.className, item.id);
    if (item.html) div.innerHTML = item.html;
    return div;
  }
};

// --- وظائف الأدوات (Tools Logic) ---

function buildSwatches() {
  const c = document.getElementById('swatchWrap');
  if (!c) return;
  c.innerHTML = '';
  palettes.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (p.cls === activePalette.cls ? ' on' : '');
    b.title = p.cls;
    b.style.background = p.s;
    b.onclick = () => setBg(p, b);
    c.appendChild(b);
  });
}

function setBg(p, btn) {
  activePalette = p;
  const r = document.getElementById('root');
  palettes.forEach(q => r.classList.remove(q.cls));
  r.classList.add(p.cls);
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
  btn.classList.add('on');
  save();
}

function stats(text) {
  const w = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const ch = text.replace(/\s/g, '').length;
  const m = Math.max(1, Math.round(w / 200));

  const shortNum = (n) => n.toLocaleString('ar-EG');
  
  const wc = document.getElementById('wc');
  const cc = document.getElementById('cc');
  const rt = document.getElementById('rt');
  const rtLbl = document.getElementById('rt-lbl');

  if (wc) wc.innerHTML = shortNum(w);
  if (cc) cc.innerHTML = shortNum(ch);

  if (rt && rtLbl) {
    if (m === 1) { rt.textContent = ''; rtLbl.textContent = 'دقيقة واحدة'; }
    else if (m === 2) { rt.textContent = ''; rtLbl.textContent = 'دقيقتان'; }
    else { rt.textContent = shortNum(m); rtLbl.textContent = (m >= 3 && m <= 10) ? 'دقائق' : 'دقيقة'; }
  }
}

function setFont(f, id) { font = f; applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); save(); }
function chSz(d) { sz = Math.min(36, Math.max(14, sz + d)); const lbl = document.getElementById('szlbl'); if (lbl) lbl.textContent = sz; if (typeof renderBody === 'function') renderBody(); save(); }
function setAl(a, id) { align = a; applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); save(); }

function applyGlobalUI() {
  document.querySelectorAll('.btn-flat').forEach(b => b.classList.remove('active'));
  
  const fontId = { fn: 'f1', fn2: 'f2', fn3: 'f3' }[font];
  const fBtn = document.getElementById(fontId);
  if (fBtn) fBtn.classList.add('active');

  const alBtn = document.getElementById(align);
  if (alBtn) alBtn.classList.add('active');
  
  const szLbl = document.getElementById('szlbl');
  if (szLbl) szLbl.textContent = sz;
  
  const contBtn = document.getElementById('contBtn');
  if (contBtn) contBtn.classList.toggle('active', continuousMode);
}

// --- تصدير الهيكل الرئيسي للبار (Main Toolbar Definition) ---

const MainToolbarSchema = [
  { type: 'button', label: 'الرئيسية', action: () => location.reload() },
  { type: 'button', label: 'القائمة', id: 'sideToggleBtn', action: () => toggleSidebar() },
  { type: 'sep' },
  { 
    type: 'custom', 
    id: 'statsBox', 
    className: 'stats-box',
    html: `
      <div class="stat"><span id="wc">0</span>&nbsp;كلمة</div>
      <div class="stats-divider"></div>
      <div class="stat"><span id="cc">0</span>&nbsp;حرف</div>
      <div class="stats-divider"></div>
      <div class="stat"><span id="rt">0</span>&nbsp;<span id="rt-lbl">دقيقة</span></div>
      <div class="stats-divider"></div>
      <div class="stat" id="navInfo">1 / 1</div>
    `
  },
  { type: 'sep' },
  { type: 'button', label: 'أميـري', id: 'f1', action: () => setFont('fn', 'f1') },
  { type: 'button', label: 'نـسخ', id: 'f2', action: () => setFont('fn2', 'f2') },
  { type: 'button', label: 'نـظام', id: 'f3', action: () => setFont('fn3', 'f3') },
  { type: 'sep' },
  { type: 'button', label: '−', action: () => chSz(-2) },
  { type: 'custom', className: 'lbl', id: 'szlbl', html: '22' },
  { type: 'button', label: '+', action: () => chSz(2) },
  { type: 'sep' },
  { type: 'button', label: 'يمين', id: 'ar', action: () => setAl('ar', 'ar') },
  { type: 'button', label: 'وسط', id: 'ac', action: () => setAl('ac', 'ac') },
  { type: 'button', label: 'ضبط', id: 'aj', action: () => setAl('aj', 'aj') },
  { type: 'sep' },
  { type: 'button', label: 'السابق', id: 'prevBtn', action: () => prevChapter() },
  { type: 'button', label: 'التالي', id: 'nextBtn', action: () => nextChapter() },
  { type: 'sep' },
  { type: 'button', label: 'متواصل', id: 'contBtn', action: () => toggleContinuous() },
  { type: 'button', label: 'تركيز', action: () => toggleFocus() },
  { type: 'button', label: 'تصدير', action: () => exportTxt() },
  { type: 'custom', id: 'swatchWrap', className: 'swatch-wrap' },
  { type: 'spacer' },
  { type: 'input', placeholder: 'بحث...', id: 'sq', action: (val) => doSearch(val) },
  { type: 'spacer' },
  { type: 'button', label: 'تعديل', id: 'editBtn', action: () => openModal() },
  { type: 'button', label: 'حذف', action: () => deleteChapter() },
  { 
    type: 'custom', 
    className: 'site-name', 
    html: `<input type="text" id="novelTitleInput" class="input-flat borderless" placeholder="اسم الرواية..." oninput="updateNovelTitle(this.value)">` 
  }
];

// تهيئة البار عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
  Toolbar.init('mainToolbar', MainToolbarSchema);
  applyGlobalUI();
});
