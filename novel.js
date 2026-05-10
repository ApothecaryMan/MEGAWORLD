/**
 * MEGAWORLD Novel Details Engine
 * Renders the novel information and chapter list.
 */

const NovelPage = {
  novelIdx: null,
  novel: null,

  init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id === null || isNaN(parseInt(id))) {
      window.location.href = 'index.html';
      return;
    }

    this.novelIdx = parseInt(id);
    this.novel = Store.state.novels[this.novelIdx];

    if (!this.novel) {
      window.location.href = 'index.html';
      return;
    }

    this.render();
  },

  render() {
    const container = document.getElementById('novelApp');
    if (!container) return;

    container.innerHTML = `
      <!-- Hero Section -->
      <section class="novel-hero">
        <img src="${this.novel.cover || 'public/default_cover.png'}" class="novel-cover-large">
        <div class="novel-info-main">
          <h1 class="novel-title-big">${this.novel.title}</h1>
          <div class="novel-meta">
            <span>بواسطة: ${this.novel.author || 'مؤلف مجهول'}</span>
            <span>|</span>
            <span>الحالة: ${this.novel.status || 'مستمرة'}</span>
            <span>|</span>
            <span>الفصول: ${this.novel.chapters.length}</span>
          </div>
          <div class="genre-tags-flex">
            ${(this.novel.genres || ['عام']).map(g => `<span class="genre-tag">${g}</span>`).join('')}
          </div>
          <p class="novel-description">${this.novel.description || 'لا يوجد وصف متاح.'}</p>
          <div class="flex-row" style="margin-top: 20px; gap: 15px;">
            <button class="btn-flat active" style="padding: 0 35px; background: var(--color-theme); color: var(--color-on-theme); border: none;" onclick="NovelPage.startReading()">ابدأ القراءة</button>
            <button class="btn-flat" onclick="NovelPage.addToLibrary()">أضف للمكتبة</button>
          </div>
        </div>
      </section>

      <!-- Chapter List Section -->
      <section class="chapter-list-section">
        <h3 class="section-label">قائمة الفصول</h3>
        <div class="chapter-list-container">
          ${this.novel.chapters.map((ch, i) => `
            <div class="chapter-row" onclick="NovelPage.readChapter(${i})">
              <span class="chapter-num">${i + 1}</span>
              <span class="chapter-name">${ch.title}</span>
              <span class="chapter-date">منذ يومين</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  },

  startReading() {
    Store.switchNovel(this.novelIdx);
    window.location.href = 'reader.html';
  },

  readChapter(chIdx) {
    Store.switchNovel(this.novelIdx);
    Store.setChapter(chIdx);
    window.location.href = 'reader.html';
  },

  addToLibrary() {
    // ميزة مستقبلية: تتبع الروايات المضافة للمكتبة الشخصية
    alert('تمت الإضافة للمكتبة!');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  // انتظر قليلاً لضمان تحميل الـ Store
  setTimeout(() => NovelPage.init(), 50);
});
