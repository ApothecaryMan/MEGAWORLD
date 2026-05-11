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

  showAt(x, y, items, width = 200) {
    if (!this.el) this.el = document.getElementById('contextMenu');
    if (!this.el) return;

    this.render(items);
    this.el.style.width = width + 'px';
    this.el.style.left = x + 'px';
    this.el.style.top = y + 'px';
    this.syncTheme();
    
    this.el.classList.add('show');
    
    const close = () => {
      this.el.classList.remove('show');
      document.removeEventListener('click', close);
    };
    setTimeout(() => document.addEventListener('click', close), 10);
  },

  hide() {
    if (this.el) this.el.classList.remove('show');
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
        ${item.icon ? `<i class="ti ${item.icon}"></i>` : ''}
      `;
      
      btn.onclick = () => {
        if (typeof item.action === 'function') item.action();
      };

      if (typeof item.onEnter === 'function') {
        btn.onmouseenter = item.onEnter;
      }
      if (typeof item.onLeave === 'function') {
        btn.onmouseleave = item.onLeave;
      }
      
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
// تم إلغاء القائمة العامة بناءً على طلب المستخدم لإبقاء النظام بسيطاً ومركزاً على العناصر التفاعلية فقط.
