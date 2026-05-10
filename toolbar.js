function toggleContinuousMode() {
  continuousMode = !continuousMode;
  const btn = document.getElementById('contBtn');
  if (btn) btn.classList.toggle('on', continuousMode);
  renderBody();
}

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
