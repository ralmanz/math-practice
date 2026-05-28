#!/usr/bin/env node
/**
 * walkthrough-generator.js
 *
 * Builds lesson `subtopics[].walkthrough` step arrays for lesson.html's
 * renderWalkthrough() (TEORÍA · PROBLEMA · CÁLCULOS three-column board).
 *
 * ── When to use ─────────────────────────────────────────────────────────────
 * Add `subtopics: [ subtopicWithWalkthrough('Title', recipe()) ]` to a lesson.
 * Cover → Empezar then runs the board (not the tabbed "Conceptos clave" UI).
 * One strong walkthrough per level is enough; practice problems stay in app.html.
 *
 * ── In seed scripts ─────────────────────────────────────────────────────────
 *   const { linearSolveWalkthrough, subtopicWithWalkthrough } =
 *     require('./walkthrough-generator');
 *   subtopics: [
 *     subtopicWithWalkthrough('…', linearSolveWalkthrough({ … })),
 *   ],
 *
 * ── Recipes (reuse across units) ────────────────────────────────────────────
 *   papomudasWalkthrough        — order of ops (Aritmética N1)
 *   linearSolveWalkthrough      — ax + b = c (one side)
 *   linearSolveBothSidesWalkthrough — ax + b = cx + d
 * Add new recipes here as levels need them; compose with probWrite/calcQuestion if needed.
 *
 * ── Audio (optional) ─────────────────────────────────────────────────────────
 *   audioPrefix: 'paa-algebra-n2-wt' → paa-algebra-n2-wt-01.mp3, -02.mp3, …
 * Files live under frontend/audio/. Missing audio is OK — board still runs.
 *
 * ── Output step schema (for lesson.html) ────────────────────────────────────
 *   col:  'theory' | 'prob' | 'calc'
 *   type: 'write' | 'question'
 *   write:  html, pause, audio, note?, railLabel, final? (prob only)
 *   question: question, hint, answer, correct, wrong, railLabel
 *   note types: rule | diagram | legend | formula | check
 */

'use strict';

/** Post-step dwell (ms). calc: time to read the card before the next step (added after audio ends). */
const DEFAULT_PAUSE = { write: 1400, calc: 1800, prob: 2200, theory: 2000 };

function step(fields) {
  return {
    audio: null,
    note: null,
    railLabel: '',
    pause: DEFAULT_PAUSE.write,
    ...fields,
  };
}

/** Theory column: rule card with optional PAPOMUDAS-style diagram chips */
function theoryRule(opts) {
  const {
    content,
    label = 'regla',
    diagram = [],
    active = null,
    railLabel = '',
    pause = DEFAULT_PAUSE.theory,
    audio = null,
    html = '',
  } = opts;
  return step({
    col: 'theory',
    type: 'write',
    html,
    pause,
    audio,
    railLabel,
    note: { type: 'rule', label, content, diagram, active },
  });
}

/** Theory column: legend list (good for algebra “steps to isolate x”) */
function theoryLegend(opts) {
  const { label, lines, railLabel = '', pause = DEFAULT_PAUSE.theory, audio = null } = opts;
  return step({
    col: 'theory',
    type: 'write',
    html: '',
    pause,
    audio,
    railLabel,
    note: { type: 'legend', label, lines },
  });
}

/** Diagram note attached to a calc/theory write step */
function diagramNote(opts) {
  const { label, diagram, active, text } = opts;
  return { type: 'diagram', label, diagram, active, text };
}

function probWrite(opts) {
  const { html, final = false, pause, audio = null, railLabel = '' } = opts;
  return step({
    col: 'prob',
    type: 'write',
    html,
    final,
    pause: pause != null ? pause : (final ? 0 : DEFAULT_PAUSE.prob),
    audio,
    railLabel,
  });
}

function calcWrite(opts) {
  const { html, sep = false, pause = DEFAULT_PAUSE.calc, audio = null, railLabel = '', note = null } = opts;
  const body = sep ? `<div class="calc-sep"></div>${html}` : html;
  return step({
    col: 'calc',
    type: 'write',
    html: body,
    pause,
    audio,
    railLabel,
    note,
  });
}

function calcQuestion(opts) {
  const {
    question,
    hint,
    answer,
    correct,
    wrong,
    railLabel = '',
    audio = null,
    note = null,
    /** Optional HTML shown above the prompt (avoids a separate calcWrite card). */
    lead = '',
  } = opts;
  const ans = String(answer);
  const okHtml = correct || `✓ ${question.replace('¿cuánto es ', '').replace('?', '')} = <span class="hl">${ans}</span>`;
  return step({
    col: 'calc',
    type: 'question',
    question,
    hint,
    answer: ans,
    correct: okHtml,
    wrong: wrong || okHtml,
    audio,
    note,
    lead,
    railLabel,
  });
}

function hl(span, color) {
  return `<span class="${color}">${span}</span>`;
}

function calcLine(expr, color) {
  return `<div class="calc-line">${hl(expr, color)} = ?</div>`;
}

// ── Recipes (reusable across PAA units) ───────────────────────────────────────

/**
 * Aritmética N1 — order of operations walkthrough (PAPOMUDAS).
 * @param {{ audioPrefix?: string }} opts  e.g. audioPrefix: 'paa-arit-n1' → paa-arit-n1-01.mp3
 */
function papomudasWalkthrough(opts = {}) {
  const prefix = opts.audioPrefix || 'paa-arit-n1';
  const aud = (n) => `${prefix}-${String(n).padStart(2, '0')}.mp3`;
  const chips = ['P', 'A', 'M/D', 'S', 'R'];

  return [
    theoryRule({
      content: 'Orden de las Operaciones',
      diagram: chips,
      active: null,
      railLabel: 'Orden de operaciones',
      pause: 1800,
      audio: aud(1),
    }),
    probWrite({
      html: '3 + 4 × 2 − (6 ÷ 3)',
      pause: 2000,
      audio: aud(2),
      railLabel: 'El problema',
    }),
    calcWrite({
      html: calcLine('(6 ÷ 3)', 'red'),
      pause: 1800,
      audio: aud(3),
      railLabel: 'Primero: paréntesis',
      note: diagramNote({
        label: 'primero: paréntesis',
        diagram: chips,
        active: 'P',
        text: 'Paréntesis van primero: en esta expresión resuelve (6 ÷ 3).',
      }),
    }),
    calcQuestion({
      question: '¿cuánto es 6 ÷ 3?',
      hint: 'resuelve el paréntesis',
      answer: '2',
      correct: '✓ 6 ÷ 3 = <span class="hl">2</span>',
      railLabel: 'Resuelve 6 ÷ 3',
    }),
    probWrite({ html: '3 + 4 × 2 − <span class="hl">2</span>', audio: aud(4), railLabel: 'Paréntesis = 2' }),
    calcWrite({
      html: calcLine('4 × 2', 'blu'),
      audio: aud(5),
      railLabel: 'Siguiente: mult/div',
      note: diagramNote({
        label: 'siguiente: mult/div',
        diagram: chips,
        active: 'M/D',
        text: 'Multiplicación y división, de izquierda a derecha: aquí calcula 4 × 2.',
      }),
    }),
    calcQuestion({
      question: '¿cuánto es 4 × 2?',
      hint: 'multiplicación antes que suma',
      answer: '8',
      correct: '✓ 4 × 2 = <span class="hl">8</span>',
      railLabel: 'Resuelve 4 × 2',
    }),
    probWrite({ html: '3 + <span class="hl">8</span> − 2', audio: aud(6), railLabel: 'Multiplicación = 8' }),
    calcWrite({
      html: calcLine('3 + 8', 'amb'),
      audio: aud(7),
      railLabel: 'Siguiente: suma',
      note: diagramNote({
        label: 'siguiente: suma',
        diagram: chips,
        active: 'S',
        text: 'Suma de izquierda a derecha: primero 3 + 8.',
      }),
    }),
    calcQuestion({
      question: '¿cuánto es 3 + 8?',
      hint: 'suma primero',
      answer: '11',
      correct: '✓ 3 + 8 = <span class="hl">11</span>',
      railLabel: 'Resuelve 3 + 8',
    }),
    probWrite({ html: '<span class="hl">11</span> − 2', audio: aud(8), railLabel: 'Suma = 11' }),
    calcWrite({
      html: calcLine('11 − 2', 'amb'),
      pause: 1800,
      audio: null,
      railLabel: 'Último: resta',
      note: diagramNote({
        label: 'último: resta',
        diagram: chips,
        active: 'R',
        text: 'Resta al final: 11 − 2.',
      }),
    }),
    calcQuestion({
      question: '¿cuánto es 11 − 2?',
      hint: 'resta lo que queda',
      answer: '9',
      correct: '✓ 11 − 2 = <span class="hl">9</span>',
      railLabel: 'Resuelve 11 − 2',
    }),
    probWrite({
      html: '<span class="hl">= 9 ✓</span>',
      final: true,
      pause: 0,
      audio: aud(9),
      railLabel: 'Resultado = 9',
    }),
  ];
}

/**
 * Linear equation in one variable (one side) — e.g. 2x + 5 = 13.
 * Uses S / M/D diagram chips (same styles as PAPOMUDAS board).
 */
function linearSolveWalkthrough(opts = {}) {
  const {
    equation = '2x + 5 = 13',
    subtractLabel = '5',
    subtractResult = '8',
    middleEquation = null,
    divideLabel = '2',
    finalAnswer = '4',
    audioPrefix = null,
  } = opts;

  const aud = (n) => (audioPrefix ? `${audioPrefix}-${String(n).padStart(2, '0')}.mp3` : null);
  const chips = ['S', 'M/D'];

  const parts = equation.split('=').map((s) => s.trim());
  const right = parts[1] || '13';
  const middle = middleEquation || `2x = ${subtractResult}`;

  return [
    theoryLegend({
      label: 'Despejar x',
      lines: [
        { chip: 'S', text: 'Primero: resta o suma en ambos lados (operación inversa)' },
        { chip: 'M/D', text: 'Luego: divide o multiplica para dejar x sola' },
      ],
      railLabel: 'Regla',
      pause: 1800,
      audio: aud(1),
    }),
    probWrite({
      html: equation,
      pause: 2000,
      audio: aud(2),
      railLabel: 'La ecuación',
    }),
    calcWrite({
      html: `<div class="calc-line">Restar ${subtractLabel} en ambos lados</div>`,
      pause: 1800,
      audio: aud(3),
      railLabel: 'Paso 1: restar',
      note: diagramNote({
        label: 'primero: + / −',
        diagram: chips,
        active: 'S',
        text: `Quita el +${subtractLabel} restando ${subtractLabel} de ambos lados.`,
      }),
    }),
    calcQuestion({
      question: `¿cuánto es ${right} − ${subtractLabel}?`,
      hint: 'resta el número suelto del lado derecho',
      answer: subtractResult,
      correct: `✓ ${right} − ${subtractLabel} = <span class="hl">${subtractResult}</span>`,
      railLabel: `Calcula ${right} − ${subtractLabel}`,
    }),
    probWrite({
      html: middle.replace(
        String(subtractResult),
        `<span class="hl">${subtractResult}</span>`
      ),
      pause: 2600,
      audio: aud(4),
      railLabel: 'Tras restar',
    }),
    calcQuestion({
      lead: calcLine(`${middle.split('=')[0].trim()} ÷ ${divideLabel}`, 'blu'),
      question: `¿cuánto es ${subtractResult} ÷ ${divideLabel}?`,
      hint: `Divide ambos lados entre ${divideLabel} para despejar x.`,
      answer: finalAnswer,
      correct: `✓ ${subtractResult} ÷ ${divideLabel} = <span class="hl">${finalAnswer}</span>`,
      railLabel: 'Paso 2: dividir',
      audio: aud(5),
      note: diagramNote({
        label: 'luego: × / ÷',
        diagram: chips,
        active: 'M/D',
        text: `Divide ambos lados entre ${divideLabel} para despejar x.`,
      }),
    }),
    probWrite({
      html: `x = <span class="hl">${finalAnswer}</span> ✓`,
      final: true,
      pause: 0,
      audio: aud(6),
      railLabel: 'Solución',
    }),
  ];
}

/**
 * Linear equation with x on both sides — e.g. 4x − 5 = 2x + 7 → x = 6.
 */
function linearSolveBothSidesWalkthrough(opts = {}) {
  const {
    equation = '4x − 5 = 2x + 7',
    subtractVarTerm = '2x',
    afterMoveEquation = '2x − 5 = 7',
    addLabel = '5',
    afterAddEquation = '2x = 12',
    rightAfterMove = '7',
    divideLabel = '2',
    finalAnswer = '6',
    audioPrefix = null,
  } = opts;

  const aud = (n) => (audioPrefix ? `${audioPrefix}-${String(n).padStart(2, '0')}.mp3` : null);
  const chips = ['S', 'M/D'];
  const lhs = afterAddEquation.split('=')[0].trim();

  return [
    theoryLegend({
      label: 'Ecuación en ambos lados',
      lines: [
        { chip: 'S', text: 'Paso 1: lleva todos los términos con x a un lado' },
        { chip: 'S', text: 'Paso 2: lleva los números al otro lado' },
        { chip: 'M/D', text: 'Paso 3: divide entre el coeficiente de x' },
      ],
      railLabel: 'Estrategia',
      pause: 1800,
      audio: aud(1),
    }),
    probWrite({
      html: equation,
      pause: 2000,
      audio: aud(2),
      railLabel: 'La ecuación',
    }),
    calcWrite({
      html: `<div class="calc-line">Restar <span class="blu">${subtractVarTerm}</span> en ambos lados</div>`,
      pause: 1800,
      audio: aud(3),
      railLabel: 'Paso 1: mover x',
      note: diagramNote({
        label: 'mover términos con x',
        diagram: chips,
        active: 'S',
        text: `Resta ${subtractVarTerm} de ambos lados para dejar las x en un solo lado.`,
      }),
    }),
    probWrite({
      html: afterMoveEquation,
      audio: aud(4),
      railLabel: 'Tras mover x',
    }),
    calcWrite({
      html: `<div class="calc-line">Sumar ${addLabel} en ambos lados</div>`,
      sep: true,
      audio: aud(5),
      railLabel: 'Paso 2: sumar',
      note: diagramNote({
        label: 'aislar el término con x',
        diagram: chips,
        active: 'S',
        text: `Suma ${addLabel} en ambos lados para quitar el −${addLabel}.`,
      }),
    }),
    calcQuestion({
      question: `¿cuánto es ${rightAfterMove} + ${addLabel}?`,
      hint: 'suma en el lado derecho',
      answer: String(Number(rightAfterMove) + Number(addLabel)),
      correct: `✓ ${rightAfterMove} + ${addLabel} = <span class="hl">${Number(rightAfterMove) + Number(addLabel)}</span>`,
      railLabel: `Calcula ${rightAfterMove} + ${addLabel}`,
    }),
    probWrite({
      html: afterAddEquation.replace(
        String(Number(rightAfterMove) + Number(addLabel)),
        `<span class="hl">${Number(rightAfterMove) + Number(addLabel)}</span>`
      ),
      pause: 2600,
      audio: aud(6),
      railLabel: 'Tras sumar',
    }),
    calcQuestion({
      lead: calcLine(`${lhs} ÷ ${divideLabel}`, 'blu'),
      question: `¿cuánto es ${Number(rightAfterMove) + Number(addLabel)} ÷ ${divideLabel}?`,
      hint: `Divide ambos lados entre ${divideLabel} para despejar x.`,
      answer: finalAnswer,
      correct: `✓ ${Number(rightAfterMove) + Number(addLabel)} ÷ ${divideLabel} = <span class="hl">${finalAnswer}</span>`,
      railLabel: 'Paso 3: dividir',
      audio: aud(7),
      note: diagramNote({
        label: 'despejar x',
        diagram: chips,
        active: 'M/D',
        text: `Divide ambos lados entre ${divideLabel}.`,
      }),
    }),
    probWrite({
      html: `x = <span class="hl">${finalAnswer}</span> ✓`,
      final: true,
      pause: 0,
      audio: aud(8),
      railLabel: 'Solución',
    }),
  ];
}

/** Wrap steps in a subtopic object for lesson JSON */
function subtopicWithWalkthrough(title, walkthroughSteps) {
  return {
    title,
    walkthrough: walkthroughSteps,
  };
}

module.exports = {
  step,
  theoryRule,
  theoryLegend,
  diagramNote,
  probWrite,
  calcWrite,
  calcQuestion,
  papomudasWalkthrough,
  linearSolveWalkthrough,
  linearSolveBothSidesWalkthrough,
  subtopicWithWalkthrough,
};
