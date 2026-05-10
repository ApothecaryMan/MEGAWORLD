const STORE_KEY = 'ar_reader_v8'; // Bumped version for multi-novel system

/**
 * وظيفة لحفظ كافة بيانات التطبيق الحالية
 */
function save() {
  try {
    const payload = {
      novels,
      activeNovelIdx,
      font,
      sz,
      align,
      sidebarVisible,
      continuousMode,
      paletteCls: activePalette ? activePalette.cls : 'bg-def'
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('فشل حفظ البيانات:', e);
  }
}

/**
 * وظيفة لتحميل البيانات المحفوظة وتطبيقها على التطبيق
 */
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    
    if (!raw) {
      // محاولة استيراد البيانات من النسخة القديمة v7
      const oldRaw = localStorage.getItem('ar_reader_v7');
      if (oldRaw) {
        const d = JSON.parse(oldRaw);
        novels = [{
          title: 'رواية افتراضية',
          chapters: d.chapters || [{ title: 'فصل 1', content: '' }],
          activeChapterIdx: d.activeIdx || 0
        }];
        activeNovelIdx = 0;
        syncStateFromActiveNovel();
        return;
      }
      
      // إذا لم توجد بيانات قديمة، إنشاء رواية أولى فارغة
      novels = [{ title: 'رواية جديدة', chapters: [{ title: 'فصل 1', content: '' }], activeChapterIdx: 0 }];
      activeNovelIdx = 0;
      syncStateFromActiveNovel();
      return;
    }

    const d = JSON.parse(raw);
    if (d.novels) novels = d.novels;
    if (d.activeNovelIdx !== undefined) activeNovelIdx = d.activeNovelIdx;
    if (d.font) font = d.font;
    if (d.sz) sz = d.sz;
    if (d.align) align = d.align;
    if (d.sidebarVisible !== undefined) sidebarVisible = d.sidebarVisible;
    if (d.continuousMode !== undefined) continuousMode = d.continuousMode;

    if (d.paletteCls && typeof palettes !== 'undefined') {
      const p = palettes.find(x => x.cls === d.paletteCls);
      if (p) activePalette = p;
    }

    syncStateFromActiveNovel();
  } catch (e) {
    console.error('فشل تحميل البيانات:', e);
  }
}

/**
 * مزامنة المتغيرات العالمية مع الرواية النشطة حالياً
 */
function syncStateFromActiveNovel() {
  if (novels[activeNovelIdx]) {
    chapters = novels[activeNovelIdx].chapters;
    activeIdx = novels[activeNovelIdx].activeChapterIdx;
  }
}

// الحفظ التلقائي عند مغادرة الصفحة
window.addEventListener('beforeunload', save);
