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
        <h2 class="section-title">${data.title}</h2>
      </div>
      <div class="top5-container">
        <!-- Rank 1: Full Luxury (Hero) -->
        <div class="rank-tier-1">
          <div class="rank-badge">1</div>
          <div class="rank-badge-huge">1</div>
          <img src="${hero.cover}" class="novel-cover">
          <div class="rank-tier-1-info" style="flex: 1;">
            <div style="font-size: 12px; opacity: 0.6; text-transform: uppercase; letter-spacing: 2px;">رواية الشهر الأولى</div>
            <h3>${hero.title}</h3>
            <p style="font-size: 14px; opacity: 0.8; line-height: 1.6; max-width: 500px;">${hero.desc}</p>
            <div class="flex-row" style="margin-top: 20px;">
              <a href="reader.html" class="btn-flat active" style="text-decoration: none; padding: 0 25px;" onclick="Store.switchNovel(${this.getNovelId(hero.title)})">ابدأ القراءة الآن</a>
              <button class="btn-flat" onclick="window.location.href='novel.html?id=${this.getNovelId(hero.title)}'">تفاصيل العمل</button>
            </div>
          </div>
        </div>

        <!-- Rank 2 & 3: Medium Luxury -->
        <div class="rank-tier-2">
          ${featured.map((item, i) => `
            <div class="rank-item-m" style="position: relative; cursor: pointer;" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
              <div class="rank-badge">${i + 2}</div>
              <img src="${item.cover}" style="width: 80px; height: 120px; object-fit: cover; border: 1px solid var(--ui-border);">
              <div class="trending-info">
                <div class="trending-title" style="font-size: 16px; font-weight: bold;">${item.title}</div>
                <div class="trending-meta" style="font-size: 12px; opacity: 0.6;">${item.meta || ''}</div>
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
        <h2 class="section-title">${data.title}</h2>
      </div>
      <div class="trending-grid">
        ${data.items.map(item => `
          <div class="trending-card">
            <div class="rank-badge">${item.rank}</div>
            <img src="${item.cover}" class="trending-cover">
            <div class="trending-info">
              <div class="trending-title">${item.title}</div>
              <div class="trending-meta" style="font-size: 12px; opacity: 0.6;">${item.meta || ''}</div>
              <div class="trending-desc" style="font-size: 12px; opacity: 0.7; margin-top: 5px; line-height: 1.4;">${item.desc || ''}</div>
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
        <h2 class="section-title">${data.title}</h2>
        <div class="flex-row"><button class="btn-flat" style="font-size: 11px;">تصفية <i class="ti ti-filter"></i></button></div>
      </div>
      <div class="novel-grid">
        ${data.items.map(item => `
          <div class="novel-card" onclick="window.location.href='novel.html?id=${this.getNovelId(item.title)}'">
            <img src="${item.cover}" class="novel-card-poster">
            <div class="novel-card-info">
              <div class="novel-card-title" style="font-size: 14px; font-weight: bold;">${item.title}</div>
              <div class="novel-card-author" style="font-size: 11px; opacity: 0.6;">${item.author || ''}</div>
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
