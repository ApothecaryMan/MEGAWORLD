/**
 * محرك شريط الأدوات الموحد (Unified Toolbar Engine)
 */
const Toolbar = {
  init(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    schema.forEach(item => {
      const el = this.createItem(item);
      if (el) container.appendChild(el);
    });
    if (typeof buildSwatches === 'function') buildSwatches();
  },

  createItem(item) {
    switch (item.type) {
      case 'button': return this.makeButton(item);
      case 'input': return this.makeInput(item);
      case 'sep': return this.makeElement('div', 'sep');
      case 'spacer': return this.makeElement('div', 'spacer');
      case 'label': return this.makeLabel(item);
      case 'custom': return this.makeCustom(item);
      default: return null;
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
    if (item.title) btn.title = item.title;
    if (item.action) btn.onclick = item.action;
    return btn;
  },

  makeInput(item) {
    const input = this.makeElement('input', item.className || 'input-flat', item.id);
    if (item.placeholder) input.placeholder = item.placeholder;
    if (item.action) input.oninput = (e) => item.action(e.target.value);
    return input;
  },

  makeLabel(item) {
    const span = this.makeElement('span', 'lbl', item.id);
    span.textContent = item.label;
    return span;
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
  const palettes = [
    { cls: 'bg-def', s: '#f5f3f0' },
    { cls: 'bg-ivory', s: '#fdf6e3' },
    { cls: 'bg-mint', s: '#f0fdf5' },
    { cls: 'bg-pink', s: '#fdf0f0' },
    { cls: 'bg-gray', s: '#f4f4f2' },
    { cls: 'bg-sky', s: '#eff6ff' },
    { cls: 'bg-night', s: '#1a1a2e' },
    { cls: 'bg-dark', s: '#212121' }
  ];
  palettes.forEach(p => {
    const b = document.createElement('button');
    b.className = 'swatch' + (p.cls === Store.state.settings.theme ? ' on' : '');
    b.style.background = p.s;
    b.dataset.theme = p.cls; // تخزين اسم الثيم في الزر
    b.onclick = () => {
      Store.updateSettings('theme', p.cls);
      applyGlobalUI();
    };
    c.appendChild(b);
  });
}

function stats(text) {
  const w = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const ch = text.replace(/\s/g, '').length;
  const m = Math.max(1, Math.round(w / 200));
  
  const shortNum = (n) => {
    if (n >= 1000) {
      const val = (n / 1000).toFixed(1).replace(/\.0$/, '');
      return val + ' <small style="font-size:10px; opacity:0.8;">ألف</small>';
    }
    return n.toLocaleString('ar-EG');
  };
  
  const wc = document.getElementById('wc');
  const cc = document.getElementById('cc');
  const rt = document.getElementById('rt');
  const rtLbl = document.getElementById('rt-lbl');

  if (wc) wc.innerHTML = shortNum(w);
  if (cc) cc.innerHTML = shortNum(ch);
  if (rt && rtLbl) {
    if (m === 1) { rt.textContent = ''; rtLbl.textContent = 'دقيقة واحدة'; }
    else if (m === 2) { rt.textContent = ''; rtLbl.textContent = 'دقيقتان'; }
    else { rt.innerHTML = shortNum(m); rtLbl.textContent = (m >= 3 && m <= 10) ? 'دقائق' : 'دقيقة'; }
  }
}

function applyGlobalUI() {
  const root = document.getElementById('root');
  if (!root) return;
  const settings = Store.state.settings;
  
  // تطبيق الثيم
  const allThemes = ['bg-def', 'bg-ivory', 'bg-mint', 'bg-pink', 'bg-gray', 'bg-sky', 'bg-night', 'bg-dark'];
  allThemes.forEach(cls => root.classList.remove(cls));
  root.classList.add(settings.theme);

  // تحديث الأزرار (مع استثناء التبويبات)
  document.querySelectorAll('.btn-flat:not(.tab)').forEach(b => b.classList.remove('active'));
  [settings.font, settings.align].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.add('active');
  });

  const szLbl = document.getElementById('szlbl');
  if (szLbl) szLbl.textContent = settings.sz;

  const contBtn = document.getElementById('contBtn');
  if (contBtn) contBtn.classList.toggle('active', settings.continuousMode);
  
  // تحديث دوائر الألوان لحظياً
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('on', s.dataset.theme === settings.theme);
  });
}

function exportTxt() {
  const n = Store.activeNovel;
  if (!n) return;
  let txt = n.title + "\n\n";
  n.chapters.forEach(ch => {
    txt += "== " + ch.title + " ==\n\n" + ch.content + "\n\n";
  });
  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = n.title + '.txt';
  a.click();
}

function doSearch(val) {
  const wrap = document.getElementById('bodyWrap');
  if (!wrap || !val.trim()) {
    if (typeof renderBody === 'function') renderBody();
    return;
  }
  
  // بحث بسيط بتظليل النص
  const text = wrap.innerHTML;
  const clean = text.replace(/<mark>|<\/mark>/g, '');
  const regex = new RegExp('(' + val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  wrap.innerHTML = clean.replace(regex, '<mark>$1</mark>');
}

// --- تعريف البار الرئيسي ---
const MainToolbarSchema = [
  { type: 'button', label: 'الرئيسية', action: () => location.reload() },
  { type: 'button', label: 'القائمة', id: 'sideToggleBtn', action: () => toggleSidebar() },
  { 
    type: 'custom', id: 'statsBox', className: 'stats-box',
    html: `<div class="stat"><span id="wc">0</span>&nbsp;كلمة</div><div class="stats-divider"></div>
           <div class="stat"><span id="cc">0</span>&nbsp;حرف</div><div class="stats-divider"></div>
           <div class="stat"><span id="rt">0</span>&nbsp;<span id="rt-lbl">دقيقة</span></div><div class="stats-divider"></div>
           <div class="stat" id="navInfo">1 / 1</div>`
  },
  { type: 'button', label: 'أميـري', id: 'fn', action: () => { Store.updateSettings('font', 'fn'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'نـسخ', id: 'fn2', action: () => { Store.updateSettings('font', 'fn2'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'نـظام', id: 'fn3', action: () => { Store.updateSettings('font', 'fn3'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: '−', action: () => { Store.updateSettings('sz', Math.max(14, Store.state.settings.sz - 2)); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'custom', className: 'lbl', id: 'szlbl', html: '22' },
  { type: 'button', label: '+', action: () => { Store.updateSettings('sz', Math.min(36, Store.state.settings.sz + 2)); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'يمين', id: 'ar', action: () => { Store.updateSettings('align', 'ar'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'وسط', id: 'ac', action: () => { Store.updateSettings('align', 'ac'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'ضبط', id: 'aj', action: () => { Store.updateSettings('align', 'aj'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'السابق', id: 'prevBtn', action: () => Store.setChapter(Store.activeChapterIdx - 1) },
  { type: 'button', label: 'التالي', id: 'nextBtn', action: () => Store.setChapter(Store.activeChapterIdx + 1) },
  { type: 'button', label: 'متواصل', id: 'contBtn', action: () => { Store.updateSettings('continuousMode', !Store.state.settings.continuousMode); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
  { type: 'button', label: 'تركيز', action: () => document.body.classList.toggle('focus-mode') },
  { type: 'button', label: 'تصدير', action: () => exportTxt() },
  { type: 'custom', id: 'swatchWrap', className: 'swatch-wrap' },
  { type: 'spacer' },
  { type: 'input', placeholder: 'بحث...', id: 'sq', action: (val) => { if (typeof doSearch === 'function') doSearch(val); } },
  { type: 'spacer' },
  { 
    type: 'custom', 
    className: 'site-name', html: `<input type="text" id="novelTitleInput" class="input-flat borderless" placeholder="اسم الرواية..." oninput="Store.updateNovelTitle(this.value)">` 
  }
];

window.addEventListener('DOMContentLoaded', () => {
  Toolbar.init('mainToolbar', MainToolbarSchema);
  applyGlobalUI();
});
