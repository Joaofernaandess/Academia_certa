const DEFAULT_OPTIONS = {
  footerSelector: '.detail-action-bar',
  margin: 8,
  menuHeight: 170,
  minWidth: 192,
  maxWidth: 240
};

const getViewportSize = () => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight
});

const getFooterLimit = (footerSelector, viewportHeight) => {
  const footer = footerSelector ? document.querySelector(footerSelector) : null;
  const footerTop = footer?.getBoundingClientRect().top;

  return footerTop && footerTop > 0
    ? Math.min(viewportHeight, footerTop)
    : viewportHeight;
};

export function getFloatingActionMenuPosition(trigger, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const rect = trigger?.getBoundingClientRect();
  const viewport = getViewportSize();
  const footerLimit = getFooterLimit(config.footerSelector, viewport.height);
  const menuWidth = Math.min(config.maxWidth, Math.max(config.minWidth, viewport.width - (config.margin * 4)));
  const spaceBelow = rect ? footerLimit - rect.bottom - config.margin : 0;
  const spaceAbove = rect ? rect.top - config.margin : 0;
  const direction = spaceBelow >= config.menuHeight || spaceBelow >= spaceAbove ? 'down' : 'up';
  const top = rect
    ? direction === 'down'
      ? rect.bottom + config.margin
      : Math.max(config.margin, rect.top - config.menuHeight - config.margin)
    : 0;
  const left = rect
    ? Math.min(Math.max(config.margin, rect.right - menuWidth), viewport.width - menuWidth - config.margin)
    : 0;
  const arrowOffset = rect
    ? Math.min(Math.max(18, rect.left + (rect.width / 2) - left), menuWidth - 18)
    : menuWidth - 28;

  return {
    direction,
    top,
    left,
    width: menuWidth,
    arrowOffset
  };
}

export function applyFloatingActionMenuPosition(position, target = document.documentElement) {
  if (!position || !target) return;

  target.style.setProperty('--zf-floating-menu-top', `${position.top}px`);
  target.style.setProperty('--zf-floating-menu-left', `${position.left}px`);
  target.style.setProperty('--zf-floating-menu-width', `${position.width}px`);
  target.style.setProperty('--zf-floating-menu-arrow-left', `${position.arrowOffset}px`);
}

export function openFloatingActionMenu(trigger, options = {}) {
  const position = getFloatingActionMenuPosition(trigger, options);
  applyFloatingActionMenuPosition(position);
  return position;
}

export function getFloatingComboboxPosition(trigger, options = {}) {
  const config = {
    margin: 12,
    maxHeight: 250,
    minHeight: 120,
    offset: 5,
    ...options
  };
  const rect = trigger?.getBoundingClientRect();
  const viewport = getViewportSize();
  const viewportOffsetTop = window.visualViewport?.offsetTop || 0;
  const viewportOffsetLeft = window.visualViewport?.offsetLeft || 0;
  const viewportBottom = viewportOffsetTop + viewport.height;
  const spaceBelow = rect ? viewportBottom - rect.bottom - config.margin : config.maxHeight;
  const spaceAbove = rect ? rect.top + viewportOffsetTop - config.margin : 0;
  const opensUp = rect && spaceBelow < config.minHeight && spaceAbove > spaceBelow;
  const availableHeight = Math.max(config.minHeight, opensUp ? spaceAbove : spaceBelow);
  const maxHeight = Math.min(config.maxHeight, availableHeight);

  return {
    top: rect && !opensUp ? rect.bottom + viewportOffsetTop + config.offset : 'auto',
    bottom: rect && opensUp ? window.innerHeight - (rect.top + viewportOffsetTop) + config.offset : 'auto',
    left: rect ? rect.left + viewportOffsetLeft : 0,
    width: rect ? rect.width : 0,
    maxHeight,
    direction: opensUp ? 'up' : 'down'
  };
}

export function applyFloatingComboboxPosition(position, target = document.documentElement) {
  if (!position || !target) return;

  target.style.setProperty('--zf-combobox-portal-top', typeof position.top === 'number' ? `${position.top}px` : position.top);
  target.style.setProperty('--zf-combobox-portal-bottom', typeof position.bottom === 'number' ? `${position.bottom}px` : position.bottom);
  target.style.setProperty('--zf-combobox-portal-left', `${position.left}px`);
  target.style.setProperty('--zf-combobox-portal-width', `${position.width}px`);
  target.style.setProperty('--zf-combobox-portal-max-height', `${position.maxHeight}px`);
}

export function openFloatingCombobox(trigger, options = {}) {
  const position = getFloatingComboboxPosition(trigger, options);
  applyFloatingComboboxPosition(position);
  return position;
}

export function getDatePickerPopoverPosition(trigger, options = {}) {
  const config = {
    margin: 12,
    popoverHeight: 330,
    minWidth: 340,
    footerSelector: '.detail-action-bar',
    ...options
  };
  const rect = trigger?.getBoundingClientRect();
  const viewport = getViewportSize();
  const viewportTop = 0;
  const viewportBottom = viewport.height;
  const footerTop = config.footerSelector
    ? document.querySelector(config.footerSelector)?.getBoundingClientRect().top
    : null;
  const lowerBoundary = Math.min(
    viewportBottom,
    footerTop && footerTop > 0 ? footerTop : viewportBottom
  ) - config.margin;
  const upperBoundary = viewportTop + config.margin;
  const availableWidth = Math.max(0, viewport.width - (config.margin * 2));
  const width = viewport.width <= 599
    ? Math.min(320, availableWidth)
    : rect
      ? Math.min(Math.max(rect.width, config.minWidth), availableWidth)
      : Math.min(config.minWidth, availableWidth);

  if (viewport.width <= 599) {
    const scrollArea = trigger?.closest?.('.order-table-scroll, .detail-card-body, .detail-view')
      || document.querySelector('.order-table-scroll, .detail-card-body, .detail-view');
    const scrollRect = scrollArea?.getBoundingClientRect();
    const mobileWidth = Math.min(320, viewport.width - (config.margin * 2));
    const left = (viewport.width - mobileWidth) / 2;
    const footerLimit = footerTop && footerTop > 0 ? footerTop : viewport.height;
    const areaTop = Math.max(config.margin, scrollRect?.top ?? config.margin);
    const areaBottom = Math.min(footerLimit - config.margin, scrollRect?.bottom ?? footerLimit - config.margin);
    const top = Math.max(areaTop, Math.min(
      (areaTop + areaBottom - config.popoverHeight) / 2,
      areaBottom - config.popoverHeight
    ));

    return {
      top,
      left,
      width: mobileWidth,
      maxHeight: config.popoverHeight,
      direction: 'center'
    };
  }

  const left = rect
    ? Math.min(
      Math.max(rect.left, config.margin),
      viewport.width - width - config.margin
    )
    : config.margin;
  const triggerTop = rect ? rect.top : upperBoundary;
  const triggerBottom = rect ? rect.bottom : upperBoundary;
  const spaceBelow = rect ? lowerBoundary - triggerBottom - config.margin : 0;
  const spaceAbove = rect ? triggerTop - upperBoundary - config.margin : 0;
  const openAbove = rect && spaceBelow < config.popoverHeight && spaceAbove > spaceBelow;
  const preferredTop = rect
    ? openAbove
      ? triggerTop - config.popoverHeight - config.margin
      : triggerBottom + config.margin
    : upperBoundary;
  const maxTop = Math.max(upperBoundary, lowerBoundary - config.popoverHeight);
  const top = Math.min(Math.max(preferredTop, upperBoundary), maxTop);
  const maxHeight = Math.max(160, lowerBoundary - top);

  return {
    top,
    left,
    width,
    maxHeight,
    direction: openAbove ? 'up' : 'down'
  };
}

export function applyDatePickerPopoverPosition(position, target = document.documentElement) {
  if (!position || !target) return;

  target.style.setProperty('--zf-datepicker-portal-top', `${position.top}px`);
  target.style.setProperty('--zf-datepicker-portal-left', `${position.left}px`);
  target.style.setProperty('--zf-datepicker-portal-width', `${position.width}px`);
  target.style.setProperty('--zf-datepicker-portal-max-height', `${position.maxHeight}px`);
}

export function openDatePickerPopover(trigger, options = {}) {
  const position = getDatePickerPopoverPosition(trigger, options);
  applyDatePickerPopoverPosition(position);
  return position;
}

const applyDatePickerPopoverPositioning = popover => {
  if (!popover || window.matchMedia('(min-width: 600px)').matches) return;

  const root = popover.closest('.date-picker-root');
  if (!root) return;

  const position = getDatePickerPopoverPosition(root);
  const rootRect = root.getBoundingClientRect();
  const localPosition = {
    ...position,
    top: position.top - rootRect.top,
    left: position.left - rootRect.left
  };

  popover.classList.add('date-picker-popover-contained');
  popover.classList.remove('date-picker-popover-top');
  applyDatePickerPopoverPosition(localPosition, popover);
};

const bindDatePickerPopoverPositioning = () => {
  const positionOpenPopovers = () => {
    document.querySelectorAll('.date-picker-popover:not(.date-picker-popover-contained)').forEach(applyDatePickerPopoverPositioning);
  };

  const observer = new MutationObserver(positionOpenPopovers);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    const actionButton = event.target.closest?.('.date-picker-action-button');
    if (!actionButton) return;

    requestAnimationFrame(() => {
      const popover = actionButton.closest('.date-picker-root')?.querySelector('.date-picker-popover');
      applyDatePickerPopoverPositioning(popover);
    });
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('.date-picker-popover-contained').forEach(popover => {
      popover.classList.remove('date-picker-popover-contained');
      applyDatePickerPopoverPositioning(popover);
    });
  });
};

export function getCalendarTooltipPosition(trigger, options = {}) {
  const config = {
    margin: 8,
    offset: 10,
    minWidth: 96,
    maxWidth: 208,
    mobileMaxWidth: 160,
    ...options
  };
  const rect = trigger?.getBoundingClientRect();
  const tooltip = trigger?.querySelector?.('.calendar-floating-tooltip-local');
  const viewport = getViewportSize();
  const viewportOffsetTop = window.visualViewport?.offsetTop || 0;
  const viewportOffsetLeft = window.visualViewport?.offsetLeft || 0;
  const textLength = tooltip?.textContent?.trim().length || 0;
  const maxWidth = viewport.width <= 480 ? config.mobileMaxWidth : config.maxWidth;
  const naturalWidth = Math.max(config.minWidth, Math.min(maxWidth, (textLength * 6.8) + 32));
  const width = Math.min(naturalWidth, viewport.width - (config.margin * 2));

  if (!rect) {
    return {
      top: viewportOffsetTop + config.margin,
      left: viewportOffsetLeft + config.margin,
      width,
      arrowLeft: width / 2
    };
  }

  const dayCenter = rect.left + viewportOffsetLeft + (rect.width / 2);
  const left = Math.min(
    Math.max(viewportOffsetLeft + config.margin, dayCenter - (width / 2)),
    viewportOffsetLeft + viewport.width - width - config.margin
  );
  const arrowLeft = Math.min(Math.max(14, dayCenter - left), width - 14);

  return {
    top: rect.top + viewportOffsetTop - config.offset,
    left,
    width,
    arrowLeft
  };
}

export function applyCalendarTooltipPosition(position, target = document.documentElement) {
  if (!position || !target) return;

  target.style.setProperty('--zf-calendar-tooltip-top', `${position.top}px`);
  target.style.setProperty('--zf-calendar-tooltip-left', `${position.left}px`);
  target.style.setProperty('--zf-calendar-tooltip-width', `${position.width}px`);
  target.style.setProperty('--zf-calendar-tooltip-arrow-left', `${position.arrowLeft}px`);
}

export function openCalendarTooltip(trigger, options = {}) {
  const position = getCalendarTooltipPosition(trigger, options);
  applyCalendarTooltipPosition(position);
  return position;
}

const bindCalendarTooltipPositioning = () => {
  document.addEventListener('pointerover', event => {
    const day = event.target.closest?.('.calendar-day');
    if (!day?.querySelector?.('.calendar-floating-tooltip-local')) return;

    openCalendarTooltip(day);
  });

  document.addEventListener('focusin', event => {
    const day = event.target.closest?.('.calendar-day');
    if (!day?.querySelector?.('.calendar-floating-tooltip-local')) return;

    openCalendarTooltip(day);
  });
};

bindCalendarTooltipPositioning();
bindDatePickerPopoverPositioning();

window.ZeniteUI = {
  ...(window.ZeniteUI || {}),
  getFloatingActionMenuPosition,
  applyFloatingActionMenuPosition,
  openFloatingActionMenu,
  getFloatingComboboxPosition,
  applyFloatingComboboxPosition,
  openFloatingCombobox,
  getDatePickerPopoverPosition,
  applyDatePickerPopoverPosition,
  openDatePickerPopover,
  applyDatePickerPopoverPositioning,
  getCalendarTooltipPosition,
  applyCalendarTooltipPosition,
  openCalendarTooltip
};
