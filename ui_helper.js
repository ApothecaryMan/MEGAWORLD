/**
 * MEGAWORLD UI Helper Engine
 * Centralized components generator for consistent Pure Flat UI.
 */

export const UIHelper = {
  /**
   * Creates a labeled field with a component inside.
   */
  createField({ label, component, flex = '1' }) {
    const group = document.createElement('div');
    group.className = 'flex-column';
    group.style.flex = flex;
    group.style.gap = '4px';
    
    if (label) {
      const lbl = document.createElement('label');
      lbl.style.cssText = 'font-size: 10px; opacity: 0.6; margin-bottom: 2px;';
      lbl.textContent = label;
      group.appendChild(lbl);
    }
    
    group.appendChild(component);
    return group;
  },

  /**
   * Creates a custom MEGAWORLD dropdown.
   */
  createDropdown({ id, value, items, onChange, label }) {
    const wrap = document.createElement('div');
    wrap.className = 'dropdown-wrap';
    wrap.style.width = '100%';
    if (id) wrap.id = id;

    const trigger = document.createElement('div');
    trigger.className = 'dropdown-trigger';
    trigger.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-wrap.open').forEach(d => {
        if (d !== wrap) d.classList.remove('open');
      });
      wrap.classList.toggle('open');
    };

    const labelSpan = document.createElement('span');
    labelSpan.id = id ? `${id}Label` : '';
    labelSpan.textContent = items.find(i => i.value === value)?.label || items[0]?.label || '';
    
    const icon = document.createElement('i');
    icon.className = 'ti ti-chevron-down';

    trigger.appendChild(labelSpan);
    trigger.appendChild(icon);

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    if (id) hiddenInput.id = id.replace('Dropdown', 'Input');
    hiddenInput.value = value;

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'dropdown-item';
      btn.textContent = item.label;
      btn.onclick = (e) => {
        e.stopPropagation();
        hiddenInput.value = item.value;
        labelSpan.textContent = item.label;
        wrap.classList.remove('open');
        if (onChange) onChange(item.value, item.label);
      };
      menu.appendChild(btn);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    wrap.appendChild(hiddenInput);

    if (!window._dropdownGlobalInited) {
      document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-wrap.open').forEach(d => d.classList.remove('open'));
      });
      window._dropdownGlobalInited = true;
    }

    return wrap;
  },

  /**
   * Creates a standardized list item (Novel or Chapter).
   * @param {Object} options
   */
  createListItem({ title, icon, active, onClick, onContextMenu, onEdit, isTruncated = true }) {
    const btn = document.createElement('button');
    btn.className = 'list-item-flat' + (active ? ' active' : '');
    
    let content = '';
    if (icon) content += `<i class="ti ${icon}"></i> `;
    
    const titleHtml = isTruncated ? `<span class="truncate">${title}</span>` : `<span>${title}</span>`;
    content += titleHtml;

    if (onEdit) {
      content += ` <i class="ti ti-edit side-edit-btn" title="تعديل"></i>`;
    }

    btn.innerHTML = content;
    btn.onclick = onClick;
    btn.oncontextmenu = onContextMenu;

    if (onEdit) {
      const editBtn = btn.querySelector('.side-edit-btn');
      editBtn.onclick = (e) => {
        e.stopPropagation();
        onEdit(e);
      };
    }

    return btn;
  }
};

window.UIHelper = UIHelper;
export default UIHelper;
