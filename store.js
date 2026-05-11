import { supabase } from './supabase_client.js';

const Store = {
  // --- الحالة (State) ---
  state: {
    novels: [],
    activeNovelIdx: 0,
    settings: {
      font: 'fn', sz: 22, align: 'ar',
      continuousMode: false, theme: 'bg-def',
      sidebarVisible: true, chapterSortOrder: 'asc'
    },
    user: null // سيتم جلبه من Supabase
  },

  // ... (palettes stay same)
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
  async init() {
    this.load(); // تحميل من localStorage أولاً للسرعة
    this.migrate();
    
    // التحقق من الجلسة السحابية
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.syncWithCloud(session.user.id);
    }

    this.autoSave();
    this.notify();
  },

  /**
   * مزامنة البيانات مع السحاب
   */
  async syncWithCloud(userId) {
    console.log('Syncing with Supabase...');
    
    // 1. جلب الروايات من السحاب
    const { data: cloudNovels, error } = await supabase
      .from('mw_novels')
      .select('*, chapters:mw_chapters(*)');

    if (error) {
      console.error('Cloud sync failed:', error);
      return;
    }

    if (cloudNovels && cloudNovels.length > 0) {
      // تحويل هيكلية السحاب لهيكلية الـ Store
      this.state.novels = cloudNovels.map(n => ({
        id: n.id,
        title: n.title,
        author: n.author_name,
        description: n.description,
        cover: n.cover_url,
        status: n.status,
        genres: n.genres,
        chapters: n.chapters.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        activeChapterIdx: 0
      }));
      
      // جلب البروفايل وتخزينه في الـ Store
      const { data: profile } = await supabase.from('mw_profiles').select('*').eq('id', userId).single();
      this.state.user = profile;

      this.save(); // تحديث الـ local cache
    } else if (this.state.novels.length > 0) {
      // إذا كان السحاب فارغ والـ local فيه بيانات، ارفع البيانات (First Time Sync)
      await this.uploadLocalDataToCloud(userId);
    }
  },

  /**
   * رفع البيانات المحلية للسيرفر (لمرة واحدة عند أول تسجيل)
   */
  async uploadLocalDataToCloud(userId) {
    for (const novel of this.state.novels) {
      const { data: nData, error: nErr } = await supabase
        .from('mw_novels')
        .insert({
          author_id: userId,
          title: novel.title,
          author_name: novel.author,
          description: novel.description,
          cover_url: novel.cover,
          status: novel.status,
          genres: novel.genres
        })
        .select()
        .single();

      if (nErr) continue;
      
      novel.id = nData.id; // تحديث الـ ID محلياً فوراً

      // رفع فصول الرواية
      const chaptersToInsert = novel.chapters.map((ch, idx) => ({
        novel_id: nData.id,
        title: ch.title,
        content: ch.content,
        sort_order: idx,
        views: ch.views || 0
      }));

      const { data: chData } = await supabase.from('mw_chapters').insert(chaptersToInsert).select();
      if (chData) {
        // تحديث الـ IDs الخاصة بالفصول محلياً برضه
        novel.chapters = chData.sort((a, b) => a.sort_order - b.sort_order);
      }
    }
    this.save(); // حفظ التغييرات النهائية (الـ IDs الجديدة)
  },

  // --- إدارة الروايات (Novel Management) ---
  getNovels() {
    return this.state.novels || [];
  },

  getNovel(idx) {
    return this.state.novels[idx] || null;
  },

  get activeNovel() {
    return this.state.novels[this.state.activeNovelIdx] || null;
  },

  get chapters() {
    return this.activeNovel ? this.activeNovel.chapters : [];
  },

  get activeChapterIdx() {
    return this.activeNovel ? this.activeNovel.activeChapterIdx : 0;
  },

  async addNovel(title = 'رواية جديدة', author = 'مؤلف مجهول', cover = '', chapters = null) {
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

    // مزامنة مع السيرفر إذا كان مسجلاً
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
       const { data, error } = await supabase.from('mw_novels').insert({
          author_id: session.user.id,
          title: novel.title,
          author_name: novel.author,
          cover_url: novel.cover
       }).select().single();
       
       if (data) {
         novel.id = data.id;
         // ارفع الفصول الأولية (الفصل 1)
         const chs = novel.chapters.map((ch, i) => ({
            novel_id: data.id,
            title: ch.title,
            content: ch.content,
            sort_order: i
         }));
         const { data: chData } = await supabase.from('mw_chapters').insert(chs).select();
         if (chData) novel.chapters = chData;
       }
    }

    this.notify();
  },

  switchNovel(idx) {
    if (idx >= 0 && idx < this.state.novels.length) {
      this.state.activeNovelIdx = idx;
      this.save();
      this.notify();
    }
  },

  setActiveNovel(title) {
    const idx = this.state.novels.findIndex(n => n.title === title);
    if (idx !== -1) {
      this.switchNovel(idx);
      return true;
    }
    return false;
  },

  async updateNovelTitle(title) {
    if (this.activeNovel) {
      this.activeNovel.title = title;
      this.save();
      
      if (this.activeNovel.id) {
        await supabase.from('mw_novels').update({ title }).eq('id', this.activeNovel.id);
      }
      
      this.notify();
    }
  },

  async updateNovel(idx, data) {
    const novel = this.state.novels[idx];
    if (novel) {
      Object.assign(novel, data);
      this.save();
      
      if (novel.id) {
        // خريطة تحويل الأسماء من Frontend لـ Database
        const dbData = {};
        if (data.title) dbData.title = data.title;
        if (data.author) dbData.author_name = data.author;
        if (data.description) dbData.description = data.description;
        if (data.cover) dbData.cover_url = data.cover;
        if (data.status) dbData.status = data.status;
        if (data.genres) dbData.genres = data.genres;
        
        await supabase.from('mw_novels').update(dbData).eq('id', novel.id);
      }
      
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

  async deleteNovel(idx) {
    const novelToDelete = this.state.novels[idx];
    
    if (this.state.novels.length > 1) {
      this.state.novels.splice(idx, 1);
      if (this.state.activeNovelIdx >= this.state.novels.length) {
        this.state.activeNovelIdx = this.state.novels.length - 1;
      }
      this.save();
      
      // حذف من السحاب
      if (novelToDelete && novelToDelete.id) {
        await supabase.from('mw_novels').delete().eq('id', novelToDelete.id);
      }

      this.notify();
    }
  },

  getAllGenres() {
    const genresSet = new Set();
    this.state.novels.forEach(n => {
      if (n.genres) n.genres.forEach(g => genresSet.add(g));
    });
    return Array.from(genresSet).sort();
  },

  // --- إدارة الفصول (Chapter Management) ---
  async addChapter() {
    if (this.activeNovel) {
      const newCh = {
        title: 'فصل ' + (this.activeNovel.chapters.length + 1),
        content: '',
        views: 0,
        sort_order: this.activeNovel.chapters.length
      };
      
      const idx = this.activeNovel.chapters.push(newCh) - 1;
      this.activeNovel.activeChapterIdx = idx;
      this.save();

      // مزامنة الفصل مع السيرفر
      if (this.activeNovel.id) {
        const { data, error } = await supabase.from('mw_chapters').insert({
           novel_id: this.activeNovel.id,
           title: newCh.title,
           content: newCh.content,
           sort_order: newCh.sort_order
        }).select().single();
        
        if (data) this.activeNovel.chapters[idx].id = data.id;
      }

      this.notify('chapter-added');
    }
  },

  incrementChapterViews(idx) {
    if (this.activeNovel && this.activeNovel.chapters[idx]) {
      const ch = this.activeNovel.chapters[idx];
      ch.views = (ch.views || 0) + 1;
      
      // تسجيل المشاهدة محلياً
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!ch.viewLog) ch.viewLog = {};
      ch.viewLog[today] = (ch.viewLog[today] || 0) + 1;
      
      this.save();
      
      // مزامنة المشاهدة مع السيرفر (يمكن عملها بـ RPC لاحقاً لزيادة العداد)
      if (ch.id) {
        supabase.from('mw_chapters').update({ views: ch.views }).eq('id', ch.id).then();
      }
    }
  },

  async updateChapter(idx, data) {
    if (this.activeNovel && this.activeNovel.chapters[idx]) {
      const ch = this.activeNovel.chapters[idx];
      Object.assign(ch, data);
      this.save();

      if (ch.id) {
        await supabase.from('mw_chapters').update(data).eq('id', ch.id);
      }
      
      this.notify();
    }
  },

  async deleteChapter(idx) {
    if (this.activeNovel) {
      const chs = this.activeNovel.chapters;
      const chToDelete = chs[idx];
      
      if (chs.length === 1) {
        chs[0] = { title: 'فصل 1', content: '' };
      } else {
        chs.splice(idx, 1);
        if (this.activeNovel.activeChapterIdx >= chs.length) {
          this.activeNovel.activeChapterIdx = chs.length - 1;
        }
      }
      this.save();

      // حذف من السيرفر
      if (chToDelete && chToDelete.id) {
        await supabase.from('mw_chapters').delete().eq('id', chToDelete.id);
      }

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
    try {
      localStorage.setItem('novel_reader_v9', JSON.stringify(this.state));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded. Some data may not be saved.');
      } else {
        console.error('Save failed', e);
      }
    }
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
      if (n.cover === undefined) n.cover = '';
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

// إتاحة الـ Store عالمياً للملفات غير الموديول
window.Store = Store;
export default Store;

// تهيئة العقل المركزي فور تحميل الملف
Store.init();
