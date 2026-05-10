function toggleSidebar() {
  const newState = !Store.state.settings.sidebarVisible;
  Store.updateSettings('sidebarVisible', newState);
}

function applySidebarState() {
  const sb = document.getElementById('sidebar');
  const btn = document.getElementById('sideToggleBtn');
  const root = document.getElementById('root');
  const isVisible = Store.state.settings.sidebarVisible;
  
  if (sb) sb.classList.toggle('hidden', !isVisible);
  if (root) root.classList.toggle('side-open', isVisible);
  if (btn) btn.classList.toggle('on', isVisible);
}

// Multi-Novel Library Functions
function renderLibrary() {
  const libList = document.getElementById('libraryList');
  const titleField = document.getElementById('novelTitleInput');
  if (!libList) return;
  libList.innerHTML = '';

  Store.state.novels.forEach((novel, i) => {
    const item = document.createElement('button');
    item.className = 'list-item-flat' + (i === Store.state.activeNovelIdx ? ' active' : '');
    item.textContent = novel.title || 'رواية بدون عنوان';
    item.onclick = () => Store.switchNovel(i);
    
    // القائمة المنبثقة للرواية
    item.oncontextmenu = (e) => {
      ContextMenu.show(e, [
        { label: 'فتح الرواية', icon: 'ti-book', action: () => Store.switchNovel(i) },
        { label: 'تغيير الاسم', icon: 'ti-edit', action: () => renameNovel(i) },
        { label: 'إضافة فصل للرواية', icon: 'ti-plus', action: () => { Store.switchNovel(i); Store.addChapter(); } },
        { sep: true },
        { label: 'حذف الرواية', icon: 'ti-trash', danger: true, action: () => Store.deleteNovel(i) }
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
          Store.updateNovelTitle(input.value.trim());
        } else {
          renderLibrary();
        }
      };
      input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    };
    
    libList.appendChild(item);
  });

  if (titleField && Store.activeNovel) {
    titleField.value = Store.activeNovel.title;
  }
}

function addNovel() {
  Store.addNovel();
}

function switchNovel(i) {
  Store.switchNovel(i);
}

function updateNovelTitle(val) {
  Store.updateNovelTitle(val);
}

// وظائف التعديل والحذف المستدعاة من المنيو
function renameNovel(i) {
  const n = prompt('اسم الرواية الجديد:', Store.state.novels[i].title);
  if (n && n.trim()) {
    Store.state.novels[i].title = n.trim();
    Store.save();
    Store.notify();
  }
}

// Initialize Library on Load
function initSidebar() {
  renderLibrary();
  applySidebarState();
  
  // الوصول للعنصر الذي تم بناؤه ديناميكياً في التولبار
  const titleField = document.getElementById('novelTitleInput');
  if (titleField) {
    // إزالة التقييد الافتراضي للسماح بالتعديل اللحظي من التولبار
    titleField.readOnly = false; 
    titleField.onblur = () => {
      Store.save();
    };
    titleField.onkeydown = (e) => { if (e.key === 'Enter') titleField.blur(); };
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // استخدام setTimeout بسيط لضمان انتهاء Toolbar.init أولاً
  setTimeout(initSidebar, 50);
});

// الاشتراك في تحديثات الـ Store لإعادة الرسم تلقائياً
Store.subscribe(() => {
  renderLibrary();
  applySidebarState();
});
