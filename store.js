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

  addNovel(title = 'رواية جديدة') {
    const novel = {
      title,
      chapters: [{ title: 'فصل 1', content: '' }],
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
        content: ''
      }) - 1;
      this.activeNovel.activeChapterIdx = idx;
      this.save();
      this.notify('chapter-added');
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
      this.notify();
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
    // ترحيل البيانات من الإصدارات القديمة (v8 وما قبلها)
    const oldData = localStorage.getItem('novel_reader_v8');
    if (oldData && this.state.novels.length === 1 && this.state.novels[0].title === 'رواية افتراضية' && this.state.novels[0].chapters[0].content === '') {
      try {
        const legacy = JSON.parse(oldData);
        if (legacy.novels) {
          this.state.novels = legacy.novels;
          this.state.activeNovelIdx = legacy.activeNovelIdx || 0;
        } else if (legacy.chapters) {
          // ترحيل من نظام الرواية الواحدة القديم جداً
          this.state.novels[0].chapters = legacy.chapters;
          this.state.novels[0].activeChapterIdx = legacy.activeIdx || 0;
        }
        this.save();
      } catch (e) { console.error('Migration failed', e); }
    }
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

// ربط المتغيرات القديمة بالجديدة لضمان عدم تعطل الأكواد الحالية مؤقتاً
let chapters = Store.chapters;
let activeIdx = Store.activeChapterIdx;
let novels = Store.state.novels;
let activeNovelIdx = Store.state.activeNovelIdx;
let font = Store.state.settings.font;
let sz = Store.state.settings.sz;
let align = Store.state.settings.align;
let continuousMode = Store.state.settings.continuousMode;
let activePalette = { cls: Store.state.settings.theme };
let sidebarVisible = Store.state.settings.sidebarVisible;

// وظيفة لمزامنة المتغيرات القديمة (سيتم حذفها لاحقاً بعد الريفراكتور الكامل)
function syncLegacy() {
  chapters = Store.chapters;
  activeIdx = Store.activeChapterIdx;
  novels = Store.state.novels;
  activeNovelIdx = Store.state.activeNovelIdx;
  font = Store.state.settings.font;
  sz = Store.state.settings.sz;
  align = Store.state.settings.align;
  continuousMode = Store.state.settings.continuousMode;
  sidebarVisible = Store.state.settings.sidebarVisible;
}

Store.subscribe(() => syncLegacy());
