import Store from './store.js';

export const StatsEngine = {
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
  },

  // --- وظائف عامة مستخدمة في الموقع بالكامل ---
  getViews(novel) {
    if (!novel.chapters || novel.chapters.length === 0) return 0;
    const views = novel.chapters.map(ch => ch.views || 0);
    return Math.max(...views);
  },

  // إجمالي مشاهدات الرواية (لكل الفصول)
  getTotalViews(novel) {
    if (!novel.chapters) return 0;
    return novel.chapters.reduce((sum, ch) => sum + (ch.views || 0), 0);
  },

  // حساب المشاهدات خلال فترة زمنية محددة (بالأيام)
  getViewsForPeriod(novel, days) {
    if (!novel.chapters) return 0;
    
    // حساب تاريخ البداية بناءً على الوقت المحلي
    const now = new Date();
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - days);
    
    const startTime = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;
    
    let total = 0;
    novel.chapters.forEach(ch => {
      if (ch.viewLog) {
        for (let date in ch.viewLog) {
          if (date >= startTime) total += ch.viewLog[date];
        }
      }
    });
    return total;
  },

  formatNum(num) {
    if (!num || isNaN(num)) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  },

  getSortedNovels() {
    const all = Store.state.novels || [];
    return [...all].sort((a, b) => this.getViews(b) - this.getViews(a));
  },

  // الترتيب حسب إجمالي المشاهدات (للمراكز الثلاثة الأولى)
  getSortedByTotal() {
    const all = Store.state.novels || [];
    return [...all].sort((a, b) => this.getTotalViews(b) - this.getTotalViews(a));
  },

  // الترتيب حسب فترة زمنية (للرائج)
  getSortedByPeriod(days) {
    const all = Store.state.novels || [];
    return [...all].sort((a, b) => {
      const vA = this.getViewsForPeriod(a, days);
      const vB = this.getViewsForPeriod(b, days);
      if (vA !== vB) return vB - vA;
      return this.getTotalViews(b) - this.getTotalViews(a); // فرز ثانوي حسب إجمالي المشاهدات
    });
  }
};


window.StatsEngine = StatsEngine;
export default StatsEngine;
