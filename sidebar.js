import Store from './store.js';
import ContextMenu from './context_menu.js';

export function toggleSidebar() {
  const newState = !Store.state.settings.sidebarVisible;
  Store.updateSettings('sidebarVisible', newState);
}

function applySidebarState() {
  const sb = document.getElementById('sidebar');
  const btn = document.getElementById('sideToggleBtn');
  const root = document.getElementById('root');
  const isVisible = !!Store.state.settings.sidebarVisible;
  
  if (sb) {
    sb.classList.toggle('hidden', !isVisible);
    // تأمين العرض المباشر في حالة الـ Flex
    if (isVisible) {
      sb.style.display = 'flex';
      sb.style.flexDirection = 'column';
    } else {
      sb.style.display = 'none';
    }
  }
  
  if (root) {
    root.classList.toggle('side-open', isVisible);
  }
  
  if (btn) {
    btn.classList.toggle('active', isVisible);
  }
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
      <span class="truncate">${novel.title || 'رواية بدون عنوان'}</span>
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
    renderNovelData(); // تحديث فوري للمعاينة
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

function formatSeparators(text) {
  if (!text) return '';
  return text.replace(/-/g, '<span class="separator-dash">-</span>');
}

// وظائف تعديل بيانات الرواية (Novel Data Edit)
function renderNovelData() {
  const container = document.getElementById('novelDataList');
  if (!container || !Store.activeNovel) return;
  const n = Store.activeNovel;
  
  container.innerHTML = `
    <div class="side-cover-container">
      ${n.cover ? 
        `<img src="${n.cover}" class="side-cover-full" id="side-cover-preview">` :
        `<div class="side-cover-placeholder placeholder-flat">
           <i class="ti ti-camera"></i>
           <span>غلاف الرواية</span>
         </div>`
      }
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
      <div class="input-flat side-input side-tags-input" id="side-genres" contenteditable="true" oninput="highlightSeparators(this)">${formatSeparators((n.genres || []).join(' - '))}</div>
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
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  // حفظ الموقع النصي للمؤشر
  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.endContainer, range.endOffset);
  const offset = preRange.toString().length;

  const text = el.innerText;
  const highlighted = text.replace(/-/g, '<span class="separator-dash">-</span>');
  
  // تحديث المحتوى فقط إذا كان هناك تغيير حقيقي (تجنب الوميض)
  if (el.innerHTML.replace(/"/g, "'") !== highlighted.replace(/"/g, "'")) {
    el.innerHTML = highlighted;
    
    // استعادة المؤشر
    const newRange = document.createRange();
    let charCount = 0;
    let nodeFound = false;

    function traverse(node) {
      if (nodeFound) return;
      if (node.nodeType === 3) { // نص
        const nextCount = charCount + node.length;
        if (nextCount >= offset) {
          newRange.setStart(node, offset - charCount);
          newRange.collapse(true);
          nodeFound = true;
        } else {
          charCount = nextCount;
        }
      } else {
        for (let child of node.childNodes) traverse(child);
      }
    }
    
    traverse(el);
    if (!nodeFound && el.childNodes.length > 0) {
      // إذا لم نجد العقدة (مثلاً في نهاية النص تماماً)
      const last = el.lastChild;
      newRange.setStartAfter(last);
      newRange.collapse(true);
    }
    
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

async function saveNovelDetails() {
  const btn = document.getElementById('saveNovelBtn');
  const originalHtml = btn.innerHTML;
  
  try {
    // حالة التحميل
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2"></i>'; // أيقونة تحميل
    
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
    
    // تنفيذ الحفظ والمزامنة
    await Store.updateNovel(idx, data);
    
    // نجاح
    btn.innerHTML = '<i class="ti ti-check"></i>';
    setTimeout(() => {
      toggleNovelDataPanel(false);
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }, 500);

  } catch (error) {
    console.error('Save Error:', error);
    btn.innerHTML = '<i class="ti ti-alert-circle"></i>';
    btn.style.color = 'red';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      btn.style.color = '';
    }, 2000);
  }
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

// الاشتراك في تحديثات الـ Store لإعادة الرسم تلقائياً
Store.subscribe(() => {
  renderLibrary();
  renderNovelData();
  applySidebarState();
});

// الجسر العالمي للتوافق مع HTML
window.toggleSidebar = toggleSidebar;
window.addNovel = addNovel;
window.renderLibrary = renderLibrary;
window.saveNovelDetails = saveNovelDetails;
window.toggleNovelDataPanel = toggleNovelDataPanel;
window.setNovelStatus = setNovelStatus;
window.removeNovelCover = removeNovelCover;
window.changeNovelCover = changeNovelCover;
window.applySidebarState = applySidebarState;
window.initSidebar = initSidebar;

export { 
  applySidebarState, 
  renderLibrary, 
  addNovel, 
  switchNovel, 
  updateNovelTitle, 
  initSidebar,
  renderNovelData,
  saveNovelDetails,
  toggleNovelDataPanel
};
