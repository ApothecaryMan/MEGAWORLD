import { supabase, getUserProfile } from './supabase_client.js';
import Store from './store.js';
import Toolbar, { applyGlobalUI } from './toolbar.js';
import ContextMenu from './context_menu.js';
import { MEGA_PAGES } from './page_config.js';
import { AuthModule } from './auth_module.js';
import HomeEngine from './home_engine.js';
import StatsEngine from './stats_engine.js';
import { initSidebar } from './sidebar.js';
import LibraryEngine from './library_engine.js';
import NovelPage from './novel.js';
import Editor from './editor.js';

const AppLayout = {
  async init() {
    // 0. تهيئة المحركات الأساسية غير البصرية
    StatsEngine.init();
    
    // 1. ضمان وجود المكونات العالمية
    this.ensureGlobalElements();

    const pageKey = this.getCurrentPageKey();
    const config = MEGA_PAGES[pageKey];

    if (!config) return;

    // 2. تحديث عنوان الصفحة
    document.title = `MEGAWORLD | ${config.title}`;

    // 3. تهيئة التولبار
    if (document.getElementById('mainToolbar') && config.toolbar) {
      // حقن التصنيفات الحقيقية
      const catDrop = config.toolbar.find(item => item.id === 'catDrop');
      if (catDrop) {
        const realGenres = Store.getAllGenres();
        catDrop.items = realGenres.map(g => ({
          label: g,
          icon: 'hash',
          action: () => {
            if (window.HomeEngine && typeof window.HomeEngine.filterByGenre === 'function') {
              window.HomeEngine.filterByGenre(g);
            }
          }
        }));
      }

      Toolbar.init('mainToolbar', config.toolbar);
      
      // التحقق من حالة المستخدم
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getUserProfile(session.user.id);
        Toolbar.setUser(profile || session.user);
      } else {
        Toolbar.setUser(null);
      }
    }

    // 4. تهيئة محركات الصفحات (إذا كانت محملة)
    if (document.getElementById('homeApp') && config.content) {
      HomeEngine.init('homeApp', config.content);
    }
    
    if (document.getElementById('library-display')) {
      LibraryEngine.init();
    }
    
    if (document.getElementById('novelApp')) {
      NovelPage.init();
    }

    if (document.getElementById('tabsBar') || document.getElementById('bodyWrap')) {
      Editor.renderTabs();
      Editor.renderBody();
    }

    // 5. تهيئة السايدبار (إذا كان موجوداً)
    if (document.getElementById('sidebar')) {
      initSidebar();
    }

    // 6. تطبيق التنسيقات العالمية
    applyGlobalUI();

    // 7. إعادة مزامنة حالة السايدبار (لضمان بقاء الأزرار متزامنة بعد الـ reset في الخطوة السابقة)
    if (typeof window.applySidebarState === 'function') {
      window.applySidebarState();
    }

    console.log(`MEGAWORLD Layout Engine: ${config.title} Ready.`);
  },

  getCurrentPageKey() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  },

  ensureGlobalElements() {
    if (!document.body.id) document.body.id = 'root';
    if (!document.body.classList.contains('root')) document.body.classList.add('root');
    
    // اكتشاف نمط التطبيق (App Mode) لتعطيل سكرول الصفحة العام
    if (document.querySelector('.main-layout')) {
      document.body.classList.add('app-mode');
    }

    // Context Menu
    if (!document.getElementById('contextMenu')) {
      const cm = document.createElement('div');
      cm.id = 'contextMenu';
      cm.className = 'context-menu';
      document.body.appendChild(cm);
      ContextMenu.el = cm;
    }

    // Progress Bar
    if (!document.getElementById('progressBar')) {
      const pWrap = document.createElement('div');
      pWrap.className = 'progress-wrap';
      pWrap.innerHTML = '<div class="progress-bar" id="progressBar"></div>';
      document.body.appendChild(pWrap);
    }

    // Modal
    if (!document.getElementById('modalBg')) {
      const modal = document.createElement('div');
      modal.id = 'modalBg';
      modal.className = 'modal-bg';
      modal.innerHTML = `
        <div class="modal" id="modal">
          <div class="modal-hdr">
            <h2 id="modalTitle"></h2>
          </div>
          <div id="modalBody" style="padding: 10px 0;"></div>
          <div class="modal-btns" id="modalBtns"></div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  }
};

// إتاحة الكائن عالمياً
window.AppLayout = AppLayout;

// تشغيل المحرك فوراً
AppLayout.init();
