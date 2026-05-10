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
        { label: 'تغيير صورة الغلاف', icon: 'ti-photo', action: () => changeNovelCover(i) },
        { label: 'إضافة فصل للرواية', icon: 'ti-plus', action: () => { Store.switchNovel(i); Store.addChapter(); } },
        { sep: true },
        { label: 'إضافة رواية نموذجية', icon: 'ti-package', action: () => importExampleNovel() },
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
  const title = prompt('أدخل اسم الرواية الجديدة:', 'رواية جديدة');
  if (!title) return;
  
  const picker = document.getElementById('coverPicker');
  if (picker) {
    picker.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          Store.addNovel(title.trim(), 'مؤلف مجهول', re.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        Store.addNovel(title.trim());
      }
      picker.value = ''; // Reset
    };
    picker.click();
  } else {
    Store.addNovel(title.trim());
  }
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

function changeNovelCover(i) {
  const picker = document.getElementById('coverPicker');
  if (picker) {
    picker.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          Store.updateNovelCover(i, re.target.result);
        };
        reader.readAsDataURL(file);
      }
      picker.value = ''; // Reset
    };
    picker.click();
  }
}

function importExampleNovel() {
  const exampleData = {
    title: 'سيد الأسرار: العودة',
    author: 'ج. ر. ر. تولكين',
    description: 'رحلة ملحمية في عالم السحر والغموض. استكشف العوالم الخفية وواجه الأسرار القديمة.',
    cover: 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png',
    status: 'مكتملة',
    genres: ['خيال', 'مغامرة', 'ملحمي'],
    chapters: [
      { title: 'رحلة غير متوقعة', content: 'تبدأ القصة في قرية هادئة حيث يلتقي الأصدقاء القدامى...' },
      { title: 'ظل الماضي', content: 'تتكشف أسرار قديمة تهدد أمن العالم وسلامته...' },
      { title: 'ثلاثة هم الصحبة', content: 'ينطلق الأبطال في رحلة طويلة وشاقة عبر الجبال...' }
    ]
  };

  const novel = {
    ...exampleData,
    activeChapterIdx: 0
  };

  Store.state.novels.push(novel);
  Store.state.activeNovelIdx = Store.state.novels.length - 1;
  Store.save();
  Store.notify();
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
