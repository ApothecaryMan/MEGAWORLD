import { supabase, getUserProfile } from './supabase_client.js';

const AppLayout = {
  async init() {
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
      // حقن التصنيفات الحقيقية
      const catDrop = config.toolbar.find(item => item.id === 'catDrop');
      if (catDrop) {
        const realGenres = Store.getAllGenres();
        catDrop.items = realGenres.map(g => ({
          label: g,
          icon: 'hash',
          action: () => {
            if (typeof HomeEngine !== 'undefined' && typeof HomeEngine.filterByGenre === 'function') {
              HomeEngine.filterByGenre(g);
            }
          }
        }));
      }

      Toolbar.init('mainToolbar', config.toolbar);
      
      // --- التحقق من حالة المستخدم (Auth Check) ---
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getUserProfile(session.user.id);
        Toolbar.setUser(profile || session.user);
      } else {
        Toolbar.setUser(null);
      }
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
  },

  getCurrentPageKey() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  },

  ensureGlobalElements() {
    if (!document.body.id) document.body.id = 'root';
    if (!document.body.classList.contains('root')) document.body.classList.add('root');

    if (!document.getElementById('contextMenu')) {
      const cm = document.createElement('div');
      cm.id = 'contextMenu';
      cm.className = 'context-menu';
      document.body.appendChild(cm);
      if (typeof ContextMenu !== 'undefined') ContextMenu.el = cm;
    }

    if (!document.getElementById('progressBar')) {
      const pWrap = document.createElement('div');
      pWrap.className = 'progress-wrap';
      pWrap.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
      document.body.appendChild(pWrap);
    }

    if (!document.getElementById('modalBg')) {
      const modal = document.createElement('div');
      modal.id = 'modalBg';
      modal.className = 'modal-bg';
      modal.innerHTML = `
        <div class="modal" id="modal">
          <div class="modal-hdr">
            <h2 id="modalTitle"></h2>
            <button class="btn-icon" onclick="document.getElementById('modalBg').classList.remove('open')"><i class="ti ti-x"></i></button>
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
