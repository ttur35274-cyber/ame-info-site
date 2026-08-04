/* ============================================================
   масс-эксперт.рф — Тёмная тема (как на ms-expert.ru)
   Класс: html.theme-dark  |  localStorage: mass-expert-theme
   Кнопки «Тёмная тема» / «Светлая тема» — ВНУТРИ гамбургер-меню
   (popup 867), как пункты меню, по стилю ms-expert.ru.

   ВАЖНО: клики обрабатываются ЧЕРЕЗ ДЕЛЕГИРОВАНИЕ на document.
   Elementor при открытии попапа пересоздаёт DOM-кнопки из своего
   шаблона (клон без обработчиков), поэтому слушатели вешаются
   на document один раз — и работают даже после пересоздания.
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
    updateButtonsState(theme === 'dark');
  }

  function updateButtonsState(isDark) {
    var darkBtn = document.querySelector('.ame-theme-toggle-dark');
    var lightBtn = document.querySelector('.ame-theme-toggle-light');
    if (darkBtn) {
      darkBtn.classList.toggle('active', !!isDark);
    }
    if (lightBtn) {
      lightBtn.classList.toggle('active', !isDark);
    }
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

  // ДЕЛЕГИРОВАНИЕ: один слушатель на document ловит клики по кнопкам темы.
  // Работает даже если Elementor пересоздал кнопки (клон без обработчиков).
  function setupDelegatedClicks() {
    document.addEventListener('click', function (e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.classList && target.classList.contains('ame-theme-toggle-dark')) {
          setSavedTheme('dark');
          applyTheme('dark');
          return;
        }
        if (target.classList && target.classList.contains('ame-theme-toggle-light')) {
          setSavedTheme('light');
          applyTheme('light');
          return;
        }
        target = target.parentElement;
      }
    });
  }

  function makeButton(cls, icon, label, theme) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ame-theme-toggle ' + cls;
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.setAttribute('data-theme', theme);
    btn.innerHTML = '<i class="' + icon + '"></i><span class="ame-theme-toggle-label">' + label + '</span>';
    return btn;
  }

  // Две кнопки-переключателя ВНУТРИ гамбургер-меню (Elementor popup 867) —
  // как пункты меню, в стиле ms-expert.ru. Обработчики НЕ вешаем на кнопки
  // (их пересоздаёт Elementor) — работает делегирование на document.
  function createToggleButtons(container) {
    if (!container || container.querySelector('.ame-theme-toggle-dark')) return;

    container.appendChild(makeButton('ame-theme-toggle-dark', 'fas fa-moon', 'Тёмная тема', 'dark'));
    container.appendChild(makeButton('ame-theme-toggle-light', 'fas fa-sun', 'Светлая тема', 'light'));
    updateButtonsState(document.documentElement.classList.contains('theme-dark'));
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
      createToggleButtons(wrap);
    }
  }

  // Элементор монтирует попап 867 в DOM только при открытии (клик по бургеру).
  // Слушаем событие elementor/popup/show + MutationObserver, чтобы добавить
  // кнопки в меню именно в момент открытия попапа.
  function watchPopup() {
    // Событие Elementor Pro: jQuery(document).trigger('elementor/popup/show', [id, element])
    if (window.jQuery) {
      try {
        window.jQuery(document).on('elementor/popup/show', function (e, id) {
          setTimeout(ensureToggleInPopup, 100);
        });
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
      setupDelegatedClicks();
      ensureToggleInPopup();
      watchPopup();
    });
  } else {
    init();
    setupDelegatedClicks();
    ensureToggleInPopup();
    watchPopup();
  }
})();
