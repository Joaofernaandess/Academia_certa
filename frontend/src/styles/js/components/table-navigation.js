const TABLE_SELECTOR = '[data-zf-table-keynav], .zf-table-keynav';
const ROW_SELECTOR = 'tbody tr:not([data-zf-table-disabled="true"])';
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [contenteditable="true"], [role="button"]';
const MODAL_SELECTOR = 'dialog[open], .modal-overlay, .message-overlay';

const getTable = (element) => element?.closest?.(TABLE_SELECTOR);
const getRow = (element) => {
  const row = element?.closest?.(ROW_SELECTOR);
  return row && getTable(row) ? row : null;
};

const isVisibleModal = (modal) => {
  if (modal.matches('dialog[open]')) return true;

  const style = window.getComputedStyle(modal);
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && style.opacity !== '0'
    && modal.isConnected;
};

const getVisibleModals = () => Array.from(document.querySelectorAll(MODAL_SELECTOR)).filter(isVisibleModal);
const hasOpenModal = () => getVisibleModals().length > 0;

const focusOpenModal = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const modals = getVisibleModals();
      const modal = modals[modals.length - 1];
      if (!modal) return;

      const focusTarget = modal.querySelector(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      focusTarget?.focus?.({ preventScroll: true });
    });
  });
};

const getRows = (table) => Array.from(table?.querySelectorAll?.(ROW_SELECTOR) || [])
  .filter(row => row.cells.length > 0 && !row.querySelector('td[colspan]'));

const clearOtherActiveRows = (activeTable) => {
  document.querySelectorAll(TABLE_SELECTOR).forEach(table => {
    if (table === activeTable) return;

    getRows(table).forEach(row => {
      row.classList.remove('zf-table-row-active');
      row.tabIndex = 0;
    });
  });
};

const dispatchTableAction = (row, action) => {
  const actionButton = row.querySelector(`[data-zf-table-${action}]`);

  if (actionButton) {
    actionButton.click();
    focusOpenModal();
    return;
  }

  row.dispatchEvent(new CustomEvent(`zenite:table-${action}`, {
    bubbles: true,
    detail: {
      row,
      table: getTable(row),
      id: row.dataset.zfTableRowId || null
    }
  }));
  focusOpenModal();
};

const dispatchTableCreate = (row) => {
  const section = row.closest('.order-table-section');
  const createButton = section?.querySelector?.('[data-zf-table-create], .order-table-section-action-button');

  if (createButton) {
    createButton.click();
    focusOpenModal();
    return;
  }

  row.dispatchEvent(new CustomEvent('zenite:table-create', {
    bubbles: true,
    detail: {
      row,
      table: getTable(row),
      id: row.dataset.zfTableRowId || null
    }
  }));
  focusOpenModal();
};

const setActiveRow = (row) => {
  const table = getTable(row);
  if (!table) return;

  clearOtherActiveRows(table);

  getRows(table).forEach(item => {
    item.classList.toggle('zf-table-row-active', item === row);
    item.tabIndex = item === row ? 0 : -1;
  });
};

const clearActiveRow = (table) => {
  getRows(table).forEach(row => {
    row.classList.remove('zf-table-row-active');
    row.tabIndex = 0;
  });
};

const focusRow = (row) => {
  if (!row) return;
  setActiveRow(row);
  row.focus({ preventScroll: true });
  row.scrollIntoView({ block: 'nearest', inline: 'nearest' });
};

const moveRow = (row, offset) => {
  const table = getTable(row);
  const rows = getRows(table);
  const currentIndex = rows.indexOf(row);
  const nextIndex = Math.max(0, Math.min(rows.length - 1, currentIndex + offset));
  focusRow(rows[nextIndex]);
};

const scrollTable = (row, offset) => {
  const tableContainer = row.closest('.table-container');
  if (tableContainer) {
    tableContainer.scrollLeft += offset;
  }
};

const prepareTable = (table) => {
  const rows = getRows(table);
  if (rows.length === 0) return;

  const activeRow = rows.find(row => row.classList.contains('zf-table-row-active')) || rows[0];
  rows.forEach(row => {
    row.tabIndex = row === activeRow ? 0 : -1;
  });
};

const prepareTables = (root = document) => {
  if (root.matches?.(TABLE_SELECTOR)) {
    prepareTable(root);
  }

  root.querySelectorAll?.(TABLE_SELECTOR).forEach(prepareTable);
};

document.addEventListener('focusin', (event) => {
  const row = getRow(event.target);
  if (row) setActiveRow(row);
});

document.addEventListener('pointerdown', (event) => {
  const row = getRow(event.target);
  if (row) setActiveRow(row);
}, true);

document.addEventListener('click', (event) => {
  const row = getRow(event.target);
  if (row && !event.target.closest(INTERACTIVE_SELECTOR)) {
    focusRow(row);
  }
});

document.addEventListener('contextmenu', (event) => {
  const row = getRow(event.target);
  if (!row || event.target.closest(INTERACTIVE_SELECTOR)) return;

  event.preventDefault();
  focusRow(row);
  dispatchTableAction(row, 'edit');
});

document.addEventListener('keydown', (event) => {
  if (hasOpenModal()) return;

  const row = getRow(event.target);
  if (!row) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveRow(row, 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveRow(row, -1);
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollTable(row, -120);
    return;
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    scrollTable(row, 120);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    focusRow(getRows(getTable(row))[0]);
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const rows = getRows(getTable(row));
    focusRow(rows[rows.length - 1]);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    dispatchTableAction(row, 'edit');
    return;
  }

  if (event.key === 'Delete') {
    event.preventDefault();
    dispatchTableAction(row, 'delete');
    return;
  }

  if (event.key === 'Insert') {
    event.preventDefault();
    dispatchTableCreate(row);
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    clearActiveRow(getTable(row));
    row.blur();
  }
});

document.addEventListener('DOMContentLoaded', () => prepareTables());

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        prepareTables(node);
      }
    });
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });
