/**
 * MEGAWORLD Modal Component
 * Manages the global modal structure and basic interactions.
 */
export const Modal = {
  /**
   * Initializes and injects the modal structure into the DOM if not present.
   */
  init() {
    if (!document.getElementById('modalBg')) {
      const modal = document.createElement('div');
      modal.id = 'modalBg';
      modal.className = 'modal-bg';
      modal.innerHTML = `
        <div class="modal" id="modal">
          <div class="modal-hdr">
            <h2 id="modalTitle"></h2>
            <button class="modal-close" id="modalClose">&times;</button>
          </div>
          <div id="modalBody"></div>
          <div class="modal-btns" id="modalBtns"></div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close button logic
      document.getElementById('modalClose').onclick = () => this.close();
    }
  },

  open() {
    const el = document.getElementById('modalBg');
    if (el) el.classList.add('open');
  },

  close() {
    const el = document.getElementById('modalBg');
    if (el) {
      el.classList.remove('open');
      // Clear small class if applied
      const m = el.querySelector('.modal');
      if (m) m.classList.remove('modal-small');
    }
  }
};

window.Modal = Modal;
export default Modal;
