import Store from './store.js';
import ContextMenu from './context_menu.js';

export const LibraryEngine = {
  currentTab: 'reading',
  currentView: 'grid',
  searchQuery: '',
  currentGenre: 'الكل',
  currentSort: 'lastRead',

  init() {
    this.renderTabs();
    this.renderGenres();
    this.bindEvents();
    this.refresh();
  },

  renderTabs() {
    document.querySelectorAll('.lib-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
    });
  },

  /**
   * Refreshes the UI with latest data from Store
   */
  refresh() {
    const novels = Store.getNovels().map((n, idx) => ({ ...n, id: idx })); // إضافة الـ ID بناءً على الفهرس
    const filtered = this.filterNovels(novels);
    const sorted = this.sortNovels(filtered);
    
    this.updateCounts(novels);
    this.renderNovels(sorted);
  },

  filterNovels(novels) {
    return novels.filter(novel => {
      // 1. Filter by Tab (Library Status)
      // إذا كانت الحالة غير موجودة، نعتبرها "قيد القراءة" افتراضياً
      const status = novel.libraryStatus || 'reading';
      const tabMatch = status === this.currentTab;
      
      // 2. Filter by Search
      const searchMatch = (novel.title || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          (novel.author || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // 3. Filter by Genre
      const genreMatch = this.currentGenre === 'الكل' || 
                         (novel.genres && novel.genres.includes(this.currentGenre));

      return tabMatch && searchMatch && genreMatch;
    });
  },

  sortNovels(novels) {
    return novels.sort((a, b) => {
      if (this.currentSort === 'alpha') return a.title.localeCompare(b.title, 'ar');
      if (this.currentSort === 'newest') return (b.dateAdded || 0) - (a.dateAdded || 0);
      
      // Default: Last Read
      const dateA = a.readingProgress?.lastReadDate || 0;
      const dateB = b.readingProgress?.lastReadDate || 0;
      return dateB - dateA;
    });
  },

  updateCounts(novels) {
    const counts = {
      reading: novels.filter(n => (n.libraryStatus || 'reading') === 'reading').length,
      completed: novels.filter(n => n.libraryStatus === 'completed').length,
      wishlist: novels.filter(n => n.libraryStatus === 'wishlist').length,
      following: novels.filter(n => n.libraryStatus === 'following').length,
      onhold: novels.filter(n => n.libraryStatus === 'onhold').length,
    };

    Object.keys(counts).forEach(key => {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = counts[key];
    });
  },

  renderNovels(novels) {
    const container = document.getElementById('library-display');
    const empty = document.getElementById('lib-empty');
    
    container.innerHTML = '';
    
    if (novels.length === 0) {
      container.style.display = 'none';
      empty.style.display = 'flex';
      return;
    }

    container.style.display = 'grid';
    empty.style.display = 'none';

    novels.forEach(novel => {
      const card = this.createNovelCard(novel);
      container.appendChild(card);
    });
  },

  createNovelCard(novel) {
    const div = document.createElement('div');
    div.className = 'lib-novel-card';
    
    // حساب التقدم برمجياً من بيانات الرواية
    const totalChapters = (novel.chapters && novel.chapters.length) || 0;
    const currentChapter = (novel.activeChapterIdx !== undefined) ? (novel.activeChapterIdx + 1) : 0;
    const percent = totalChapters > 0 ? Math.round((currentChapter / totalChapters) * 100) : 0;
    
    // Check for updates (New Chapter)
    const lastReadDate = novel.lastReadDate || 0;
    const hasUpdate = (novel.lastChapterUpdate || 0) > lastReadDate;

    div.innerHTML = `
      <div class="lib-card-cover-wrap">
        ${novel.cover ? 
          `<img src="${novel.cover}" class="lib-card-cover">` :
          `<div class="lib-card-cover-placeholder placeholder-flat">
             <i class="ti ti-photo"></i>
             <span>بدون غلاف</span>
           </div>`
        }
        ${hasUpdate ? '<div class="lib-card-badge">فصل جديد!</div>' : ''}
      </div>
      
      <div class="lib-card-info">
        <h3 class="lib-card-title">${novel.title}</h3>
        <p class="lib-card-author">بواسطة: ${novel.author}</p>
        
        <div class="lib-progress-section">
          <div class="lib-progress-text">
            <span>الفصل ${currentChapter} من ${totalChapters}</span>
            <span>${percent}%</span>
          </div>
          <div class="progress-flat-container">
            <div class="progress-flat-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      </div>

      <div class="lib-card-footer">
        <button class="btn-flat active mini" onclick="LibraryEngine.continueReading('${novel.id}')">
          <i class="ti ti-player-play"></i> أكمل
        </button>
        <button class="btn-flat mini" onclick="LibraryEngine.showOptions(event, '${novel.id}')">
          <i class="ti ti-dots-vertical"></i>
        </button>
      </div>
    `;

    return div;
  },

  renderGenres() {
    const menu = document.getElementById('genre-menu');
    const novels = Store.getNovels();
    const genres = new Set(['الكل']);
    
    novels.forEach(n => {
      if (n.genres) n.genres.forEach(g => genres.add(g));
    });

    menu.innerHTML = Array.from(genres).map(g => `
      <button class="dropdown-item ${g === this.currentGenre ? 'active' : ''}" 
              onclick="LibraryEngine.setGenre('${g}')">${g}</button>
    `).join('');
  },

  /** Event Handlers **/
  setTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.lib-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    this.refresh();
  },

  setGenre(genre) {
    this.currentGenre = genre;
    document.getElementById('current-genre').textContent = genre;
    document.getElementById('filter-genre').classList.remove('open');
    this.renderGenres();
    this.refresh();
  },

  setSort(sort, label) {
    this.currentSort = sort;
    document.getElementById('current-sort').textContent = label;
    document.getElementById('filter-sort').classList.remove('open');
    this.refresh();
  },

  setView(view) {
    this.currentView = view;
    const container = document.getElementById('library-display');
    container.classList.toggle('list-view', view === 'list');
    document.getElementById('view-grid').classList.toggle('active', view === 'grid');
    document.getElementById('view-list').classList.toggle('active', view === 'list');
  },

  continueReading(id) {
    Store.switchNovel(parseInt(id));
    window.location.href = 'index.html';
  },

  showOptions(e, id) {
    if (typeof ContextMenu !== 'undefined') {
      const novels = Store.getNovels();
      const novel = novels[id];
      if (!novel) return;

      const items = [];
      
      // خيارات النقل (حسب الحالة الحالية)
      if (novel.libraryStatus !== 'reading') {
        items.push({ label: 'نقل إلى "قيد القراءة"', icon: 'ti-book-2', action: () => this.updateStatus(id, 'reading') });
      }
      if (novel.libraryStatus !== 'completed') {
        items.push({ label: 'نقل إلى "مكتملة"', icon: 'ti-circle-check', action: () => this.updateStatus(id, 'completed') });
      }
      if (novel.libraryStatus !== 'wishlist') {
        items.push({ label: 'إضافة للمفضلة', icon: 'ti-star', action: () => this.updateStatus(id, 'wishlist') });
      }
      if (novel.libraryStatus !== 'following') {
        items.push({ label: 'نقل إلى "متابعة"', icon: 'ti-rss', action: () => this.updateStatus(id, 'following') });
      }
      if (novel.libraryStatus !== 'onhold') {
        items.push({ label: 'نقل إلى "متوقفة"', icon: 'ti-player-pause', action: () => this.updateStatus(id, 'onhold') });
      }

      items.push({ sep: true });
      items.push({ label: 'عرض التفاصيل', icon: 'ti-external-link', action: () => window.location.href = `novel.html?id=${id}` });
      items.push({ sep: true });
      items.push({ label: 'حذف من المكتبة', icon: 'ti-trash', danger: true, action: () => this.deleteNovel(id) });

      ContextMenu.show(e, items);
    }
  },

  updateStatus(id, status) {
    const novels = Store.getNovels();
    if (novels[id]) {
      novels[id].libraryStatus = status;
      Store.save();
      
      // تحديث العدادات العالمية في التولبار إذا كان متاحاً
      if (typeof AppLayout !== 'undefined') {
        const totalNovels = Object.keys(Store.getNovels()).length;
        const badge = document.querySelector('.badge-flat'); // محاولة البحث عن البادج في الدوم مباشرة
        if (badge) badge.textContent = totalNovels;
      }

      this.refresh();
    }
  },

  deleteNovel(id) {
    if (confirm('هل أنت متأكد من حذف هذه الرواية من مكتبتك؟')) {
      const novels = Store.getNovels();
      novels.splice(id, 1); // الحذف من المصفوفة
      Store.save();
      this.refresh();
    }
  },

  bindEvents() {
    // Tabs
    document.querySelectorAll('.lib-tab').forEach(btn => {
      btn.onclick = () => this.setTab(btn.dataset.tab);
    });

    // View Toggles
    document.getElementById('view-grid').onclick = () => this.setView('grid');
    document.getElementById('view-list').onclick = () => this.setView('list');

    // Search
    document.getElementById('lib-search').oninput = (e) => {
      this.searchQuery = e.target.value;
      this.refresh();
    };

    // Dropdowns
    document.querySelectorAll('.dropdown-wrap').forEach(dw => {
      dw.querySelector('.dropdown-trigger').onclick = (e) => {
        e.stopPropagation();
        const isOpen = dw.classList.contains('open');
        document.querySelectorAll('.dropdown-wrap').forEach(d => d.classList.remove('open'));
        if (!isOpen) dw.classList.add('open');
      };
    });

    // Sort items
    document.querySelectorAll('#filter-sort .dropdown-item').forEach(item => {
      item.onclick = () => this.setSort(item.dataset.sort, item.textContent);
    });

    // Close dropdowns on click outside
    window.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-wrap').forEach(d => d.classList.remove('open'));
    });
  }
};

window.LibraryEngine = LibraryEngine;
export default LibraryEngine;
