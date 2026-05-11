/**
 * MEGAWORLD Global Layout Engine
 * Orchestrates page initialization based on centralized config.
 */
const AppLayout = {
  init() {
    window.addEventListener('DOMContentLoaded', () => {
      const pageKey = this.getCurrentPageKey();
      const config = MEGA_PAGES[pageKey];

      if (!config) {
        console.warn(`No configuration found for page: ${pageKey}`);
        return;
      }

      // 0. ضمان وجود المكونات العالمية (الحقن التلقائي)
      this.ensureGlobalElements();

      // 1. تحديث عنوان الصفحة
      document.title = `MEGAWORLD | ${config.title}`;

      // 2. تهيئة التولبار (إذا وجد له حاوية)
      if (document.getElementById('mainToolbar') && config.toolbar) {
        // حقن التصنيفات الحقيقية بدلاً من الموكاب
        const catDrop = config.toolbar.find(item => item.id === 'catDrop');
        if (catDrop) {
          const realGenres = Store.getAllGenres();
          catDrop.items = realGenres.map(g => ({
            label: g,
            icon: 'hash',
            action: () => {
              if (typeof HomeEngine !== 'undefined' && typeof HomeEngine.filterByGenre === 'function') {
                HomeEngine.filterByGenre(g);
              } else {
                console.log('Filtering by genre:', g);
              }
            }
          }));
          // إضافة خيار عرض الكل إذا كان هناك تصنيفات
          if (realGenres.length > 0) {
            catDrop.items.push({ sep: true });
            catDrop.items.push({ label: 'عرض الكل', icon: 'list', action: () => HomeEngine.filterByGenre(null) });
          }
        }
        // حقن بيانات المستخدم الحقيقية في التولبار
        const userItem = config.toolbar.find(item => item.type === 'user');
        if (userItem) {
          const u = Store.state.user || {};
          userItem.label = u.displayName || 'مستخدم';
          userItem.avatar = u.avatar || '';
          userItem.status = u.membership || 'عضو عادي';
          userItem.level = `ليفل ${u.level || 0}`;

          // تحديث عداد المكتبة (Badge) بإجمالي عدد الروايات
          const libMenuItem = userItem.menuItems.find(m => m.label === 'المكتبة الخاصة');
          if (libMenuItem) {
            const totalNovels = Object.keys(Store.getNovels()).length;
            libMenuItem.badge = totalNovels.toString();
          }
        }

        Toolbar.init('mainToolbar', config.toolbar);
      }

      // 3. تهيئة محتوى الصفحة (إذا وجد له حاوية ومكونات)
      if (document.getElementById('homeApp') && config.content) {
        HomeEngine.init('homeApp', config.content);
      }

      // 4. تطبيق التنسيقات العالمية (الثيمات)
      if (typeof applyGlobalUI === 'function') {
        applyGlobalUI();
      }

      console.log(`Page initialized: ${config.title}`);
    });
  },

  getCurrentPageKey() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  },

  ensureGlobalElements() {
    // 1. التأكد من وجود ID للجسم لتطبيق الثيمات
    if (!document.body.id) document.body.id = 'root';
    if (!document.body.classList.contains('root')) document.body.classList.add('root');

    // 2. حقن قائمة السياق تلقائياً
    if (!document.getElementById('contextMenu')) {
      const cm = document.createElement('div');
      cm.id = 'contextMenu';
      cm.className = 'context-menu';
      document.body.appendChild(cm);
      if (typeof ContextMenu !== 'undefined') ContextMenu.el = cm;
    }

    // 3. حقن شريط التقدم (Progress Bar)
    if (!document.getElementById('progressBar')) {
      const pWrap = document.createElement('div');
      pWrap.className = 'progress-wrap';
      pWrap.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
      document.body.appendChild(pWrap);
    }

    // 4. حقن الهيكل الأساسي للمودال (Modal) - مطلوب لعمل المحرر والنظام
    if (!document.getElementById('modalBg')) {
      const modal = document.createElement('div');
      modal.id = 'modalBg';
      modal.className = 'modal-bg';
      modal.innerHTML = `
        <div class="modal" id="modal">
          <div class="modal-hdr">
          </div>
          <div id="modalBody" style="padding: 10px 0;"></div>
          <div class="modal-btns" id="modalBtns"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }
};

// تشغيل المحرك فوراً
AppLayout.init();
