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

      // 1. تحديث عنوان الصفحة
      document.title = `MEGAWORLD | ${config.title}`;

      // 2. تهيئة التولبار (إذا وجد له حاوية)
      if (document.getElementById('mainToolbar') && config.toolbar) {
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
  }
};

// تشغيل المحرك فوراً
AppLayout.init();
