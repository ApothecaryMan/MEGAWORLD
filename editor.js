function syncModal() {
  const m = document.getElementById('modal');
  if (!m || !activePalette) return;
  m.style.background = activePalette.bg;
  m.style.color = activePalette.fg;
  const els = m.querySelectorAll('.ta,.btn,.modal-title,.modal-title-input');
  els.forEach(el => { el.style.color = activePalette.fg; });
  const ta = document.getElementById('ta');
  const ti = document.getElementById('titleInput');
  if (ta) ta.style.background = 'rgba(128,128,128,0.08)';
  if (ti) ti.style.borderBottomColor = 'rgba(128,128,128,.3)';
}

function openModal() {
  const ch = chapters[activeIdx];
  const ti = document.getElementById('titleInput');
  const ta = document.getElementById('ta');
  const mb = document.getElementById('modalBg');
  
  if (ti) ti.value = ch ? ch.title : '';
  if (ta) ta.value = ch ? ch.content : '';
  if (mb) mb.classList.add('open');
  
  syncModal();
  setTimeout(() => {
    if (ta) ta.focus();
  }, 80);
}

function closeModal() {
  const mb = document.getElementById('modalBg');
  if (mb) mb.classList.remove('open');
}

function applyText() {
  try {
    const ta = document.getElementById('ta');
    const ti = document.getElementById('titleInput');
    if (!ta || !ti) return;
    const text = ta.value.trim();
    const title = ti.value.trim();
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

// Event Listeners for Editor
window.addEventListener('DOMContentLoaded', () => {
  const mb = document.getElementById('modalBg');
  if (mb) mb.addEventListener('click', e => {
    if (e.target === mb) closeModal();
  });

  const ta = document.getElementById('ta');
  if (ta) ta.addEventListener('input', () => {
    if (!chapters[activeIdx]) return;
    chapters[activeIdx].content = ta.value;
    save();
  });

  const ti = document.getElementById('titleInput');
  if (ti) ti.addEventListener('input', () => {
    if (!chapters[activeIdx]) return;
    chapters[activeIdx].title = ti.value;
    if (typeof renderTabs === 'function') renderTabs();
    save();
  });
});
