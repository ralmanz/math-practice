/**
 * landing-try.js — one real practice problem on the landing page (same engine checks as app.html).
 */
(function () {
  'use strict';

  var PROBLEM = {
    type: 'Simplify',
    question: 'Simplifica 4x + 3x',
    expression: '4x + 3x',
    answer: '7x',
    hints: [
      'Son términos semejantes (misma variable x).',
      'Suma los coeficientes: 4 + 3.',
      '(4 + 3)x = ?',
    ],
    hintsEn: [
      'These are like terms (same variable x).',
      'Add the coefficients: 4 + 3.',
      '(4 + 3)x = ?',
    ],
  };

  var stepHistory = [];
  var wrongCount = 0;
  var hintIndex = 0;
  var done = false;

  var els = {};

  function t(key, fallback) {
    if (typeof window.Lang !== 'undefined' && typeof window.Lang.t === 'function') {
      var v = window.Lang.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function useSpanish() {
    if (typeof window.Lang === 'undefined' || typeof window.Lang.detect !== 'function') {
      return false;
    }
    return window.Lang.detect() === 'es';
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function renderMath(text) {
    var s = escapeHtml(String(text));
    s = s.replace(/²/g, '<sup>2</sup>');
    s = s.replace(/³/g, '<sup>3</sup>');
    s = s.replace(/\^(\d+)/g, '<sup>$1</sup>');
    return s;
  }

  function getInitialWorkExpression(problem) {
    if (problem.expression != null && String(problem.expression).trim() !== '') {
      return String(problem.expression).trim();
    }
    return String(problem.question || '').trim();
  }

  function canonicalFormForCheck(expr) {
    var s = mv.normalize(expr).replace(/\s/g, '').toLowerCase();
    var prev;
    do {
      prev = s;
      s = s.replace(/\(([a-z0-9]+)\)/g, '$1');
    } while (s !== prev);
    s = s.replace(/\(([^()]+)\)/g, function (match, inner) {
      if (inner.indexOf('+') !== -1 && /^[a-z0-9+]+$/.test(inner)) {
        return '(' + inner.split('+').sort().join('+') + ')';
      }
      return match;
    });
    return s;
  }

  function checkFinalAnswer(equivInput, problem) {
    var stripped = String(equivInput).replace(/^\s*=\s*/, '');
    return mv.checkIsFinal(stripped, problem.answer, problem.type);
  }

  var mv;

  function showFeedback(type, message) {
    var fb = els.feedback;
    fb.className = 'hero-try-feedback feedback ' + type;
    fb.textContent = message;
    fb.hidden = false;
  }

  function hideFeedback() {
    els.feedback.hidden = true;
    els.feedback.className = 'hero-try-feedback feedback';
    els.feedback.textContent = '';
  }

  function addStep(bareExpr) {
    var div = document.createElement('div');
    div.className = 'hero-try-step';
    div.innerHTML =
      '<span class="hero-try-step-check" aria-hidden="true">&#10003;</span>' +
      '<span class="hero-try-step-text">' + renderMath(bareExpr) + '</span>';
    els.steps.appendChild(div);
  }

  function showHint() {
    var hints = useSpanish() ? PROBLEM.hints : PROBLEM.hintsEn;
    if (!hints.length) return;
    var text = hints[Math.min(hintIndex, hints.length - 1)];
    hintIndex++;
    els.hintText.textContent = text;
    els.hintBox.hidden = false;
  }

  function showComplete() {
    done = true;
    els.inputArea.hidden = true;
    els.hintBtn.hidden = true;
    els.complete.hidden = false;
  }

  function submitStep() {
    if (done) return;
    var bareInput = els.input.value.trim();
    if (!bareInput) return;

    els.submit.disabled = true;
    hideFeedback();

    var previousExpression = stepHistory.length > 0
      ? stepHistory[stepHistory.length - 1]
      : getInitialWorkExpression(PROBLEM);

    var equiv = mv.checkEquivalence(previousExpression, bareInput, PROBLEM.type);

    if (equiv.valid === true) {
      wrongCount = 0;
      stepHistory.push(bareInput);
      addStep(bareInput);
      hideFeedback();

      var isFinal = checkFinalAnswer(bareInput, PROBLEM);
      if (isFinal.valid === true) {
        var rawA = canonicalFormForCheck(bareInput);
        var rawB = canonicalFormForCheck(PROBLEM.answer);
        if (rawA === rawB) {
          showComplete();
          els.submit.disabled = true;
          return;
        }
        showFeedback(
          'nudge',
          t('hero_try_nudge_form', 'Correct value, but try to simplify or factor further!')
        );
        els.input.value = '';
        els.submit.disabled = false;
        return;
      }
      els.input.value = '';
      els.submit.disabled = false;
      return;
    }

    wrongCount++;
    els.input.value = '';
    if (wrongCount >= 2) {
      showHint();
      showFeedback(
        'nudge',
        t('hero_try_wrong_hint', "That step doesn't look right. Try a hint!")
      );
    } else {
      showFeedback(
        'nudge',
        t('hero_try_wrong', "That step doesn't look right. Try again!")
      );
    }
    els.submit.disabled = false;
  }

  function bind() {
    els.root = document.getElementById('hero-try');
    if (!els.root || typeof window.MathValidation === 'undefined' || typeof Algebrite === 'undefined') {
      return;
    }

    mv = window.MathValidation.create(Algebrite);

    els.question = document.getElementById('hero-try-question');
    els.work = document.getElementById('hero-try-work');
    els.steps = document.getElementById('hero-try-steps');
    els.feedback = document.getElementById('hero-try-feedback');
    els.input = document.getElementById('hero-try-input');
    els.submit = document.getElementById('hero-try-submit');
    els.hintBtn = document.getElementById('hero-try-hint-btn');
    els.hintBox = document.getElementById('hero-try-hint');
    els.hintText = document.getElementById('hero-try-hint-text');
    els.inputArea = document.getElementById('hero-try-input-area');
    els.complete = document.getElementById('hero-try-complete');

    if (els.question && !els.question.innerHTML.trim()) {
      var q = useSpanish() ? PROBLEM.question : 'Simplify 4x + 3x';
      els.question.innerHTML = renderMath(q);
    }
    els.work.innerHTML = renderMath(PROBLEM.expression);

    els.submit.addEventListener('click', submitStep);
    els.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitStep();
      }
    });
    els.hintBtn.addEventListener('click', showHint);

    requestAnimationFrame(function () {
      var wrap = els.root.closest('.hero-demo-wrap');
      if (!wrap || wrap.dataset.widthLocked) return;
      var w = Math.ceil(els.root.getBoundingClientRect().width);
      if (w > 0) {
        var px = w + 'px';
        wrap.style.minWidth = px;
        els.root.style.minWidth = px;
        wrap.dataset.widthLocked = '1';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
