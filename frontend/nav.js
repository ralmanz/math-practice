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
    '  width: 100%; max-width: none; margin: 0;',
    '  padding: 0 16px; height: 56px;',
    '  display: flex; align-items: center;',
    '  justify-content: space-between; gap: 12px;',
    '}',
    '#nav-root .nav-logo {',
    '  font-weight: 400; font-size: 1.2rem;',
    '  color: var(--text, #111827); text-decoration: none;',
    '  letter-spacing: -0.03em; flex-shrink: 0;',
    '}',
    '#nav-root .nav-logo .logo-math { color: #2563EB; font-weight: 700; }',
    '#nav-root .nav-right { display: flex; align-items: center; gap: 12px; position: relative; }',
    '#nav-root .nav-menu-wrap { position: relative; }',
    '#nav-root .nav-menu-btn {',
    '  display: flex; flex-direction: column; align-items: center; justify-content: center;',
    '  gap: 5px; width: 44px; height: 44px; padding: 0;',
    '  border: 1.5px solid var(--border, #E5E7EB); border-radius: 10px;',
    '  background: #fff; cursor: pointer; transition: border-color 0.15s, background 0.15s;',
    '}',
    '#nav-root .nav-menu-btn:hover { border-color: #D1D5DB; background: #F9FAFB; }',
    '#nav-root .nav-menu-btn[aria-expanded="true"] { border-color: #2563EB; background: #EFF6FF; }',
    '#nav-root .nav-menu-bar {',
    '  display: block; width: 18px; height: 2px; border-radius: 1px;',
    '  background: var(--text, #111827);',
    '}',
    '#nav-root .nav-menu-panel {',
    '  position: absolute; top: calc(100% + 8px); right: 0; min-width: 200px;',
    '  padding: 6px; background: #fff; border: 1px solid var(--border, #E5E7EB);',
    '  border-radius: 12px; box-shadow: 0 10px 30px rgba(17,24,39,0.12);',
    '  z-index: 300;',
    '}',
    '#nav-root .nav-menu-panel[hidden] { display: none; }',
    '#nav-root .nav-menu-item {',
    '  display: block; width: 100%; text-align: left;',
    '  padding: 10px 14px; border: none; border-radius: 8px;',
    '  font-size: 0.9rem; font-weight: 500; font-family: inherit;',
    '  color: var(--text, #111827); background: transparent;',
    '  text-decoration: none; cursor: pointer; transition: background 0.12s;',
    '}',
    '#nav-root .nav-menu-item:hover { background: #F3F4F6; }',
    '#nav-root .nav-menu-item--danger { color: #B91C1C; }',
    '#nav-root .nav-menu-item--danger:hover { background: #FEF2F2; }',
    '#nav-root .nav-student {',
    '  font-size: 0.88rem; font-weight: 600;',
    '  color: var(--text-mid, #374151);',
    '}',
    '#nav-root .nav-ghost {',
    '  display: inline-block;',
    '  font-size: 0.88rem; font-weight: 500;',
    '  color: var(--text-muted, #6B7280);',
    '  text-decoration: none;',
    '  padding: 7px 16px;',
    '  border-radius: 8px;',
    '  border: 1.5px solid var(--border, #E5E7EB);',
    '  background: transparent;',
    '  transition: color 0.15s, border-color 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-ghost:hover { color: var(--text, #111827); border-color: #D1D5DB; }',
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
    '#nav-root .nav-practicar {',
    '  display: inline-block; padding: 8px 18px;',
    '  background: #2563EB; color: #fff; border-radius: 8px;',
    '  font-size: 0.9rem; font-weight: 600; text-decoration: none;',
    '  transition: background 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-practicar:hover { background: #1E40AF; }',
  ].join('\n');

  function menuLabel(key, fallback) {
    if (typeof Lang !== 'undefined' && Lang.t) {
      var t = Lang.t(key);
      if (t && t !== key) return t;
    }
    return fallback;
  }

  function buildMenuPanel(isTeacher, isStudent, isGuest) {
    var accountHref = isTeacher ? 'teacher.html' : (isStudent ? 'home.html' : 'login.html');
    var accountLabel = menuLabel('nav_account', 'Account');
    var signLabel = isGuest
      ? menuLabel('nav_signin', 'Sign in')
      : menuLabel('nav_signout', 'Sign out');
    var html =
      '<a href="' + accountHref + '" class="nav-menu-item" id="nav-account-link">' + accountLabel + '</a>';
    if (isGuest) {
      html += '<a href="login.html" class="nav-menu-item">' + signLabel + '</a>';
      html +=
        '<a href="filter.html" class="nav-menu-item">' +
        menuLabel('nav_practice_guest', 'Practice') +
        '</a>';
    } else {
      html +=
        '<button type="button" class="nav-menu-item nav-menu-item--danger" id="nav-signout-btn">' +
        signLabel +
        '</button>';
    }
    return html;
  }

  function menuButtonHtml() {
    return (
      '<div class="nav-menu-wrap">' +
      '<button type="button" class="nav-menu-btn" id="nav-menu-btn" aria-label="' +
      menuLabel('nav_menu_aria', 'Menu') +
      '" aria-expanded="false" aria-haspopup="true">' +
      '<span class="nav-menu-bar"></span>' +
      '<span class="nav-menu-bar"></span>' +
      '<span class="nav-menu-bar"></span>' +
      '</button>' +
      '<div class="nav-menu-panel" id="nav-menu-panel" role="menu" hidden>' +
      '</div>' +
      '</div>'
    );
  }

  function wireMenu(panelHtml) {
    var btn = document.getElementById('nav-menu-btn');
    var panel = document.getElementById('nav-menu-panel');
    if (!btn || !panel) return;
    panel.innerHTML = panelHtml;

    function closeMenu() {
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    }

    function openMenu() {
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.hidden) openMenu();
      else closeMenu();
    });

    document.addEventListener('click', function () {
      closeMenu();
    });

    panel.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function injectStyles() {
    if (document.getElementById('nuvo-nav-css')) return;
    var s = document.createElement('style');
    s.id = 'nuvo-nav-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function getStudentFirstName() {
    var raw = localStorage.getItem('nuvo_student');
    if (!raw) return '';
    try {
      var data = JSON.parse(raw);
      var fullName = (data.name || data.id || '').trim();
      return fullName.split(' ')[0] || fullName;
    } catch (e) {
      return raw.trim().split(' ')[0] || raw.trim();
    }
  }

  function initNav() {
    var root = document.getElementById('nav-root');
    if (!root) return;
    injectStyles();

    var isTeacher  = localStorage.getItem('nuvo_teacher') === 'true';
    var nuvoStudent = localStorage.getItem('nuvo_student');
    var isStudent  = !isTeacher && !!nuvoStudent;

    var logoHref = isStudent ? 'home.html' : (isTeacher ? 'index.html' : 'index.html');
    var isGuest = !isTeacher && !isStudent;

    root.innerHTML =
      '<nav>' +
      '<div class="nav-inner">' +
      '<a href="' + logoHref + '" class="nav-logo">Nuvo <span class="logo-math">Math</span></a>' +
      '<div class="nav-right">' + menuButtonHtml() + '</div>' +
      '</div>' +
      '</nav>';

    wireMenu(buildMenuPanel(isTeacher, isStudent, isGuest));

    var signOutBtn = document.getElementById('nav-signout-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isTeacher) {
          localStorage.removeItem('nuvo_teacher');
          sessionStorage.removeItem('teacherSecret');
        } else {
          localStorage.removeItem('nuvo_student');
          localStorage.removeItem('studentId');
        }
        window.location.href = 'index.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }

  window.initNav = initNav;
}());
