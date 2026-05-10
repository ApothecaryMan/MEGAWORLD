// Main Logic & Core Functionality

setInterval(save, 2000);

function renderTabs() {
  const bar = document.getElementById('tabsBar');
  const side = document.getElementById('sideList');
  if (!bar) return;
  bar.innerHTML = '';
  if (side) side.innerHTML = '';

  // Ensure we are using the latest data from the active novel
  if (novels[activeNovelIdx]) {
    chapters = novels[activeNovelIdx].chapters;
    activeIdx = novels[activeNovelIdx].activeChapterIdx;
  }

  chapters.forEach((ch, i) => {
    // Top Tabs
    const t = document.createElement('button');
    t.className = 'tab' + (i === activeIdx ? ' active' : '');
    t.textContent = ch.title || ('فصل ' + (i + 1));
    t.draggable = true;
    t.onclick = () => goTo(i);
    
    // تعديل الاسم بالضغط مرتين
    t.ondblclick = () => {
      const input = document.createElement('input');
      input.className = 'inline-edit-input';
      input.value = t.textContent.replace('×', '').trim();
      t.textContent = '';
      t.appendChild(input);
      input.focus();
      input.onblur = () => {
        if (input.value.trim()) {
          chapters[i].title = input.value.trim();
          renderTabs();
          save();
        } else {
          renderTabs();
        }
      };
      input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    };

    t.addEventListener('dragstart', e => { dragSrcIdx = i; t.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    t.addEventListener('dragend', () => document.querySelectorAll('.tab').forEach(x => x.classList.remove('dragging', 'drag-over')));
    t.addEventListener('dragover', e => { e.preventDefault(); t.classList.add('drag-over'); });
    t.addEventListener('dragleave', () => t.classList.remove('drag-over'));
    t.addEventListener('drop', e => {
      e.preventDefault(); t.classList.remove('drag-over');
      if (dragSrcIdx === null || dragSrcIdx === i) return;
      const moved = chapters.splice(dragSrcIdx, 1)[0];
      chapters.splice(i, 0, moved);
      activeIdx = i;
      if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = i;
      dragSrcIdx = null;
      renderTabs(); renderBody(); save();
    });
    
    const cl = document.createElement('button');
    cl.className = 'tab-close'; cl.textContent = '×'; cl.title = 'حذف';
    cl.onclick = (e) => { 
      e.stopPropagation(); 
      if (chapters.length === 1) { 
        chapters[0].content = ''; 
        chapters[0].title = 'فصل 1'; 
      } else { 
        chapters.splice(i, 1); 
        if (activeIdx >= chapters.length) activeIdx = chapters.length - 1; 
      } 
      if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = activeIdx;
      renderTabs(); renderBody(); save(); 
    };
    t.appendChild(cl);
    bar.appendChild(t);

    // Sidebar Item
    if (side) {
      const s = document.createElement('button');
      s.className = 'side-item' + (i === activeIdx ? ' active' : '');
      s.textContent = ch.title || ('فصل ' + (i + 1));
      s.onclick = () => goTo(i);
      
      // تعديل اسم الفصل في القائمة الجانبية بالضغط مرتين
      s.ondblclick = () => {
        const input = document.createElement('input');
        input.className = 'inline-edit-input';
        input.value = s.textContent;
        s.textContent = '';
        s.appendChild(input);
        input.focus();
        input.onblur = () => {
          if (input.value.trim()) {
            chapters[i].title = input.value.trim();
            renderTabs();
            save();
          } else {
            renderTabs();
          }
        };
        input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
      };
      
      side.appendChild(s);
    }
  });

  const add = document.createElement('button');
  add.className = 'tab-add'; add.textContent = '+'; add.title = 'فصل جديد';
  add.onclick = addChapter;
  bar.appendChild(add);
}

function renderBody() {
  const wrap = document.getElementById('bodyWrap');
  if (!wrap) return;
  
  if (novels[activeNovelIdx]) {
    chapters = novels[activeNovelIdx].chapters;
    activeIdx = novels[activeNovelIdx].activeChapterIdx;
  }
  
  const ch = chapters[activeIdx];
  if (!ch) { wrap.innerHTML = ''; return; }
  
  if (!ch.content) {
    wrap.innerHTML = `<div class="paste-zone" id="pasteZone" role="button">
        <i class="ti ti-clipboard-text" aria-hidden="true"></i>
        <div class="paste-title">انقر للصق نص الفصل</div>
        <div class="paste-sub">أو اسحب النص وأفلته هنا</div>
      </div>`;
    const z = document.getElementById('pasteZone');
    if (z) {
      z.onclick = () => { if (typeof openModal === 'function') openModal(); };
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('drag'); });
      z.addEventListener('dragleave', () => z.classList.remove('drag'));
      z.addEventListener('drop', e => {
        e.preventDefault(); z.classList.remove('drag');
        const text = e.dataTransfer.getData('text');
        if (text) {
          const ta = document.getElementById('ta');
          if (ta) ta.value = text;
          if (typeof applyText === 'function') applyText();
        }
      });
    }
    if (typeof stats === 'function') stats('');
  } else {
    if (continuousMode) {
      let full = '';
      chapters.forEach((c, i) => {
        if (!c.content) return;
        full += `
        <h2 id="ch-title-${i}" class="chapter-text ch-marker ${font} ${align}" data-index="${i}" style="font-size:${sz}px; font-weight:bold; margin-top:2rem; margin-bottom:16px;">${escHtml(c.title)}</h2>
        <div class="chapter-text ${font} ${align}" style="font-size:${sz}px;">
        ${escHtml(c.content)}
        </div>
        <div class="orn" style="margin-top:3rem; margin-bottom:3rem;"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>
        `;
      });
      wrap.innerHTML = full;
      if (typeof stats === 'function') stats(chapters[activeIdx].content);
    } else {
      wrap.innerHTML = `
      ${activeIdx !== 0 ? '<div class="orn"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>' : ''}
      <h2 id="ch-title-${activeIdx}" class="chapter-text ch-marker ${font} ${align}" data-index="${activeIdx}" style="font-size:${sz}px; font-weight:bold; margin-bottom:16px;">${escHtml(ch.title)}</h2>
      <div class="chapter-text ${font} ${align}" id="chapterText" style="font-size:${sz}px;">${escHtml(ch.content)}</div>
      <div class="orn" style="margin-top:2rem;"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>`;
      if (typeof stats === 'function') stats(ch.content);
    }
  }

  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const info = document.getElementById('navInfo');
  if (prev) prev.disabled = activeIdx === 0;
  if (next) next.disabled = activeIdx === chapters.length - 1;
  if (info) info.textContent = (activeIdx + 1) + ' / ' + chapters.length;
}

function escHtml(t) {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addChapter() {
  chapters.push({ title: 'فصل ' + (chapters.length + 1), content: '' });
  activeIdx = chapters.length - 1;
  if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = activeIdx;
  renderTabs(); renderBody();
  window.scrollTo({ top: 0 });
  if (typeof openModal === 'function') openModal();
  save();
}

function goTo(i) {
  if (i < 0 || i >= chapters.length) return;
  activeIdx = i;
  if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = i;

  if (continuousMode) {
    const target = document.getElementById(`ch-title-${i}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateActiveUI();
    } else {
      renderTabs(); renderBody();
    }
  } else {
    renderTabs(); renderBody();
  }
  save();
}

function updateActiveUI() {
  document.querySelectorAll('.tab').forEach((t, idx) => {
    t.classList.toggle('active', idx === activeIdx);
  });
  document.querySelectorAll('.side-item').forEach((s, idx) => {
    s.classList.toggle('active', idx === activeIdx);
  });
  const info = document.getElementById('navInfo');
  if (info) info.textContent = (activeIdx + 1) + ' / ' + chapters.length;
}

function deleteChapter() {
  if (chapters.length === 1) { chapters[0].content = ''; chapters[0].title = 'فصل 1'; }
  else { chapters.splice(activeIdx, 1); if (activeIdx >= chapters.length) activeIdx = chapters.length - 1; }
  if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = activeIdx;
  renderTabs(); renderBody(); save();
}

function doSearch(q) {
  const el = document.getElementById('chapterText');
  if (!el) return;
  const txt = chapters[activeIdx].content;
  if (!txt) return;
  if (!q) {
    el.innerHTML = escHtml(txt);
    return;
  }
  try {
    const rg = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    el.innerHTML = escHtml(txt).replace(rg, m => `<mark>${m}</mark>`);
  } catch (e) { }
}

function searchInChapter() {
  const input = document.getElementById('sq');
  if (input) input.focus();
}

function exportTxt() {
  const ch = chapters[activeIdx];
  const blob = new Blob([ch.content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (ch.title || 'chapter') + '.txt';
  a.click();
}

function toggleFocus() {
  document.body.classList.toggle('focus-mode');
}

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

  if (continuousMode) {
    const markers = document.querySelectorAll('.ch-marker');
    let currentIdx = activeIdx;
    for (let m of markers) {
      const rect = m.getBoundingClientRect();
      if (rect.top <= 120) {
        currentIdx = parseInt(m.getAttribute('data-index'));
      } else {
        break;
      }
    }
    if (!isNaN(currentIdx) && activeIdx !== currentIdx) {
      activeIdx = currentIdx;
      if (novels[activeNovelIdx]) novels[activeNovelIdx].activeChapterIdx = activeIdx;
      updateActiveUI();
      if (typeof stats === 'function') stats(chapters[activeIdx].content);
    }
  }
});

window.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'ArrowLeft') goTo(activeIdx + 1);
  if (e.ctrlKey && e.key === 'ArrowRight') goTo(activeIdx - 1);
  if (e.ctrlKey && e.key === 'f') { e.preventDefault(); searchInChapter(); }
  if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
    document.body.classList.remove('focus-mode');
  }
});

// Initialization
window.onload = () => {
  if (typeof load === 'function') load();
  
  if (novels.length === 0) {
    novels = [{ title: 'رواية جديدة', chapters: [{ title: 'فصل 1', content: '' }], activeChapterIdx: 0 }];
  }
  
  syncStateFromActiveNovel();
  
  if (typeof buildSwatches === 'function') buildSwatches();
  if (typeof applyGlobalUI === 'function') applyGlobalUI();
  if (typeof applySidebarState === 'function') applySidebarState();
  if (typeof renderLibrary === 'function') renderLibrary();
  
  renderTabs();
  renderBody();
};
