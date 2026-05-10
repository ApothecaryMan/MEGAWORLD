let continuousMode = false;

function toggleContinuousMode() {
  continuousMode = !continuousMode;
  const btn = document.getElementById('contBtn');
  if (btn) btn.classList.toggle('on', continuousMode);
  renderBody();
}

let font = 'fn', sz = 22, align = 'ar', activeIdx = 0;
let chapters = [];
let dragSrcIdx = null;
let sidebarVisible = true;

const palettes = [
  { cls: 'bg-def', s: '#e8e6e0', bg: 'var(--color-background-primary)', fg: 'var(--color-text-primary)' },
  { cls: 'bg-ivory', s: '#fdf6e3', bg: '#fdf6e3', fg: '#3b3020' },
  { cls: 'bg-pink', s: '#fde8e8', bg: '#fdf0f0', fg: '#3a1e1e' },
  { cls: 'bg-mint', s: '#d1fae5', bg: '#f0fdf5', fg: '#1a3326' },
  { cls: 'bg-sky', s: '#dbeafe', bg: '#eff6ff', fg: '#1e2f4a' },
  { cls: 'bg-gray', s: '#f4f4f2', bg: '#f4f4f2', fg: '#2a2a2a' },
  { cls: 'bg-night', s: '#1a1a2e', bg: '#1a1a2e', fg: '#e0d8c8' },
  { cls: 'bg-dark', s: '#212121', bg: '#212121', fg: '#d4c9b0' },
];
let activePalette = palettes[0];

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

setInterval(save, 2000);

function buildSwatches() {
  const c = document.getElementById('swatches');
  if (!c) return;
  c.innerHTML = '';
  palettes.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (p.cls === activePalette.cls ? ' on' : '');
    b.title = p.cls;
    b.style.background = p.s;
    b.onclick = () => setBg(p, b);
    c.appendChild(b);
  });
}

function setBg(p, btn) {
  activePalette = p;
  const r = document.getElementById('root');
  palettes.forEach(q => r.classList.remove(q.cls));
  r.classList.add(p.cls);
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
  btn.classList.add('on');
  save();
}

function applyGlobalUI() {
  const r = document.getElementById('root');
  if (!r) return;
  palettes.forEach(q => r.classList.remove(q.cls));
  r.classList.add(activePalette.cls);
  document.getElementById('szlbl').textContent = sz;
  ['f1', 'f2', 'f3'].forEach(x => {
    const el = document.getElementById(x);
    if (el) el.classList.remove('on');
  });
  const fi = { fn: 'f1', fn2: 'f2', fn3: 'f3' }[font];
  if (fi) {
    const el = document.getElementById(fi);
    if (el) el.classList.add('on');
  }
  ['ar', 'ac', 'aj'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('on', align === id);
  });

  const contBtn = document.getElementById('contBtn');
  if (contBtn) contBtn.classList.toggle('on', continuousMode);
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('on', s.title === activePalette.cls);
  });
}

function setFont(f, id) { font = f; applyGlobalUI(); renderBody(); save(); }
function chSz(d) { sz = Math.min(36, Math.max(14, sz + d)); document.getElementById('szlbl').textContent = sz; renderBody(); save(); }
function setAl(a, id) { align = a; applyGlobalUI(); renderBody(); save(); }

function stats(text) {
  const w = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const ch = text.replace(/\s/g, '').length;
  const m = Math.max(1, Math.round(w / 200));

  const shortNum = (n) => {
    if (n >= 1000) return (n / 1000).toLocaleString('ar-EG', { maximumFractionDigits: 1 }) + ' <small style="font-size:0.8em; opacity:0.8;">ألف</small>';
    return n.toLocaleString('ar-EG');
  };

  document.getElementById('wc').innerHTML = shortNum(w);
  document.getElementById('cc').innerHTML = shortNum(ch);

  const rtEl = document.getElementById('rt');
  const rtLbl = document.getElementById('rt-lbl');

  if (m === 1) {
    rtEl.textContent = '';
    rtLbl.textContent = 'دقيقة واحدة';
  } else if (m === 2) {
    rtEl.textContent = '';
    rtLbl.textContent = 'دقيقتان';
  } else {
    rtEl.textContent = m.toLocaleString('ar-EG');
    rtLbl.textContent = (m >= 3 && m <= 10) ? 'دقائق' : 'دقيقة';
  }
}

function renderTabs() {
  const bar = document.getElementById('tabsBar');
  const side = document.getElementById('sideList');
  if (!bar) return;
  bar.innerHTML = '';
  if (side) side.innerHTML = '';

  chapters.forEach((ch, i) => {
    // Top Tabs
    const t = document.createElement('button');
    t.className = 'tab' + (i === activeIdx ? ' active' : '');
    t.textContent = ch.title || ('فصل ' + (i + 1));
    t.draggable = true;
    t.onclick = () => goTo(i);
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
      dragSrcIdx = null;
      renderTabs(); renderBody(); save();
    });
    const cl = document.createElement('button');
    cl.className = 'tab-close'; cl.textContent = '×'; cl.title = 'حذف';
    cl.onclick = (e) => { e.stopPropagation(); if (chapters.length === 1) { chapters[0].content = ''; chapters[0].title = 'فصل 1'; } else { chapters.splice(i, 1); if (activeIdx >= chapters.length) activeIdx = chapters.length - 1; } renderTabs(); renderBody(); save(); };
    t.appendChild(cl);
    bar.appendChild(t);

    // Sidebar Item
    if (side) {
      const s = document.createElement('button');
      s.className = 'side-item' + (i === activeIdx ? ' active' : '');
      s.textContent = ch.title || ('فصل ' + (i + 1));
      s.onclick = () => goTo(i);
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
  const ch = chapters[activeIdx];
  if (!ch) { wrap.innerHTML = ''; return; }
  if (!ch.content) {
    wrap.innerHTML = `<div class="paste-zone" id="pasteZone" role="button">
        <i class="ti ti-clipboard-text" aria-hidden="true"></i>
        <div class="paste-title">انقر للصق نص الفصل</div>
        <div class="paste-sub">أو اسحب النص وأفلته هنا</div>
      </div>`;
    document.getElementById('pasteZone').onclick = openModal;
    const z = document.getElementById('pasteZone');
    z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('drag'); });
    z.addEventListener('dragleave', () => z.classList.remove('drag'));
    z.addEventListener('drop', e => {
      e.preventDefault(); z.classList.remove('drag');
      const text = e.dataTransfer.getData('text');
      if (text) { document.getElementById('ta').value = text; applyText(); }
    });
    stats('');
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
      stats(chapters[activeIdx].content);
    } else {
      wrap.innerHTML = `
      ${activeIdx !== 0 ? '<div class="orn"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>' : ''}
      <h2 id="ch-title-${activeIdx}" class="chapter-text ch-marker ${font} ${align}" data-index="${activeIdx}" style="font-size:${sz}px; font-weight:bold; margin-bottom:16px;">${escHtml(ch.title)}</h2>
      <div class="chapter-text ${font} ${align}" id="chapterText" style="font-size:${sz}px;">${escHtml(ch.content)}</div>
      <div class="orn" style="margin-top:2rem;"><div class="orn-line"></div><div class="orn-dot"></div><div class="orn-line"></div></div>`;
      stats(ch.content);
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
  renderTabs(); renderBody();
  window.scrollTo({ top: 0 });
  openModal();
  save();
}

function goTo(i) {
  if (i < 0 || i >= chapters.length) return;
  activeIdx = i;

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
  renderTabs(); renderBody(); save();
}

function syncModal() {
  const m = document.getElementById('modal');
  if (!m) return;
  m.style.background = activePalette.bg;
  m.style.color = activePalette.fg;
  const els = m.querySelectorAll('.ta,.btn,.modal-title,.modal-title-input');
  els.forEach(el => { el.style.color = activePalette.fg; });
  document.getElementById('ta').style.background = 'rgba(128,128,128,0.08)';
  document.getElementById('titleInput').style.borderBottomColor = 'rgba(128,128,128,.3)';
}

function openModal() {
  const ch = chapters[activeIdx];
  document.getElementById('titleInput').value = ch ? ch.title : '';
  document.getElementById('ta').value = ch ? ch.content : '';
  document.getElementById('modalBg').classList.add('open');
  syncModal();
  setTimeout(() => document.getElementById('ta').focus(), 80);
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
}

function applyText() {
  try {
    const text = document.getElementById('ta').value.trim();
    const title = document.getElementById('titleInput').value.trim();
    if (!chapters[activeIdx]) return;
    chapters[activeIdx].content = text;
    if (title) chapters[activeIdx].title = title;
    renderTabs();
    renderBody();
    save();
  } catch (e) {
    console.error('applyText error', e);
  } finally {
    closeModal();
  }
}

document.getElementById('modalBg').addEventListener('click', e => {
  if (e.target === document.getElementById('modalBg')) closeModal();
});

document.getElementById('ta').addEventListener('input', () => {
  if (!chapters[activeIdx]) return;
  chapters[activeIdx].content = document.getElementById('ta').value;
  save();
});

document.getElementById('titleInput').addEventListener('input', () => {
  if (!chapters[activeIdx]) return;
  chapters[activeIdx].title = document.getElementById('titleInput').value;
  renderTabs();
  save();
});

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
      updateActiveUI();
      stats(chapters[activeIdx].content);
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

const contextMenu = document.getElementById('contextMenu');

function showContextMenu(e) {
  e.preventDefault();
  const menu = document.getElementById('contextMenu');
  menu.classList.add('show');
  let x = e.clientX;
  let y = e.clientY;
  const menuWidth = menu.offsetWidth;
  if (x - menuWidth < 0) menu.style.left = x + 'px';
  else menu.style.left = (x - menuWidth) + 'px';
  menu.style.top = y + 'px';
  syncContextTheme();
}

document.addEventListener('contextmenu', showContextMenu);
document.addEventListener('click', () => contextMenu.classList.remove('show'));

function syncContextTheme() {
  const root = document.getElementById('root');
  if (!root) return;
  const bg = getComputedStyle(root).backgroundColor;
  const fg = getComputedStyle(root).color;
  contextMenu.style.background = bg;
  contextMenu.style.color = fg;
}

function setThemeQuick(cls) {
  const palette = palettes.find(p => p.cls === cls);
  if (!palette) return;
  activePalette = palette;
  const r = document.getElementById('root');
  palettes.forEach(q => r.classList.remove(q.cls));
  r.classList.add(palette.cls);
  document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s.title === palette.cls));
  save();
}

// Initialization
load();
if (chapters.length === 0) chapters = [{ title: 'فصل 1', content: '' }];
if (activeIdx >= chapters.length) activeIdx = 0;
buildSwatches();
applyGlobalUI();
applySidebarState();
renderTabs();
renderBody();
