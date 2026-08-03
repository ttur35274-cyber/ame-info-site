/* ============================================================
   масс-эксперт.рф — Тёмная тема (как на ms-expert.ru)
   Класс: html.theme-dark  |  localStorage: mass-expert-theme
   Кнопка переключения — ВНУТРИ гамбургер-меню (popup 867),
   как пункт меню, по стилю ms-expert.ru.
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

  // Кнопка-переключатель ВНУТРИ гамбургер-меню (Elementor popup 867) —
  // добавляется как последний пункт меню, в стиле ms-expert.ru
  function createToggleButton() {
    if (document.querySelector('.ame-theme-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ame-theme-toggle';
    btn.setAttribute('aria-label', 'Переключить тему');
    btn.title = 'Переключить тему';
    btn.innerHTML = '<i class="fas fa-moon"></i><span class="ame-theme-toggle-label">Тёмная тема</span>';
    btn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.contains('theme-dark');
      var next = isDark ? 'light' : 'dark';
      setSavedTheme(next);
      applyTheme(next);
    });

    // Ищем контейнер меню попапа 867 (бургер-меню)
    var menuWrap = document.querySelector('.elementor-867 .elementor-widget-wrap') ||
                   document.querySelector('.elementor-location-popup .elementor-widget-wrap') ||
                   document.querySelector('.elementor-popup-modal .elementor-widget-wrap');
    if (menuWrap) {
      menuWrap.appendChild(btn);
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
