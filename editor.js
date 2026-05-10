// محرك المحرر (Editor Engine)

function openModal() {
  const bg = document.getElementById('modalBg');
  const ta = document.getElementById('ta');
  const ti = document.getElementById('titleInput');
  const activeChapter = Store.chapters[Store.activeChapterIdx];

  if (!bg || !ta || !ti || !activeChapter) return;

  ti.value = activeChapter.title || '';
  ta.value = activeChapter.content || '';
  
  bg.classList.add('open');
  ta.focus();
}

function closeModal() {
  const bg = document.getElementById('modalBg');
  if (bg) bg.classList.remove('open');
}

function applyText() {
  const ta = document.getElementById('ta');
  const ti = document.getElementById('titleInput');
  const activeIdx = Store.activeChapterIdx;

  if (ta && ti) {
    Store.updateChapter(activeIdx, {
      title: ti.value.trim() || ('فصل ' + (activeIdx + 1)),
      content: ta.value
    });
    closeModal();
  }
}

// إغلاق المودال عند الضغط على Esc
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
