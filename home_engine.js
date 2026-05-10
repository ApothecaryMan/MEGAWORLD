/**
 * MEGAWORLD Home & Admin Engine
 * Generates dynamic page sections based on a provided schema.
 */
const HomeEngine = {
  containerId: null,
  schema: [],

  init(containerId, schema) {
    this.containerId = containerId;
    this.schema = schema;
    this.render();
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.innerHTML = '';

    this.schema.forEach(section => {
      const el = this.createSection(section);
      if (el) container.appendChild(el);
    });
  },

  createSection(section) {
    switch (section.type) {
      case 'top5': return this.makeTop5(section);
      case 'trending': return this.makeTrending(section);
      case 'grid': return this.makeGrid(section);
      case 'footer': return this.makeFooter(section);
      default: return null;
    }
  },

  makeTop5(data) {
    const section = this.makeWrapper();
    const hero = data.items[0];
    const featured = data.items.slice(1, 3);

    section.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-subtitle">ترشيحاتنا المختارة</span>
          <h2 class="section-title">${data.title}</h2>
        </div>
      </div>
      <div class="top5-container">
        <!-- Rank 1: Full Luxury (Hero) -->
        <div class="rank-tier-1">
          <div class="rank-badge">1</div>
          <img src="${hero.cover}" class="novel-cover">
          <div class="rank-tier-1-info" style="flex: 1;">
            <div style="font-size: 11px; opacity: 0.5; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; margin-bottom: 5px;">رواية الشهر الأولى</div>
            <h3>${hero.title}</h3>
            
            <div class="rank-meta-row">
              <span class="rank-author">بواسطة: ${hero.author || 'كاتب مجهول'}</span>
              <span class="rank-sep">•</span>
              <span class="rank-status">مكتملة</span>
            </div>

            <div class="rank-meta-tags">
              ${(hero.tags || ['خيال', 'سحر', 'أكشن']).map(tag => `<span class="rank-tag">${tag}</span>`).join('')}
            </div>

            <p class="rank-desc">${hero.desc}</p>
            
            <div class="rank-stats-row">
              <div class="rank-stat">
                <i class="ti ti-eye"></i>
                <span>1.2M مشاهدة</span>
              </div>
              <div class="rank-stat">
                <i class="ti ti-list"></i>
                <span>850 فصل</span>
              </div>
              <div class="rank-stat">
                <i class="ti ti-star"></i>
                <span>4.8 التقييم</span>
              </div>
            </div>

            <div class="flex-row" style="margin-top: 25px; gap: 12px;">
              <a href="reader.html" class="btn-flat active" style="text-decoration: none; padding: 0 25px; height: 38px; display: flex; align-items: center;" onclick="Store.switchNovel(${this.getNovelId(hero.title)})">ابدأ القراءة الآن</a>
              <button class="btn-flat" style="height: 38px; padding: 0 20px;" onclick="window.location.href='novel.html?id=${this.getNovelId(hero.title)}'">تفاصيل العمل</button>
              <button class="btn-flat" style="height: 38px; width: 38px; padding: 0; justify-content: center;" title="حفظ في المكتبة">
                <i class="ti ti-bookmark" style="font-size: 18px;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Rank 2 & 3: Medium Luxury -->
        <div class="rank-tier-2">
          ${featured.map((item, i) => `
            <div class="rank-item-m" style="position: relative; cursor: pointer;" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
              <div class="rank-badge">${i + 2}</div>
              <img src="${item.cover}" class="rank-item-m-cover">
              <div class="rank-item-m-info">
                <div>
                  <div class="rank-item-m-title">${item.title}</div>
                  <div class="rank-item-m-author">بواسطة: ${item.author || 'كاتب مجهول'}</div>
                </div>
                
                <div class="rank-item-m-stats">
                  <span><i class="ti ti-eye"></i> 1.8M</span>
                  <span><i class="ti ti-list"></i> 450 فصل</span>
                  <span><i class="ti ti-star"></i> 4.7</span>
                </div>

                <div class="rank-item-m-tags">
                  <span class="rank-tag-mini">أكشن</span>
                  <span class="rank-tag-mini">دراما</span>
                </div>

                <div class="rank-item-m-actions">
                  <button class="btn-flat active mini" onclick="event.stopPropagation(); Store.switchNovel(${this.getNovelId(item.title)}); window.location.href='reader.html'">إقرأ</button>
                  <button class="btn-flat mini" onclick="event.stopPropagation(); window.location.href='novel.html?id=${this.getNovelId(item.title)}'">تفاصيل</button>
                  <button class="btn-flat mini-icon" title="حفظ"><i class="ti ti-bookmark"></i></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return section;
  },

  makeTrending(data) {
    const section = this.makeWrapper();
    section.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-subtitle">الأكثر قراءة الآن</span>
          <h2 class="section-title">${data.title}</h2>
        </div>
      </div>
      <div class="novel-grid">
        ${data.items.map(item => `
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
            <div class="rank-badge" style="top: 8px; right: 8px; width: 30px; height: 30px; font-size: 14px;">${item.rank}</div>
            <img src="${item.cover}" class="novel-card-poster">
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title}</div>
              <div class="novel-card-author">${item.author || ''}</div>
              <div class="novel-card-stats">
                <span>1.8M <i class="ti ti-eye"></i></span>
                <span>450 فصل <i class="ti ti-list"></i></span>
                <span>4.7 <i class="ti ti-star"></i></span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return section;
  },

  makeGrid(data) {
    const section = this.makeWrapper();
    section.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-subtitle">تصفح المكتبة</span>
          <h2 class="section-title">${data.title}</h2>
        </div>
        <div class="flex-row"><button class="btn-flat" style="font-size: 11px;">تصفية <i class="ti ti-filter"></i></button></div>
      </div>
      <div class="novel-grid">
        ${data.items.map(item => `
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
            <img src="${item.cover}" class="novel-card-poster">
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title}</div>
              <div class="novel-card-author">${item.author || ''}</div>
              <div class="novel-card-stats">
                <span>1.2M <i class="ti ti-eye"></i></span>
                <span>380 فصل <i class="ti ti-list"></i></span>
                <span>4.5 <i class="ti ti-star"></i></span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return section;
  },

  makeFooter(data) {
    const footer = document.createElement('footer');
    footer.style.cssText = `margin-top: 60px; padding: 40px; border-top: 1px solid var(--ui-border-light); text-align: center; opacity: 0.6; font-size: 12px;`;
    footer.innerHTML = data.text;
    return footer;
  },

  makeWrapper() {
    const div = document.createElement('section');
    div.className = 'home-container';
    return div;
  },

  getNovelId(title) {
    if (!Store || !Store.state || !Store.state.novels) return 0;
    const idx = Store.state.novels.findIndex(n => n.title === title);
    return idx !== -1 ? idx : 0;
  }
};
