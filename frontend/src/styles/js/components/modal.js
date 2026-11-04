const MODAL_SELECTOR = 'dialog[open], .modal-overlay, .message-overlay';
const CLOSE_SELECTOR = [
  '[data-zf-modal-close]',
  '[data-modal-close]',
  '.modal-close',
  '.modal-close-icon',
  '.modal-actions .button-outline',
  '.message-card .button',
  'button[aria-label*="Fechar" i]',
  'button[aria-label*="Cancelar" i]'
].join(', ');
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
const FORM_FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

const isVisibleModal = (modal) => {
  if (modal.matches('dialog[open]')) return true;

  const style = window.getComputedStyle(modal);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && modal.isConnected;
};

const getOpenModals = () => Array.from(document.querySelectorAll(MODAL_SELECTOR))
  .filter(isVisibleModal);

const closeModal = (modal) => {
  const closeButton = modal.querySelector(CLOSE_SELECTOR);

  if (closeButton) {
    closeButton.click();
    return;
  }

  if (modal.matches('dialog[open]')) {
    modal.close();
    modal.dispatchEvent(new Event('close', { bubbles: true }));
  }
};

document.addEventListener('keydown', (event) => {
  const modals = getOpenModals();
  const modal = modals[modals.length - 1];
  if (!modal) return;

  if (event.key !== 'Escape') {
    const targetInsideModal = modal.contains(event.target);
    const targetIsFormField = event.target.closest?.(FORM_FIELD_SELECTOR);

    if (SCROLL_KEYS.has(event.key) && (!targetInsideModal || !targetIsFormField)) {
      event.preventDefault();
      event.stopPropagation();
    }

    return;
  }

  event.preventDefault();
  event.stopPropagation();
  closeModal(modal);
}, true);
