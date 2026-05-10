/**
 * محرك الإحصائيات (Stats Engine)
 * مسؤول عن حساب وتحديث بيانات الفصل في التولبار.
 */
const StatsEngine = {
  init() {
    Store.subscribe((event) => {
      // تحديث الإحصائيات عند تغيير المحتوى أو الفصل
      this.update();
      
      // زيادة المشاهدات عند تغيير الفصل
      if (event === 'chapter-changed') {
        Store.incrementChapterViews(Store.activeChapterIdx);
      }
    });

    // التحديث الأولي
    this.update();
  },

  update() {
    const ch = Store.chapters[Store.activeChapterIdx];
    const text = ch ? (ch.content || '') : '';
    
    // 1. حساب الكلمات والحروف
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    // 2. حساب وقت القراءة (المتوسط 200 كلمة/دقيقة)
    const readTime = Math.ceil(words / 200);
    const rtLabel = readTime <= 10 && readTime > 2 ? 'دقائق' : 'دقيقة';

    // 3. المشاهدات
    const views = ch ? (ch.views || 0) : 0;

    // 4. معلومات التنقل
    const activeIdx = Store.activeChapterIdx;
    const count = Store.chapters.length;

    // تحديث الواجهة
    this.updateUI({
      words,
      chars,
      readTime,
      rtLabel,
      views,
      nav: `${activeIdx + 1} / ${count}`
    });
  },

  updateUI(data) {
    const el = {
      wc: document.getElementById('wc'),
      cc: document.getElementById('cc'),
      rt: document.getElementById('rt'),
      rtl: document.getElementById('rt-lbl'),
      vc: document.getElementById('vc'),
      nav: document.getElementById('navInfo')
    };

    if (el.wc) el.wc.textContent = data.words.toLocaleString();
    if (el.cc) el.cc.textContent = data.chars.toLocaleString();
    if (el.rt) el.rt.textContent = data.readTime;
    if (el.rtl) el.rtl.textContent = data.rtLabel;
    if (el.vc) el.vc.textContent = data.views.toLocaleString();
    if (el.nav) el.nav.textContent = data.nav;
  }
};

// تشغيل المحرك
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => StatsEngine.init(), 100);
});
