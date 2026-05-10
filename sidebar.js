function toggleSidebar() {
  sidebarVisible = !sidebarVisible;
  applySidebarState();
  save();
}

function applySidebarState() {
  const sb = document.getElementById('sidebar');
  const btn = document.getElementById('sideToggleBtn');
  const root = document.getElementById('root');
  if (sb) {
    sb.classList.toggle('hidden', !sidebarVisible);
  }
  if (root) {
    root.classList.toggle('side-open', sidebarVisible);
  }
  if (btn) {
    btn.classList.toggle('on', sidebarVisible);
  }
}

// Multi-Novel Library Functions
function renderLibrary() {
  const libList = document.getElementById('libraryList');
  const titleField = document.getElementById('novelTitleInput');
  if (!libList) return;
  libList.innerHTML = '';

  novels.forEach((novel, i) => {
    const item = document.createElement('button');
    item.className = 'list-item-flat' + (i === activeNovelIdx ? ' active' : '');
    item.textContent = novel.title || 'رواية بدون عنوان';
    item.onclick = () => switchNovel(i);
    
    // القائمة المنبثقة للرواية (الاستدعاء الجديد الموحد)
    item.oncontextmenu = (e) => {
      ContextMenu.show(e, [
        { label: 'فتح الرواية', icon: 'ti-book', action: () => switchNovel(i) },
        { label: 'تغيير الاسم', icon: 'ti-edit', action: () => renameNovel(i) },
        { label: 'إضافة فصل للرواية', icon: 'ti-plus', action: () => { switchNovel(i); addChapter(); } },
        { sep: true },
        { label: 'حذف الرواية', icon: 'ti-trash', danger: true, action: () => deleteNovel(i) }
      ]);
    };
    
    // تعديل اسم الرواية بالضغط مرتين
    item.ondblclick = () => {
      const input = document.createElement('input');
      input.className = 'inline-edit-input';
      input.value = item.textContent;
      item.textContent = '';
      item.appendChild(input);
      input.focus();
      input.onblur = () => {
        if (input.value.trim()) {
          novels[i].title = input.value.trim();
          renderLibrary();
          save();
        } else {
          renderLibrary();
        }
      };
      input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    };
    
    libList.appendChild(item);
  });

  if (titleField && novels[activeNovelIdx]) {
    titleField.value = novels[activeNovelIdx].title;
  }
}

function addNovel() {
  const newNovel = {
    title: 'رواية جديدة ' + (novels.length + 1),
    chapters: [{ title: 'فصل 1', content: '' }],
    activeChapterIdx: 0
  };
  novels.push(newNovel);
  activeNovelIdx = novels.length - 1;
  syncStateFromActiveNovel();
  renderLibrary();
  renderTabs();
  renderBody();
  save();
}

function switchNovel(i) {
  if (i < 0 || i >= novels.length) return;
  activeNovelIdx = i;
  syncStateFromActiveNovel();
  renderLibrary();
  renderTabs();
  renderBody();
  save();
}

function updateNovelTitle(val) {
  if (novels[activeNovelIdx]) {
    novels[activeNovelIdx].title = val;
    renderLibrary();
    save();
  }
}

// وظائف التعديل والحذف المستدعاة من المنيو
function renameNovel(i) {
  const n = prompt('اسم الرواية الجديد:', novels[i].title);
  if (n && n.trim()) {
    novels[i].title = n.trim();
    renderLibrary();
    save();
  }
}

function deleteNovel(i) {
  if (novels.length === 1) return alert('لا يمكن حذف آخر رواية.');
  if (confirm(`حذف رواية "${novels[i].title}" نهائياً؟`)) {
    novels.splice(i, 1);
    if (activeNovelIdx >= novels.length) activeNovelIdx = novels.length - 1;
    syncStateFromActiveNovel();
    renderLibrary(); renderTabs(); renderBody();
    save();
  }
}

// Helper to keep legacy variables in sync
function syncStateFromActiveNovel() {
  if (novels[activeNovelIdx]) {
    chapters = novels[activeNovelIdx].chapters;
    activeIdx = novels[activeNovelIdx].activeChapterIdx;
  }
}

// Initialize Library on Load
window.addEventListener('DOMContentLoaded', () => {
  renderLibrary();
  
  const titleField = document.getElementById('novelTitleInput');
  if (titleField) {
    titleField.readOnly = true;
    titleField.ondblclick = () => {
      titleField.readOnly = false;
      titleField.focus();
      titleField.select();
    };
    titleField.onblur = () => {
      titleField.readOnly = true;
      save();
    };
    titleField.onkeydown = (e) => { if (e.key === 'Enter') titleField.blur(); };
  }
});
