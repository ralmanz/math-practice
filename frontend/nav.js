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
    '  font-weight: 400; font-size: 1.2rem;',
    '  color: var(--text, #111827); text-decoration: none;',
    '  letter-spacing: -0.03em; flex-shrink: 0;',
    '}',
    '#nav-root .nav-logo .logo-math { color: #1D9E75; font-weight: 700; }',
    '#nav-root .nav-right { display: flex; align-items: center; gap: 20px; }',
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
    '  background: #1D9E75; color: #fff; border-radius: 8px;',
    '  font-size: 0.9rem; font-weight: 600; text-decoration: none;',
    '  transition: background 0.15s; white-space: nowrap;',
    '}',
    '#nav-root .nav-practicar:hover { background: #178A64; }',
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

    var logoHref, rightHtml;

    if (isTeacher) {
      logoHref = 'index.html';
      rightHtml =
        '<a href="teacher.html" class="nav-teacher-link">Panel del maestro</a>' +
        '<a href="#" class="nav-ghost" id="nav-signout-btn">Cerrar sesi\u00f3n</a>' +
        '<span id="nav-student-name" style="display:none;" aria-hidden="true"></span>';
    } else if (isStudent) {
      var firstName = getStudentFirstName();
      logoHref = 'home.html';
      rightHtml =
        '<span class="nav-student" id="nav-student-name">' + firstName + '</span>' +
        '<a href="#" class="nav-ghost" id="nav-signout-btn">Cerrar sesi\u00f3n</a>';
    } else {
      logoHref = 'index.html';
      rightHtml =
        '<a href="login.html" class="nav-signin">Iniciar sesi\u00f3n</a>' +
        '<a href="filter.html" class="nav-practicar">Practicar</a>';
    }

    root.innerHTML =
      '<nav>' +
      '<div class="nav-inner">' +
      '<a href="' + logoHref + '" class="nav-logo">Nuvo <span class="logo-math">Math</span></a>' +
      '<div class="nav-right">' + rightHtml + '</div>' +
      '</div>' +
      '</nav>';

    var btn = document.getElementById('nav-signout-btn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isTeacher) {
          localStorage.removeItem('nuvo_teacher');
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
