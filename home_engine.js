/**
 * MEGAWORLD Home & Admin Engine
 * Generates dynamic page sections based on a provided schema.
 */
const HomeEngine = {
  containerId: null,
  schema: [],

  init(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;
    this.container = container;
    this.schema = config;
    this.render(config);
  },

  trendingDays: 7, // الافتراضي أسبوع
  currentFilter: null,

  filterByGenre(genre) {
    this.currentFilter = genre;
    this.render(this.schema);
  },

  renderPoster(cover, className = 'novel-card-poster') {
    if (cover) {
      return `<img src="${cover}" class="${className}">`;
    }
    return `
      <div class="${className} novel-poster-placeholder placeholder-flat">
        <i class="ti ti-camera"></i>
        <span>بدون غلاف</span>
      </div>
    `;
  },

  render(config) {
    this.container.innerHTML = '';
    let allRealNovels = Store.state.novels || [];
    
    // تطبيق الفلتر إذا وجد
    if (this.currentFilter) {
      allRealNovels = allRealNovels.filter(n => n.genres && n.genres.includes(this.currentFilter));
    }

    // الترتيب حسب إجمالي المشاهدات (للتوب 3)
    let sortedByTotal = StatsEngine.getSortedByTotal().filter(n => allRealNovels.includes(n));
    
    // الترتيب حسب الفترة الزمنية (للرائج)
    let sortedByTrending = StatsEngine.getSortedByPeriod(this.trendingDays).filter(n => allRealNovels.includes(n));

    config.forEach(section => {
      let node;
      const sectionTitle = this.currentFilter ? `${section.title} - ${this.currentFilter}` : section.title;

      if (['top5', 'trending', 'grid'].includes(section.type)) {
        if (section.type === 'top5') {
          const top3 = sortedByTotal.slice(0, 3);
          if (top3.length > 0) {
            node = this.makeTop5({ title: sectionTitle, items: top3 });
          }
        } else if (section.type === 'trending') {
          const trending = sortedByTrending.slice(0, 10);
          if (trending.length > 0) {
            node = this.makeTrending({ title: sectionTitle, items: trending.map((n, i) => ({ ...n, rank: i + 1 })) });
            node.id = 'trendingSection'; // معرف خاص للتحديث المستقل
            this.trendingData = { title: section.title }; // حفظ العنوان الأصلي للتحديث
          }
        } else if (section.type === 'grid') {
          if (allRealNovels.length > 0) {
            node = this.makeGrid({ title: sectionTitle, items: allRealNovels });
          }
        }
      } else {
        node = this.renderSection(section);
      }

      if (node) this.container.appendChild(node);
    });

    if (allRealNovels.length === 0) {
      this.container.innerHTML = `<div style="text-align:center; padding:100px; opacity:0.5;">
        <i class="ti ti-book-off" style="font-size:48px;"></i>
        <h2 style="margin-top:20px;">مكتبتك فارغة حالياً</h2>
        <p>ابدأ بإضافة رواياتك المفضلة من صفحة القارئ لتظهر هنا.</p>
      </div>`;
    }
  },

  renderSection(section) {
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
        <div class="rank-tier-1" oncontextmenu="HomeEngine.showNovelMenu(event, ${this.getNovelId(hero.title)})">
          <div class="rank-badge">1</div>
          ${this.renderPoster(hero.cover, 'novel-cover')}
          <div class="rank-tier-1-info" style="flex: 1;">
            <div style="font-size: 11px; opacity: 0.5; text-transform: uppercase; letter-spacing: 3px; font-weight: 800; margin-bottom: 5px;">رواية الشهر الأولى</div>
            <h3>${hero.title || '---'}</h3>
            
            <div class="rank-meta-row">
              <span class="rank-author">بواسطة: ${hero.author || '---'}</span>
              <span class="rank-sep">•</span>
              <span class="rank-status">${hero.status || '---'}</span>
            </div>

            <div class="rank-meta-tags">
              ${(hero.genres || ['---']).map(tag => `<span class="rank-tag">${tag}</span>`).join('')}
            </div>

            <p class="rank-desc">${hero.description || 'لا يوجد وصف متاح حالياً.'}</p>
            
            <div class="rank-stats-row">
              <div class="rank-stat">
                <i class="ti ti-eye"></i>
                <span>${StatsEngine.formatNum(StatsEngine.getTotalViews(hero))} مشاهدة</span>
              </div>
              <div class="rank-stat">
                <i class="ti ti-list"></i>
                <span>${hero.chapters ? hero.chapters.length : '---'} فصل</span>
              </div>
              <div class="rank-stat">
                <i class="ti ti-star"></i>
                <span>${hero.rating || '---'} التقييم</span>
              </div>
            </div>

            <div class="flex-row" style="margin-top: 25px; gap: 12px;">
              <a href="editor.html" class="btn-flat active" style="text-decoration: none; padding: 0 25px; height: 38px; display: flex; align-items: center;" onclick="Store.switchNovel(${this.getNovelId(hero.title)})">ابدأ القراءة الآن</a>
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
            <div class="rank-item-m" style="position: relative; cursor: pointer;" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'" oncontextmenu="HomeEngine.showNovelMenu(event, ${this.getNovelId(item.title)})">
              <div class="rank-badge">${i + 2}</div>
              ${this.renderPoster(item.cover, 'rank-item-m-cover')}
              <div class="rank-item-m-info">
                <div>
                  <div class="rank-item-m-title">${item.title || '---'}</div>
                  <div class="rank-item-m-author">بواسطة: ${item.author || '---'}</div>
                </div>
                
                <div class="rank-item-m-stats">
                  <span><i class="ti ti-eye"></i> ${StatsEngine.formatNum(StatsEngine.getTotalViews(item))}</span>
                  <span><i class="ti ti-list"></i> ${item.chapters ? item.chapters.length : '---'} فصل</span>
                  <span><i class="ti ti-star"></i> ${item.rating || '---'}</span>
                </div>

                <div class="rank-item-m-tags">
                  ${(item.genres || ['---']).slice(0, 2).map(tag => `<span class="rank-tag-mini">${tag}</span>`).join('')}
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
          <span class="section-subtitle">${this.trendingDays === 1 ? 'الأكثر قراءة اليوم' : (this.trendingDays === 7 ? 'الأكثر قراءة هذا الأسبوع' : 'الأكثر قراءة هذا الشهر')}</span>
          <h2 class="section-title">${data.title}</h2>
        </div>
        <div class="filter-group" style="display: flex; gap: 8px;">
          <button class="btn-flat mini ${this.trendingDays === 1 ? 'active' : ''}" onclick="HomeEngine.setTrendingPeriod(1)">اليوم</button>
          <button class="btn-flat mini ${this.trendingDays === 7 ? 'active' : ''}" onclick="HomeEngine.setTrendingPeriod(7)">أسبوع</button>
          <button class="btn-flat mini ${this.trendingDays === 30 ? 'active' : ''}" onclick="HomeEngine.setTrendingPeriod(30)">شهر</button>
        </div>
      </div>
      <div class="novel-grid">
        ${data.items.map(item => `
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'" oncontextmenu="HomeEngine.showNovelMenu(event, ${this.getNovelId(item.title)})">
            <div class="rank-badge" style="top: 8px; right: 8px; width: 30px; height: 30px; font-size: 14px; border-radius: 0;">${item.rank}</div>
            ${this.renderPoster(item.cover, 'novel-card-poster')}
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title || '---'}</div>
              <div class="novel-card-author">${item.author || '---'}</div>
              <div class="novel-card-stats">
                <span>${StatsEngine.formatNum(StatsEngine.getViewsForPeriod(item, this.trendingDays))} <i class="ti ti-eye"></i></span>
                <span>${item.chapters ? item.chapters.length : '---'} فصل <i class="ti ti-list"></i></span>
                <span>${item.rating || '---'} <i class="ti ti-star"></i></span>
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
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'" oncontextmenu="HomeEngine.showNovelMenu(event, ${this.getNovelId(item.title)})">
            ${this.renderPoster(item.cover, 'novel-card-poster')}
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title || '---'}</div>
              <div class="novel-card-author">${item.author || '---'}</div>
              <div class="novel-card-stats">
                <span>${StatsEngine.formatNum(StatsEngine.getTotalViews(item))} <i class="ti ti-eye"></i></span>
                <span>${item.chapters ? item.chapters.length : '---'} فصل <i class="ti ti-list"></i></span>
                <span>${item.rating || '---'} <i class="ti ti-star"></i></span>
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

  showSearchResults(query) {
    if (!query.trim()) {
      if (typeof ContextMenu !== 'undefined') ContextMenu.hide();
      return;
    }
    
    const allNovels = Store.state.novels || [];
    const q = query.toLowerCase();
    
    const results = allNovels.filter(n => {
      const titleWords = (n.title || '').toLowerCase().split(/\s+/);
      const authorWords = (n.author || '').toLowerCase().split(/\s+/);
      
      const matchTitle = titleWords.some(w => w.startsWith(q));
      const matchAuthor = authorWords.some(w => w.startsWith(q));
      
      return matchTitle || matchAuthor;
    }).slice(0, 5);
    
    if (results.length === 0) {
      if (typeof ContextMenu !== 'undefined') ContextMenu.hide();
      return;
    }
    
    const searchInput = document.getElementById('sq');
    if (!searchInput) return;
    
    const rect = searchInput.getBoundingClientRect();
    const menuItems = results.map(n => ({
      label: `
        <div style="display:flex; align-items:center; gap:12px; padding: 4px 0; text-align: right;">
          <div style="width:32px; height:48px; flex-shrink:0; border:1px solid var(--ui-border-light); background:var(--ui-input-bg);">
            ${n.cover ? `<img src="${n.cover}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="ti ti-camera" style="font-size:12px;"></i></div>`}
          </div>
          <div style="overflow:hidden;">
            <div style="font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.title}</div>
            <div style="font-size:11px; opacity:0.5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.author}</div>
          </div>
        </div>
      `,
      action: () => window.location.href = `novel.html?id=${this.getNovelId(n.title)}`
    }));
    
    if (typeof ContextMenu !== 'undefined') {
      ContextMenu.showAt(rect.left, rect.bottom + 10, menuItems, rect.width);
    }
  },

  showNovelMenu(e, id) {
    e.preventDefault();
    e.stopPropagation();
    const n = Store.state.novels[id];
    if (!n) return;
    
    ContextMenu.show(e, [
      { label: 'ابدأ القراءة', icon: 'ti-book', action: () => { Store.switchNovel(id); window.location.href = 'editor.html'; } },
      { label: 'عرض صفحة الرواية', icon: 'ti-external-link', action: () => window.location.href = `novel.html?id=${id}` },
      { sep: true },
      { label: 'نسخ اسم الرواية', icon: 'ti-copy', action: () => navigator.clipboard.writeText(n.title) },
      { label: 'نسخ اسم المؤلف', icon: 'ti-user', action: () => navigator.clipboard.writeText(n.author) },
      { sep: true },
      { label: 'تعديل في لوحة الإدارة', icon: 'ti-settings', action: () => window.location.href = 'admin.html' }
    ]);
  },

  setTrendingPeriod(days) {
    this.trendingDays = days;
    const section = document.getElementById('trendingSection');
    if (section && this.trendingData) {
      // تحديث الروايات المرتبة حسب الفترة الجديدة
      const sortedByTrending = StatsEngine.getSortedByPeriod(this.trendingDays);
      const trendingItems = sortedByTrending.slice(0, 10).map((n, i) => ({ ...n, rank: i + 1 }));
      
      // إعادة بناء محتوى القسم فقط
      const newData = { title: this.trendingData.title, items: trendingItems };
      const tempDiv = this.makeTrending(newData);
      section.innerHTML = tempDiv.innerHTML;
    }
  },

  getNovelId(title) {
    if (!Store || !Store.state || !Store.state.novels) return 0;
    const idx = Store.state.novels.findIndex(n => n.title === title);
    return idx !== -1 ? idx : 0;
  }
};
