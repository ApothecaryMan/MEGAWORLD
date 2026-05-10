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
