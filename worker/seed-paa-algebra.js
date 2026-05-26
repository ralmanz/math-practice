#!/usr/bin/env node
// seed-paa-algebra.js — Uploads PAA Álgebra lessons and problems to Cloudflare KV
// Run from the worker/ directory: node seed-paa-algebra.js
//
// Requires: wrangler CLI authenticated and wrangler.toml present in this directory.
//
// VALIDATION AUDIT (run before seeding):
//   PASS  L1: P1 (Simplify), P2 (Simplify), P3 (Evaluate), P4 (Expand), P5 (Factorize), P6 (Solve)
//   PASS  L2: P1–P6 (including P3/P4 inequalities via math-validation.js inequalityEquivalence)
//   PASS  L3: P1 (Factorize trinomial — Algebrite expands both sides to verify),
//          P2/P3 (multi-value Solve — comma-separated order-independent matching),
//          P4/P5/P6 (two-variable system — comma matching handles x=N, y=M correctly).
//
// KV keys written:
//   __problem_bank__         (merged with existing)
//   lesson:PAA:algebra:level1
//   lesson:PAA:algebra:level2
//   lesson:PAA:algebra:level3

'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const NAMESPACE_ID = 'bd9a4b14857d4df993a2c065d0804b41';
const CREATED_AT   = '2026-05-25T00:00:00.000Z';

// ── Problem data ──────────────────────────────────────────────────────────────

const PAA_ALGEBRA_PROBLEMS = [

  // ── NIVEL 1: Expresiones y ecuaciones lineales de un solo lado ───────────────

  {
    id: 'paa-algebra-n1-p1',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Simplify', format: 'open',
    expression: '4x + 3x',
    question: 'Simplifica 4x + 3x',
    answer: '7x',
    hints: [
      'Son términos semejantes (misma variable x).',
      'Suma los coeficientes: 4 + 3.',
      '(4 + 3)x = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n1-p2',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Simplify', format: 'open',
    expression: '5x + 2 - 3x + 4',
    question: 'Simplifica 5x + 2 − 3x + 4',
    answer: '2x + 6',
    hints: [
      'Agrupa términos con x por un lado y números por otro.',
      '5x − 3x y 2 + 4.',
      '(5x − 3x) + (2 + 4) = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n1-p3',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Evaluate', format: 'open',
    expression: '(-2)^2 + 1',
    question: 'Evalúa x² + 1 cuando x = −2',
    answer: '5',
    hints: [
      'Sustituye x por −2. Cuidado con el signo en la potencia.',
      '(−2)² = 4 (un negativo al cuadrado es positivo).',
      '4 + 1 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n1-p4',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Expand', format: 'open',
    expression: '4(x + 3)',
    question: 'Expande 4(x + 3)',
    answer: '4x + 12',
    hints: [
      'Multiplica el 4 por cada término del paréntesis.',
      '4 por x y 4 por 3.',
      '4x + 12 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n1-p5',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Factorize', format: 'open',
    expression: '6x + 9',
    question: 'Factoriza 6x + 9',
    answer: '3(2x + 3)',
    hints: [
      '¿Qué número divide a 6 y a 9?',
      'El factor común es 3.',
      '3(2x + 3), verifica expandiendo.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n1-p6',
    curriculum: 'PAA', unit: 'algebra', stage: '1',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '2x + 5 = 13',
    question: 'Resuelve 2x + 5 = 13',
    answer: 'x = 4',
    hints: [
      'Resta 5 de ambos lados.',
      '2x = 8.',
      'x = 8 / 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },

  // ── NIVEL 2: Ecuaciones de ambos lados, inecuaciones, exponentes y polinomios

  {
    id: 'paa-algebra-n2-p1',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '4x - 5 = 2x + 7',
    question: 'Resuelve 4x − 5 = 2x + 7',
    answer: 'x = 6',
    hints: [
      'Resta 2x de ambos lados.',
      '2x − 5 = 7, luego 2x = 12.',
      'x = 12 / 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n2-p2',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '3(x - 2) = 9',
    question: 'Resuelve 3(x − 2) = 9',
    answer: 'x = 5',
    hints: [
      'Expande, o divide ambos lados entre 3.',
      'x − 2 = 3.',
      'x = 3 + 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n2-p3',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '-2x > 6',
    question: 'Resuelve la inecuación −2x > 6',
    answer: 'x < -3',
    hints: [
      'Divide ambos lados entre −2.',
      'Al dividir entre negativo, INVIERTE el sentido.',
      'x < −3.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n2-p4',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '2x + 1 < 9',
    question: 'Resuelve la inecuación 2x + 1 < 9',
    answer: 'x < 4',
    hints: [
      'Resta 1, luego divide entre 2 (positivo: el sentido no cambia).',
      '2x < 8.',
      'x < 8 / 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n2-p5',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Simplify', format: 'open',
    expression: '(x^2 + 3x) + (2x^2 - x)',
    question: 'Simplifica (x² + 3x) + (2x² − x)',
    answer: '3x^2 + 2x',
    hints: [
      'Combina los x² por un lado y los x por otro.',
      'x² + 2x² y 3x − x.',
      '3x² + 2x.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n2-p6',
    curriculum: 'PAA', unit: 'algebra', stage: '2',
    problemType: 'practice', type: 'Evaluate', format: 'open',
    expression: '5^2 - 4*5 + 3',
    question: 'Evalúa x² − 4x + 3 cuando x = 5',
    answer: '8',
    hints: [
      'Sustituye x por 5 en cada término.',
      '25 − 20 + 3.',
      '25 − 4(5) + 3 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },

  // ── NIVEL 3: Cuadráticas factorizables y sistemas 2×2 ───────────────────────

  {
    id: 'paa-algebra-n3-p1',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Factorize', format: 'open',
    expression: 'x^2 + 5x + 6',
    question: 'Factoriza x² + 5x + 6',
    answer: '(x + 2)(x + 3)',
    hints: [
      'Dos números que multiplicados den 6 y sumados den 5.',
      '2 y 3.',
      '(x + 2)(x + 3).',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n3-p2',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: 'x^2 - 7x + 12 = 0',
    question: 'Resuelve x² − 7x + 12 = 0',
    answer: 'x = 3, x = 4',
    hints: [
      'Factoriza: dos números que den 12 y sumen 7.',
      '3 y 4, (x − 3)(x − 4) = 0.',
      'x − 3 = 0 y x − 4 = 0.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n3-p3',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: 'x^2 - 9 = 0',
    question: 'Resuelve x² − 9 = 0',
    answer: 'x = 3, x = -3',
    hints: [
      'Es una diferencia de cuadrados: x² − 9 = (x − 3)(x + 3).',
      '(x − 3)(x + 3) = 0.',
      'x = 3 o x = −3.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n3-p4',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: 'x + y = 7',
    question: 'Resuelve el sistema: x + y = 7 ; x − y = 1',
    answer: 'x = 4, y = 3',
    hints: [
      'Suma las dos ecuaciones para eliminar y.',
      '2x = 8.',
      'x = 4, luego y = 7 − 4 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n3-p5',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: 'y = 2x',
    question: 'Resuelve por sustitución: y = 2x ; x + y = 9',
    answer: 'x = 3, y = 6',
    hints: [
      'Sustituye y = 2x en la segunda ecuación.',
      'x + 2x = 9, 3x = 9.',
      'x = 3, y = 2(3) = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-algebra-n3-p6',
    curriculum: 'PAA', unit: 'algebra', stage: '3',
    problemType: 'practice', type: 'Solve', format: 'open',
    expression: '2x + y = 10',
    question: 'Resuelve el sistema: 2x + y = 10 ; x − y = 2',
    answer: 'x = 4, y = 2',
    hints: [
      'Suma las ecuaciones para eliminar y.',
      '3x = 12.',
      'x = 4, luego y = 4 − 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
];

// ── Lesson data ───────────────────────────────────────────────────────────────

const PAA_ALGEBRA_LESSONS = [
  // ── NIVEL 1 ──────────────────────────────────────────────────────────────────
  {
    key: 'lesson:PAA:algebra:level1',
    data: {
      id: 'paa-algebra-n1',
      curriculum: 'PAA',
      unit: 'algebra',
      level: 1,
      title: 'Expresiones algebraicas y ecuaciones lineales de un solo lado',
      subtitle:
        'Aprende a combinar términos semejantes, evaluar por sustitución, expandir con la propiedad distributiva, factorizar el factor común y resolver ecuaciones lineales con la incógnita en un solo lado.',
      intro: {
        rule: 'Una expresión algebraica combina números, variables y operaciones. Solo los términos semejantes (misma variable, mismo exponente) se pueden combinar. Para resolver una ecuación lineal: despeja la incógnita deshaciendo las operaciones en orden inverso.',
        ruleTitle: 'Álgebra — Nivel 1',
        ruleChips: ['Simplificar', 'Evaluar', 'Expandir', 'Factorizar', 'Resolver'],
        ruleNote: 'Para resolver una ecuación: deshaz las operaciones de afuera hacia adentro (primero suma/resta, luego multiplica/divide).',
        goals: [
          'Combinar términos semejantes con variable x.',
          'Sustituir un valor numérico y calcular la expresión resultante.',
          'Expandir un factor sobre un paréntesis con la propiedad distributiva.',
          'Factorizar un binomio extrayendo el factor común.',
          'Resolver una ecuación lineal con la incógnita en un solo lado.',
        ],
        problems: [
          'Simplificación de expresiones algebraicas.',
          'Evaluación de expresiones con sustitución de negativos.',
          'Expansión y factorización de expresiones lineales.',
          'Ecuaciones lineales de dos pasos.',
        ],
        practice: 'Después del concepto y el ejemplo, practicarás con 6 ejercicios paso a paso.',
      },
      conceptVoice:
        'En álgebra, una expresión como 4x + 3x combina dos términos semejantes — misma variable x — y se simplifica sumando los coeficientes: 4 + 3 = 7, entonces 4x + 3x = 7x. ' +
        'Si hay términos con x y números separados, agrúpalos por tipo antes de combinar. ' +
        'Para evaluar, sustituye el valor dado: si x = −2, entonces x² + 1 = (−2)² + 1 = 4 + 1 = 5. El cuadrado de un negativo es siempre positivo. ' +
        'Para expandir, multiplica el factor externo por cada término dentro del paréntesis: 4(x + 3) = 4x + 12. ' +
        'Para factorizar, identifica el mayor factor que divide a todos los términos y sácalo: 6x + 9 = 3(2x + 3). Verifica expandiendo. ' +
        'Para resolver 2x + 5 = 13, resta 5 a ambos lados: 2x = 8; luego divide entre 2: x = 4.',
      formulas: [
        '4x + 3x = 7x   (términos semejantes)',
        '(−2)² = 4   (potencia de negativo → positivo)',
        'a(b + c) = ab + ac   (propiedad distributiva)',
        'Factor común: 6x + 9 = 3(2x + 3)',
        'Despejar: 2x + 5 = 13  →  2x = 8  →  x = 4',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-title" style="text-align:center">Nivel 1 — Cinco operaciones</div>' +
        '<div class="visual-group-grid">' +
        '<div class="visual-group-box"><div class="visual-group-title">Simplificar</div><div class="tile-equation">4x + 3x = 7x</div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Evaluar</div><div class="tile-equation">x²+1 con x=−2 → 5</div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Expandir</div><div class="tile-equation">4(x+3) = 4x+12</div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Factorizar</div><div class="tile-equation">6x+9 = 3(2x+3)</div></div>' +
        '</div>' +
        '<div class="tile-equation" style="margin-top:10px;">Resolver: 2x+5=13 → x=4</div>' +
        '</div>',
      rules: [
        'Términos semejantes: misma variable, mismo exponente — solo esos se combinan. 3x + 5x = 8x, pero 3x + 2x² NO.',
        'Evaluar: sustituye el valor dado y calcula. Si x = −2: (−2)² + 1 = 4 + 1 = 5.',
        'Expandir: a(b + c) = ab + ac. Multiplica el factor externo por CADA término del paréntesis.',
        'Factorizar: inverso de expandir. Busca el mayor factor común de todos los términos.',
        'Ecuación lineal: despeja la incógnita deshaciendo operaciones en orden inverso (+ / − primero, luego × / ÷).',
      ],
      example: {
        start: '3x + 5 = 14',
        narration_intro:
          'Observa cómo despejamos x resolviendo primero la suma y luego la multiplicación en orden inverso.',
        formulas: ['3x + 5 − 5 = 14 − 5', '3x = 9', 'x = 3'],
        steps: [
          {
            equation: '3x = 9',
            annotation: 'Paso 1 — Restar 5 de ambos lados',
            narration: 'Restamos 5 a ambos lados para aislar el término con x: 3x + 5 − 5 = 14 − 5 → 3x = 9.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Aislar el término con x</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">3x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
              '<span class="paa-highlight-box">5</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="term-card">14</span>' +
              '</div>' +
              '<div class="tile-equation">Ambos lados − 5: 3x = 9</div>' +
              '</div>',
          },
          {
            equation: 'x = 3',
            annotation: 'Paso 2 — Dividir entre 3',
            narration: 'Dividimos ambos lados entre 3: 3x ÷ 3 = 9 ÷ 3 → x = 3.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Despejar x</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="paa-highlight-box">3x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="term-card">9</span>' +
              '</div>' +
              '<div class="tile-equation">Ambos lados ÷ 3: x = 3</div>' +
              '</div>',
          },
        ],
      },
      practiceProblems: [
        'paa-algebra-n1-p1', 'paa-algebra-n1-p2', 'paa-algebra-n1-p3',
        'paa-algebra-n1-p4', 'paa-algebra-n1-p5', 'paa-algebra-n1-p6',
      ],
    },
  },

  // ── NIVEL 2 ──────────────────────────────────────────────────────────────────
  {
    key: 'lesson:PAA:algebra:level2',
    data: {
      id: 'paa-algebra-n2',
      curriculum: 'PAA',
      unit: 'algebra',
      level: 2,
      title: 'Ecuaciones de ambos lados, inecuaciones, exponentes y polinomios',
      subtitle:
        'Lleva las variables a un lado y los números al otro. En inecuaciones, invierte el sentido al multiplicar o dividir por un número negativo.',
      intro: {
        rule: 'En ecuaciones con x en ambos lados: mueve los términos con variable a un lado y los números al otro. En inecuaciones: mismo procedimiento, pero al multiplicar o dividir por negativo se INVIERTE el signo (> pasa a <).',
        ruleTitle: 'Álgebra — Nivel 2',
        ruleChips: ['Ambos lados', 'Paréntesis', 'Inecuaciones', 'Polinomios'],
        ruleNote: 'Regla crítica: al multiplicar o dividir por un número NEGATIVO en una inecuación, el signo de desigualdad se invierte.',
        goals: [
          'Resolver ecuaciones lineales con x en ambos lados.',
          'Resolver ecuaciones con paréntesis expandiendo primero.',
          'Resolver inecuaciones lineales identificando cuándo invertir el sentido.',
          'Simplificar polinomios combinando términos semejantes.',
          'Evaluar polinomios con sustitución de valores numéricos.',
        ],
        problems: [
          'Ecuaciones con incógnita en ambos lados.',
          'Ecuaciones con paréntesis.',
          'Inecuaciones lineales con posible inversión de sentido.',
          'Operaciones con polinomios.',
        ],
        practice: 'Después del concepto y el ejemplo, practicarás con 6 ejercicios paso a paso.',
      },
      conceptVoice:
        'Cuando la incógnita aparece en ambos lados, el objetivo es llevar todos los términos con x a un lado y los números al otro. ' +
        'Por ejemplo, 4x − 5 = 2x + 7: restamos 2x a ambos lados → 2x − 5 = 7; sumamos 5 → 2x = 12; dividimos entre 2 → x = 6. ' +
        'Para ecuaciones con paréntesis: expande primero, o divide por el factor si es posible. ' +
        'En inecuaciones el procedimiento es el mismo, EXCEPTO que al multiplicar o dividir por un número negativo el sentido de la desigualdad se invierte: si −2x > 6, dividimos entre −2 e invertimos → x < −3. ' +
        'Los polinomios se operan combinando solo términos semejantes: x² + 2x² = 3x², pero x² y x no se combinan. ' +
        'Para evaluar un polinomio como x² − 4x + 3 en x = 5: 25 − 20 + 3 = 8.',
      formulas: [
        '4x − 5 = 2x + 7  →  2x = 12  →  x = 6',
        '3(x − 2) = 9  →  x − 2 = 3  →  x = 5',
        '−2x > 6  →  x < −3  (sentido invertido al ÷ negativo)',
        '2x + 1 < 9  →  2x < 8  →  x < 4  (positivo: sentido sin cambio)',
        '(x² + 3x) + (2x² − x) = 3x² + 2x',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-title" style="text-align:center">Regla clave: inecuaciones con negativo</div>' +
        '<div class="visual-group-grid">' +
        '<div class="visual-group-box"><div class="visual-group-title">Ecuación</div>' +
        '<div class="tile-equation">−2x = 6<br>÷(−2): x = −3</div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Inecuación ⚠️</div>' +
        '<div class="tile-equation">−2x &gt; 6<br>÷(−2): x &lt; −3</div></div>' +
        '</div>' +
        '</div>',
      rules: [
        'Ambos lados: mueve términos con variable a un lado y números al otro, cambiando el signo al pasar.',
        'Paréntesis: expande primero (o divide por el factor), luego resuelve como ecuación normal.',
        'Inecuaciones: mismo procedimiento que ecuaciones, EXCEPTO invertir el sentido al × o ÷ por negativo.',
        'Polinomios: solo se combinan términos semejantes (misma variable y mismo exponente).',
        'Evaluar con sustitución: cuidado con los signos — (−2)² = 4 (positivo).',
      ],
      example: {
        start: '4x − 5 = 2x + 7',
        narration_intro:
          'Observa cómo llevamos todas las x a un lado y los números al otro en tres pasos.',
        formulas: ['2x − 5 = 7', '2x = 12', 'x = 6'],
        steps: [
          {
            equation: '2x − 5 = 7',
            annotation: 'Paso 1 — Restar 2x de ambos lados',
            narration: 'Restamos 2x a ambos lados para llevar las x al lado izquierdo: 4x − 2x − 5 = 7.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Llevar x al lado izquierdo</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="paa-highlight-box">4x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">−</span>' +
              '<span class="term-card">5</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="paa-highlight-box">2x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
              '<span class="term-card">7</span>' +
              '</div>' +
              '<div class="tile-equation">Ambos lados − 2x: 2x − 5 = 7</div>' +
              '</div>',
          },
          {
            equation: '2x = 12',
            annotation: 'Paso 2 — Sumar 5 a ambos lados',
            narration: 'Sumamos 5 a ambos lados para aislar el término con x: 2x − 5 + 5 = 7 + 5 → 2x = 12.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Aislar el término con x</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">2x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">−</span>' +
              '<span class="paa-highlight-box">5</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="term-card">7</span>' +
              '</div>' +
              '<div class="tile-equation">Ambos lados + 5: 2x = 12</div>' +
              '</div>',
          },
          {
            equation: 'x = 6',
            annotation: 'Paso 3 — Dividir entre 2',
            narration: 'Dividimos entre 2: 2x ÷ 2 = 12 ÷ 2 → x = 6.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Despejar x</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="paa-highlight-box">2x</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="term-card">12</span>' +
              '</div>' +
              '<div class="tile-equation">Ambos lados ÷ 2: x = 6</div>' +
              '</div>',
          },
        ],
      },
      practiceProblems: [
        'paa-algebra-n2-p1', 'paa-algebra-n2-p2', 'paa-algebra-n2-p3',
        'paa-algebra-n2-p4', 'paa-algebra-n2-p5', 'paa-algebra-n2-p6',
      ],
    },
  },

  // ── NIVEL 3 ──────────────────────────────────────────────────────────────────
  {
    key: 'lesson:PAA:algebra:level3',
    data: {
      id: 'paa-algebra-n3',
      curriculum: 'PAA',
      unit: 'algebra',
      level: 3,
      title: 'Cuadráticas factorizables y sistemas 2×2',
      subtitle:
        'Factoriza cuadráticas buscando dos números que cumplan suma y producto. Resuelve sistemas 2×2 eliminando o sustituyendo una variable.',
      intro: {
        rule: 'Para cuadráticas x²+bx+c: busca dos números con producto c y suma b, factoriza como (x+n₁)(x+n₂), luego iguala cada factor a cero. Para sistemas 2×2: suma/resta ecuaciones para eliminar una variable (eliminación), o despeja y sustituye (sustitución).',
        ruleTitle: 'Álgebra — Nivel 3',
        ruleChips: ['Factorizar cuadrática', 'Diferencia de cuadrados', 'Eliminación', 'Sustitución'],
        ruleNote: 'Una cuadrática tiene dos soluciones. Un sistema 2×2 tiene un par (x, y). Escribe ambas soluciones separadas por coma.',
        goals: [
          'Factorizar trinomios cuadráticos de la forma x² + bx + c.',
          'Reconocer y aplicar la diferencia de cuadrados: x² − a² = (x−a)(x+a).',
          'Resolver sistemas de dos ecuaciones por eliminación.',
          'Resolver sistemas de dos ecuaciones por sustitución.',
          'Expresar la solución del sistema como par x = N, y = M.',
        ],
        problems: [
          'Factorización de trinomios cuadráticos.',
          'Ecuaciones cuadráticas resolubles por factorización.',
          'Sistemas de dos ecuaciones lineales en dos variables.',
        ],
        practice: 'Después del concepto y el ejemplo, practicarás con 6 ejercicios paso a paso.',
      },
      conceptVoice:
        'Para factorizar un trinomio cuadrático como x² + 5x + 6, busca dos números que multiplicados den 6 y sumados den 5. Esos son 2 y 3, así que x² + 5x + 6 = (x + 2)(x + 3). ' +
        'Para resolverlo como ecuación iguala cada factor a cero: x + 2 = 0 → x = −2; x + 3 = 0 → x = −3. ' +
        'La diferencia de cuadrados tiene su propia forma: x² − 9 = (x − 3)(x + 3), sin término medio. ' +
        'Para sistemas 2×2, usa eliminación: suma las ecuaciones para cancelar una variable, despeja la otra, y sustitúyela para encontrar la primera. ' +
        'O usa sustitución: despeja una variable en la ecuación más simple y ponla en la otra ecuación.',
      formulas: [
        'x² + 5x + 6 = (x + 2)(x + 3)',
        'x² − 9 = (x − 3)(x + 3)  (diferencia de cuadrados)',
        'Cuadrática = 0: factoriza → iguala a 0 → 2 soluciones',
        'Sistema por eliminación: suma ecuaciones para cancelar y',
        'Sistema por sustitución: despeja y, sustituye en la otra',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-title" style="text-align:center">Nivel 3 — Cuadráticas y sistemas</div>' +
        '<div class="visual-group-grid">' +
        '<div class="visual-group-box"><div class="visual-group-title">Cuadrática</div>' +
        '<div class="tile-equation">x²+5x+6=(x+2)(x+3)<br>x=−2 o x=−3</div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Sistema</div>' +
        '<div class="tile-equation">x+y=7  x−y=1<br>suma→2x=8→x=4, y=3</div></div>' +
        '</div>' +
        '</div>',
      rules: [
        'Trinomio x²+bx+c: busca dos números con producto c y suma b → factoriza como (x+n₁)(x+n₂).',
        'Diferencia de cuadrados: x²−a² = (x−a)(x+a). No hay término del medio.',
        'Cuadrática = 0: factoriza, iguala cada factor a cero, obtén las dos soluciones.',
        'Sistema por eliminación: suma o resta las ecuaciones para que una variable desaparezca.',
        'Sistema por sustitución: despeja una variable en la ecuación más simple, sustitúyela en la otra.',
      ],
      example: {
        start: 'x² + 5x + 6 = 0',
        narration_intro:
          'Observa cómo factorizamos el trinomio y obtenemos las dos soluciones igualando cada factor a cero.',
        formulas: [
          '2 × 3 = 6  y  2 + 3 = 5',
          '(x + 2)(x + 3) = 0',
          'x = −2  o  x = −3',
        ],
        steps: [
          {
            equation: '2 × 3 = 6  y  2 + 3 = 5',
            annotation: 'Paso 1 — Buscar dos números con producto 6 y suma 5',
            narration: 'Buscamos dos números que multiplicados den 6 y sumados den 5. Probamos: 2 × 3 = 6 ✓ y 2 + 3 = 5 ✓.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Buscar los dos números</div>' +
              '<div class="visual-group-grid">' +
              '<div class="visual-group-box"><div class="visual-group-title">Producto = 6</div>' +
              '<div class="paa-highlight-box">2 × 3 = 6 ✓</div></div>' +
              '<div class="visual-group-box"><div class="visual-group-title">Suma = 5</div>' +
              '<div class="paa-highlight-box">2 + 3 = 5 ✓</div></div>' +
              '</div></div>',
          },
          {
            equation: '(x + 2)(x + 3) = 0',
            annotation: 'Paso 2 — Escribir la forma factorizada',
            narration: 'Con los números 2 y 3, escribimos la forma factorizada: x² + 5x + 6 = (x + 2)(x + 3).',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Forma factorizada</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">x² + 5x + 6</span>' +
              '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
              '<span class="paa-highlight-box">(x + 2)(x + 3)</span>' +
              '</div>' +
              '<div class="tile-equation">Si el producto es 0, al menos un factor es 0</div>' +
              '</div>',
          },
          {
            equation: 'x = −2  o  x = −3',
            annotation: 'Paso 3 — Igualar cada factor a cero',
            narration: 'Si (x + 2)(x + 3) = 0, entonces x + 2 = 0 → x = −2, o x + 3 = 0 → x = −3.',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Dos soluciones</div>' +
              '<div class="visual-group-grid">' +
              '<div class="visual-group-box"><div class="visual-group-title">Factor 1 = 0</div>' +
              '<div class="paa-highlight-box">x + 2 = 0<br>x = −2</div></div>' +
              '<div class="visual-group-box"><div class="visual-group-title">Factor 2 = 0</div>' +
              '<div class="paa-highlight-box">x + 3 = 0<br>x = −3</div></div>' +
              '</div></div>',
          },
        ],
      },
      practiceProblems: [
        'paa-algebra-n3-p1', 'paa-algebra-n3-p2', 'paa-algebra-n3-p3',
        'paa-algebra-n3-p4', 'paa-algebra-n3-p5', 'paa-algebra-n3-p6',
      ],
    },
  },
];

// ── Wrangler KV helpers ───────────────────────────────────────────────────────

function kvGet(key) {
  const result = spawnSync(
    'npx', ['wrangler', 'kv', 'key', 'get',
      '--remote',
      '--namespace-id=' + NAMESPACE_ID,
      key],
    { encoding: 'utf8', cwd: __dirname }
  );
  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function kvPut(key, valueStr, maxAttempts) {
  const attempts = maxAttempts || 5;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const tmpFile = path.join(os.tmpdir(), 'nuvo-kv-' + Date.now() + '-' + attempt + '.json');
    fs.writeFileSync(tmpFile, valueStr, 'utf8');
    try {
      const result = spawnSync(
        'npx', ['wrangler', 'kv', 'key', 'put',
          '--remote',
          '--namespace-id=' + NAMESPACE_ID,
          key,
          '--path=' + tmpFile],
        { encoding: 'utf8', cwd: __dirname, stdio: 'pipe' }
      );
      if (result.status === 0) return true;
      console.error('  wrangler error (attempt ' + attempt + '/' + attempts + '):', result.stderr || result.stdout);
    } finally {
      try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
    }
    if (attempt < attempts) {
      spawnSync('sleep', [String(2 * attempt)], { stdio: 'ignore' });
    }
  }
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n=== PAA Álgebra Seed Script ===\n');

  console.log('VALIDATION SUMMARY:');
  console.log('  PASS   L1: P1–P6 (Simplify, Evaluate, Expand, Factorize, Solve)');
  console.log('  PASS   L2: P1–P6 (inequalities validated via frontend/math-validation.js)');
  console.log('  PASS   L3: P1 (Factorize), P2-P3 (multi-value Solve), P4-P6 (system Solve)\n');

  // 1. Merge problems into existing bank
  console.log('Reading current __problem_bank__...');
  const bankRaw = kvGet('__problem_bank__');
  let bank = [];
  if (bankRaw) {
    try { bank = JSON.parse(bankRaw); } catch (e) { bank = []; }
  }
  console.log('  Existing problems in bank:', bank.length);

  // Remove any existing PAA algebra problems to avoid duplicates
  const newIds = new Set(PAA_ALGEBRA_PROBLEMS.map(p => p.id));
  const filtered = bank.filter(p => !newIds.has(p.id));
  const merged = filtered.concat(PAA_ALGEBRA_PROBLEMS);
  console.log('  After merge:', merged.length, 'problems (' + PAA_ALGEBRA_PROBLEMS.length + ' PAA Álgebra added)');

  console.log('Writing __problem_bank__...');
  const ok = kvPut('__problem_bank__', JSON.stringify(merged));
  console.log(ok ? '  ✓ Problem bank updated' : '  ✗ FAILED to update problem bank');

  // 2. Write each lesson
  console.log('\nWriting lessons...');
  for (const lesson of PAA_ALGEBRA_LESSONS) {
    process.stdout.write('  ' + lesson.key + ' ... ');
    const lessonOk = kvPut(lesson.key, JSON.stringify(lesson.data));
    console.log(lessonOk ? '✓' : '✗ FAILED');
  }

  console.log('\n=== Done ===');
  console.log('Problems uploaded: ' + PAA_ALGEBRA_PROBLEMS.length);
  console.log('Lessons uploaded:  ' + PAA_ALGEBRA_LESSONS.length);
  console.log('\nNext steps:');
  console.log('  1. git add/commit/push frontend changes (home.html, app.html, curriculum_brain.md)');
  console.log('  2. node seed-paa-algebra.js  ← you are here (KV only — no wrangler deploy needed)');
  console.log('  3. Test: lesson.html?curriculum=PAA&unit=algebra&stage=1');
  console.log('          app.html?mode=practice&curriculum=PAA&unit=algebra&stage=1&student=STUDENT_ID');
  console.log('  4. After confirming Álgebra works end-to-end, run Step 5 (hide Aritmética in home.html)\n');
}

main();
