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
    // التأكد من وجود ID للجسم لتطبيق الثيمات
    if (!document.body.id) document.body.id = 'root';
    if (!document.body.classList.contains('root')) document.body.classList.add('root');

    // حقن قائمة السياق تلقائياً إذا كانت مفقودة
    if (!document.getElementById('contextMenu')) {
      const cm = document.createElement('div');
      cm.id = 'contextMenu';
      cm.className = 'context-menu';
      document.body.appendChild(cm);
      // إعادة ربط المحرك بالقنصر الجديد
      if (typeof ContextMenu !== 'undefined') ContextMenu.el = cm;
    }
  }
};

// تشغيل المحرك فوراً
AppLayout.init();
