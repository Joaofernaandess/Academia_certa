import './components/combobox.js';
import './components/modal.js';
import './components/sidebar.js';
import './components/table-navigation.js';
import './components/floating-action-menu.js';
import './components/theme.js';
import './components/validation.js';

const scrollTimers = new WeakMap();

const ativarScrollbarTemporaria = (event) => {
  const target =
    event.target === document || event.target === window
      ? document.documentElement
      : event.target;

  if (!target || !target.classList) return;

  target.classList.add('is-scrolling');

  const timerAnterior = scrollTimers.get(target);
  if (timerAnterior) clearTimeout(timerAnterior);

  const novoTimer = setTimeout(() => {
    target.classList.remove('is-scrolling');
    scrollTimers.delete(target);
  }, 750);

  scrollTimers.set(target, novoTimer);
};

window.addEventListener('scroll', ativarScrollbarTemporaria, {
  capture: true,
  passive: true
});