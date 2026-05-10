/**
 * محرك شريط الأدوات الموحد (Unified Toolbar Engine)
 */
const Toolbar = {
  containerId: null,
  schema: [],
  storageKey: null,
  hiddenItems: [],

  init(containerId, schema, storageKey = 'main_toolbar_layout') {
    this.containerId = containerId;
    this.schema = schema;
    this.storageKey = storageKey;
    
    // تحميل العناصر المخفية وفلترتها (لضمان بقاء العناصر الموجودة في الـ Schema فقط)
    const saved = localStorage.getItem(this.storageKey);
    const rawHidden = saved ? JSON.parse(saved) : [];
    const validIds = this.schema.map(i => i.id).filter(Boolean);
    this.hiddenItems = rawHidden.filter(id => validIds.includes(id));

    this.render();
    // بناء لوحة الألوان فوراً بعد الرندر
    if (typeof buildSwatches === 'function') buildSwatches();
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.innerHTML = '';
    
    // إنشاء الحاويات الثلاثة
    const rightSide = this.makeElement('div', 'toolbar-side side-right');
    const centerSide = this.makeElement('div', 'toolbar-side side-center');
    const leftSide = this.makeElement('div', 'toolbar-side side-left');
    
    container.appendChild(rightSide);
    container.appendChild(centerSide);
    container.appendChild(leftSide);

    this.schema.forEach(item => {
      // تجاهل العناصر المخفية (إذا كان لها ID)
      if (item.id && this.hiddenItems.includes(item.id)) return;
      
      const el = this.createItem(item);
      if (el) {
        if (item.align === 'left') leftSide.appendChild(el);
        else if (item.align === 'right') rightSide.appendChild(el);
        else centerSide.appendChild(el);
      }
    });

    // إضافة مستمع القائمة المنبثقة للشريط نفسه
    container.oncontextmenu = (e) => {
      // منع ظهور القائمة الافتراضية إذا ضغطنا على الشريط نفسه أو الحاويات
      if (e.target === container || e.target.classList.contains('toolbar-side') || e.target.classList.contains('spacer')) {
        this.showConfigMenu(e);
      }
    };

    if (typeof buildSwatches === 'function') buildSwatches();
  },

  showConfigMenu(e) {
    if (typeof ContextMenu === 'undefined') return;
    
    const menuItems = this.schema.map(item => {
      // نتجاهل الفواصل والمسافات من قائمة التحكم لتجنب الزحام
      if (!item.id || item.type === 'spacer' || item.type === 'sep') return null;
      
      const isHidden = this.hiddenItems.includes(item.id);
      return {
        label: item.label || item.id,
        icon: isHidden ? 'ti-square' : 'ti-checkbox',
        action: () => this.toggleItem(item.id),
        onEnter: () => {
          const el = document.getElementById(item.id);
          if (el) el.classList.add('toolbar-highlight');
        },
        onLeave: () => {
          const el = document.getElementById(item.id);
          if (el) el.classList.remove('toolbar-highlight');
        }
      };
    }).filter(Boolean);

    menuItems.push({ sep: true });
    menuItems.push({
      label: 'إظهار الكل',
      icon: 'ti-eye',
      action: () => {
        this.hiddenItems = [];
        this.save();
        this.render();
        if (typeof applyGlobalUI === 'function') applyGlobalUI();
      }
    });
    menuItems.push({
      label: 'إخفاء الكل',
      icon: 'ti-eye-off',
      action: () => {
        this.hiddenItems = this.schema.map(i => i.id).filter(Boolean);
        this.save();
        this.render();
      }
    });
    menuItems.push({
      label: 'إعادة الضبط الافتراضي',
      icon: 'ti-refresh',
      danger: true,
      action: () => {
        if (confirm('هل تريد إعادة ضبط شريط الأدوات للحالة الافتراضية؟')) {
          this.hiddenItems = [];
          this.save();
          this.render();
          if (typeof applyGlobalUI === 'function') applyGlobalUI();
        }
      }
    });

    ContextMenu.show(e, menuItems);
  },

  toggleItem(id) {
    if (this.hiddenItems.includes(id)) {
      this.hiddenItems = this.hiddenItems.filter(i => i !== id);
    } else {
      this.hiddenItems.push(id);
    }
    this.save();
    this.render();
    if (typeof applyGlobalUI === 'function') applyGlobalUI();
  },

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.hiddenItems));
  },

  createItem(item) {
    switch (item.type) {
      case 'group': return this.makeGroup(item);
      case 'button': return this.makeButton(item);
      case 'input': return this.makeInput(item);
      case 'sep': return this.makeElement('div', 'sep');
      case 'spacer': return this.makeElement('div', 'spacer');
      case 'label': return this.makeLabel(item);
      case 'custom': return this.makeCustom(item);
      case 'dropdown': return this.makeDropdown(item);
      default: return null;
    }
  },

  makeGroup(group) {
    const wrapper = this.makeElement('div', 'toolbar-group', group.id);
    if (group.items) {
      group.items.forEach(item => {
        const el = this.createItem(item);
        if (el) wrapper.appendChild(el);
      });
    }
    return wrapper;
  },

  makeElement(tag, className, id) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (id) el.id = id;
    return el;
  },

  makeButton(item) {
    const btn = this.makeElement('button', 'btn-flat');
    if (item.id) btn.id = item.id;
    if (item.className) btn.classList.add(...item.className.split(' '));
    
    // دعم الأيقونات أو النصوص
    if (item.html) btn.innerHTML = item.html;
    else btn.textContent = item.label;

    if (item.title) btn.title = item.title;
    btn.onclick = (e) => item.action && item.action(e);
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
    if (item.style) div.style.cssText = item.style;
    return div;
  },

  makeDropdown(item) {
    const wrap = this.makeElement('div', 'dropdown-wrap');
    if (item.id) wrap.id = item.id;
    
    wrap.innerHTML = `
      <div class="dropdown-trigger">
        ${item.icon ? `<i class="ti ti-${item.icon}"></i>` : ''}
        <span>${item.label}</span>
        <i class="ti ti-chevron-down"></i>
      </div>
      <div class="dropdown-menu"></div>
    `;

    const menu = wrap.querySelector('.dropdown-menu');
    item.items.forEach(it => {
      const btn = document.createElement('button');
      btn.className = `dropdown-item ${it.className || ''}`;
      btn.innerHTML = `<span>${it.label}</span> ${it.icon ? `<i class="ti ti-${it.icon}"></i>` : ''}`;
      btn.onclick = (e) => { e.stopPropagation(); it.action(); wrap.classList.remove('open'); };
      menu.appendChild(btn);
    });

    wrap.querySelector('.dropdown-trigger').onclick = (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      document.querySelectorAll('.dropdown-wrap').forEach(w => w.classList.remove('open'));
      if (!isOpen) wrap.classList.add('open');
    };
    
    // إغلاق عند الضغط خارجاً
    document.addEventListener('click', () => wrap.classList.remove('open'));

    return wrap;
  }
};

// --- وظائف الأدوات (Tools Logic) ---

function buildSwatches() {
  const c = document.getElementById('swatchWrap');
  if (!c) return;
  c.innerHTML = '';
  const palettes = Store.palettes;
  const current = palettes.find(p => p.id === Store.state.settings.theme) || palettes[0];
  
  // زر الثيم الحالي (على شكل كبسولة)
  const btn = document.createElement('button');
  btn.className = 'btn-flat theme-picker-btn';
  btn.title = 'تغيير الثيم';
  
  btn.innerHTML = `
    <div class="swatch on" style="background:${current.bg}; width:12px; height:12px; border-radius:50%; border:1px solid rgba(128,128,128,0.2);"></div>
    <span style="font-size:12px; font-weight:500;">${current.label}</span>
  `;
  
  btn.onclick = (e) => {
    const menuItems = palettes.map(p => ({
      label: `<div style="display:flex;align-items:center;gap:12px;">
                <div style="width:18px;height:18px;background:${p.bg};border:1px solid rgba(128,128,128,0.3);border-radius:50%;"></div>
                ${p.label}
              </div>`,
      icon: p.id === Store.state.settings.theme ? 'ti-check' : '',
      action: () => {
        Store.updateSettings('theme', p.id);
        applyGlobalUI();
      }
    }));
    ContextMenu.show(e, menuItems);
  };
  
  c.appendChild(btn);
}

function stats(text) {
  const w = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const ch = text.replace(/\s/g, '').length;
  const m = Math.max(1, Math.round(w / 200));
  
  const shortNum = (n) => {
    if (n >= 1000) {
      const val = (n / 1000).toFixed(1).replace(/\.0$/, '');
      return val + '<small style="font-size:6px; opacity:0.7;">ألف</small>';
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
  const allThemes = ['bg-def', 'bg-blue', 'bg-ivory', 'bg-mint', 'bg-pink', 'bg-gray', 'bg-sky', 'bg-night', 'bg-dark', 'bg-oled'];
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
  
  // تحديث زر الألوان الديناميكي
  if (typeof buildSwatches === 'function') buildSwatches();
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

// Auto-init removed. Managed by AppLayout.
