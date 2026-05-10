/**
 * العقل المركزي للتطبيق (The Store)
 * يدير البيانات، الحالة، والحفظ التلقائي.
 */
const Store = {
  // --- الحالة (State) ---
  state: {
    novels: [],
    activeNovelIdx: 0,
    settings: {
      font: 'fn',
      sz: 22,
      align: 'ar',
      continuousMode: false,
      theme: 'bg-def',
      sidebarVisible: true
    }
  },

  // --- البيانات الثابتة (Constants) ---
  palettes: [
    { id: 'bg-def', label: 'ورقي', bg: '#f5f3f0', text: '#2d2d2d' },
    { id: 'bg-ivory', label: 'عاجي', bg: '#fdf6e3', text: '#3b3020' },
    { id: 'bg-mint', label: 'نعناعي', bg: '#f0fdf5', text: '#1a3326' },
    { id: 'bg-pink', label: 'زهري', bg: '#fdf0f0', text: '#3a1e1e' },
    { id: 'bg-gray', label: 'رمادي', bg: '#f4f4f2', text: '#2a2a2a' },
    { id: 'bg-sky', label: 'سماوي', bg: '#eff6ff', text: '#1e2f4a' },
    { id: 'bg-night', label: 'ليلي', bg: '#1a1a2e', text: '#e0d8c8' },
    { id: 'bg-dark', label: 'داكن', bg: '#212121', text: '#d4c9b0' },
    { id: 'bg-oled', label: '(OLED)', bg: '#000000', text: '#ffffff' },
    { id: 'bg-forest', label: 'غابة', bg: '#0d1f17', text: '#b8e8c8' },
    { id: 'bg-abyss', label: 'هاوية', bg: '#0a0f1e', text: '#c4cfe8' },
    { id: 'bg-ember', label: 'جمر', bg: '#1c1208', text: '#e8c89a' }
  ],

  // --- التهيئة (Initialization) ---
  init() {
    this.load();
    this.migrate();
    this.autoSave();
    this.notify();
  },

  // --- إدارة الروايات (Novel Management) ---
  get activeNovel() {
    return this.state.novels[this.state.activeNovelIdx] || null;
  },

  get chapters() {
    return this.activeNovel ? this.activeNovel.chapters : [];
  },

  get activeChapterIdx() {
    return this.activeNovel ? this.activeNovel.activeChapterIdx : 0;
  },

  addNovel(title = 'رواية جديدة', author = 'مؤلف مجهول', cover = 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png', chapters = null) {
    const novel = {
      title,
      author,
      description: 'لا يوجد وصف متاح حالياً لهذه الرواية.',
      cover,
      status: 'مستمرة',
      genres: ['عام'],
      chapters: chapters || [{ title: 'فصل 1', content: '' }],
      activeChapterIdx: 0
    };
    this.state.novels.push(novel);
    this.state.activeNovelIdx = this.state.novels.length - 1;
    this.save();
    this.notify();
  },

  switchNovel(idx) {
    if (idx >= 0 && idx < this.state.novels.length) {
      this.state.activeNovelIdx = idx;
      this.save();
      this.notify();
    }
  },

  updateNovelTitle(title) {
    if (this.activeNovel) {
      this.activeNovel.title = title;
      this.save();
      this.notify();
    }
  },

  updateNovelCover(idx, cover) {
    if (this.state.novels[idx]) {
      this.state.novels[idx].cover = cover;
      this.save();
      this.notify();
    }
  },

  deleteNovel(idx) {
    if (this.state.novels.length > 1) {
      this.state.novels.splice(idx, 1);
      if (this.state.activeNovelIdx >= this.state.novels.length) {
        this.state.activeNovelIdx = this.state.novels.length - 1;
      }
      this.save();
      this.notify();
    }
  },

  // --- إدارة الفصول (Chapter Management) ---
  addChapter() {
    if (this.activeNovel) {
      const idx = this.activeNovel.chapters.push({
        title: 'فصل ' + (this.activeNovel.chapters.length + 1),
        content: '',
        views: 0
      }) - 1;
      this.activeNovel.activeChapterIdx = idx;
      this.save();
      this.notify('chapter-added');
    }
  },

  incrementChapterViews(idx) {
    if (this.activeNovel && this.activeNovel.chapters[idx]) {
      const ch = this.activeNovel.chapters[idx];
      ch.views = (ch.views || 0) + 1;
      
      // تسجيل المشاهدة بالتاريخ المحلي للحسابات الزمنية بدقة
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      if (!ch.viewLog) ch.viewLog = {};
      ch.viewLog[today] = (ch.viewLog[today] || 0) + 1;
      
      this.save();
    }
  },

  updateChapter(idx, data) {
    if (this.activeNovel && this.activeNovel.chapters[idx]) {
      Object.assign(this.activeNovel.chapters[idx], data);
      this.save();
      this.notify();
    }
  },

  deleteChapter(idx) {
    if (this.activeNovel) {
      const chs = this.activeNovel.chapters;
      if (chs.length === 1) {
        chs[0] = { title: 'فصل 1', content: '' };
      } else {
        chs.splice(idx, 1);
        if (this.activeNovel.activeChapterIdx >= chs.length) {
          this.activeNovel.activeChapterIdx = chs.length - 1;
        }
      }
      this.save();
      this.notify();
    }
  },

  setChapter(idx) {
    if (this.activeNovel && idx >= 0 && idx < this.activeNovel.chapters.length) {
      this.activeNovel.activeChapterIdx = idx;
      this.save();
      this.notify('chapter-changed');
    }
  },

  // --- الإعدادات (Settings) ---
  updateSettings(key, val) {
    this.state.settings[key] = val;
    this.save();
    if (key === 'sidebarVisible') {
      if (typeof applySidebarState === 'function') applySidebarState();
    }
  },

  // --- الحفظ والتحميل (Persistence) ---
  save() {
    localStorage.setItem('novel_reader_v9', JSON.stringify(this.state));
  },

  load() {
    const data = localStorage.getItem('novel_reader_v9');
    if (data) {
      try {
        this.state = JSON.parse(data);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    } else {
      // إعداد افتراضي لأول مرة
      this.addNovel('رواية افتراضية');
    }
  },

  migrate() {
    // 1. ترحيل البيانات من الإصدارات القديمة (v8 وما قبلها)
    const oldData = localStorage.getItem('novel_reader_v8');
    if (oldData && this.state.novels.length === 1 && this.state.novels[0].title === 'رواية افتراضية' && this.state.novels[0].chapters[0].content === '') {
      try {
        const legacy = JSON.parse(oldData);
        if (legacy.novels) {
          this.state.novels = legacy.novels;
          this.state.activeNovelIdx = legacy.activeNovelIdx || 0;
        } else if (legacy.chapters) {
          this.state.novels[0].chapters = legacy.chapters;
          this.state.novels[0].activeChapterIdx = legacy.activeIdx || 0;
        }
      } catch (e) { console.error('Migration failed', e); }
    }

    // 2. تحديث هيكلية الروايات الحالية لتشمل الحقول الجديدة
    this.state.novels.forEach(n => {
      if (!n.author) n.author = 'مؤلف مجهول';
      if (!n.description) n.description = 'لا يوجد وصف متاح حالياً لهذه الرواية.';
      if (!n.status) n.status = 'مستمرة';
      if (!n.genres) n.genres = ['عام'];
      if (!n.cover) n.cover = 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png';
      n.chapters.forEach(ch => {
        if (!ch.views) ch.views = 0;
        if (!ch.viewLog) ch.viewLog = {};
      });
    });
    this.save();
  },

  autoSave() {
    // حفظ احتياطي كل دقيقتين
    setInterval(() => this.save(), 120000);
  },

  // --- نظام التنبيه (Observer Pattern) ---
  listeners: [],
  subscribe(callback) {
    this.listeners.push(callback);
  },
  notify(event) {
    this.listeners.forEach(cb => cb(event));
  }
};

// تهيئة العقل المركزي فور تحميل الملف
Store.init();
