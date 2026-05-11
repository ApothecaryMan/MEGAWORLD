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
      case 'profile-identity': return this.makeProfileIdentity(section);
      case 'footer': return this.makeFooter(section);
      default: return null;
    }
  },

  profileEditMode: false,
  toggleProfileEdit() {
    this.profileEditMode = !this.profileEditMode;
    if (this.container && this.schema && this.schema.length > 0) {
      this.render(this.schema);
    } else {
      const playground = document.getElementById('profile-identity-playground');
      if (playground) {
        const temp = this.makeProfileIdentity();
        playground.innerHTML = temp.innerHTML;
        playground.className = temp.className;
      }
    }
  },
  saveProfile() {
    if (!Store.state.user) Store.state.user = {};
    const u = Store.state.user;
    
    // الحصول على القيم الجديدة
    const newName = document.getElementById('editDisplayName').value;
    const newUser = document.getElementById('editUsername').value.replace('@', '');
    const newBio = document.getElementById('editBio').value;

    // حفظ في الـ Store
    u.displayName = newName;
    u.username = newUser;
    u.bio = newBio;
    Store.save();

    this.profileEditMode = false;

    // إذا كنا في صفحة مدارة بواسطة المحرك، نعيد الرندر
    if (this.container && this.schema && this.schema.length > 0) {
      this.render(this.schema);
    } else {
      // إذا كنا في صفحة التيست، نحدث النص فقط ونغلق وضع التعديل يدوياً أو نعيد الرندر للحاوية المحلية
      const playground = document.getElementById('profile-identity-playground');
      if (playground) {
        // حيلة بسيطة: محاكاة رندر للحاوية فقط
        const temp = this.makeProfileIdentity();
        playground.innerHTML = temp.innerHTML;
        playground.className = temp.className;
      }
    }
    
    // تحديث التولبار وكل المكونات العالمية
    if (typeof applyGlobalUI === 'function') applyGlobalUI();
  },

  makeProfileIdentity(data) {
    const user = Store.state.user || {};
    const stats = user.stats || {};
    const libraryCount = (Store.state.novels || []).length;
    
    const section = document.createElement('div');
    section.className = 'profile-full-container';
    section.innerHTML = `
        <!-- 1. Header: Avatar & Basic Info -->
        <div class="profile-identity-header">
          <div class="profile-avatar-editable">
            ${user.avatar ? `<img id="profileAvatarImg" src="${user.avatar}" style="width:100%; height:100%; object-fit:cover;">` : `<span class="avatar-fallback">${(user.displayName || 'م')[0]}</span>`}
            ${this.profileEditMode ? `<button class="avatar-edit-hint" onclick="HomeEngine.triggerAvatarFile()"><i class="ti ti-camera"></i></button>` : ''}
            <input type="file" id="avatarFileInput" style="display:none" accept="image/*" onchange="HomeEngine.handleAvatarFile(this)">
          </div>
          
          <div class="profile-main-meta">
            <div class="profile-name-group" style="display: flex; gap: 10px; align-items: center;">
              ${this.profileEditMode ? `
                <input type="text" id="editDisplayName" class="input-flat" style="font-size: 20px; font-weight: 800; width: 200px;" value="${user.displayName || ''}" placeholder="الاسم المعروض">
                <input type="text" id="editUsername" class="input-flat" style="font-size: 14px; width: 150px; opacity: 0.8;" value="@${user.username || ''}" placeholder="اسم المستخدم">
              ` : `
                <h1 class="profile-display-name">${user.displayName || '---'}</h1>
                <span class="profile-username">@${user.username || '---'}</span>
              `}
            </div>
            
            <div class="profile-badges-row">
              <span class="badge-flat gold"><i class="ti ti-award"></i> ${user.membership || 'عضو عادي'}</span>
              <span class="badge-flat silver">ليفل ${user.level || '0'}</span>
              <span class="profile-join-date">انضم في: ${user.joinDate || '---'}</span>
            </div>
          </div>

          <div class="profile-actions-top">
            ${this.profileEditMode ? `
              <button class="btn-flat active" onclick="HomeEngine.saveProfile()"><i class="ti ti-check"></i> حفظ التغييرات</button>
              <button class="btn-flat" onclick="HomeEngine.toggleProfileEdit()"><i class="ti ti-x"></i> إلغاء</button>
            ` : `
              <button class="btn-flat active" onclick="HomeEngine.toggleProfileEdit()"><i class="ti ti-edit"></i> تعديل الملف الشخصي</button>
              <a href="#" class="btn-flat" style="text-decoration: none;"><i class="ti ti-external-link"></i> عرض للعامة</a>
            `}
          </div>
        </div>

        <!-- 2. Bio Section -->
        <div class="profile-section-block">
          <div class="section-label">النبذة الشخصية (Bio)</div>
          <div class="bio-textarea-wrap">
            <textarea id="editBio" class="input-flat bio-textarea" ${this.profileEditMode ? '' : 'readonly'} placeholder="اكتب شيئاً عن نفسك...">${user.bio || ''}</textarea>
            <div class="char-counter">${(user.bio || '').length} / 200</div>
          </div>
        </div>

        <!-- 3. Personal Statistics Grid -->
        <div class="profile-section-block">
          <div class="section-label">الإحصائيات الشخصية</div>
          <div class="profile-stats-grid">
            <div class="stat-card">
              <span class="stat-num">${stats.completedNovels || '0'}</span>
              <span class="stat-desc">رواية مكتملة</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">${StatsEngine.formatNum(stats.totalChaptersRead || 0)}</span>
              <span class="stat-desc">فصل مقروء</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">${stats.readingHours || '0'}</span>
              <span class="stat-desc">ساعة قراءة</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">${stats.commentsCount || '0'}</span>
              <span class="stat-desc">تعليق منشور</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">${libraryCount}</span>
              <span class="stat-desc">رواية في المكتبة</span>
            </div>
            <div class="stat-card">
              <span class="stat-num">${stats.followingCount || '0'}</span>
              <span class="stat-desc">كتّاب متابَعون</span>
            </div>
          </div>
        </div>

        <!-- 4. Favorite Genres -->
        <div class="profile-section-block">
          <div class="section-label">التصنيفات المفضلة</div>
          <div class="genres-list">
            ${(user.favoriteGenres || []).map((g, i) => `
              <span class="genre-tag">
                ${g} 
                ${this.profileEditMode ? `<i class="ti ti-x" onclick="HomeEngine.removeGenre(${i})"></i>` : ''}
              </span>
            `).join('')}
            ${this.profileEditMode ? `<button class="genre-tag add-btn" onclick="HomeEngine.addGenre(event)"><i class="ti ti-plus"></i> أضف</button>` : ''}
          </div>
        </div>

        <!-- 5. Achievements -->
        <div class="profile-section-block">
          <div class="section-label">الإنجازات (Achievements)</div>
          <div class="achievements-container">
            <div class="achievements-list">
              ${(user.achievements || []).map(a => `
                <div class="achievement-icon ${a.unlocked ? '' : 'locked'}" title="${a.label} ${a.unlocked ? '' : '(مغلق)'}">
                  <i class="ti ${a.icon}"></i>
                </div>
              `).join('')}
            </div>
            <div class="next-achievement-progress">
              <div class="progress-info">
                <span>التقدم نحو الإنجاز القادم</span>
                <span>80%</span>
              </div>
              <div class="progress-flat-container">
                <div class="progress-flat-fill" style="width: 80%;"></div>
              </div>
            </div>
          </div>
        </div>
    `;
    return section;
  },

  addGenre(e) {
    const allGenres = Store.getAllGenres();
    const myGenres = Store.state.user.favoriteGenres || [];
    const available = allGenres.filter(g => !myGenres.includes(g));

    if (available.length === 0) return;

    // تحويل التصنيفات إلى عناصر قائمة منسدلة
    const menuItems = available.map(g => ({
      label: g,
      icon: 'ti-hash',
      action: () => this.confirmAddGenre(g)
    }));

    // إظهار المنيو تحت الزر
    if (typeof ContextMenu !== 'undefined') {
      ContextMenu.show(e, menuItems);
    }
  },

  confirmAddGenre(name) {
    if (!Store.state.user.favoriteGenres) Store.state.user.favoriteGenres = [];
    Store.state.user.favoriteGenres.push(name);
    Store.save();
    
    if (typeof closeModal === 'function') closeModal();
    
    // إعادة الرندر حسب المكان
    if (this.container && this.schema && this.schema.length > 0) {
      this.render(this.schema);
    } else {
      const playground = document.getElementById('profile-identity-playground');
      if (playground) {
        playground.innerHTML = this.makeProfileIdentity().innerHTML;
      }
    }
  },

  removeGenre(idx) {
    if (Store.state.user.favoriteGenres) {
      Store.state.user.favoriteGenres.splice(idx, 1);
      if (this.container && this.schema && this.schema.length > 0) {
        this.render(this.schema);
      } else {
        const playground = document.getElementById('profile-identity-playground');
        if (playground) {
          const temp = this.makeProfileIdentity();
          playground.innerHTML = temp.innerHTML;
        }
      }
    }
  },

  triggerAvatarFile() {
    document.getElementById('avatarFileInput').click();
  },

  handleAvatarFile(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // تصغير الصورة لتقليل حجمها في الـ LocalStorage
          const canvas = document.createElement('canvas');
          const size = 200; // حجم مناسب جداً للبروفايل
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          // قص وتوسيط الصورة
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          if (!Store.state.user) Store.state.user = {};
          Store.state.user.avatar = compressedUrl;

          // تحديث المعاينة فوراً
          const previewImg = document.getElementById('profileAvatarImg');
          if (previewImg) previewImg.src = compressedUrl;
          else {
             // لو كنا في وضع الفالباك (حرف) نحتاج رندر لإظهار الصورة
             if (this.container && this.schema && this.schema.length > 0) this.render(this.schema);
             else {
               const playground = document.getElementById('profile-identity-playground');
               if (playground) { playground.innerHTML = this.makeProfileIdentity().innerHTML; }
             }
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
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
