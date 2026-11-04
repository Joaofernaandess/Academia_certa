const THEME_COLOR = {
  dark: '#D4AF37',
  light: '#0A1F44'
};

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function ensureThemeColorMeta() {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');

  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }

  return metaThemeColor;
}

function updateThemeColor() {
  ensureThemeColorMeta().setAttribute('content', THEME_COLOR[getCurrentTheme()]);
}

updateThemeColor();

const themeObserver = new MutationObserver(updateThemeColor);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});

document.addEventListener('themechange', updateThemeColor);

document.addEventListener('DOMContentLoaded', () => {
  updateThemeColor();

  const themeSwitch = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');

  if (themeSwitch) {
    themeSwitch.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.removeAttribute('data-theme');
        if (themeLabel) themeLabel.textContent = "Modo Escuro Ativado";
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeLabel) themeLabel.textContent = "Modo Claro Ativado";
      }
    });
  }
});
