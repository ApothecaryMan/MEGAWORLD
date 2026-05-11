import Store from './store.js';
import ContextMenu from './context_menu.js';
import TabsEngine from './tabs.js';
import UIHelper from './ui_helper.js';

/**
 * --- منطق المحرر (Modals & Forms) ---
 */
export let currentModalMode = 'chapter';

function openModal(mode = 'chapter') {
  currentModalMode = mode;
  const bg = document.getElementById('modalBg');
  const body = document.getElementById('modalBody');
  const hdr = document.getElementById('modalTitle');
  const btns = document.getElementById('modalBtns');
  
  if (!bg || !body || !hdr || !btns) return;

  if (mode === 'chapter') {
    const activeChapter = Store.chapters[Store.activeChapterIdx];
    if (!activeChapter) return;

    hdr.textContent = 'تعديل الفصل';
    body.innerHTML = `
      <div class="flex-column" style="gap:12px;" id="modalFormContainer">
        <input class="input-flat" style="width:100%; border:none; border-bottom:1px solid var(--ui-border-light); font-size: 16px; font-weight: bold;" id="titleInput" placeholder="عنوان الفصل..." value="${activeChapter.title || ''}">
        
        <div class="flex-row" style="gap: 10px; justify-content: space-between; align-items: center;" id="modalDropdownsRow">
          <!-- Dropdowns will be injected here -->
        </div>

        <textarea class="ta" id="ta" style="min-height: 200px;" placeholder="نص الفصل...">${activeChapter.content || ''}</textarea>
      </div>
    `;

    const dropdownsRow = document.getElementById('modalDropdownsRow');
    
    // Visibility Field
    dropdownsRow.appendChild(UIHelper.createField({
      label: 'رؤية الفصل:',
      component: UIHelper.createDropdown({
        id: 'visibilityDropdown',
        value: activeChapter.visibility || 'public',
        items: [
          { value: 'public', label: 'عام (للجميع)' },
          { value: 'subscribers_only', label: 'للمسجلين فقط' },
          { value: 'premium_only', label: 'للمشتركين (Premium)' },
          { value: 'hidden', label: 'مخفي (مسودة)' }
        ],
        onChange: (val, lbl) => setChapterVisibility(val, lbl)
      })
    }));

    // Plan Field
    dropdownsRow.appendChild(UIHelper.createField({
      label: 'الخطة المطلوبة:',
      component: UIHelper.createDropdown({
        id: 'planDropdown',
        value: activeChapter.required_plan || 'free',
        items: [
          { value: 'free', label: 'مجانية' },
          { value: 'basic', label: 'أساسية (Basic)' },
          { value: 'premium', label: 'بريميوم (Premium)' }
        ],
        onChange: (val, lbl) => setRequiredPlan(val, lbl)
      })
    }));
  } else if (mode === 'novel-desc') {
    const novel = Store.activeNovel;
    if (!novel) return;
    hdr.textContent = 'وصف الرواية';
    body.innerHTML = `<textarea class="ta" id="ta" placeholder="اكتب ملخص الرواية هنا...">${novel.description || ''}</textarea>`;
  }

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
    const visibility = document.getElementById('visibilityInput').value;
    const required_plan = document.getElementById('planInput').value;

    Store.updateChapter(activeIdx, {
      title: ti.value.trim() || ('فصل ' + (activeIdx + 1)),
      content: ta.value,
      visibility,
      required_plan,
      is_locked: (visibility === 'premium_only' || required_plan !== 'free')
    });
  } else if (currentModalMode === 'novel-desc') {
    const sideDesc = document.getElementById('side-desc');
    if (sideDesc) sideDesc.value = ta.value;
    Store.updateNovel(Store.state.activeNovelIdx, { description: ta.value });
  }
  closeModal();
}

function openDescEditor() {
  openModal('novel-desc');
}

function setChapterVisibility(val, label) {
  const input = document.getElementById('visibilityInput');
  const lbl = document.getElementById('visibilityLabel');
  const dropdown = document.getElementById('visibilityDropdown');
  if (input) input.value = val;
  if (lbl) lbl.textContent = label;
  if (dropdown) dropdown.classList.remove('open');
}

function setRequiredPlan(val, label) {
  const input = document.getElementById('planInput');
  const lbl = document.getElementById('planLabel');
  const dropdown = document.getElementById('planDropdown');
  if (input) input.value = val;
  if (lbl) lbl.textContent = label;
  if (dropdown) dropdown.classList.remove('open');
}

/**
 * --- منطق القارئ (Rendering & Interactions) ---
 */
function renderTabs() {
  TabsEngine.render();
}

function addChapter() {
  Store.addChapter();
}

function renderBody() {
  const wrap = document.getElementById('bodyWrap');
  if (!wrap) return;
  
  const ch = Store.chapters[Store.activeChapterIdx];
  if (!ch) { wrap.innerHTML = ''; return; }
  
  wrap.oncontextmenu = (e) => {
    if (window.getSelection().toString().trim()) return;
    ContextMenu.show(e, [
      { label: 'تعديل الفصل الحالي', icon: 'ti-edit', action: () => openModal() },
      { label: 'إضافة فصل جديد', icon: 'ti-plus', action: () => Store.addChapter() },
      { sep: true },
      { label: 'تبديل وضع التركيز', icon: 'ti-maximize', action: () => document.body.classList.toggle('focus-mode') },
      { label: 'وضع التمرير المتواصل', icon: 'ti-infinity', action: () => {
          Store.updateSettings('continuousMode', !Store.state.settings.continuousMode);
          if (typeof window.applyGlobalUI === 'function') window.applyGlobalUI();
          renderBody();
        }
      }
    ]);
  };
  
  const settings = Store.state.settings;

  if (!ch.content) {
    wrap.innerHTML = `<div class="paste-zone" id="pasteZone" role="button">
        <i class="ti ti-clipboard-text"></i>
        <div class="paste-title">انقر لصق نص الفصل</div>
        <div class="paste-sub">أو اسحب النص وأفلته هنا</div>
      </div>`;
    const z = document.getElementById('pasteZone');
    if (z) {
      z.onclick = () => openModal();
      z.addEventListener('drop', e => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text');
        if (text) {
          Store.updateChapter(Store.activeChapterIdx, { content: text });
          renderBody();
        }
      });
      z.addEventListener('dragover', e => e.preventDefault());
    }
  } else {
    const escHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (settings.continuousMode) {
      let full = '';
      Store.chapters.forEach((c, i) => {
        if (!c.content) return;
        full += `
        <h2 id="ch-title-${i}" class="chapter-text ch-marker ${settings.font} ${settings.align}" data-index="${i}" style="font-size:${settings.sz}px; font-weight:bold; margin-top:2rem;">${escHtml(c.title)}</h2>
        <div class="chapter-text ${settings.font} ${settings.align}" style="font-size:${settings.sz}px;">${escHtml(c.content)}</div>
        <div class="orn"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>`;
      });
      wrap.innerHTML = full;
    } else {
      wrap.innerHTML = `
      <h2 id="ch-title-${Store.activeChapterIdx}" class="chapter-text ch-marker ${settings.font} ${settings.align}" data-index="${Store.activeChapterIdx}" style="font-size:${settings.sz}px; font-weight:bold;">${escHtml(ch.title)}</h2>
      <div class="chapter-text ${settings.font} ${settings.align}" id="chapterText" style="font-size:${settings.sz}px;">${escHtml(ch.content)}</div>
      <div class="orn"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>`;
    }
  }

  updateNavUI();
}

function updateNavUI() {
  const info = document.getElementById('navInfo');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const activeIdx = Store.activeChapterIdx;
  const count = Store.chapters.length;

  if (info) info.textContent = (activeIdx + 1) + ' / ' + count;
  if (prev) prev.disabled = activeIdx === 0;
  if (next) next.disabled = activeIdx === count - 1;
}

function sortChapters(order) {
  Store.updateSettings('chapterSortOrder', order);
  const filter = document.getElementById('chaptersFilter');
  if (filter) filter.classList.remove('open');
  renderTabs();
}

// التمرير والتقدم
function initScrollListener() {
  const wrap = document.getElementById('bodyWrap');
  if (!wrap) return;

  wrap.onscroll = () => {
    const h = wrap.scrollHeight - wrap.clientHeight;
    const p = (wrap.scrollTop / h) * 100;
    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = (isFinite(p) ? p : 0) + '%';

    if (Store.state.settings.continuousMode) {
      const markers = document.querySelectorAll('.ch-marker');
      let currentIdx = Store.activeChapterIdx;
      for (let m of markers) {
        // نستخدم الإحداثيات بالنسبة لـ wrap
        const rect = m.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        if (rect.top - wrapRect.top <= 120) {
          currentIdx = parseInt(m.getAttribute('data-index'));
        } else break;
      }
      if (Store.activeChapterIdx !== currentIdx) {
        Store.setChapter(currentIdx, 'chapter-scrolled');
      }
    }
  };
}

/**
 * --- تهيئة واشتراكات ---
 */
Store.subscribe((event) => {
  renderTabs();
  if (event !== 'chapter-scrolled') {
    renderBody();
    initScrollListener(); // إعادة تهيئة المستمع بعد الريندر
  }
  if (event === 'chapter-added') openModal();
});

// التهيية الأولية للمستمع
initScrollListener();

// الجسر العالمي للتوافق مع onclick في HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.applyText = applyText;
window.openDescEditor = openDescEditor;
window.addChapter = addChapter;
window.sortChapters = sortChapters;
window.renderTabs = renderTabs;
window.renderBody = renderBody;
window.setChapterVisibility = setChapterVisibility;
window.setRequiredPlan = setRequiredPlan;

export default {
  openModal,
  closeModal,
  applyText,
  openDescEditor,
  addChapter,
  renderTabs,
  renderBody,
  sortChapters,
  setChapterVisibility,
  setRequiredPlan
};
