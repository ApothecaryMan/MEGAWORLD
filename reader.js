// محرك القراءة والتبويبات (Reader Engine)
function addChapter() {
  Store.addChapter();
}

function renderTabs() {
  const bar = document.getElementById('tabsBar');
  const side = document.getElementById('sideList');
  if (!bar) return;
  bar.innerHTML = '';
  if (side) side.innerHTML = '';

  const chapters = Store.chapters;
  const activeIdx = Store.activeChapterIdx;

  chapters.forEach((ch, i) => {
    // التبويبات العلوية
    const t = document.createElement('button');
    t.className = 'btn-flat tab' + (i === activeIdx ? ' active' : '');
    t.textContent = ch.title || ('فصل ' + (i + 1));
    t.draggable = true;
    t.onclick = () => Store.setChapter(i);
    
    // القائمة المنبثقة للتبويبات
    t.oncontextmenu = (e) => {
      ContextMenu.show(e, [
        { label: 'تعديل النص', icon: 'ti-edit', action: () => { Store.setChapter(i); openModal(); } },
        { label: 'إضافة فصل جديد', icon: 'ti-plus', action: () => Store.addChapter() },
        { sep: true },
        { label: 'حذف الفصل', icon: 'ti-trash', danger: true, action: () => Store.deleteChapter(i) }
      ]);
    };
    
    // التعديل بالضغط مرتين
    t.ondblclick = () => {
      const input = document.createElement('input');
      input.className = 'inline-edit-input';
      input.value = t.textContent.replace('×', '').trim();
      t.textContent = '';
      t.appendChild(input);
      input.focus();
      input.onblur = () => {
        if (input.value.trim()) {
          Store.updateChapter(i, { title: input.value.trim() });
          renderTabs();
        } else {
          renderTabs();
        }
      };
      input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    };

    // السحب والإفلات (Drag & Drop)
    t.addEventListener('dragstart', e => { dragSrcIdx = i; t.classList.add('dragging'); });
    t.addEventListener('dragover', e => { e.preventDefault(); t.classList.add('drag-over'); });
    t.addEventListener('dragleave', () => t.classList.remove('drag-over'));
    t.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrcIdx === null || dragSrcIdx === i) return;
      const chs = Store.chapters;
      const moved = chs.splice(dragSrcIdx, 1)[0];
      chs.splice(i, 0, moved);
      Store.activeNovel.activeChapterIdx = i;
      Store.save(); Store.notify();
    });
    
    const cl = document.createElement('button');
    cl.className = 'tab-close'; cl.textContent = '×';
    cl.onclick = (e) => { e.stopPropagation(); Store.deleteChapter(i); };
    t.appendChild(cl);
    bar.appendChild(t);

    // قائمة الفصول في الجنب
    if (side) {
      const s = document.createElement('button');
      s.className = 'list-item-flat' + (i === activeIdx ? ' active' : '');
      s.textContent = ch.title || ('فصل ' + (i + 1));
      s.onclick = () => Store.setChapter(i);
      s.oncontextmenu = (e) => ContextMenu.show(e, [
        { label: 'فتح الفصل', icon: 'ti-external-link', action: () => Store.setChapter(i) },
        { label: 'تعديل النص', icon: 'ti-edit', action: () => { Store.setChapter(i); openModal(); } },
        { sep: true },
        { label: 'حذف الفصل', icon: 'ti-trash', danger: true, action: () => Store.deleteChapter(i) }
      ]);
      side.appendChild(s);
    }
  });

  const add = document.createElement('button');
  add.className = 'btn-icon'; add.textContent = '+'; add.onclick = () => Store.addChapter();
  bar.appendChild(add);
}

function renderBody() {
  const wrap = document.getElementById('bodyWrap');
  if (!wrap) return;
  
  const ch = Store.chapters[Store.activeChapterIdx];
  if (!ch) { wrap.innerHTML = ''; return; }
  
  const settings = Store.state.settings;

  if (!ch.content) {
    wrap.innerHTML = `<div class="paste-zone" id="pasteZone" role="button">
        <i class="ti ti-clipboard-text" aria-hidden="true"></i>
        <div class="paste-title">انقر لصق نص الفصل</div>
        <div class="paste-sub">أو اسحب النص وأفلته هنا</div>
      </div>`;
    const z = document.getElementById('pasteZone');
    if (z) {
      z.onclick = () => openModal();
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('drag'); });
      z.addEventListener('dragleave', () => z.classList.remove('drag'));
      z.addEventListener('drop', e => {
        e.preventDefault(); z.classList.remove('drag');
        const text = e.dataTransfer.getData('text');
        if (text) {
          Store.updateChapter(Store.activeChapterIdx, { content: text });
          renderBody();
        }
      });
    }
    if (typeof stats === 'function') stats('');
  } else {
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
      if (typeof stats === 'function') stats(ch.content);
    } else {
      wrap.innerHTML = `
      <h2 id="ch-title-${Store.activeChapterIdx}" class="chapter-text ch-marker ${settings.font} ${settings.align}" data-index="${Store.activeChapterIdx}" style="font-size:${settings.sz}px; font-weight:bold;">${escHtml(ch.title)}</h2>
      <div class="chapter-text ${settings.font} ${settings.align}" id="chapterText" style="font-size:${settings.sz}px;">${escHtml(ch.content)}</div>
      <div class="orn"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>`;
      if (typeof stats === 'function') stats(ch.content);
    }
  }

  updateNavUI();
}

function updateNavUI() {
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const info = document.getElementById('navInfo');
  const activeIdx = Store.activeChapterIdx;
  const count = Store.chapters.length;

  if (prev) prev.disabled = activeIdx === 0;
  if (next) next.disabled = activeIdx === count - 1;
  if (info) info.textContent = (activeIdx + 1) + ' / ' + count;
}

function escHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function goTo(i) {
  Store.setChapter(i);
}

// التمرير الذكي (Scrolling Logic)
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = (window.scrollY / h) * 100;
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = (isFinite(p) ? p : 0) + '%';

  const tabs = document.getElementById('tabsBar');
  const current = window.scrollY;
  if (tabs) {
    if (current > lastScrollY && current > 80) tabs.classList.add('hide-tabs');
    else tabs.classList.remove('hide-tabs');
  }
  lastScrollY = current;

  if (Store.state.settings.continuousMode) {
    const markers = document.querySelectorAll('.ch-marker');
    let currentIdx = Store.activeChapterIdx;
    for (let m of markers) {
      if (m.getBoundingClientRect().top <= 120) {
        currentIdx = parseInt(m.getAttribute('data-index'));
      } else break;
    }
    if (Store.activeChapterIdx !== currentIdx) {
      Store.activeNovel.activeChapterIdx = currentIdx;
      updateActiveUI();
    }
  }
});

function updateActiveUI() {
  document.querySelectorAll('.tab').forEach((t, idx) => t.classList.toggle('active', idx === Store.activeChapterIdx));
  updateNavUI();
}

// تهيئة القارئ
Store.subscribe((event) => {
  renderTabs();
  renderBody();
  if (event === 'chapter-added') openModal();
});

window.onload = () => {
  renderTabs();
  renderBody();
  if (typeof buildSwatches === 'function') buildSwatches();
  if (typeof applyGlobalUI === 'function') applyGlobalUI();
  if (typeof applySidebarState === 'function') applySidebarState();
};
