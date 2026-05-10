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
    item.className = 'side-item' + (i === activeNovelIdx ? ' active' : '');
    item.textContent = novel.title || 'رواية بدون عنوان';
    item.onclick = () => switchNovel(i);
    
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
  
  // تفعيل التعديل بالضغط مرتين لعنوان الرواية في البار العلوي
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
