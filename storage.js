const STORE_KEY = 'ar_reader_v7';

/**
 * وظيفة لحفظ كافة بيانات التطبيق الحالية
 */
function save() {
  try {
    const payload = {
      chapters,
      activeIdx,
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
    if (!raw) return;
    const d = JSON.parse(raw);
    
    if (d.chapters) chapters = d.chapters;
    if (d.activeIdx !== undefined) activeIdx = d.activeIdx;
    if (d.font) font = d.font;
    if (d.sz) sz = d.sz;
    if (d.align) align = d.align;
    if (d.sidebarVisible !== undefined) sidebarVisible = d.sidebarVisible;
    if (d.continuousMode !== undefined) continuousMode = d.continuousMode;

    if (d.paletteCls && typeof palettes !== 'undefined') {
      const p = palettes.find(x => x.cls === d.paletteCls);
      if (p) activePalette = p;
    }
  } catch (e) {
    console.error('فشل تحميل البيانات:', e);
  }
}

// الحفظ التلقائي عند مغادرة الصفحة
window.addEventListener('beforeunload', save);
