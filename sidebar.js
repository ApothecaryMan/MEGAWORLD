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
    item.innerHTML = `
      <span>${novel.title || 'رواية بدون عنوان'}</span>
      <i class="ti ti-edit side-edit-btn" title="تعديل البيانات"></i>
    `;
    item.onclick = () => Store.switchNovel(i);
    
    // أيقونة التعديل تفتح اللوحة الجانبية
    const editBtn = item.querySelector('.side-edit-btn');
    editBtn.onclick = (e) => {
      e.stopPropagation();
      Store.switchNovel(i);
      toggleNovelDataPanel(true);
    };
    
    // القائمة المنبثقة للرواية
    item.oncontextmenu = (e) => {
      ContextMenu.show(e, [
        { label: 'فتح الرواية', icon: 'ti-book', action: () => Store.switchNovel(i) },
        { label: 'عرض صفحة الرواية', icon: 'ti-external-link', action: () => window.location.href = 'novel.html?id=' + i },
        { label: 'تعديل بيانات الرواية', icon: 'ti-edit', action: () => { Store.switchNovel(i); toggleNovelDataPanel(true); } },
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

function removeNovelCover(i) {
  if (confirm('هل أنت متأكد من حذف الغلاف؟')) {
    Store.updateNovelCover(i, '');
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

// وظائف تعديل بيانات الرواية (Novel Data Edit)
function renderNovelData() {
  const container = document.getElementById('novelDataList');
  if (!container || !Store.activeNovel) return;
  const n = Store.activeNovel;
  
  container.innerHTML = `
    <div class="side-cover-container">
      <img src="${n.cover || 'public/ChatGPT Image May 7, 2026, 07_38_24 PM.png'}" class="side-cover-full" id="side-cover-preview">
      <button class="side-cover-delete" onclick="removeNovelCover(${Store.state.activeNovelIdx})" title="حذف الغلاف">×</button>
      <button class="side-cover-btn" onclick="changeNovelCover(${Store.state.activeNovelIdx})">تغيير الغلاف</button>
    </div>
    <div class="side-item-group">
      <label class="side-label">عنوان الرواية</label>
      <input type="text" class="input-flat side-input" id="side-title" value="${n.title || ''}">
    </div>
    <div class="side-item-group">
      <label class="side-label">المؤلف</label>
      <input type="text" class="input-flat side-input" id="side-author" value="${n.author || ''}">
    </div>
    <div class="side-item-group">
      <label class="side-label">الحالة</label>
      <div class="dropdown-wrap" id="sideStatusDropdown">
        <div class="dropdown-trigger" onclick="this.parentElement.classList.toggle('open')">
          <span id="sideStatusLabel">${n.status || 'مستمرة'}</span>
          <i class="ti ti-chevron-down"></i>
        </div>
        <div class="dropdown-menu">
          <button class="dropdown-item" onclick="setNovelStatus('مستمرة')">مستمرة</button>
          <button class="dropdown-item" onclick="setNovelStatus('مكتملة')">مكتملة</button>
          <button class="dropdown-item" onclick="setNovelStatus('متوقفة')">متوقفة</button>
        </div>
      </div>
      <input type="hidden" id="side-status" value="${n.status || 'مستمرة'}">
    </div>
    <div class="side-item-group">
      <label class="side-label">التصنيفات (افصل بـ <span style="color:var(--color-theme); font-weight:bold; font-size:14px;">-</span>)</label>
      <div class="input-flat side-input side-tags-input" id="side-genres" contenteditable="true" oninput="highlightSeparators(this)">${(n.genres || []).join(' - ')}</div>
    </div>
    <div class="side-item-group">
      <label class="side-label">الوصف</label>
      <button class="btn-flat" onclick="openDescEditor()" style="width: 100%; font-size: 11px;">
        <i class="ti ti-edit"></i> تعديل ملخص الرواية
      </button>
      <input type="hidden" id="side-desc" value="${n.description || ''}">
    </div>
  `;
}

function toggleNovelDataPanel(show) {
  const root = document.getElementById('root');
  if (show === undefined) {
    root.classList.toggle('data-open');
  } else {
    root.classList.toggle('data-open', show);
  }
}

function setNovelStatus(status) {
  const input = document.getElementById('side-status');
  const label = document.getElementById('sideStatusLabel');
  const dropdown = document.getElementById('sideStatusDropdown');
  
  if (input) input.value = status;
  if (label) label.textContent = status;
  if (dropdown) dropdown.classList.remove('open');
}

function highlightSeparators(el) {
  // حفظ موقع الكرسر بدقة قبل التحديث
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.endContainer, range.endOffset);
  const offset = preRange.toString().length;

  const text = el.innerText;
  const highlighted = text.replace(/-/g, '<span style="color:var(--color-theme); font-weight:bold;">$&</span>');
  
  if (el.innerHTML !== highlighted) {
    el.innerHTML = highlighted;
    
    // استعادة موقع الكرسر بالتنقل عبر العقد
    const newRange = document.createRange();
    let charCount = 0;
    let nodeFound = false;

    function traverse(node) {
      if (nodeFound) return;
      if (node.nodeType === 3) { // نص
        if (charCount + node.length >= offset) {
          newRange.setStart(node, offset - charCount);
          newRange.collapse(true);
          nodeFound = true;
        } else {
          charCount += node.length;
        }
      } else {
        for (let child of node.childNodes) traverse(child);
      }
    }
    
    traverse(el);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

function saveNovelDetails() {
  const idx = Store.state.activeNovelIdx;
  const genresEl = document.getElementById('side-genres');
  const genresVal = genresEl ? genresEl.innerText : '';
  const genres = genresVal ? genresVal.split('-').map(g => g.trim()).filter(Boolean) : [];
  
  const data = {
    title: document.getElementById('side-title').value,
    author: document.getElementById('side-author').value,
    status: document.getElementById('side-status').value,
    description: document.getElementById('side-desc').value,
    genres: genres
  };
  
  Store.updateNovel(idx, data);
  toggleNovelDataPanel(false); // إغلاق بعد الحفظ
}

// Initialize Library on Load
function initSidebar() {
  renderLibrary();
  renderNovelData();
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
  renderNovelData();
  applySidebarState();
});
