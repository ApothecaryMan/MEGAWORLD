import Store from './store.js';
import ContextMenu from './context_menu.js';
import UIHelper from './ui_helper.js';

/**
 * MEGAWORLD Tabs & Chapter List Engine
 * Handles rendering of the top tabs bar and the sidebar chapters list.
 */

let dragSrcIdx = null;

export const TabsEngine = {
  render() {
    const bar = document.getElementById('tabsBar');
    const side = document.getElementById('sideList');
    if (!bar && !side) return;

    const chapters = Store.chapters || [];
    const activeIdx = Store.activeChapterIdx;
    const sortOrder = Store.state.settings.chapterSortOrder || 'asc';
    
    // Update filter label if exists
    const filterLabel = document.getElementById('filterLabel');
    if (filterLabel) filterLabel.textContent = sortOrder === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً';

    // 1. Render Top Tabs Bar
    if (bar) {
      bar.innerHTML = '';
      chapters.forEach((ch, i) => {
        const t = document.createElement('button');
        t.className = 'tab' + (i === activeIdx ? ' active' : '');
        
        // Icon based on status
        if (ch.visibility === 'hidden') {
          const icon = document.createElement('i');
          icon.className = 'ti ti-eye-off';
          icon.style.marginRight = '4px';
          t.appendChild(icon);
        } else if (ch.is_locked) {
          const icon = document.createElement('i');
          icon.className = 'ti ti-lock';
          icon.style.marginRight = '4px';
          t.appendChild(icon);
        }

        // Truncated title
        const titleSpan = document.createElement('span');
        titleSpan.className = 'truncate';
        titleSpan.textContent = ch.title || ('فصل ' + (i + 1));
        t.appendChild(titleSpan);

        t.draggable = true;
        t.onclick = () => Store.setChapter(i);
        
        // Context Menu
        t.oncontextmenu = (e) => {
          ContextMenu.show(e, [
            { label: 'تعديل النص', icon: 'ti-edit', action: () => { Store.setChapter(i); if(window.openModal) window.openModal(); } },
            { label: 'إضافة فصل جديد', icon: 'ti-plus', action: () => Store.addChapter() },
            { sep: true },
            { label: 'حذف الفصل', icon: 'ti-trash', danger: true, action: () => Store.deleteChapter(i) }
          ]);
        };
        
        // Inline Rename
        t.ondblclick = () => {
          const input = document.createElement('input');
          input.className = 'inline-edit-input';
          input.value = titleSpan.textContent.trim();
          titleSpan.textContent = '';
          t.appendChild(input);
          input.focus();
          input.onblur = () => {
            if (input.value.trim()) {
              Store.updateChapter(i, { title: input.value.trim() });
            } else {
              this.render();
            }
          };
          input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
        };

        // Drag & Drop
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
        
        // Close button
        const cl = document.createElement('button');
        cl.className = 'tab-close'; cl.textContent = '×';
        cl.onclick = (e) => { e.stopPropagation(); Store.deleteChapter(i); };
        t.appendChild(cl);
        
        bar.appendChild(t);
      });

      // Add Chapter Button in Tabs Bar
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-icon';
      addBtn.style.margin = '0 8px';
      addBtn.innerHTML = '<i class="ti ti-plus"></i>';
      addBtn.title = 'إضافة فصل جديد';
      addBtn.onclick = () => Store.addChapter();
      bar.appendChild(addBtn);
    }

    // 2. Render Sidebar Chapter List
    if (side) {
      side.innerHTML = '';
      const displayChapters = chapters.map((ch, i) => ({ ...ch, originalIdx: i }));
      if (sortOrder === 'desc') displayChapters.reverse();

      displayChapters.forEach((ch) => {
        const i = ch.originalIdx;
        
        // Determine Icon based on status
        let icon = null;
        if (ch.visibility === 'hidden') icon = 'ti-eye-off';
        else if (ch.is_locked) icon = 'ti-lock';

        const s = UIHelper.createListItem({
          title: ch.title || ('فصل ' + (i + 1)),
          icon: icon,
          active: i === activeIdx,
          onClick: () => Store.setChapter(i),
          onContextMenu: (e) => ContextMenu.show(e, [
            { label: 'فتح الفصل', icon: 'ti-external-link', action: () => Store.setChapter(i) },
            { label: 'تعديل النص', icon: 'ti-edit', action: () => { Store.setChapter(i); if(window.openModal) window.openModal(); } },
            { sep: true },
            { label: 'حذف الفصل', icon: 'ti-trash', danger: true, action: () => Store.deleteChapter(i) }
          ])
        });
        
        side.appendChild(s);
      });

      // Scroll active items into view
      const activeTab = bar?.querySelector('.tab.active');
      if (activeTab) activeTab.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      
      const activeSide = side?.querySelector('.list-item-flat.active');
      if (activeSide) activeSide.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }
};

// Global Bridge
window.TabsEngine = TabsEngine;
window.renderTabs = () => TabsEngine.render();

export default TabsEngine;
