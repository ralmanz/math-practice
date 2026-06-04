/**
 * landing-previews.js — three independent hero preview animations (guided, engine, tutor).
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PACE = 4 / 3;

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, Math.round(ms * PACE));
    });
  }

  function startLoop(el, phases, fullKey) {
    if (!el) return;
    if (reduce) {
      el.setAttribute('data-phase', fullKey || 'full');
      return;
    }
    (async function () {
      for (;;) {
        for (var i = 0; i < phases.length; i++) {
          el.setAttribute('data-phase', String(phases[i].phase));
          await wait(phases[i].ms);
        }
      }
    })();
  }

  startLoop(document.getElementById('hero-preview-guided'), [
    { phase: 0, ms: 1000 },
    { phase: 1, ms: 1200 },
    { phase: 2, ms: 1300 },
    { phase: 3, ms: 2200 },
    { phase: 'reset', ms: 500 },
  ]);

  startLoop(document.getElementById('hero-preview-engine'), [
    { phase: 0, ms: 750 },
    { phase: 1, ms: 1000 },
    { phase: 2, ms: 1150 },
    { phase: 3, ms: 1500 },
    { phase: 4, ms: 2200 },
    { phase: 'reset', ms: 500 },
  ]);

  startLoop(document.getElementById('hero-preview-tutor'), [
    { phase: 0, ms: 750 },
    { phase: 1, ms: 1800 },
    { phase: 'reset', ms: 500 },
  ]);
})();
