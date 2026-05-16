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
  // ── NIVEL 3: Problemas adicionales de práctica (P7–P15) ────────────────────
  {
    id: 'paa-aritmetica-n3-p7',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: 'MCQ', format: 'mcq',
    question: '¿Cuál es la factorización prima de 72?',
    answer: 'C',
    options: ['2 × 36', '4 × 18', '2³ × 3²', '2² × 3 × 6'],
    hints: [
      'La factorización prima usa solo números primos. Elimina las opciones que contienen números compuestos.',
      'Divide 72 entre 2 repetidamente: 72 → 36 → 18 → 9. Ahora factoriza 9.',
      '9 = 3². Entonces 72 = 2³ × 3².',
    ],
    modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p8',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'Un agricultor tiene 48 naranjas y 36 manzanas. Quiere hacer bolsas iguales sin que sobre ninguna fruta. ¿Cuántas bolsas puede hacer como máximo?',
    answer: '12',
    hints: [
      'El número máximo de bolsas iguales es el MCD de 48 y 36.',
      '48 = 2⁴ × 3 y 36 = 2² × 3². Los factores comunes son 2² y 3.',
      'MCD = 2² × 3 = 4 × 3 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p9',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: '¿Cuál es el MCM de 8 y 12?',
    answer: '24',
    hints: [
      'Factoriza ambos números y toma todos los factores con el mayor exponente.',
      '8 = 2³ y 12 = 2² × 3. El mayor exponente de 2 es 2³ y el de 3 es 3¹.',
      'MCM = 2³ × 3 = 8 × 3 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p10',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'En una panadería, el pan de trigo se hornea cada 6 horas y el pan de maíz cada 9 horas. Si ambos se hornean juntos ahora, ¿cuántas horas pasarán hasta que coincidan de nuevo?',
    answer: '18',
    hints: [
      'El momento en que coinciden de nuevo es el MCM de 6 y 9.',
      '6 = 2 × 3 y 9 = 3². El MCM toma todos los factores con el mayor exponente.',
      'MCM = 2 × 3² = 2 × 9 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p11',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'En la sucesión 5, 12, 19, 26... ¿cuál es el octavo término?',
    answer: '54',
    hints: [
      'Identifica la diferencia común entre términos consecutivos.',
      'La diferencia es 7. El término n se calcula como: primer término + (n−1) × diferencia.',
      '5 + (8−1) × 7 = 5 + 49 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p12',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'Una empresa tiene 15 empleados en enero. Cada mes contrata 4 empleados más. ¿Cuántos empleados tendrá en julio (mes 7)?',
    answer: '39',
    hints: [
      'Esto es una sucesión aritmética donde el primer término es 15 y la diferencia común es 4.',
      'El término del mes n es: 15 + (n−1) × 4. Para julio, n = 7.',
      '15 + (7−1) × 4 = 15 + 24 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p13',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'En la sucesión 3, 6, 12, 24... ¿cuál es el siguiente término?',
    answer: '48',
    hints: [
      'Identifica el patrón — ¿por qué número se multiplica cada término?',
      'Cada término se multiplica por 2. Esto se llama razón común.',
      'El último término es 24. Multiplica: 24 × 2 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p14',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'Una bacteria se divide en 2 cada hora. Si comenzamos con 5 bacterias, ¿cuántas habrá después de 4 horas?',
    answer: '80',
    hints: [
      'Cada hora la cantidad se multiplica por 2. Esto es una sucesión geométrica con razón 2.',
      'Después de n horas: cantidad inicial × 2ⁿ. Aquí n = 4.',
      '5 × 2⁴ = 5 × 16 = ?',
    ],
    options: [], modules: ['equivalence'], createdAt: CREATED_AT,
  },
  {
    id: 'paa-aritmetica-n3-p15',
    curriculum: 'PAA', unit: 'aritmetica', stage: '3',
    problemType: 'practice', type: '', format: 'open',
    question: 'En la sucesión 4, 12, 36, 108... ¿cuál es el sexto término?',
    answer: '972',
    hints: [
      'Identifica la razón común dividiendo un término entre el anterior.',
      'La razón es 3. El término n es: primer término × razón^(n−1).',
      '4 × 3^(6−1) = 4 × 3⁵ = 4 × 243 = ?',
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
      conceptVisual: `<style>
.ooo-wrap{font-family:var(--sans)}
.ooo-visual-label{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--text-secondary);margin-bottom:.6rem}
.ooo-expr{display:flex;flex-wrap:wrap;align-items:baseline;gap:.25rem;padding:.75rem 0;min-height:3.2rem}
.ooo-state{display:flex;flex-wrap:wrap;align-items:baseline;gap:.25rem}
.ooo-token{display:inline-flex;align-items:center;justify-content:center;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:.25em .55em;font-family:var(--mono);font-size:1.2rem;font-weight:700;color:var(--text);transition:background .3s ease,border-color .3s ease,color .3s ease}
.ooo-token--amber{background:var(--amber-bg);border-color:var(--amber);color:var(--amber)}
.ooo-token--ok{background:var(--teal-light);border-color:var(--teal);color:var(--teal)}
.ooo-op{display:inline-flex;align-items:center;font-size:1.1rem;font-weight:800;color:var(--text-secondary);padding:0 .1rem}
.ooo-dots{display:flex;gap:.5rem;margin:.5rem 0 .3rem}
.ooo-dot{width:8px;height:8px;border-radius:50%;background:var(--border);transition:background .3s ease}
.ooo-dot--on{background:var(--accent)}
.ooo-step-label{font-size:.9rem;color:var(--text-secondary);line-height:1.5;margin:.25rem 0 .75rem}
.ooo-step-label--ok{color:var(--teal);font-weight:600}
.ooo-btn{display:inline-flex;align-items:center;gap:.35rem;background:var(--accent-bg);border:1.5px solid var(--accent-light);border-radius:999px;padding:.5rem 1.1rem;font-family:var(--mono);font-size:.88rem;font-weight:700;color:var(--accent);cursor:pointer;animation:ooo-pulse 2.4s ease-in-out infinite}
.ooo-btn:hover{background:var(--accent-light)}
.ooo-reset{display:none;align-items:center;gap:.35rem;background:transparent;border:1.5px solid var(--border);border-radius:999px;padding:.4rem 1rem;font-size:.85rem;font-weight:600;color:var(--text-secondary);cursor:pointer}
.ooo-reset:hover{background:var(--bg)}
@keyframes ooo-pulse{0%,100%{opacity:1}50%{opacity:.65}}
@media(prefers-reduced-motion:reduce){.ooo-btn{animation:none}.ooo-token,.ooo-dot{transition:none}}
</style>
<div id="ooo-wrap" data-step="0" class="ooo-wrap">
  <div class="ooo-visual-label">Representación visual</div>
  <div class="ooo-expr">
    <div id="ooo-s0" class="ooo-state">
      <span class="ooo-token">18</span><span class="ooo-op">+</span><span class="ooo-token">2³</span><span class="ooo-op">÷</span><span class="ooo-token">4</span><span class="ooo-op">×</span><span class="ooo-token">2</span>
    </div>
    <div id="ooo-s1" class="ooo-state" style="display:none">
      <span class="ooo-token">18</span><span class="ooo-op">+</span><span class="ooo-token ooo-token--amber">8</span><span class="ooo-op">÷</span><span class="ooo-token">4</span><span class="ooo-op">×</span><span class="ooo-token">2</span>
    </div>
    <div id="ooo-s2" class="ooo-state" style="display:none">
      <span class="ooo-token">18</span><span class="ooo-op">+</span><span class="ooo-token ooo-token--amber">4</span>
    </div>
    <div id="ooo-s3" class="ooo-state" style="display:none">
      <span class="ooo-token ooo-token--ok">22</span>
    </div>
  </div>
  <div class="ooo-dots">
    <div id="ooo-dot1" class="ooo-dot"></div>
    <div id="ooo-dot2" class="ooo-dot"></div>
    <div id="ooo-dot3" class="ooo-dot"></div>
  </div>
  <p id="ooo-label" class="ooo-step-label">Aplica el orden PAPOMUDAS paso a paso.</p>
  <button id="ooo-btn" class="ooo-btn" onclick="(function(b){var w=document.getElementById('ooo-wrap');var s=parseInt(w.dataset.step||'0');document.getElementById('ooo-s'+s).style.display='none';s++;w.dataset.step=s;document.getElementById('ooo-s'+s).style.display='';document.getElementById('ooo-dot'+s).classList.add('ooo-dot--on');var lbl=document.getElementById('ooo-label');var msgs=['','Primero resolvemos las potencias: 2³ = 8','Luego multiplicación y división de izquierda a derecha: 8 ÷ 4 = 2, luego 2 × 2 = 4','Finalmente la suma: 18 + 4 = 22 ✓'];lbl.textContent=msgs[s];if(s===1){b.textContent='Paso 2: × y ÷ →';}else if(s===2){b.textContent='Paso 3: Suma →';}else{b.style.display='none';document.getElementById('ooo-reset').style.display='inline-flex';lbl.classList.add('ooo-step-label--ok');}})(this)">Paso 1: Potencias →</button>
  <button id="ooo-reset" class="ooo-reset" onclick="(function(){for(var i=1;i<=3;i++){document.getElementById('ooo-s'+i).style.display='none';document.getElementById('ooo-dot'+i).classList.remove('ooo-dot--on');}document.getElementById('ooo-s0').style.display='';document.getElementById('ooo-wrap').dataset.step='0';var lbl=document.getElementById('ooo-label');lbl.textContent='Aplica el orden PAPOMUDAS paso a paso.';lbl.classList.remove('ooo-step-label--ok');var btn=document.getElementById('ooo-btn');btn.textContent='Paso 1: Potencias →';btn.style.display='';this.style.display='none';})()">↺ Reiniciar</button>
</div>`,
      rules: [
        'Conmutativa: a + b = b + a · · · a × b = b × a',
        'Asociativa: (a + b) + c = a + (b + c)',
        'Distributiva: a(b + c) = ab + ac',
        'Elemento neutro: a + 0 = a · · · a × 1 = a',
        'Orden de operaciones (PAPOMUDAS): Paréntesis → Potencias → Multiplicación y División (izquierda a derecha) → Adición y Sustracción (izquierda a derecha)',
      ],
      subtopics: [
        {
          title: 'PAPOMUDAS',
          walkthrough: [
            { col: 'theory', type: 'write', html: '<div class="theory-line rule">PAPOMUDAS</div><div class="theory-line">Paréntesis → Potencias → Mult/Div → Suma/Resta</div>', pause: 1800, audio: 'paa-arit-n1-01.mp3', note: { type: 'rule', label: 'regla', content: 'Orden de las Operaciones', diagram: ['P','A','M/D','S/R'], active: null } },
            { col: 'prob',   type: 'write', html: '3 + 4 × 2 − (6 ÷ 3)', pause: 2000, audio: 'paa-arit-n1-02.mp3', note: { type: 'diagram', label: 'orden de operaciones', diagram: ['P','A','M/D','S/R'], active: null } },
            { col: 'calc',   type: 'write', html: '<div class="calc-line"><span class="red">(6 ÷ 3)</span> = ?</div>', pause: 700, audio: 'paa-arit-n1-03.mp3', note: { type: 'diagram', label: 'primero: paréntesis', diagram: ['P','A','M/D','S/R'], active: 'P' } },
            { col: 'calc',   type: 'question', question: '¿cuánto es 6 ÷ 3?', hint: 'resuelve el paréntesis', answer: '2', correct: '✓ 6 ÷ 3 = <span class="hl">2</span>', wrong: '6 ÷ 3 = <span class="hl">2</span>', audio: null, note: null },
            { col: 'prob',   type: 'write', html: '3 + 4 × 2 − <span class="hl">2</span>', pause: 1400, audio: 'paa-arit-n1-04.mp3', note: { type: 'formula', label: 'paréntesis', content: '(6 ÷ 3) = 2' } },
            { col: 'theory', type: 'write', html: '<div class="theory-line">paréntesis ✓</div>', pause: 700, audio: null, note: { type: 'check', text: 'paréntesis resuelto' } },
            { col: 'calc',   type: 'write', html: '<div class="calc-sep"></div><div class="calc-line"><span class="blu">4 × 2</span> = ?</div>', pause: 700, audio: 'paa-arit-n1-05.mp3', note: { type: 'diagram', label: 'siguiente: mult/div', diagram: ['P','A','M/D','S/R'], active: 'M/D' } },
            { col: 'calc',   type: 'question', question: '¿cuánto es 4 × 2?', hint: 'multiplicación antes que suma', answer: '8', correct: '✓ 4 × 2 = <span class="hl">8</span>', wrong: '4 × 2 = <span class="hl">8</span>', audio: null, note: null },
            { col: 'prob',   type: 'write', html: '3 + <span class="hl">8</span> − 2', pause: 1400, audio: 'paa-arit-n1-06.mp3', note: { type: 'formula', label: 'multiplicación', content: '4 × 2 = 8' } },
            { col: 'theory', type: 'write', html: '<div class="theory-line">multiplicación ✓</div>', pause: 700, audio: null, note: { type: 'check', text: 'multiplicación resuelta' } },
            { col: 'calc',   type: 'write', html: '<div class="calc-sep"></div><div class="calc-line"><span class="amb">3 + 8 − 2</span> = ?</div>', pause: 700, audio: 'paa-arit-n1-07.mp3', note: { type: 'diagram', label: 'último: suma/resta', diagram: ['P','A','M/D','S/R'], active: 'S/R' } },
            { col: 'calc',   type: 'question', question: '¿cuánto es 3 + 8 − 2?', hint: 'de izquierda a derecha', answer: '9', correct: '✓ 3 + 8 − 2 = <span class="hl">9</span>', wrong: '3 + 8 = 11 → 11 − 2 = <span class="hl">9</span>', audio: 'paa-arit-n1-08.mp3', note: null },
            { col: 'prob',   type: 'write', html: '<span class="hl">= 9 ✓</span>', final: true, pause: 0, audio: null, note: { type: 'formula', label: 'resultado', content: '3 + 8 − 2 = 9' } },
            { col: 'theory', type: 'write', html: '<div class="theory-line">suma/resta ✓</div>', pause: 0, audio: 'paa-arit-n1-09.mp3', note: { type: 'check', text: 'suma/resta resuelta' } },
          ],
        },
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
      conceptVisual: fs.readFileSync('./visual_nivel2.html', 'utf8'),
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
      subtopics: [
        // ── Subtopic 1: Divisibilidad y factorización prima ──────────────────
        {
          title: 'Divisibilidad y factorización prima',
          rules: [
            'Divisibilidad: un número es divisible por otro si el residuo de la división es 0',
            'Reglas rápidas: divisible por 2 → termina en par · por 3 → suma de dígitos divisible por 3 · por 5 → termina en 0 o 5',
            'Factorización prima: expresar un número como producto de números primos. Ejemplo: 60 = 2² × 3 × 5',
          ],
          formulas: [
            '60 = 2² × 3 × 5',
            '84 = 2² × 3 × 7',
          ],
          conceptVoice:
            'Un número es divisible por otro si la división no deja residuo. ' +
            'Tres reglas útiles: si termina en número par, es divisible por 2; si la suma de sus dígitos es divisible por 3, el número también lo es; si termina en 0 o 5, es divisible por 5. ' +
            'La factorización prima consiste en expresar un número como producto solo de números primos. ' +
            'Por ejemplo, 60 se divide entre 2 para obtener 30, luego entre 2 para obtener 15, y 15 = 3 × 5. Entonces 60 = 2² × 3 × 5.',
          conceptVisual: null,
          example: {
            start: 'Factoriza 60 en factores primos',
            narration_intro:
              'Vamos a descomponer 60 dividiéndolo entre el menor primo posible en cada paso.',
            formulas: ['60 ÷ 2 = 30', '30 ÷ 2 = 15', '15 = 3 × 5', '60 = 2² × 3 × 5'],
            steps: [
              {
                equation: '60 ÷ 2 = 30',
                annotation: 'Paso 1 — Dividir entre 2 (60 termina en par)',
                narration: '60 termina en 0, que es par. Dividimos entre el primo más pequeño: 60 ÷ 2 = 30.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Divisible por 2</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">60</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">÷</span>' +
                  '<span class="term-card">2</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
                  '<span class="paa-highlight-box">30</span>' +
                  '</div>' +
                  '<div class="tile-equation">60 termina en 0 → es par → divisible por 2</div></div>',
              },
              {
                equation: '30 ÷ 2 = 15',
                annotation: 'Paso 2 — Dividir entre 2 otra vez (30 también es par)',
                narration: '30 es par. Dividimos entre 2 nuevamente: 30 ÷ 2 = 15.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Divisible por 2 de nuevo</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">30</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">÷</span>' +
                  '<span class="term-card">2</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
                  '<span class="paa-highlight-box">15</span>' +
                  '</div>' +
                  '<div class="tile-equation">30 termina en 0 → es par → divisible por 2</div></div>',
              },
              {
                equation: '15 = 3 × 5',
                annotation: 'Paso 3 — Factorizar 15 (suma de dígitos: 1+5=6)',
                narration: '15 no es par. Suma de dígitos: 1 + 5 = 6, divisible por 3. Entonces 15 ÷ 3 = 5. Ambos 3 y 5 son primos.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Divisible por 3</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">15</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
                  '<span class="term-card" style="border-color:#F59E0B;background:#FFFBEB;color:#B45309;">3</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
                  '<span class="term-card" style="border-color:#F59E0B;background:#FFFBEB;color:#B45309;">5</span>' +
                  '</div>' +
                  '<div class="tile-equation">Suma de dígitos: 1 + 5 = 6 → divisible por 3 · 5 es primo</div></div>',
              },
              {
                equation: '60 = 2² × 3 × 5',
                annotation: 'Resultado — Factorización prima completa',
                narration: 'Reunimos todos los factores primos: 60 = 2 × 2 × 3 × 5 = 2² × 3 × 5.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Factorización prima de 60</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card" style="border-color:#F59E0B;background:#FFFBEB;color:#B45309;">2²</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
                  '<span class="term-card" style="border-color:#F59E0B;background:#FFFBEB;color:#B45309;">3</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
                  '<span class="term-card" style="border-color:#F59E0B;background:#FFFBEB;color:#B45309;">5</span>' +
                  '</div>' +
                  '<div class="tile-equation">60 = 2² × 3 × 5</div></div>',
              },
            ],
          },
          practiceProblems: ['paa-aritmetica-n3-p1', 'paa-aritmetica-n3-p5', 'paa-aritmetica-n3-p7'],
        },

        // ── Subtopic 2: MCD — Máximo Común Divisor ───────────────────────────
        {
          title: 'MCD — Máximo Común Divisor',
          rules: [
            'MCD (Máximo Común Divisor): el mayor número que divide exactamente a dos o más números',
            'Método: factoriza ambos números → toma los factores comunes con el menor exponente',
          ],
          formulas: [
            '24 = 2³ × 3   ·   36 = 2² × 3²',
            'MCD(24, 36) = 2² × 3 = 12',
          ],
          conceptVoice:
            'El Máximo Común Divisor es el mayor número que divide exactamente a dos o más números sin dejar residuo. ' +
            'Para encontrarlo, factoriza cada número en primos. Luego identifica los factores que aparecen en ambos números y toma el exponente más pequeño de cada uno. ' +
            'Por ejemplo, para 12 y 18: 12 = 2² × 3 y 18 = 2 × 3². ' +
            'El factor 2 aparece con exponentes 2 y 1; el menor es 1. El factor 3 aparece con exponentes 1 y 2; el menor es 1. ' +
            'MCD = 2¹ × 3¹ = 6.',
          conceptVisual: fs.readFileSync('./visual_nivel3.html', 'utf8'),
          example: {
            start: 'MCD de 12 y 18',
            narration_intro:
              'Vamos a factorizar 12 y 18, luego tomar los factores comunes con el menor exponente para obtener el MCD.',
            formulas: ['12 = 2² × 3', '18 = 2 × 3²', 'MCD = 2¹ × 3¹ = 6'],
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
                annotation: 'Paso 2 — Factores comunes con el menor exponente',
                narration: 'Factor 2: exponente mínimo = 2¹. Factor 3: exponente mínimo = 3¹. MCD = 2 × 3 = 6.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Solo lo compartido (exponente mínimo)</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">2¹</span><span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
                  '<span class="term-card">3¹</span></div>' +
                  '<div class="tile-equation" style="margin-top:10px;">2 × 3 = 6</div></div>',
              },
            ],
          },
          practiceProblems: ['paa-aritmetica-n3-p2', 'paa-aritmetica-n3-p6', 'paa-aritmetica-n3-p8'],
        },

        // ── Subtopic 3: MCM — Mínimo Común Múltiplo ──────────────────────────
        {
          title: 'MCM — Mínimo Común Múltiplo',
          rules: [
            'MCM (Mínimo Común Múltiplo): el menor número que es múltiplo de dos o más números',
            'Método: factoriza ambos números → toma todos los factores con el mayor exponente',
          ],
          formulas: [
            '12 = 2² × 3   ·   18 = 2 × 3²',
            'MCM(12, 18) = 2² × 3² = 4 × 9 = 36',
          ],
          conceptVoice:
            'El Mínimo Común Múltiplo es el menor número que es múltiplo de dos o más números a la vez. ' +
            'Para encontrarlo, factoriza cada número en primos. Luego toma todos los factores primos que aparecen en cualquiera de los números, usando el exponente más grande de cada uno. ' +
            'Por ejemplo, para 12 y 18: 12 = 2² × 3 y 18 = 2 × 3². ' +
            'El factor 2 aparece con exponentes 2 y 1; el mayor es 2². El factor 3 aparece con exponentes 1 y 2; el mayor es 3². ' +
            'MCM = 2² × 3² = 4 × 9 = 36.',
          conceptVisual: fs.readFileSync('./visual_nivel3.html', 'utf8'),
          // This is the representative worked example used by showExample() after all subtopics
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
          practiceProblems: ['paa-aritmetica-n3-p3', 'paa-aritmetica-n3-p9', 'paa-aritmetica-n3-p10'],
        },

        // ── Subtopic 4: Sucesiones aritméticas ───────────────────────────────
        {
          title: 'Sucesiones aritméticas',
          rules: [
            'Sucesión aritmética: diferencia constante entre términos consecutivos → 3, 7, 11, 15... (+4)',
            'Para encontrar el siguiente término: identifica la diferencia d y sumala al último término',
          ],
          formulas: [
            '3, 7, 11, 15... → d = 7 − 3 = 4',
            'Siguiente término: 15 + 4 = 19',
          ],
          conceptVoice:
            'Una sucesión aritmética es una lista de números donde la diferencia entre cualquier par de términos consecutivos es siempre la misma. ' +
            'Esa diferencia se llama diferencia común. ' +
            'Por ejemplo, en la sucesión 3, 7, 11, 15... la diferencia es siempre 4: 7−3=4, 11−7=4, 15−11=4. ' +
            'Para encontrar el siguiente término, simplemente suma la diferencia al último término: 15 + 4 = 19.',
          conceptVisual: null,
          example: {
            start: '3, 7, 11, 15... ¿cuál es el siguiente número?',
            narration_intro:
              'Identificamos la diferencia constante entre términos consecutivos y la usamos para encontrar el siguiente.',
            formulas: ['d = 7 − 3 = 4', 'Siguiente: 15 + 4 = 19'],
            steps: [
              {
                equation: '7 − 3 = 4   (diferencia constante)',
                annotation: 'Paso 1 — Identificar la diferencia entre términos',
                narration: 'Calculamos la diferencia entre términos consecutivos: 7 − 3 = 4. Verificamos: 11 − 7 = 4 y 15 − 11 = 4. La diferencia es siempre 4.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Diferencia constante d = 4</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">3</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">7</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">11</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">15</span>' +
                  '</div>' +
                  '<div class="tile-equation">7 − 3 = 4   ·   11 − 7 = 4   ·   15 − 11 = 4</div></div>',
              },
              {
                equation: '15 + 4 = 19',
                annotation: 'Paso 2 — Sumar la diferencia al último término',
                narration: 'El siguiente término es el último más la diferencia: 15 + 4 = 19.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Siguiente término</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">15</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">+</span>' +
                  '<span class="term-card">4</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
                  '<span class="paa-highlight-box">19</span>' +
                  '</div>' +
                  '<div class="tile-equation">15 + 4 = 19</div></div>',
              },
            ],
          },
          practiceProblems: ['paa-aritmetica-n3-p4', 'paa-aritmetica-n3-p11', 'paa-aritmetica-n3-p12'],
        },

        // ── Subtopic 5: Sucesiones geométricas ───────────────────────────────
        {
          title: 'Sucesiones geométricas',
          rules: [
            'Sucesión geométrica: razón constante entre términos consecutivos → 2, 6, 18, 54... (×3)',
            'Para encontrar el siguiente término: identifica la razón r y multiplica el último término por r',
          ],
          formulas: [
            '2, 6, 18, 54... → r = 6 ÷ 2 = 3',
            'Siguiente término: 54 × 3 = 162',
          ],
          conceptVoice:
            'Una sucesión geométrica es una lista de números donde cada término se obtiene multiplicando el anterior por un mismo factor constante, llamado razón común. ' +
            'Por ejemplo, en la sucesión 2, 6, 18, 54... cada término es tres veces el anterior: 6÷2=3, 18÷6=3, 54÷18=3. La razón es 3. ' +
            'Para encontrar el siguiente término, multiplica el último por la razón: 54 × 3 = 162.',
          conceptVisual: null,
          example: {
            start: '2, 6, 18, 54... ¿cuál es el siguiente número?',
            narration_intro:
              'Identificamos la razón constante entre términos consecutivos y la usamos para encontrar el siguiente.',
            formulas: ['r = 6 ÷ 2 = 3', 'Siguiente: 54 × 3 = 162'],
            steps: [
              {
                equation: '6 ÷ 2 = 3   (razón constante)',
                annotation: 'Paso 1 — Identificar la razón entre términos',
                narration: 'Calculamos la razón entre términos consecutivos: 6 ÷ 2 = 3. Verificamos: 18 ÷ 6 = 3 y 54 ÷ 18 = 3. La razón es siempre 3.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Razón constante r = 3</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">2</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">6</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">18</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">→</span>' +
                  '<span class="term-card">54</span>' +
                  '</div>' +
                  '<div class="tile-equation">6 ÷ 2 = 3   ·   18 ÷ 6 = 3   ·   54 ÷ 18 = 3</div></div>',
              },
              {
                equation: '54 × 3 = 162',
                annotation: 'Paso 2 — Multiplicar el último término por la razón',
                narration: 'El siguiente término es el último multiplicado por la razón: 54 × 3 = 162.',
                visual:
                  '<div class="lesson-visual-board">' +
                  '<div class="visual-group-title" style="text-align:center">Siguiente término</div>' +
                  '<div class="visual-expression-strip">' +
                  '<span class="term-card">54</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">×</span>' +
                  '<span class="term-card">3</span>' +
                  '<span style="font-weight:800;color:var(--text-secondary);margin:0 4px;">=</span>' +
                  '<span class="paa-highlight-box">162</span>' +
                  '</div>' +
                  '<div class="tile-equation">54 × 3 = 162</div></div>',
              },
            ],
          },
          practiceProblems: ['paa-aritmetica-n3-p13', 'paa-aritmetica-n3-p14', 'paa-aritmetica-n3-p15'],
        },
      ],
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
  console.log('\nNext: git push, then npx wrangler deploy (in worker/).\n');
}

main();
