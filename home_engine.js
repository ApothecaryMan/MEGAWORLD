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
    this.render(config);
  },

  render(config) {
    this.container.innerHTML = '';
    const allRealNovels = Store.state.novels || [];
    
    // ترتيب الروايات حسب المشاهدات (ترتيب منفصل للرائج)
    const sortedByViews = [...allRealNovels].sort((a, b) => this.getViews(b) - this.getViews(a));

    config.forEach(section => {
      let node;
      if (['top5', 'trending', 'grid'].includes(section.type)) {
        if (section.type === 'top5') {
          const top3 = sortedByViews.slice(0, 3);
          if (top3.length > 0) {
            node = this.makeTop5({ title: section.title, items: top3 });
          }
        } else if (section.type === 'trending') {
          // الروايات التي تلي المراكز الثلاثة الأولى في ترتيب المشاهدات
          const trending = sortedByViews.slice(0, 10);
          if (trending.length > 0) {
            node = this.makeTrending({ title: section.title, items: trending.map((n, i) => ({ ...n, rank: i + 1 })) });
          }
        } else if (section.type === 'grid') {
          if (allRealNovels.length > 0) {
            node = this.makeGrid({ title: section.title, items: allRealNovels });
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
        <div class="rank-tier-1">
          <div class="rank-badge">1</div>
          <img src="${hero.cover || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png'}" class="novel-cover">
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
                <span>${this.formatNum(this.getViews(hero))} مشاهدة</span>
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
              <img src="${item.cover || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png'}" class="rank-item-m-cover">
              <div class="rank-item-m-info">
                <div>
                  <div class="rank-item-m-title">${item.title || '---'}</div>
                  <div class="rank-item-m-author">بواسطة: ${item.author || '---'}</div>
                </div>
                
                <div class="rank-item-m-stats">
                  <span><i class="ti ti-eye"></i> ${this.formatNum(this.getViews(item))}</span>
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
          <span class="section-subtitle">الأكثر قراءة الآن</span>
          <h2 class="section-title">${data.title}</h2>
        </div>
      </div>
      <div class="novel-grid">
        ${data.items.map(item => `
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
            <div class="rank-badge" style="top: 8px; right: 8px; width: 30px; height: 30px; font-size: 14px;">${item.rank}</div>
            <img src="${item.cover || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png'}" class="novel-card-poster">
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title || '---'}</div>
              <div class="novel-card-author">${item.author || '---'}</div>
              <div class="novel-card-stats">
                <span>${this.formatNum(this.getViews(item))} <i class="ti ti-eye"></i></span>
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
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
            <img src="${item.cover || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png'}" class="novel-card-poster">
            <div class="novel-card-info">
              <div class="novel-card-title">${item.title || '---'}</div>
              <div class="novel-card-author">${item.author || '---'}</div>
              <div class="novel-card-stats">
                <span>${this.formatNum(this.getViews(item))} <i class="ti ti-eye"></i></span>
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

  getNovelId(title) {
    if (!Store || !Store.state || !Store.state.novels) return 0;
    const idx = Store.state.novels.findIndex(n => n.title === title);
    return idx !== -1 ? idx : 0;
  },

  getViews(item) {
    if (!item.chapters || item.chapters.length === 0) return 0;
    const views = item.chapters.map(ch => ch.views || 0);
    return Math.max(...views);
  },

  formatNum(num) {
    if (!num || isNaN(num)) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  }
};
