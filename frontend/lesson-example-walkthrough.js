/* Converts lesson.example { start, steps[] } → walkthrough board step arrays (lesson.html). */
(function (global) {
  'use strict';

  var DEFAULT_PAUSE = { write: 2000, calc: 2000, prob: 2200, theory: 2000 };

  function wtStep(fields) {
    return {
      audio: null,
      note: null,
      railLabel: '',
      pause: DEFAULT_PAUSE.write,
      col: 'calc',
      type: 'write',
      html: '',
      ...fields,
    };
  }

  function probHtml(expr, final) {
    var e = String(expr || '').trim();
    if (!e) return '';
    var inner = e.indexOf('<') >= 0 ? e : '<span class="hl">' + escapeHtml(e) + '</span>';
    return final ? inner + ' <span class="hl">✓</span>' : inner;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function calcHtmlForStep(s) {
    if (s.visual) return String(s.visual);
    if (s.equation) return '<div class="calc-line">' + escapeHtml(s.equation) + '</div>';
    if (s.annotation) return '<div class="calc-line">' + escapeHtml(s.annotation) + '</div>';
    return '';
  }

  /**
   * @param {{ start?: string, narration_intro?: string, steps?: Array }} ex
   * @returns {Array<object>}
   */
  function exampleStepsToWalkthrough(ex) {
    if (!ex || !Array.isArray(ex.steps) || !ex.steps.length) return [];

    var steps = ex.steps;
    var out = [];
    var intro = String(ex.narration_intro || '').trim();

    if (intro) {
      out.push(
        wtStep({
          col: 'theory',
          pause: DEFAULT_PAUSE.theory,
          railLabel: 'Ejemplo resuelto',
          note: { type: 'rule', label: 'Observa', content: intro, diagram: [], active: null },
        })
      );
    }

    var start = String(ex.start || '').trim();
    if (start) {
      out.push(
        wtStep({
          col: 'prob',
          html: probHtml(start, false),
          pause: DEFAULT_PAUSE.prob,
          railLabel: 'El problema',
        })
      );
    }

    for (var i = 0; i < steps.length; i++) {
      var s = steps[i] || {};
      var annotation = String(s.annotation || '').trim();
      var narration = String(s.narration || '').trim();
      var equation = String(s.equation || '').trim();
      var isLast = i === steps.length - 1;
      var calcBody = calcHtmlForStep(s);

      if (calcBody) {
        out.push(
          wtStep({
            col: 'calc',
            html: calcBody,
            pause: DEFAULT_PAUSE.calc,
            railLabel: annotation || 'Paso ' + (i + 1),
            note:
              narration && narration !== annotation
                ? { type: 'rule', label: annotation || 'Paso', content: narration, diagram: [], active: null }
                : null,
          })
        );
      } else if (narration) {
        out.push(
          wtStep({
            col: 'calc',
            html: '<div class="calc-line">' + escapeHtml(narration) + '</div>',
            pause: DEFAULT_PAUSE.calc,
            railLabel: annotation || 'Paso ' + (i + 1),
            note: null,
          })
        );
      }

      if (equation) {
        out.push(
          wtStep({
            col: 'prob',
            html: probHtml(equation, isLast),
            final: isLast,
            pause: isLast ? 0 : DEFAULT_PAUSE.prob,
            railLabel: isLast ? 'Resultado' : 'Paso ' + (i + 1),
          })
        );
      }
    }

    return out;
  }

  global.exampleStepsToWalkthrough = exampleStepsToWalkthrough;
})(typeof window !== 'undefined' ? window : global);
