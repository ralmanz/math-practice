/* ── Nuvo shared nav ─────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CSS = [
    '#nav-root { font-family: "DM Sans", "Inter", sans-serif; }',
    '#nav-root nav {',
    '  position: sticky; top: 0; z-index: 200;',
    '  background: rgba(255,255,255,0.96);',
    '  backdrop-filter: blur(8px);',
    '  -webkit-backdrop-filter: blur(8px);',
    '  border-bottom: 1px solid var(--border, #E5E7EB);',
    '}',
    '#nav-root .nav-inner {',
    '  max-width: 1100px; margin: 0 auto;',
    '  padding: 0 24px; height: 64px;',
    '  display: flex; align-items: center;',
    '  justify-content: space-between; gap: 16px;',
    '}',
    '#nav-root .nav-logo {',
    '  font-weight: 800; font-size: 1.2rem;',
    '  color: var(--text, #111827); text-decoration: none;',
    '  letter-spacing: -0.03em; flex-shrink: 0;',
    '}',
    '#nav-root .nav-logo span { color: #2D6A4F; }',
    '#nav-root .nav-right { display: flex; align-items: center; gap: 20px; }',
    '#nav-root .nav-student {',
    '  font-size: 0.88rem; font-weight: 600;',
    '  color: var(--text-mid, #374151);',
    '}',
    '#nav-root .nav-signout {',
    '  font-size: 0.88rem; font-weight: 500;',
    '  color: var(--text-muted, #6B7280); text-decoration: none;',
    '  transition: color 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-signout:hover { color: var(--text, #111827); }',
    '#nav-root .nav-signin {',
    '  text-decoration: none; color: var(--text-mid, #374151);',
    '  font-size: 0.9rem; font-weight: 500;',
    '  transition: color 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-signin:hover { color: var(--text, #111827); }',
    '#nav-root .nav-teacher-link {',
    '  text-decoration: none; color: var(--text-mid, #374151);',
    '  font-size: 0.9rem; font-weight: 600;',
    '  transition: color 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-teacher-link:hover { color: var(--text, #111827); }',
    '#nav-root .nav-get-started {',
    '  display: inline-block; padding: 8px 18px;',
    '  background: #2563EB; color: #fff; border-radius: 8px;',
    '  font-size: 0.9rem; font-weight: 600; text-decoration: none;',
    '  transition: background 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-get-started:hover { background: #1E40AF; }',
    '@media (max-width: 640px) {',
    '  #nav-root .nav-student { display: none; }',
    '  #nav-root .nav-teacher-link { display: none; }',
    '}',
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('nuvo-nav-css')) return;
    var s = document.createElement('style');
    s.id = 'nuvo-nav-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function initNav() {
    var root = document.getElementById('nav-root');
    if (!root) return;
    injectStyles();

    var isTeacher = localStorage.getItem('nuvo_teacher') === 'true';
    var studentId = localStorage.getItem('studentId');

    var rightHtml;
    if (isTeacher) {
      // hidden span keeps home.html's getElementById('nav-student-name') safe
      rightHtml =
        '<a href="teacher.html" class="nav-teacher-link">Panel de maestro</a>' +
        '<a href="#" class="nav-signout" id="nav-signout-btn">Cerrar sesi\u00f3n</a>' +
        '<span id="nav-student-name" style="display:none;" aria-hidden="true"></span>';
    } else if (studentId) {
      rightHtml =
        '<span class="nav-student" id="nav-student-name"></span>' +
        '<a href="#" class="nav-signout" id="nav-signout-btn">Cerrar sesi\u00f3n</a>';
    } else {
      var getStartedLabel =
        typeof window !== 'undefined' && window.Lang
          ? window.Lang.t('nav_get_started')
          : 'Practicar';
      rightHtml =
        '<a href="login.html" class="nav-signin">Iniciar sesi\u00f3n</a>' +
        '<a href="filter.html" class="nav-get-started">' +
        getStartedLabel +
        '</a>';
    }

    root.innerHTML =
      '<nav>' +
      '<div class="nav-inner">' +
      '<a href="index.html" class="nav-logo">Nuvo <span>Math</span></a>' +
      '<div class="nav-right">' + rightHtml + '</div>' +
      '</div>' +
      '</nav>';

    var btn = document.getElementById('nav-signout-btn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('studentId');
        localStorage.removeItem('nuvo_teacher');
        window.location.href = 'index.html';
      });
    }
  }

  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }

  window.initNav = initNav;
}());
