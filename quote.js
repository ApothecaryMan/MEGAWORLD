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
      border: 1px solid var(--ui-border);
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
function exportQuote(text) { exportQuoteQuick(text); }
