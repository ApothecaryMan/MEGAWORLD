/**
 * محرك القوائم المنبثقة الذكي (ContextMenu Engine)
 * مصمم ليكون خفيفاً، سريعاً، وسهل الاستدعاء في أي مكان.
 */
const ContextMenu = {
  el: document.getElementById('contextMenu'),

  /**
   * إظهار القائمة بمجموعة من الخيارات
   * @param {Event} e - حدث الضغط
   * @param {Array} items - مصفوفة من الخيارات [{ label, icon, action, danger }]
   */
  show(e, items) {
    if (!this.el) this.el = document.getElementById('contextMenu');
    if (!this.el) return;

    e.preventDefault();
    e.stopPropagation();

    this.render(items);
    this.position(e);
    this.syncTheme();
    
    this.el.classList.add('show');
    
    // إغلاق القائمة عند الضغط في أي مكان
    const close = () => {
      this.el.classList.remove('show');
      document.removeEventListener('click', close);
    };
    setTimeout(() => document.addEventListener('click', close), 10);
  },

  render(items) {
    this.el.innerHTML = '';
    items.forEach(item => {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.className = 'context-sep';
        this.el.appendChild(sep);
        return;
      }

      const btn = document.createElement('button');
      btn.className = 'list-item-flat context-item';
      if (item.danger) btn.classList.add('danger');
      
      btn.innerHTML = `
        <span>${item.label}</span>
        <i class="ti ${item.icon || 'ti-chevron-left'}"></i>
      `;
      
      btn.onclick = () => {
        if (typeof item.action === 'function') item.action();
      };
      
      this.el.appendChild(btn);
    });
  },

  position(e) {
    let x = e.clientX;
    let y = e.clientY;
    const w = 200; // عرض افتراضي
    const h = this.el.offsetHeight;

    if (x + w > window.innerWidth) x -= w;
    if (y + h > window.innerHeight) y -= h;

    this.el.style.left = x + 'px';
    this.el.style.top = y + 'px';
  },

  syncTheme() {
    const root = document.getElementById('root');
    if (!root) return;
    const style = getComputedStyle(root);
    this.el.style.background = style.backgroundColor;
    this.el.style.color = style.color;
  }
};

// الاستماع الافتراضي للقائمة العامة
document.addEventListener('contextmenu', (e) => {
  const isSpecial = e.target.closest('.list-item-flat') || e.target.closest('.tab') || e.target.closest('.sticky-bar');
  if (!isSpecial) {
    const sel = window.getSelection().toString().trim();
    if (sel.length > 0) {
      // قائمة تحديد النص (Selection Menu)
      const wordCount = sel.split(/\s+/).filter(w => w.length > 0).length;
      ContextMenu.show(e, [
        { label: 'نسخ النص', icon: 'ti-copy', action: () => navigator.clipboard.writeText(sel) },
        { label: 'البحث عن النص', icon: 'ti-search', action: () => { if (typeof doSearch === 'function') doSearch(sel); } },
        { sep: true },
        { label: `الكلمات المحددة: ${wordCount}`, icon: 'ti-text-size' },
        { label: `الحروف المحددة: ${sel.length}`, icon: 'ti-sort-a-z' }
      ]);
    } else {
      // قائمة الفصل العامة (General Menu)
      ContextMenu.show(e, [
        { label: 'تعديل الفصل الحالي', icon: 'ti-edit', action: () => { if (typeof openModal === 'function') openModal(); } },
        { label: 'إضافة فصل جديد', icon: 'ti-plus', action: () => { if (typeof addChapter === 'function') addChapter(); } },
        { sep: true },
        { label: 'تبديل وضع التركيز', icon: 'ti-maximize', action: () => document.body.classList.toggle('focus-mode') },
        { label: 'وضع التمرير المتواصل', icon: 'ti-infinity', action: () => { 
            if (Store && typeof applyGlobalUI === 'function') {
              Store.updateSettings('continuousMode', !Store.state.settings.continuousMode);
              applyGlobalUI();
              if (typeof renderBody === 'function') renderBody();
            }
          } 
        }
      ]);
    }
  }
});
