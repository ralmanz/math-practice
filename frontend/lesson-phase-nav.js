/* ── Shared lesson section nav (Intro → Práctica) ───────────────────────── */
(function () {
  'use strict';

  var PHASE_COUNT = 4;
  var LABEL_KEYS = ['', 'phase_intro', 'phase_concepts', 'phase_example', 'phase_practice'];

  var CSS = [
    '.lesson-page {',
    '  width: 100%; max-width: 600px; margin: 0 auto;',
    '  padding: 0 16px 48px; box-sizing: border-box; flex-shrink: 0;',
    '}',
    '.lesson-page #practice-screen { margin-top: 0; }',
    '.lesson-topnav { display: none; }',
    '.lesson-page .lesson-topnav,',
    '.lesson-page .lesson-phase-shell,',
    '.lesson-page .lesson-phase-nav {',
    '  position: static; top: auto; z-index: auto;',
    '}',
    '.lesson-page .lesson-phase-shell {',
    '  width: 100%; max-width: none; margin: 0 0 12px; padding: 8px 0 0;',
    '  box-sizing: border-box; flex-shrink: 0; position: static; top: auto;',
    '}',
    '.lesson-phase-shell {',
    '  width: 100%; margin: 0 0 12px; padding: 8px 0 0;',
    '  box-sizing: border-box; flex-shrink: 0; position: static; top: auto;',
    '}',
    /* Fixed 4-column bar — no horizontal scroll */
    '.lesson-phase-nav {',
    '  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));',
    '  gap: 4px; width: 100%; margin-bottom: 0; overflow: visible;',
    '}',
    '.lesson-phase-step {',
    '  display: flex; flex-direction: column; align-items: center; justify-content: center;',
    '  gap: 3px; min-width: 0; width: 100%;',
    '  padding: 7px 2px; border: 1.5px solid var(--border, #E8E8E4);',
    '  border-radius: 10px; background: #fff; font-family: inherit;',
    '  cursor: pointer; text-decoration: none; color: inherit; text-align: center;',
    '  transition: border-color 0.15s, background 0.15s, color 0.15s;',
    '}',
    'a.lesson-phase-step:hover, button.lesson-phase-step:hover {',
    '  border-color: var(--accent, #2D6A4F); background: var(--accent-bg, #F0FAF3);',
    '}',
    '.lesson-phase-step.is-current {',
    '  border-color: var(--accent, #2D6A4F); background: var(--accent-bg, #F0FAF3);',
    '}',
    '.lesson-phase-step.is-done:not(.is-current) {',
    '  border-color: #D1FAE5; background: #F0FDF4;',
    '}',
    '.lesson-phase-num {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0;',
    '  font-size: 0.68rem; font-weight: 800; line-height: 1;',
    '  background: var(--border, #E8E8E4); color: var(--text-secondary, #6B6B6B);',
    '}',
    '.lesson-phase-step.is-current .lesson-phase-num,',
    '.lesson-phase-step.is-done .lesson-phase-num {',
    '  background: var(--accent, #2D6A4F); color: #fff;',
    '}',
    '.lesson-phase-label {',
    '  font-size: 0.68rem; font-weight: 600;',
    '  color: var(--text-secondary, #6B6B6B); line-height: 1.15;',
    '  max-width: 100%; overflow: hidden; text-overflow: ellipsis;',
    '  white-space: nowrap;',
    '}',
    '.lesson-phase-step.is-current .lesson-phase-label {',
    '  color: var(--accent-dark, var(--accent, #2D6A4F));',
    '}',
  ].join('\n');

  function injectStyles() {
    var existing = document.getElementById('lesson-phase-nav-css');
    if (existing) {
      existing.textContent = CSS;
      return;
    }
    var s = document.createElement('style');
    s.id = 'lesson-phase-nav-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function label(key) {
    if (typeof Lang !== 'undefined' && Lang.t) {
      var t = Lang.t(key);
      if (t && t !== key) return t;
    }
    return key;
  }

  function buildHtml(current, opts) {
    var esc = opts.escHtml || function (s) {
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };
    var steps = [];
    var i;
    for (i = 1; i <= PHASE_COUNT; i++) {
      var isCurrent = i === current;
      var isDone = i < current;
      var cls = 'lesson-phase-step';
      if (isCurrent) cls += ' is-current';
      if (isDone) cls += ' is-done';
      var stepLabel = label(LABEL_KEYS[i]);
      var inner =
        '<span class="lesson-phase-num">' + i + '</span>' +
        '<span class="lesson-phase-label">' + esc(stepLabel) + '</span>';
      var href = opts.href ? opts.href(i) : null;
      var aria = ' aria-label="' + esc(stepLabel) + '"';
      if (href && !isCurrent) {
        steps.push(
          '<a class="' + cls + '" href="' + href + '" data-lesson-phase="' + i + '"' + aria + '>' + inner + '</a>'
        );
      } else {
        steps.push(
          '<button type="button" class="' + cls + '" data-lesson-phase="' + i + '"' +
          (isCurrent ? ' aria-current="step"' : '') + aria + '>' + inner + '</button>'
        );
      }
    }
    return (
      '<nav class="lesson-phase-nav" aria-label="' +
      esc(label('lesson_phase_nav_aria')) +
      '">' +
      steps.join('') +
      '</nav>'
    );
  }

  function bind(root, onNavigate) {
    if (!root) return;
    root._lessonPhaseOnNavigate = onNavigate;
    if (root.dataset.phaseNavBound) return;
    root.dataset.phaseNavBound = '1';
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-lesson-phase]');
      if (!el || el.tagName === 'A') return;
      e.preventDefault();
      var n = Number(el.getAttribute('data-lesson-phase'));
      if (root._lessonPhaseOnNavigate) root._lessonPhaseOnNavigate(n);
    });
  }

  function render(root, opts) {
    if (!root) return;
    injectStyles();
    opts = opts || {};
    var current = Math.min(Math.max(opts.current || 1, 1), PHASE_COUNT);
    root.innerHTML = buildHtml(current, opts);
    bind(root, opts.onNavigate);
  }

  window.LessonPhaseNav = {
    PHASE_COUNT: PHASE_COUNT,
    PHASE_SLUGS: ['', 'cover', 'concepts', 'example', 'practice'],
    injectStyles: injectStyles,
    render: render,
    buildHtml: buildHtml,
  };
}());
