const initializedSidebars = new WeakSet();
const initializedSidebarCheckboxes = new WeakSet();

function syncSidebarScrollLock() {
  const hasOpenSidebar = Array.from(document.querySelectorAll('.sidebar-checkbox'))
    .some((checkbox) => checkbox.checked);

  document.documentElement.classList.toggle('sidebar-scroll-locked', hasOpenSidebar);
  document.body.classList.toggle('sidebar-scroll-locked', hasOpenSidebar);
}

function getSidebarCheckbox(sidebar) {
  const targetId = sidebar.getAttribute('data-sidebar-target');
  if (targetId) return document.getElementById(targetId);

  const shell = sidebar.closest('.app-shell') || document;
  return shell.querySelector('.sidebar-checkbox') || document.getElementById('menu-toggle');
}

function closeSidebar(sidebar, checkbox) {
  sidebar.style.removeProperty('transform');
  sidebar.classList.remove('sidebar-dragging');
  if (checkbox) checkbox.checked = false;
  syncSidebarScrollLock();
}

function enhanceSidebar(sidebar) {
  if (initializedSidebars.has(sidebar)) return;

  const checkbox = getSidebarCheckbox(sidebar);
  if (!checkbox) return;

  initializedSidebars.add(sidebar);

  if (!initializedSidebarCheckboxes.has(checkbox)) {
    initializedSidebarCheckboxes.add(checkbox);
    checkbox.addEventListener('change', syncSidebarScrollLock);
    syncSidebarScrollLock();
  }

  if (!sidebar.querySelector('.sidebar-close-icon')) {
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'sidebar-close-icon';
    closeButton.setAttribute('aria-label', 'Fechar menu');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => closeSidebar(sidebar, checkbox));
    sidebar.prepend(closeButton);
  }

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  sidebar.addEventListener('touchstart', (event) => {
    if (!checkbox.checked || event.touches.length !== 1) return;

    startX = event.touches[0].clientX;
    currentX = startX;
    dragging = true;
    sidebar.classList.add('sidebar-dragging');
  }, { passive: true });

  sidebar.addEventListener('touchmove', (event) => {
    if (!dragging) return;

    currentX = event.touches[0].clientX;
    const deltaX = Math.min(0, currentX - startX);

    if (deltaX < 0) {
      sidebar.style.transform = `translateX(${deltaX}px)`;
    }
  }, { passive: true });

  sidebar.addEventListener('touchend', () => {
    if (!dragging) return;

    dragging = false;
    const draggedDistance = startX - currentX;
    const closeDistance = Math.min(sidebar.offsetWidth * 0.35, 120);

    if (draggedDistance >= closeDistance) {
      closeSidebar(sidebar, checkbox);
      return;
    }

    sidebar.style.removeProperty('transform');
    sidebar.classList.remove('sidebar-dragging');
  });

  sidebar.addEventListener('touchcancel', () => {
    dragging = false;
    sidebar.style.removeProperty('transform');
    sidebar.classList.remove('sidebar-dragging');
  });
}

function initSidebars() {
  document.querySelectorAll('.sidebar').forEach(enhanceSidebar);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebars);
} else {
  initSidebars();
}

const observer = new MutationObserver(initSidebars);
observer.observe(document.documentElement, { childList: true, subtree: true });