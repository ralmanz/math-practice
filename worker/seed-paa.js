#!/usr/bin/env node
// seed-paa.js — Uploads PAA Aritmética lessons and problems to Cloudflare KV
// Run from the worker/ directory: node seed-paa.js
//
// Requires: wrangler CLI authenticated and wrangler.toml present in this directory.

'use strict';

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const NAMESPACE_ID = 'bd9a4b14857d4df993a2c065d0804b41';
const CREATED_AT   = '2026-05-12T00:00:00.000Z';

// ── Problem data ─────────────────────────────────────────────────────────────

const PAA_PROBLEMS = [

  // ── NIVEL 1: Operaciones con números reales y orden de operaciones ──────────

  {
    id: 'paa-aritmetica-n1-p1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es 5 + 3 × 4?',
    answer: '17',
    hints: [
      'Recuerda el orden de operaciones — la multiplicación va antes que la suma.',
      'Primero calcula 3 × 4, luego suma 5.',
      '3 × 4 = 12. Ahora suma: 5 + 12 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-p2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es (5 + 3) × 4?',
    answer: '32',
    hints: [
      'Los paréntesis cambian el orden — resuelve primero lo que está adentro.',
      'Primero calcula 5 + 3, luego multiplica por 4.',
      '5 + 3 = 8. Ahora multiplica: 8 × 4 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-p3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es 24 ÷ 6 + 2 × 3?',
    answer: '10',
    hints: [
      'Hay dos operaciones del mismo nivel (÷ y ×) — resuélvelas de izquierda a derecha antes de sumar.',
      'Primero calcula 24 ÷ 6 y 2 × 3 por separado, luego suma los resultados.',
      '24 ÷ 6 = 4 y 2 × 3 = 6. Ahora suma: 4 + 6 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-p4',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es 3² + 4 × 2 − 1?',
    answer: '16',
    hints: [
      'Empieza por la potencia, luego la multiplicación, luego suma y resta.',
      '3² = 9 y 4 × 2 = 8. Ahora combínalos.',
      '9 + 8 − 1 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-p5',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es 50 − 2³ × 3 + 1?',
    answer: '27',
    hints: [
      'Hay una potencia en la expresión — resuélvela primero.',
      '2³ = 8. Ahora multiplica: 8 × 3 = 24. Luego opera con 50 y 1.',
      '50 − 24 + 1 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-p6',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'practice', type: '', format: 'open',
    question: 'Simplifica: 4(3 + 2) − 2(6 − 1)',
    answer: '10',
    hints: [
      'Resuelve primero cada paréntesis por separado.',
      '4(5) = 20 y 2(5) = 10. Ahora resta.',
      '20 − 10 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-t1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'test', type: '', format: 'open',
    question: '¿Cuánto es 18 + 2³ ÷ 4 × 2?',
    answer: '22',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-t2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'test', type: '', format: 'open',
    question: '¿Cuánto es 3(4 + 2) − 2(5 − 3)?',
    answer: '14',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n1-t3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '1',
    problemType: 'test', type: '', format: 'open',
    question: 'Si a = 3 y b = 2, ¿cuánto es a² + 2ab − b²?',
    answer: '13',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },

  // ── NIVEL 2: Razón, proporción y porcentaje ─────────────────────────────────

  {
    id: 'paa-aritmetica-n2-p1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuánto es el 25% de 200?',
    answer: '50',
    hints: [
      'Para calcular un porcentaje, convierte el porcentaje a decimal y multiplica.',
      '25% = 0.25. Ahora multiplica por 200.',
      '0.25 × 200 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-p2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: '', format: 'open',
    question: 'Un producto cuesta $80.00 con 15% de descuento. ¿Cuál es el precio final?',
    answer: '68',
    hints: [
      'Un descuento del 15% significa que pagas el 85% del precio original.',
      'Multiplica el precio original por 0.85.',
      '80 × 0.85 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-p3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: '', format: 'open',
    question: 'Si 3 lápices cuestan $1.50, ¿cuánto cuestan 8 lápices?',
    answer: '4',
    hints: [
      'Establece una proporción: 3 lápices es a $1.50 como 8 lápices es a $x.',
      'Usa productos cruzados: 3x = 1.50 × 8.',
      '3x = 12. Divide: x = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-p4',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: 'MCQ', format: 'mcq',
    question: 'En una clase hay 12 niñas y 18 niños. ¿Cuál es la razón de niñas al total de estudiantes?',
    answer: 'A',
    options: ['2:5', '2:3', '3:5', '1:3'],
    hints: [
      'El total de estudiantes es 12 + 18 = 30. La razón es niñas:total.',
      'La razón es 12:30. Simplifica dividiendo ambos por el MCD.',
      'El MCD de 12 y 30 es 6. Entonces 12÷6 : 30÷6 = ?',
    ],
    modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-p5',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: '', format: 'open',
    question: 'Un conductor viajó 115 km el primer día y 85 km el segundo. Si recorrió el 80% de la distancia total, ¿cuántos km le faltan por recorrer?',
    answer: '50',
    hints: [
      'Primero calcula la distancia recorrida hasta ahora.',
      '115 + 85 = 200 km. Eso representa el 80%. ¿Cuál es el 100%?',
      'Si 200 es el 80%, el total es 200 ÷ 0.80 = 250. Los km que faltan son 250 − 200 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-p6',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Qué porcentaje de 150 es 45?',
    answer: '30',
    hints: [
      'Para encontrar qué porcentaje es una parte del total, divide la parte entre el total y multiplica por 100.',
      '(45 ÷ 150) × 100 = ?',
      '45 ÷ 150 = 0.30. Ahora multiplica por 100.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-t1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'test', type: '', format: 'open',
    question: 'Un artículo de $120.00 tiene 25% de descuento. ¿Cuál es el precio final?',
    answer: '90',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-t2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'test', type: '', format: 'open',
    question: 'Si 5/8 de la distancia total son 300 km, ¿cuál es la distancia total en km?',
    answer: '480',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n2-t3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '2',
    problemType: 'test', type: '', format: 'open',
    question: 'Un joven retira el 25% de sus ahorros y gasta el 33⅓% de eso en adornos que costaron $250.00. ¿Cuántos dólares tenía en el banco?',
    answer: '3000',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },

  // ── NIVEL 3: Patrones numéricos y teoría de números ────────────────────────

  {
    id: 'paa-aritmetica-n3-p1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: 'MCQ', format: 'mcq',
    question: '¿Cuál es la factorización prima de 60?',
    answer: 'B',
    options: ['2 × 5 × 6', '2² × 3 × 5', '2 × 30', '4 × 15'],
    hints: [
      'La factorización prima usa SOLO números primos. ¿Cuáles de las opciones contienen solo primos?',
      'Divide 60 entre 2 repetidamente: 60 ÷ 2 = 30 ÷ 2 = 15. Ahora factoriza 15.',
      '15 = 3 × 5. Entonces 60 = 2 × 2 × 3 × 5 = ?',
    ],
    modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuál es el MCD de 24 y 36?',
    answer: '12',
    hints: [
      'Factoriza ambos números en factores primos.',
      '24 = 2³ × 3 y 36 = 2² × 3². Busca los factores comunes con el menor exponente.',
      'Los factores comunes son 2² y 3. Multiplica: 4 × 3 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuál es el MCM de 4 y 6?',
    answer: '12',
    hints: [
      'Factoriza ambos números y toma todos los factores con el mayor exponente.',
      '4 = 2² y 6 = 2 × 3. El mayor exponente de 2 es 2², y el de 3 es 3¹.',
      'MCM = 2² × 3 = 4 × 3 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p4',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'En la sucesión 3, 7, 11, 15... ¿cuál es el siguiente número?',
    answer: '19',
    hints: [
      'Identifica el patrón — ¿cuánto aumenta cada término?',
      'La diferencia entre términos consecutivos es siempre la misma. Calcula 7 − 3.',
      'La diferencia es 4. Suma 4 al último término: 15 + 4 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p5',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuántos múltiplos de 7 hay entre 1 y 50?',
    answer: '7',
    hints: [
      'Los múltiplos de 7 son: 7, 14, 21... Lista los que están entre 1 y 50.',
      'El mayor múltiplo de 7 que no supera 50 es 49. ¿Cuántos múltiplos hay desde 7 hasta 49?',
      '7, 14, 21, 28, 35, 42, 49. Cuenta cuántos hay.',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p6',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuál es el MCD de 45 y 60?',
    answer: '15',
    hints: [
      'Factoriza ambos números en factores primos.',
      '45 = 3² × 5 y 60 = 2² × 3 × 5. Busca los factores comunes.',
      'Los factores comunes son 3 y 5. Multiplica: 3 × 5 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-t1',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'test', type: '', format: 'open',
    question: 'Dos autobuses salen juntos de la terminal. Uno pasa cada 12 minutos y otro cada 18 minutos. ¿En cuántos minutos volverán a salir juntos?',
    answer: '36',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-t2',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'test', type: '', format: 'open',
    question: '¿Cuál es el siguiente término en la sucesión 2, 6, 18, 54...?',
    answer: '162',
    hints: [], options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-t3',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'test', type: 'MCQ', format: 'mcq',
    question: '¿Cuál es la factorización prima de 84?',
    answer: 'C',
    options: ['2 × 42', '4 × 21', '2² × 3 × 7', '2 × 3 × 14'],
    hints: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
];

// ── Lesson data ───────────────────────────────────────────────────────────────

const PAA_LESSONS = [
  {
    key: 'lesson:PAA:aritmetica:level1',
    data: {
      id: 'paa-aritmetica-n1',
      curriculum: 'PAA',
      unit: 'aritmetica',
      level: 1,
      title: 'Operaciones con números reales y orden de operaciones',
      subtitle:
        'Elige el orden correcto: paréntesis y potencias antes que multiplicar o dividir, y estas antes que sumar o restar. Así toda expresión tiene un valor único.',
      conceptVoice:
        'En la Prueba de Admisión aparecen expresiones con sumas, restas, productos, cocientes y potencias. ' +
        'El orden de operaciones te dice qué hacer primero: paréntesis, luego potencias, luego multiplicación y división de izquierda a derecha, y al final suma y resta también de izquierda a derecha. ' +
        'Si sigues ese orden, evitas errores comunes como multiplicar antes de resolver una potencia o sumar antes de dividir.',
      formulas: [
        'Orden: Paréntesis → Potencias → × y ÷ (izq→der) → + y − (izq→der)',
        'a(b + c) = ab + ac',
        '2³ = 2 × 2 × 2 = 8',
        '18 + 2³ ÷ 4 × 2  →  primero 2³, luego ÷ y ×, luego +',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-box">' +
        '<div class="visual-group-title">Orden que se aplica en cascada</div>' +
        '<div class="paa-order-flow">' +
        '<div class="paa-order-step"><span>1</span><strong>Paréntesis</strong><small>( )</small></div>' +
        '<div class="paa-order-step"><span>2</span><strong>Potencias</strong><small>aⁿ</small></div>' +
        '<div class="paa-order-step"><span>3</span><strong>× y ÷</strong><small>izq → der</small></div>' +
        '<div class="paa-order-step"><span>4</span><strong>+ y −</strong><small>izq → der</small></div>' +
        '</div></div>' +
        '<div class="paa-mini-compare">' +
        '<div class="visual-group-box"><div class="visual-group-title">Trampa común</div>' +
        '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.55;">Si mezclas el orden, los mismos símbolos pueden dar otro resultado. El examen premia el procedimiento correcto.</p></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Idea práctica</div>' +
        '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.55;">Marca primero potencias, luego multiplicaciones y divisiones como un bloque, y deja sumas y restas para cuando ya no queden otros niveles.</p></div>' +
        '</div>' +
        '<div class="tile-equation">Mini-ejemplo: 5 + 3 × 4 = 5 + 12 = 17</div>' +
        '</div>',
      rules: [
        'Conmutativa: a + b = b + a · · · a × b = b × a',
        'Asociativa: (a + b) + c = a + (b + c)',
        'Distributiva: a(b + c) = ab + ac',
        'Elemento neutro: a + 0 = a · · · a × 1 = a',
        'Orden de operaciones (PAPOMUDAS): Paréntesis → Potencias → Multiplicación y División (izquierda a derecha) → Adición y Sustracción (izquierda a derecha)',
      ],
      example: {
        start: '18 + 2³ ÷ 4 × 2',
        narration_intro:
          'Sigue este ejemplo respetando el orden de operaciones. Usa las pestañas Símbolos, Visual, Fórmulas y Voz; avanza con «Mostrar paso» para ver cada transformación.',
        formulas: ['2³ = 8', '8 ÷ 4 = 2', '2 × 2 = 4', '18 + 4 = 22'],
        steps: [
          {
            equation: '2³ = 8',
            annotation: 'Paso 1 — Resolver la potencia',
            narration: 'Comenzamos por la potencia: 2³ = 8',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Potencia primero</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">18</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
              '<span class="paa-highlight-box">2³</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">÷</span>' +
              '<span class="term-card">4</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
              '<span class="term-card">2</span></div>' +
              '<div class="tile-equation" style="margin-top:10px;">2³ = 2 × 2 × 2 = 8</div></div>',
          },
          {
            equation: '8 ÷ 4 = 2  →  2 × 2 = 4',
            annotation: 'Paso 2 — Multiplicación y división (izquierda a derecha)',
            narration: 'Dividimos: 8 ÷ 4 = 2. Luego multiplicamos: 2 × 2 = 4',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Mismo nivel: de izquierda a derecha</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">18</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
              '<span class="term-card">8</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">÷</span>' +
              '<span class="term-card">4</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
              '<span class="term-card">2</span></div>' +
              '<div class="visual-group-grid" style="margin-top:10px">' +
              '<div class="visual-group-box"><div class="visual-group-title">Primero</div><div class="paa-highlight-box" style="margin:0 auto;max-width:220px;">8 ÷ 4 = 2</div></div>' +
              '<div class="visual-group-box"><div class="visual-group-title">Luego</div><div class="paa-highlight-box" style="margin:0 auto;max-width:220px;">2 × 2 = 4</div></div>' +
              '</div></div>',
          },
          {
            equation: '18 + 4 = 22',
            annotation: 'Paso 3 — Suma',
            narration: 'Finalmente sumamos: 18 + 4 = 22',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Último nivel: suma</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">18</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
              '<span class="paa-highlight-box">4</span></div>' +
              '<div class="tile-equation" style="margin-top:10px;">18 + 4 = 22</div></div>',
          },
        ],
      },
      practiceProblems: ['paa-aritmetica-n1-p1','paa-aritmetica-n1-p2','paa-aritmetica-n1-p3',
                         'paa-aritmetica-n1-p4','paa-aritmetica-n1-p5','paa-aritmetica-n1-p6'],
      testProblems:     ['paa-aritmetica-n1-t1','paa-aritmetica-n1-t2','paa-aritmetica-n1-t3'],
    },
  },
  {
    key: 'lesson:PAA:aritmetica:level2',
    data: {
      id: 'paa-aritmetica-n2',
      curriculum: 'PAA',
      unit: 'aritmetica',
      level: 2,
      title: 'Razón, proporción y porcentaje',
      subtitle:
        'Razón y proporción comparan cantidades; el porcentaje expresa una parte de cien. Los descuentos encadenados se multiplican, no se suman como si fueran un solo porcentaje.',
      conceptVoice:
        'Una razón compara dos cantidades. Una proporción dice que dos razones son iguales y te permite usar productos cruzados. ' +
        'El porcentaje es una parte de cien: x por ciento de n es x dividido cien, multiplicado por n. ' +
        'Cuando hay dos descuentos seguidos, el segundo se aplica sobre el precio ya rebajado, por eso multiplicas por 0.80 y luego por 0.90, no por 0.70.',
      formulas: [
        'a : b = a / b',
        'a / b = c / d  →  a · d = b · c',
        'x% de n = (x / 100) × n',
        '20% descuento → multiplicar por 0.80',
        '10% descuento adicional → multiplicar por 0.90 sobre el precio actual',
        '0.80 × 0.90 = 0.72 (72% del original, no 70%)',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-box">' +
        '<div class="visual-group-title">Dos rebajas seguidas</div>' +
        '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.55;">Cada descuento recorta el precio que ya tienes en pantalla. Por eso las barras bajan en dos pasos, no en un solo salto.</p>' +
        '</div>' +
        '<div class="visual-group-box">' +
        '<div class="visual-group-title">Cuánto del precio sigues pagando</div>' +
        '<div class="paa-meter-row"><div class="paa-meter-label"><span>Precio original</span><span>100%</span></div>' +
        '<div class="paa-meter-track"><div class="paa-meter-fill" style="width:100%"></div></div></div>' +
        '<div class="paa-meter-row"><div class="paa-meter-label"><span>Tras 20% off</span><span>80%</span></div>' +
        '<div class="paa-meter-track"><div class="paa-meter-fill" style="width:80%"></div></div></div>' +
        '<div class="paa-meter-row"><div class="paa-meter-label"><span>Tras 10% más</span><span>72%</span></div>' +
        '<div class="paa-meter-track"><div class="paa-meter-fill--muted" style="width:72%"></div></div></div>' +
        '<div class="tile-equation" style="margin-top:8px;">0.80 × 0.90 = 0.72</div></div></div>',
      rules: [
        'Razón: comparación entre dos cantidades → a:b o a/b',
        'Proporción: dos razones iguales → a/b = c/d, por lo tanto ad = bc (productos cruzados)',
        'Porcentaje: parte de 100 → x% de n = (x ÷ 100) × n',
        'Descuento: precio final = precio original × (1 − descuento como decimal). Ejemplo: 20% → precio final = original × 0.80',
        'Aumento: precio final = precio original × (1 + aumento como decimal). Ejemplo: 15% → precio final = original × 1.15',
        'Atención: dos descuentos consecutivos NO se suman — se aplican uno tras otro',
      ],
      example: {
        start: '$48.00 con 20% de descuento + 10% adicional con tarjeta',
        narration_intro:
          'Este es un caso típico de descuentos encadenados. Observa cómo cada rebaja actúa sobre el precio actual y cómo la barra visual se reduce en dos etapas.',
        formulas: ['48 × 0.80 = 38.40', '38.40 × 0.90 = 34.56', '38.40 − 34.56 = 3.84'],
        steps: [
          {
            equation: '48 × 0.80 = $38.40',
            annotation: 'Paso 1 — Precio con 20% de descuento',
            narration: 'Multiplicamos el precio original por 0.80: 48 × 0.80 = $38.40',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Primer descuento: 20%</div>' +
              '<div class="paa-meter-row"><div class="paa-meter-label"><span>Original</span><span>$48.00</span></div>' +
              '<div class="paa-meter-track"><div class="paa-meter-fill" style="width:100%"></div></div></div>' +
              '<div class="paa-meter-row"><div class="paa-meter-label"><span>Tras 20% off</span><span>$38.40</span></div>' +
              '<div class="paa-meter-track"><div class="paa-meter-fill" style="width:80%"></div></div></div>' +
              '<div class="tile-equation">48 × 0.80 = 38.40</div></div>',
          },
          {
            equation: '38.40 × 0.90 = $34.56',
            annotation: 'Paso 2 — Descuento adicional del 10% (tarjeta)',
            narration: 'Aplicamos el segundo descuento: 38.40 × 0.90 = $34.56',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Segundo descuento: 10% sobre el ya rebajado</div>' +
              '<div class="paa-meter-row"><div class="paa-meter-label"><span>Después del 20%</span><span>$38.40</span></div>' +
              '<div class="paa-meter-track"><div class="paa-meter-fill" style="width:80%"></div></div></div>' +
              '<div class="paa-meter-row"><div class="paa-meter-label"><span>Tras 10% adicional</span><span>$34.56</span></div>' +
              '<div class="paa-meter-track"><div class="paa-meter-fill--muted" style="width:72%"></div></div></div>' +
              '<div class="tile-equation">38.40 × 0.90 = 34.56</div></div>',
          },
          {
            equation: '38.40 − 34.56 = $3.84',
            annotation: 'Paso 3 — Diferencia',
            narration: 'Quien NO usa tarjeta paga $3.84 más: 38.40 − 34.56 = $3.84',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">¿Cuánto te ahorras con la tarjeta?</div>' +
              '<div class="visual-group-grid">' +
              '<div class="visual-group-box"><div class="visual-group-title">Sin 10% extra</div><div class="paa-highlight-box">$38.40</div></div>' +
              '<div class="visual-group-box"><div class="visual-group-title">Con tarjeta</div><div class="paa-highlight-box">$34.56</div></div>' +
              '</div>' +
              '<div class="tile-equation" style="margin-top:10px;">38.40 − 34.56 = 3.84</div></div>',
          },
        ],
      },
      practiceProblems: ['paa-aritmetica-n2-p1','paa-aritmetica-n2-p2','paa-aritmetica-n2-p3',
                         'paa-aritmetica-n2-p4','paa-aritmetica-n2-p5','paa-aritmetica-n2-p6'],
      testProblems:     ['paa-aritmetica-n2-t1','paa-aritmetica-n2-t2','paa-aritmetica-n2-t3'],
    },
  },
  {
    key: 'lesson:PAA:aritmetica:level3',
    data: {
      id: 'paa-aritmetica-n3',
      curriculum: 'PAA',
      unit: 'aritmetica',
      level: 3,
      title: 'Patrones numéricos y teoría de números',
      subtitle:
        'Descomponer en primos hace visibles los factores comunes. Con eso calculas MCD tomando el menor exponente en cada primo, y MCM tomando el mayor exponente.',
      conceptVoice:
        'La factorización prima descompone un número como producto de primos. ' +
        'El máximo común divisor reúne solo los factores que aparecen en ambos números, con el exponente más pequeño. ' +
        'El mínimo común múltiplo usa todos los primos que aparecen en cualquiera, con el exponente más grande. ' +
        'Las sucesiones aritméticas suman la misma diferencia cada vez; las geométricas multiplican por la misma razón.',
      formulas: [
        '12 = 2² × 3',
        '18 = 2 × 3²',
        'MCD = 2^min × 3^min = 2 × 3 = 6',
        'MCM = 2^max × 3^max = 4 × 9 = 36',
      ],
      conceptVisual:
        '<div class="lesson-visual-board">' +
        '<div class="visual-group-grid">' +
        '<div class="visual-group-box"><div class="visual-group-title">Árbol para 12</div>' +
        '<div class="paa-tree">' +
        '<div class="paa-tree-row"><div class="paa-tree-node">12</div></div>' +
        '<div class="paa-tree-row"><div class="paa-tree-node">4</div><div class="paa-tree-node">3</div></div>' +
        '<div class="paa-tree-row"><div class="paa-tree-node">2</div><div class="paa-tree-node">2</div><div class="paa-tree-node paa-tree-node--prime">3</div></div>' +
        '<div class="tile-equation" style="margin-top:6px;">12 = 2² × 3</div></div></div>' +
        '<div class="visual-group-box"><div class="visual-group-title">Árbol para 18</div>' +
        '<div class="paa-tree">' +
        '<div class="paa-tree-row"><div class="paa-tree-node">18</div></div>' +
        '<div class="paa-tree-row"><div class="paa-tree-node">6</div><div class="paa-tree-node">3</div></div>' +
        '<div class="paa-tree-row"><div class="paa-tree-node">2</div><div class="paa-tree-node">3</div><div class="paa-tree-node paa-tree-node--prime">3</div></div>' +
        '<div class="tile-equation" style="margin-top:6px;">18 = 2 × 3²</div></div></div>' +
        '</div>' +
        '<div class="visual-group-box" style="margin-top:10px">' +
        '<div class="visual-group-title">Idea visual MCD vs MCM</div>' +
        '<p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.55;">MCD: solo lo que comparten ambos (exponente mínimo). MCM: cubre todo lo que aparece en cualquiera (exponente máximo).</p>' +
        '</div></div>',
      rules: [
        'Divisibilidad: divisible por 2 → termina en par · por 3 → suma de dígitos divisible por 3 · por 5 → termina en 0 o 5',
        'Factorización prima: expresar un número como producto de números primos. Ejemplo: 60 = 2² × 3 × 5',
        'MCD (Máximo Común Divisor): factoriza ambos → toma los factores comunes con el menor exponente',
        'MCM (Mínimo Común Múltiplo): factoriza ambos → toma todos los factores con el mayor exponente',
        'Sucesión aritmética: diferencia constante entre términos → 3, 7, 11, 15... (+4)',
        'Sucesión geométrica: razón constante entre términos → 2, 6, 18, 54... (×3)',
      ],
      example: {
        start: 'MCD y MCM de 12 y 18',
        narration_intro:
          'Vamos a factorizar 12 y 18, luego leer los exponentes para obtener el MCD y el MCM. Usa Visual para ver los árboles y Fórmulas para las expresiones compactas.',
        formulas: ['12 = 2² × 3', '18 = 2 × 3²', 'MCD = 2 × 3 = 6', 'MCM = 2² × 3² = 36'],
        steps: [
          {
            equation: '12 = 2² × 3  · · ·  18 = 2 × 3²',
            annotation: 'Paso 1 — Factorización prima de cada número',
            narration: 'Factorizamos: 12 = 2² × 3 y 18 = 2 × 3²',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Primos que aparecen</div>' +
              '<div class="visual-group-grid">' +
              '<div class="visual-group-box"><div class="visual-group-title">12</div>' +
              '<div class="visual-expression-strip"><span class="term-card">2²</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span><span class="term-card">3</span></div></div>' +
              '<div class="visual-group-box"><div class="visual-group-title">18</div>' +
              '<div class="visual-expression-strip"><span class="term-card">2</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span><span class="term-card">3²</span></div></div>' +
              '</div></div>',
          },
          {
            equation: 'MCD = 2¹ × 3¹ = 6',
            annotation: 'Paso 2 — MCD: factores comunes con el menor exponente',
            narration: 'Factor 2: exp mínimo = 2¹ · Factor 3: exp mínimo = 3¹ · MCD = 2 × 3 = 6',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Solo lo compartido (exponente mínimo)</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">2¹</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
              '<span class="term-card">3¹</span></div>' +
              '<div class="tile-equation" style="margin-top:10px;">2 × 3 = 6</div></div>',
          },
          {
            equation: 'MCM = 2² × 3² = 4 × 9 = 36',
            annotation: 'Paso 3 — MCM: todos los factores con el mayor exponente',
            narration: 'Factor 2: exp máximo = 2² · Factor 3: exp máximo = 3² · MCM = 4 × 9 = 36',
            visual:
              '<div class="lesson-visual-board">' +
              '<div class="visual-group-title" style="text-align:center">Cubrir todo (exponente máximo)</div>' +
              '<div class="visual-expression-strip">' +
              '<span class="term-card">2²</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
              '<span class="term-card">3²</span></div>' +
              '<div class="tile-equation" style="margin-top:10px;">4 × 9 = 36</div></div>',
          },
        ],
      },
      practiceProblems: ['paa-aritmetica-n3-p1','paa-aritmetica-n3-p2','paa-aritmetica-n3-p3',
                         'paa-aritmetica-n3-p4','paa-aritmetica-n3-p5','paa-aritmetica-n3-p6'],
      testProblems:     ['paa-aritmetica-n3-t1','paa-aritmetica-n3-t2','paa-aritmetica-n3-t3'],
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
  if (result.status !== 0) {
    // Key not found or other error — return null
    return null;
  }
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
  console.log('\n=== PAA Aritmética Seed Script ===\n');

  // 1. Merge problems into existing bank
  console.log('Reading current __problem_bank__...');
  const bankRaw = kvGet('__problem_bank__');
  let bank = [];
  if (bankRaw) {
    try { bank = JSON.parse(bankRaw); } catch (e) { bank = []; }
  }
  console.log('  Existing problems in bank:', bank.length);

  // Remove any existing PAA aritmetica problems to avoid duplicates
  const newIds = new Set(PAA_PROBLEMS.map(p => p.id));
  const filtered = bank.filter(p => !newIds.has(p.id));
  const merged = filtered.concat(PAA_PROBLEMS);
  console.log('  After merge:', merged.length, 'problems (' + PAA_PROBLEMS.length + ' PAA added)');

  console.log('Writing __problem_bank__...');
  const ok = kvPut('__problem_bank__', JSON.stringify(merged));
  console.log(ok ? '  ✓ Problem bank updated' : '  ✗ FAILED to update problem bank');

  // 2. Write each lesson
  console.log('\nWriting lessons...');
  for (const lesson of PAA_LESSONS) {
    process.stdout.write('  ' + lesson.key + ' ... ');
    const lessonOk = kvPut(lesson.key, JSON.stringify(lesson.data));
    console.log(lessonOk ? '✓' : '✗ FAILED');
  }

  console.log('\n=== Done ===');
  console.log('Problems uploaded: ' + PAA_PROBLEMS.length);
  console.log('Lessons uploaded:  ' + PAA_LESSONS.length);
  console.log('\nNext: git push frontend, then npx wrangler deploy (in worker/).\n');
}

main();
