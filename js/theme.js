/* ============================================================
   масс-эксперт.рф — Тёмная тема (как на ms-expert.ru)
   Класс: html.theme-dark  |  localStorage: mass-expert-theme
   ============================================================ */
(function () {
  'use strict';

  var THEME_KEY = 'mass-expert-theme';

  function applyTheme(theme) {
    var root = document.documentElement;
    root.classList.remove('theme-dark');
    if (theme === 'dark') {
      root.classList.add('theme-dark');
    }
    updateButtonIcon(theme === 'dark');
  }

  function updateButtonIcon(isDark) {
    var btns = document.querySelectorAll('.ame-theme-toggle i');
    btns.forEach(function (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) { return null; }
  }

  function setSavedTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme || 'light');
    } catch (e) {}
  }

  function init() {
    var saved = getSavedTheme();
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }

    // Слушаем системную тему, только если нет сохранённого выбора
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getSavedTheme()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // Кнопка-переключатель в шапке сайта (перед кнопкой "Связаться с нами")
  function createToggleButton() {
    if (document.querySelector('.ame-theme-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ame-theme-toggle';
    btn.setAttribute('aria-label', 'Переключить тему');
    btn.title = 'Переключить тему';
    btn.innerHTML = '<i class="fas fa-moon"></i>';
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.contains('theme-dark');
      var next = isDark ? 'light' : 'dark';
      setSavedTheme(next);
      applyTheme(next);
    });

    // Вставляем в колонку с бургером (logo-menu) — видна на всех разрешениях,
    // в отличие от nav-menu-header (скрыта на мобильных)
    var anchor = document.querySelector('.logo-menu .elementor-widget-wrap') ||
                 document.querySelector('.elementor-location-header .nav-menu-header .elementor-widget-wrap') ||
                 document.querySelector('header');
    if (anchor) {
      anchor.appendChild(btn);
    } else {
      // Fallback: fixed-кнопка в правом нижнем углу
      btn.classList.add('ame-theme-toggle-fixed');
      document.body.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      createToggleButton();
    });
  } else {
    init();
    createToggleButton();
  }
})();
