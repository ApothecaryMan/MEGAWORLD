const contextMenu = document.getElementById('contextMenu');

function showContextMenu(e) {
  e.preventDefault();
  const menu = document.getElementById('contextMenu');
  if (!menu) return;
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
document.addEventListener('click', () => {
  const menu = document.getElementById('contextMenu');
  if (menu) menu.classList.remove('show');
});

function syncContextTheme() {
  const root = document.getElementById('root');
  const menu = document.getElementById('contextMenu');
  if (!root || !menu) return;
  const bg = getComputedStyle(root).backgroundColor;
  const fg = getComputedStyle(root).color;
  menu.style.background = bg;
  menu.style.color = fg;
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
