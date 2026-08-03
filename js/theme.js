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
    updateButtonIcons(theme === 'dark');
  }

  function updateButtonIcons(isDark) {
    var btns = document.querySelectorAll('.ame-theme-toggle');
    btns.forEach(function (btn) {
      var icon = btn.querySelector('i');
      var label = btn.querySelector('.ame-theme-toggle-label');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
      if (label) {
        label.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
      }
      btn.setAttribute('aria-label', isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему');
      btn.title = isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему';
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
  function createToggleButton(container) {
    if (!container || container.querySelector('.ame-theme-toggle')) return;

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

    container.appendChild(btn);
    updateButtonIcons(document.documentElement.classList.contains('theme-dark'));
  }

  // Ищем контейнер меню попапа 867 (бургер-меню) в текущем DOM
  function findPopupMenu() {
    return document.querySelector('.elementor-867 .elementor-widget-wrap') ||
           document.querySelector('#elementor-popup-modal-867 .elementor-widget-wrap') ||
           document.querySelector('.elementor-popup-modal .elementor-widget-wrap') ||
           document.querySelector('.elementor-location-popup .elementor-widget-wrap');
  }

  function ensureToggleInPopup() {
    var wrap = findPopupMenu();
    if (wrap) {
      createToggleButton(wrap);
    }
  }

  // Элементор монтирует попап 867 в DOM только при открытии (клик по бургеру).
  // Слушаем событие elementor/popup/show + MutationObserver, чтобы добавить
  // кнопку в меню именно в момент открытия попапа.
  function watchPopup() {
    // Событие Elementor Pro: jQuery(document).trigger('elementor/popup/show', [id, element])
    if (window.jQuery) {
      try {
        window.jQuery(document).on('elementor/popup/show', function (e, id) {
          if (String(id) === '867' || String(id) === '') {
            setTimeout(ensureToggleInPopup, 50);
          } else {
            setTimeout(ensureToggleInPopup, 50);
          }
        });
        window.jQuery(document).on('elementor/popup/hide', function () {});
      } catch (e) {}
    }

    // MutationObserver — надёжный запасной вариант: ловим появление попапа в DOM
    try {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node && node.nodeType === 1) {
              var html = node.outerHTML || '';
              if (html.indexOf('elementor-867') >= 0 || html.indexOf('popup-modal') >= 0 || html.indexOf('elementor-location-popup') >= 0) {
                ensureToggleInPopup();
                return;
              }
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      ensureToggleInPopup();
      watchPopup();
    });
  } else {
    init();
    ensureToggleInPopup();
    watchPopup();
  }
})();
