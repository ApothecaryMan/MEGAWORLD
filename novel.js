/**
 * MEGAWORLD Novel Details Engine
 * Renders the novel information and chapter list using the premium Unified Shell design.
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

    // Update Toolbar Title dynamically
    const tbTitle = document.getElementById('toolbarNovelTitle');
    if (tbTitle) tbTitle.innerText = this.novel.title;
  },

  render() {
    const container = document.getElementById('novelApp');
    if (!container) return;

    // Build Genre Tags HTML
    const tagsHtml = (this.novel.genres || ['عام']).map(g => `<span class="genre-tag">${g}</span>`).join('');

    // Build Chapters List HTML
    const chaptersHtml = this.novel.chapters.map((ch, i) => `
      <a href="#" class="chapter-item" onclick="event.preventDefault(); NovelPage.readChapter(${i})">
        <div class="chapter-main-info">
          <span class="chapter-index">${i + 1}</span>
          <span class="chapter-item-title">${ch.title}</span>
        </div>
        <div class="chapter-item-meta">
          <span class="chapter-date">منذ يومين</span>
          <span class="chapter-lock"><i class="ti ti-lock-open"></i></span>
        </div>
      </a>
    `).join('');

    // Render Full Page Structure (Centered Main Content with Side Sidebar - Flipped)
    container.innerHTML = `
      <div class="flex-row" style="justify-content: center; align-items: flex-start; gap: 40px; flex-wrap: nowrap;">
        
        <!-- Right Column Spacer: 300px (To balance the sidebar on the left) -->
        <div style="width: 300px; flex-shrink: 0;" class="hide-mobile"></div>

        <!-- Center Column: Main Content (Hero + Chapters + Reviews) - Max 850px -->
        <div style="width: 850px; flex-shrink: 0; display: flex; flex-direction: column; gap: 30px;">
          
          <!-- Phase 1: Novel Header (Tight & Integrated) -->
          <section class="test-section" style="padding:0; margin-bottom: 0;">
            <div class="novel-detail-header">
              <img src="${this.novel.cover || 'public/default_cover.png'}" class="novel-detail-cover" alt="Cover">
              
              <div class="novel-detail-info">
                <div>
                  <h1 class="novel-detail-title">${this.novel.title}</h1>
                  <div class="novel-detail-author">بواسطة: ${this.novel.author || 'مؤلف مجهول'}</div>
                </div>
                
                <div class="novel-rating">
                  <i class="ti ti-star-filled"></i>
                  <i class="ti ti-star-filled"></i>
                  <i class="ti ti-star-filled"></i>
                  <i class="ti ti-star-filled"></i>
                  <i class="ti ti-star-half-filled"></i>
                  <span>(4.8/5) • 1.2K تقييم</span>
                </div>

                <div class="novel-summary">
                  ${this.novel.description || 'لا يوجد وصف متاح لهذه الرواية حالياً.'}
                </div>

                <div class="flex-row" style="gap: 8px;">
                  ${tagsHtml}
                </div>

                <div class="novel-detail-stats">
                  <div class="stat-item"><span class="stat-value">1.2M</span><span class="stat-label">مشاهدة</span></div>
                  <div class="stat-item"><span class="stat-value">85K</span><span class="stat-label">إعجاب</span></div>
                  <div class="stat-item"><span class="stat-value">${this.novel.chapters.length}</span><span class="stat-label">فصل</span></div>
                  <div class="stat-item"><span class="stat-value">${this.novel.status || 'مستمرة'}</span><span class="stat-label">الحالة</span></div>
                </div>

                <div class="flex-row" style="margin-top: 10px; gap: 10px;">
                  <button class="btn-flat active" style="padding: 0 25px; height: 38px;" onclick="NovelPage.startReading()">ابدأ القراءة</button>
                  <button class="btn-flat" style="padding: 0 20px; height: 38px;" onclick="NovelPage.addToLibrary()">
                    <i class="ti ti-bookmark"></i> حفظ
                  </button>
                  <button class="btn-icon" style="height: 38px; width: 38px;"><i class="ti ti-share"></i></button>
                </div>
              </div>
            </div>
          </section>

          <!-- Chapter List Section -->
          <section class="test-section" style="padding:0;">
            <div class="section-header" style="border-bottom: none; margin-bottom: 5px;">
              <h2 class="section-title">قائمة الفصول</h2>
              <div class="flex-row" style="gap: 10px;">
                <input type="text" placeholder="رقم الفصل..." class="input-flat" style="width: 120px; height: 30px; font-size: 11px;">
                <button class="btn-flat" style="font-size: 11px; height: 30px; padding: 0 10px;"><i class="ti ti-arrows-sort"></i> ترتيب</button>
              </div>
            </div>
            <div class="chapter-list-container">
              ${chaptersHtml}
            </div>
            <button class="btn-load-more">مشاهدة المزيد</button>
          </section>

          <!-- Reviews Section -->
          <section class="test-section" style="padding:0;">
            <div class="section-header">
              <h2 class="section-title">تقييمات القراء</h2>
              <button class="btn-flat" style="color: var(--color-theme); font-size: 12px;">أضف تقييمك</button>
            </div>
            <div class="review-item">
              <div class="review-header">
                <div class="review-user">
                  <div class="review-avatar"></div>
                  <div class="review-username">مستخدم تجريبي</div>
                </div>
                <div class="novel-rating" style="font-size: 11px;">
                  <i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i><i class="ti ti-star-filled"></i>
                </div>
              </div>
              <div class="review-content">رواية رائعة جداً، الترجمة ممتازة والأحداث مشوقة.</div>
              <div class="review-date">منذ يومين</div>
            </div>
          </section>
        </div>

        <!-- Left Column: Sidebar (Related) - 300px -->
        <div style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 30px;">
          <section class="test-section" style="padding:0;">
            <h2 class="section-title" style="margin-bottom: 15px;">روايات مشابهة</h2>
            <div class="related-sidebar">
              ${this.renderRelatedNovels()}
            </div>
          </section>
        </div>

      </div>
    `;
  },

  renderRelatedNovels() {
    // Pick 3 random novels from store (excluding current)
    const related = Store.state.novels
      .filter((_, i) => i !== this.novelIdx)
      .slice(0, 3);

    return related.map(n => `
      <div class="related-card" onclick="window.location.href='novel.html?id=${Store.state.novels.indexOf(n)}'">
        <img src="${n.cover || 'public/default_cover.png'}" class="related-cover">
        <div class="related-info">
          <div class="related-title">${n.title}</div>
          <div class="related-meta">${(n.genres || ['عام'])[0]} • ${n.status || 'مستمرة'}</div>
        </div>
      </div>
    `).join('');
  },

  startReading() {
    Store.switchNovel(this.novelIdx);
    window.location.href = 'editor.html';
  },

  readChapter(chIdx) {
    Store.switchNovel(this.novelIdx);
    Store.setChapter(chIdx);
    window.location.href = 'editor.html';
  },

  addToLibrary() {
    alert('تمت الإضافة للمكتبة!');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => NovelPage.init(), 50);
});
