/**
 * محرك تصدير الاقتباسات (Quote Export Engine)
 * يعتمد على html2canvas لتحويل النصوص إلى صور بتصاميم مخصصة.
 */
async function exportQuote(text) {
  if (!text || text.trim() === '') return;
  
  const settings = Store.state.settings;
  const novelTitle = (Store.activeNovel && Store.activeNovel.title) || 'رواية بدون عنوان';
  const activeChapter = Store.chapters[Store.activeChapterIdx];
  const chapterTitle = activeChapter ? activeChapter.title : '';
  
  // إنشاء حاوية الاقتباس
  const qWrap = document.createElement('div');
  qWrap.className = `quote-export-temp ${settings.theme} ${settings.font}`;
  
  // تطبيق الثيم من العناصر الرئيسية لضمان الدقة
  const rootStyle = getComputedStyle(document.getElementById('root') || document.body);
  const bgColor = rootStyle.getPropertyValue('--color-background-primary').trim();
  const textColor = rootStyle.getPropertyValue('--color-text-primary').trim();

  qWrap.style.cssText = `
    position: fixed; top: -10000px; left: -10000px;
    width: 600px; padding: 70px 50px;
    background: ${bgColor};
    color: ${textColor};
    text-align: center;
    border: 1px solid var(--ui-border);
    direction: rtl;
    font-family: ${settings.font === 'fn' ? 'var(--ui-font-serif)' : 'var(--ui-font-sans)'};
  `;

  qWrap.innerHTML = `
    <div style="font-size: 26px; line-height: 1.8; font-family: inherit; position: relative;">
      <span style="font-size: 45px; opacity: 0.3; font-family: serif; margin-left: 8px; vertical-align: sub; line-height: 0;">«</span>
      ${text}
      <span style="font-size: 45px; opacity: 0.3; font-family: serif; margin-right: 8px; vertical-align: sub; line-height: 0;">»</span>
    </div>
    <div style="margin-top: 50px; padding-top: 25px; border-top: 1px solid var(--ui-border-light); font-family: var(--ui-font-sans); font-size: 15px; opacity: 0.8;">
      <span style="opacity: 0.6;">رواية:</span> ${novelTitle}
      ${chapterTitle ? ` <span style="opacity: 0.3; margin: 0 10px;">|</span> ${chapterTitle}` : ''}
    </div>
  `;

  document.body.appendChild(qWrap);

  try {
    const canvas = await html2canvas(qWrap, {
      backgroundColor: bgColor,
      scale: 2,
      logging: false,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `MEGAWORLD-Quote-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Export failed:', err);
    alert('فشل تصدير الاقتباس، يرجى المحاولة مرة أخرى.');
  } finally {
    document.body.removeChild(qWrap);
  }
}
