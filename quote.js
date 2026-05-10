/**
 * محرك الاقتباسات المنظم (Refactored Quote System)
 */

// 1. مساعد بناء الواجهة (UI Helper) لضمان تطابق التصميم في كل مكان
const QuoteUI = {
  getPalette(id) {
    return Store.palettes.find(p => p.id === id) || Store.palettes[0];
  },

  buildCard(container, text, settings) {
    const novelTitle = (Store.activeNovel && Store.activeNovel.title) || 'رواية بدون عنوان';
    const activeChapter = Store.chapters[Store.activeChapterIdx];
    const chapterTitle = activeChapter ? activeChapter.title : '';
    const colors = this.getPalette(settings.theme);

    container.style.cssText = `
      width: 500px; padding: 60px 45px;
      background: ${colors.bg};
      color: ${colors.text};
      text-align: center;
      border: 1px solid rgba(128,128,128,0.15);
      direction: rtl;
      font-family: ${settings.font === 'fn' ? 'var(--ui-font-serif)' : 'var(--ui-font-sans)'};
      box-shadow: 0 15px 45px rgba(0,0,0,0.15);
      position: relative;
    `;

    container.innerHTML = `
      <div style="line-height: 1.8; position: relative;">
        <span style="font-size: 45px; opacity: 0.25; font-family: serif; margin-left: 8px; vertical-align: sub; line-height: 0;">«</span>
        <span style="font-size: ${settings.fontSize}px;">${text}</span>
        <span style="font-size: 45px; opacity: 0.25; font-family: serif; margin-right: 8px; vertical-align: sub; line-height: 0;">»</span>
      </div>
      <div style="margin-top: 55px; padding-top: 22px; border-top: 1px solid rgba(128,128,128,0.15); font-family: var(--ui-font-sans); font-size: 14px; opacity: 0.8;">
        ${settings.showNovel ? `<span>رواية: ${novelTitle}</span>` : ''}
        ${settings.showChapter && chapterTitle ? `<span style="opacity: 0.2; margin: 0 12px;">|</span> <span>${chapterTitle}</span>` : ''}
      </div>
    `;
  }
};

// 3. محرر الاقتباسات التفاعلي
const QuoteEditor = {
  text: '',
  settings: { fontSize: 26, theme: 'bg-def', font: 'fn', showNovel: true, showChapter: true },

  open(text) {
    this.text = text;
    this.settings.theme = Store.state.settings.theme;
    this.settings.font = Store.state.settings.font;
    this.renderModal();
  },

  renderModal() {
    let modal = document.getElementById('quoteModal') || this.createModal();
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content quote-editor-modal" style="width: 900px; max-width: 95vw; display: flex; height: 600px; padding: 0; overflow: hidden;">
        <div class="quote-preview-area" style="flex: 1; background: #222; display: flex; align-items: center; justify-content: center; padding: 30px; overflow: auto;">
          <div id="quotePreviewCard"></div>
        </div>
        <div class="quote-tools-area" style="width: 320px; background: var(--ui-toolbar-bg); border-right: 1px solid var(--ui-border); padding: 30px; display: flex; flex-direction: column; gap: 24px;">
          <h3 style="margin:0; font-size:18px; border-bottom: 2px solid var(--ui-border-light); padding-bottom: 10px;">تخصيص الاقتباس</h3>
          
          <div class="tool-group">
            <label>حجم الخط (${this.settings.fontSize}px)</label>
            <input type="range" min="16" max="60" value="${this.settings.fontSize}" oninput="QuoteEditor.update('fontSize', this.value)">
          </div>

          <div class="tool-group">
            <label>نوع الخط</label>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px;">
              <button class="btn-flat ${this.settings.font==='fn'?'active':''}" onclick="QuoteEditor.update('font', 'fn')">أميري</button>
              <button class="btn-flat ${this.settings.font==='fn2'?'active':''}" onclick="QuoteEditor.update('font', 'fn2')">نسخ</button>
              <button class="btn-flat ${this.settings.font==='fn3'?'active':''}" onclick="QuoteEditor.update('font', 'fn3')">نظام</button>
            </div>
          </div>

          <div class="tool-group">
            <label>الثيم اللوني</label>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
              ${Store.palettes.map(p => `
                <button class="swatch ${p.id === this.settings.theme ? 'on' : ''}" 
                        style="background:${p.bg}; width:100%; height:28px; border-radius:4px;" 
                        onclick="QuoteEditor.update('theme', '${p.id}')"></button>
              `).join('')}
            </div>
          </div>

          <div class="tool-group" style="gap:12px;">
            <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
              <input type="checkbox" ${this.settings.showNovel?'checked':''} onchange="QuoteEditor.update('showNovel', this.checked)"> إظهار اسم الرواية
            </label>
            <label style="display:flex; align-items:center; gap:12px; cursor:pointer;">
              <input type="checkbox" ${this.settings.showChapter?'checked':''} onchange="QuoteEditor.update('showChapter', this.checked)"> إظهار اسم الفصل
            </label>
          </div>

          <div style="margin-top:auto; display:flex; gap:12px;">
            <button class="btn-flat active" style="flex:1.5; background:#0078d4; color:white; font-weight:bold;" onclick="QuoteEditor.save()">حفظ الصورة</button>
            <button class="btn-flat" style="flex:1;" onclick="QuoteEditor.close()">إلغاء</button>
          </div>
        </div>
      </div>
    `;
    QuoteUI.buildCard(document.getElementById('quotePreviewCard'), this.text, this.settings);
  },

  createModal() {
    const m = document.createElement('div');
    m.id = 'quoteModal';
    m.className = 'modal-overlay';
    document.body.appendChild(m);
    return m;
  },

  update(key, val) {
    QuoteEditor.settings[key] = (key === 'fontSize') ? parseInt(val) : val;
    QuoteEditor.renderModal();
  },

  async save() {
    const card = document.getElementById('quotePreviewCard');
    const colors = QuoteUI.getPalette(this.settings.theme);
    
    try {
      const canvas = await html2canvas(card, { backgroundColor: colors.bg, scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Quote-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { alert('خطأ في الحفظ'); }
  },

  close() { document.getElementById('quoteModal').style.display = 'none'; }
};

// ضمان وصول الأحداث للكائن
window.QuoteEditor = QuoteEditor;

// 4. دالة الحفظ السريع
async function exportQuoteQuick(text) {
  if (!text) return;
  const temp = document.createElement('div');
  temp.style.cssText = 'position:fixed; top:-9999px; left:-9999px;';
  document.body.appendChild(temp);

  const currentSettings = {
    fontSize: Store.state.settings.sz + 4,
    theme: Store.state.settings.theme,
    font: Store.state.settings.font,
    showNovel: true,
    showChapter: true
  };

  QuoteUI.buildCard(temp, text, currentSettings);

  try {
    const canvas = await html2canvas(temp, { backgroundColor: QuoteUI.getPalette(currentSettings.theme).bg, scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `QuickQuote-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally { document.body.removeChild(temp); }
}

// 5. الاختصارات العامة
function openQuoteEditor(text) { QuoteEditor.open(text); }
function exportQuote(text) { QuoteEditor.open(text); }
