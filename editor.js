// محرك المحرر (Editor Engine)
let currentModalMode = 'chapter'; // 'chapter' or 'novel-desc'

function openModal(mode = 'chapter') {
  currentModalMode = mode;
  const bg = document.getElementById('modalBg');
  const ta = document.getElementById('ta');
  const ti = document.getElementById('titleInput');
  const hdr = document.querySelector('.modal-title');
  
  if (!bg || !ta || !ti) return;

  if (mode === 'chapter') {
    const activeChapter = Store.chapters[Store.activeChapterIdx];
    if (!activeChapter) return;
    hdr.textContent = 'اسم الفصل:';
    ti.style.display = 'block';
    ti.value = activeChapter.title || '';
    ta.value = activeChapter.content || '';
  } else if (mode === 'novel-desc') {
    const novel = Store.activeNovel;
    if (!novel) return;
    hdr.textContent = 'ملخص الرواية:';
    ti.style.display = 'none';
    ta.value = novel.description || '';
  }
  
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

  if (currentModalMode === 'chapter') {
    const activeIdx = Store.activeChapterIdx;
    Store.updateChapter(activeIdx, {
      title: ti.value.trim() || ('فصل ' + (activeIdx + 1)),
      content: ta.value
    });
  } else if (currentModalMode === 'novel-desc') {
    const sideDesc = document.getElementById('side-desc');
    if (sideDesc) sideDesc.value = ta.value;
    
    // تحديث المتجر فوراً لضمان الحفظ
    Store.updateNovel(Store.state.activeNovelIdx, { description: ta.value });
  }
  closeModal();
}

function openDescEditor() {
  openModal('novel-desc');
}

// إغلاق المودال عند الضغط على Esc
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
