// محرك المحرر (Editor Engine)
let currentModalMode = 'chapter'; // 'chapter' or 'novel-desc'

function openModal(mode = 'chapter') {
  currentModalMode = mode;
  const bg = document.getElementById('modalBg');
  const body = document.getElementById('modalBody');
  const hdr = document.getElementById('modalTitle');
  const btns = document.getElementById('modalBtns');
  
  if (!bg || !body || !hdr || !btns) return;

  // إعداد المحتوى بناءً على النوع
  if (mode === 'chapter') {
    const activeChapter = Store.chapters[Store.activeChapterIdx];
    if (!activeChapter) return;
    hdr.textContent = 'تعديل الفصل';
    body.innerHTML = `
      <div class="flex-column" style="gap:12px;">
        <input class="input-flat" style="width:100%; border:none; border-bottom:1px solid var(--ui-border-light);" id="titleInput" placeholder="عنوان الفصل..." value="${activeChapter.title || ''}">
        <textarea class="ta" id="ta" placeholder="نص الفصل...">${activeChapter.content || ''}</textarea>
      </div>
    `;
  } else if (mode === 'novel-desc') {
    const novel = Store.activeNovel;
    if (!novel) return;
    hdr.textContent = 'وصف الرواية';
    body.innerHTML = `<textarea class="ta" id="ta" placeholder="اكتب ملخص الرواية هنا...">${novel.description || ''}</textarea>`;
  }

  // إعداد الأزرار
  btns.innerHTML = `
    <button class="btn-flat" onclick="closeModal()">إلغاء</button>
    <button class="btn-flat active" onclick="applyText()">حفظ التغييرات</button>
  `;
  
  bg.classList.add('open');
  const ta = document.getElementById('ta');
  if (ta) ta.focus();
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
