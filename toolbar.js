import Store from './store.js';
import { ContextMenu } from './context_menu.js';
import { AuthModule } from './auth_module.js';

export const Toolbar = {
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

  /**
   * تحديث بيانات المستخدم في الشريط ديناميكياً
   */
  setUser(userData) {
    const profileEl = document.getElementById('profile');
    if (!profileEl) return;

    if (!userData) {
      // حالة عدم وجود مستخدم
      profileEl.className = 'btn-flat active';
      profileEl.style.height = '30px';
      profileEl.style.display = 'flex';
      profileEl.innerHTML = `<span>دخول / تسجيل</span> <i class="ti ti-login"></i>`;
      profileEl.onclick = () => {
        if (window.AuthModule) window.AuthModule.renderLoginModal();
        else console.error('AuthModule not loaded');
      };
    } else {
      // حالة وجود مستخدم مسجل
      // استخراج البيانات بذكاء من البروفايل أو الميتاداتا
      const meta = userData.user_metadata || {};
      const name = userData.display_name || userData.displayName || meta.full_name || meta.display_name || meta.name || 'مستخدم جديد';
      const status = userData.membership || (userData.role === 'authenticated' ? 'عضو عادي' : (userData.role === 'admin' ? 'مدير النظام' : 'عضو جديد'));
      const avatar = userData.avatar_url || userData.avatar || meta.avatar_url || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png';

      profileEl.className = 'user-item-flat toolbar-user'; // أضفنا toolbar-user للتحكم في القائمة
      profileEl.style.display = 'flex';
      
      const libraryCount = (Store.state.novels || []).length;

      profileEl.innerHTML = `
        <div class="user-meta">
          <span class="user-name">${name}</span>
          <span class="user-status">${status}</span>
        </div>
        <img src="${avatar}" class="user-avatar">
        <i class="ti ti-chevron-down user-chevron"></i>

        <!-- النافذة المخصصة (Profile Menu) -->
        <div class="profile-menu">
          <div class="profile-header">
            <div class="profile-avatar-big">
              <img src="${avatar}" alt="User">
            </div>
            <div class="profile-info-main">
              <div class="profile-display-name">${name}</div>
              <div class="profile-status">
                <span class="membership-label">${status}</span>
                <span class="profile-level">ليفل ${userData.level || 1}</span>
              </div>
            </div>
          </div>
          
          <div class="profile-menu-body">
            <button class="profile-menu-item" onclick="window.location.href='profile.html'">
              <i class="ti ti-user-circle"></i>
              <span class="item-label">ملفي الشخصي</span>
            </button>
            <button class="profile-menu-item" onclick="window.location.href='library.html'">
              <i class="ti ti-bookmarks"></i>
              <span class="item-label">المكتبة الخاصة</span>
              <span class="item-badge">${libraryCount}</span>
            </button>
            <button class="profile-menu-item">
              <i class="ti ti-history"></i>
              <span class="item-label">سجل القراءة</span>
            </button>
            
            <div class="profile-menu-sep"></div>
            
            <button class="profile-menu-item">
              <i class="ti ti-settings"></i>
              <span class="item-label">إعدادات الحساب</span>
            </button>
            <button class="profile-menu-item">
              <i class="ti ti-help-circle"></i>
              <span class="item-label">مركز المساعدة</span>
            </button>
          </div>
          
          <div class="profile-footer">
            <button class="btn-flat logout-btn" id="logoutBtn">تسجيل الخروج</button>
            <button class="btn-flat">تبديل الحساب</button>
          </div>
        </div>
      `;

      // منطق الفتح والغلق
      profileEl.onclick = (e) => {
        e.stopPropagation();
        const isOpen = profileEl.classList.contains('open');
        
        // إغلاق أي قوائم أخرى مفتوحة أولاً
        document.querySelectorAll('.toolbar-user').forEach(el => el.classList.remove('open'));
        
        if (!isOpen) profileEl.classList.add('open');
      };

      // ربط زر تسجيل الخروج
      const logoutBtn = profileEl.querySelector('#logoutBtn');
      if (logoutBtn) {
        logoutBtn.onclick = async (e) => {
          e.stopPropagation();
          await supabase.auth.signOut();
          window.location.reload();
        };
      }

      // إغلاق المنيو عند الضغط في أي مكان خارجها
      document.addEventListener('click', () => {
        profileEl.classList.remove('open');
      }, { once: false });
    }
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
      case 'user': return this.makeUser(item);
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
    if (item.style) btn.style.cssText = item.style;
    btn.onclick = (e) => item.action && item.action(e);
    return btn;
  },

  makeInput(item) {
    const input = this.makeElement('input', item.className || 'input-flat', item.id);
    if (item.placeholder) input.placeholder = item.placeholder;
    if (item.action) input.oninput = (e) => item.action(e.target.value);
    
    if (item.icon) {
      const wrap = this.makeElement('div', 'input-wrap');
      if (item.style) wrap.style.cssText = item.style;
      const icon = this.makeElement('i', `ti ti-${item.icon} input-icon`);
      wrap.appendChild(icon);
      wrap.appendChild(input);
      // تأكد أن الحقل نفسه يملأ المساحة
      input.style.width = '100%'; 
      return wrap;
    }

    if (item.style) input.style.cssText = item.style;
    return input;
  },

  makeLabel(item) {
    const span = this.makeElement('span', 'lbl', item.id);
    span.textContent = item.label;
    if (item.style) span.style.cssText = item.style;
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
  },

  makeUser(item) {
    const wrap = this.makeElement('div', 'user-item-flat', item.id);
    if (item.className) wrap.classList.add(...item.className.split(' '));
    
    // إعداد أولي (Loading State)
    wrap.innerHTML = `
      <div class="user-meta">
        <span class="user-name">${item.label || 'جاري التحميل...'}</span>
        <span class="user-status">${item.status || '...'}</span>
      </div>
      <div class="user-avatar-placeholder">
        <i class="ti ti-user"></i>
      </div>
    `;

    // إذا كانت هناك بيانات أولية، نقوم بتطبيقها فوراً
    // لكن AppLayout ستقوم باستدعاء setUser لاحقاً بالبيانات الحقيقية
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


function applyGlobalUI() {
  const root = document.getElementById('root') || document.body;
  if (!root) return;
  const settings = Store.state.settings;
  
  // تطبيق الثيم
  Store.palettes.forEach(p => root.classList.remove(p.id));
  root.classList.add(settings.theme || 'dark');

  // تحديث الأزرار (مع استثناء التبويبات)
  document.querySelectorAll('.btn-flat:not(.tab)').forEach(b => b.classList.remove('active'));
  [settings.font, settings.align].forEach(id => {
    if (!id) return;
    const btn = document.getElementById(id);
    if (btn) btn.classList.add('active');
  });

  const szLbl = document.getElementById('szlbl');
  if (szLbl) szLbl.textContent = settings.sz;

  const contBtn = document.getElementById('contBtn');
  if (contBtn) contBtn.classList.toggle('active', !!settings.continuousMode);
  
  // تحديث زر الألوان الديناميكي
  buildSwatches();
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
  // Logic varies by page. For Reader:
  const wrap = document.getElementById('bodyWrap');
  if (wrap) {
    if (!val.trim()) {
      if (window.renderBody) window.renderBody();
      return;
    }
    const text = wrap.innerHTML;
    const clean = text.replace(/<mark>|<\/mark>/g, '');
    const regex = new RegExp('(' + val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    wrap.innerHTML = clean.replace(regex, '<mark>$1</mark>');
    return;
  }

  // For Home Page:
  if (window.HomeEngine && typeof window.HomeEngine.filterBySearch === 'function') {
    window.HomeEngine.filterBySearch(val);
  }
}

// إتاحة الوظائف عالمياً للموديولات الأخرى
window.Toolbar = Toolbar;
window.applyGlobalUI = applyGlobalUI;
window.buildSwatches = buildSwatches;
window.exportTxt = exportTxt;
window.doSearch = doSearch;

export { applyGlobalUI, buildSwatches, exportTxt, doSearch };
export default Toolbar;
