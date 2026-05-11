/**
 * MEGAWORLD Page Configurations
 * Centralized schemas for all platform pages.
 */
const MEGA_PAGES = {
  // --- الرئيسية (Home Page) ---
  'index.html': {
    id: 'home',
    title: 'الرئيسية',
    toolbar: [
      { type: 'custom', id: 'logo', label: 'MEGAWORLD', className: 'site-name', align: 'right', html: 'MEGAWORLD' },
      { 
        type: 'dropdown', label: 'التصنيفات', id: 'catDrop', align: 'right',
        items: [
          { label: 'رعب', icon: 'ghost', action: () => alert('تصنيف رعب') },
          { label: 'خيال علمي', icon: 'rocket', action: () => alert('خيال علمي') },
          { label: 'غموض', icon: 'spy', action: () => alert('غموض') }
        ]
      },
      { type: 'button', label: 'المكتبة', id: 'libLink', align: 'right', action: () => window.location.href = 'editor.html' },
      { type: 'spacer' },
      { type: 'input', label: 'البحث', placeholder: 'ابحث عن رواية...', id: 'sq', align: 'center', icon: 'search', style: 'width: 500px; border-radius: 20px;', action: (val) => { if (typeof HomeEngine !== 'undefined') HomeEngine.showSearchResults(val); } },
      { type: 'spacer' },
      { type: 'button', label: 'التنبيهات', title: 'التنبيهات', id: 'notifBtn', align: 'left', className: 'btn-icon', html: '<i class="ti ti-bell"></i>' },
      { type: 'button', label: 'تجربة', id: 'testBtn', align: 'left', action: () => window.location.href = 'test.html' },
      { type: 'custom', id: 'swatchWrap', label: 'الألوان', className: 'swatch-wrap', align: 'left' },
      { type: 'user', id: 'profile', align: 'left', label: 'أحمد محمد علي', avatar: 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png', status: 'عضو ذهبي', level: 'ليفل 45' }
    ],
    content: [
      {
        type: 'top5',
        title: 'أشهــــر 3 روايات',
        items: []
      },
      {
        type: 'trending',
        title: 'القائمــــة الرائجـة حاليــــاً',
        items: []
      },
      {
        type: 'grid',
        title: 'أحـدث الإضافــــات',
        items: []
      },
      { type: 'footer', text: '&copy; 2026 MEGAWORLD Design Language.' }
    ]
  },

  // --- القارئ (Reader Page) ---
  'editor.html': {
    id: 'reader',
    title: 'المحرر',
    toolbar: [
      { type: 'button', label: 'الرئيسية', id: 'homeBtn', align: 'right', action: () => window.location.href = 'index.html' },
      { type: 'button', label: 'القائمة', id: 'sideToggleBtn', align: 'right', action: () => typeof toggleSidebar === 'function' && toggleSidebar() },
      { 
        type: 'custom', id: 'statsBox', label: 'الإحصائيات', className: 'stats-box', align: 'right',
        html: `<div class="stat"><span id="wc">0</span>&nbsp;كلمة</div><div class="stats-divider"></div>
               <div class="stat"><span id="cc">0</span>&nbsp;حرف</div><div class="stats-divider"></div>
               <div class="stat"><span id="rt">0</span>&nbsp;<span id="rt-lbl">دقيقة</span></div><div class="stats-divider"></div>
               <div class="stat"><i class="ti ti-eye" style="font-size:12px; opacity:0.6;"></i>&nbsp;<span id="vc">0</span></div><div class="stats-divider"></div>
               <div class="stat" id="navInfo">1 / 1</div>`
      },
      {
        type: 'group', id: 'fontsGroup', label: 'الخطوط',
        items: [
          { type: 'button', label: 'أميـري', id: 'fn', action: () => { Store.updateSettings('font', 'fn'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
          { type: 'button', label: 'نـسخ', id: 'fn2', action: () => { Store.updateSettings('font', 'fn2'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
          { type: 'button', label: 'نـظام', id: 'fn3', action: () => { Store.updateSettings('font', 'fn3'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } }
        ]
      },
      {
        type: 'group', id: 'fontSizeGroup', label: 'حجم الخط',
        items: [
          { type: 'button', label: '−', id: 'decSizeBtn', action: () => { Store.updateSettings('sz', Math.max(14, Store.state.settings.sz - 2)); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
          { type: 'custom', className: 'btn-flat sz-display', id: 'szlbl', html: '22' },
          { type: 'button', label: '+', id: 'incSizeBtn', action: () => { Store.updateSettings('sz', Math.min(36, Store.state.settings.sz + 2)); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } }
        ]
      },
      {
        type: 'group', id: 'alignGroup', label: 'المحاذاة',
        items: [
          { type: 'button', label: 'يمين', id: 'ar', action: () => { Store.updateSettings('align', 'ar'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
          { type: 'button', label: 'وسط', id: 'ac', action: () => { Store.updateSettings('align', 'ac'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
          { type: 'button', label: 'ضبط', id: 'aj', action: () => { Store.updateSettings('align', 'aj'); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } }
        ]
      },
      {
        type: 'group', id: 'navGroup', label: 'التنقل',
        items: [
          { type: 'button', label: 'السابق', id: 'prevBtn', action: () => Store.setChapter(Store.activeChapterIdx - 1) },
          { type: 'button', label: 'التالي', id: 'nextBtn', action: () => Store.setChapter(Store.activeChapterIdx + 1) }
        ]
      },
      { type: 'button', label: 'متواصل', id: 'contBtn', action: () => { Store.updateSettings('continuousMode', !Store.state.settings.continuousMode); applyGlobalUI(); if (typeof renderBody === 'function') renderBody(); } },
      { type: 'button', label: 'تركيز', id: 'focusBtn', action: () => document.body.classList.toggle('focus-mode') },
      { type: 'button', label: 'تصدير', id: 'exportBtn', action: () => exportTxt() },
      { type: 'button', label: 'تجربة', id: 'testBtn', align: 'left', action: () => window.location.href = 'test.html' },
      { type: 'button', label: 'الإدارة', id: 'adminBtn', align: 'left', action: () => window.location.href = 'admin.html' },
      { type: 'custom', id: 'swatchWrap', label: 'الألوان', className: 'swatch-wrap', align: 'left' },
      { type: 'input', label: 'البحث', placeholder: 'بحث...', id: 'sq', align: 'left', action: (val) => { if (typeof doSearch === 'function') doSearch(val); } },
      { 
        type: 'custom', id: 'novelTitleWrap', label: 'اسم الرواية', align: 'left',
        className: 'site-name', html: `<input type="text" id="novelTitleInput" class="input-flat borderless" placeholder="اسم الرواية..." oninput="Store.updateNovelTitle(this.value)">` 
      }
    ]
  },

  // --- الإدارة (Admin Page) ---
  'admin.html': {
    id: 'admin',
    title: 'لوحة الإدارة',
    toolbar: [
      { 
        type: 'custom', id: 'logo', label: 'MEGAWORLD ADMIN', align: 'right', 
        className: 'site-name', 
        html: `MEGAWORLD ADMIN <span style="font-size: 10px; background: var(--color-theme); color: var(--color-on-theme); padding: 2px 8px; margin-right: 10px; font-weight: bold; border-radius: 2px;">وضع التعديل</span>` 
      },
      { type: 'button', label: 'معاينة الموقع', id: 'viewSite', align: 'right', html: '<i class="ti ti-external-link"></i> معاينة الموقع', action: () => window.location.href = 'index.html' },
      { type: 'button', label: 'الذهاب للقارئ', id: 'viewReader', align: 'right', action: () => window.location.href = 'editor.html' },
      
      { type: 'spacer' },
      
      { type: 'custom', id: 'swatchWrap', label: 'الألوان', className: 'swatch-wrap', align: 'left' },
      { type: 'button', label: 'تسجيل الخروج', id: 'logoutBtn', align: 'left', className: 'danger', html: 'تسجيل الخروج <i class="ti ti-logout"></i>' }
    ],
    content: [
      { type: 'top5', title: 'تعديل أشهر 5 روايات (وضع الإدارة)', items: [ /* Mock data or from store */ ] },
      { type: 'grid', title: 'إدارة المكتبة الكاملة', items: [ /* Mock data */ ] },
      { type: 'footer', text: 'نظام إدارة MEGAWORLD - إصدار تجريبي' }
    ]
  },

  // --- تفاصيل الرواية (Novel Details) ---
  'novel.html': {
    id: 'novel',
    title: 'تفاصيل العمل',
    toolbar: [
      { type: 'custom', id: 'logo', label: 'MEGAWORLD', className: 'site-name', align: 'right', html: 'MEGAWORLD' },
      { type: 'button', label: 'الرئيسية', id: 'backHome', align: 'right', action: () => window.location.href = 'index.html' },
      { type: 'spacer' },
      { type: 'custom', id: 'toolbarNovelTitle', label: 'اسم الرواية', align: 'center', className: 'lbl', style: 'font-size: 14px; font-weight: bold; opacity: 1; color: var(--color-theme);', html: 'جاري التحميل...' },
      { type: 'spacer' },
      { type: 'button', label: 'ابدأ القراءة', id: 'quickRead', align: 'left', className: 'btn-flat active', style: 'height: 30px; font-size: 11px;', action: () => typeof NovelPage !== 'undefined' && NovelPage.startReading() },
      { type: 'custom', id: 'swatchWrap', label: 'الألوان', className: 'swatch-wrap', align: 'left' },
      { type: 'user', id: 'profile', align: 'left', label: 'أحمد محمد علي', avatar: 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png', status: 'عضو ذهبي', level: 'ليفل 45' }
    ]
  }
};
