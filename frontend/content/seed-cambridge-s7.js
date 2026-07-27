'use strict';

/**
 * Cambridge Lower Secondary — Stage 7 — Algebra
 * Frame: CAMB · Band: s7 · Language: en
 *
 * Authored against D-STRUCT v3.0 (docs/curriculum_structure_authority.md §7.2).
 * Seeds bind to SKILL IDs (Layer A), not to subTopics. `legacySubTopic` is carried
 * where one exists so the existing engine can resolve these before the Layer A
 * migration (docs migration steps 1–2) lands.
 *
 * Content authority: curriculum_brain.md §1 — Cambridge Stage 7.
 * Deliberately EXCLUDED at Stage 7 (brain §1 "What is NOT yet covered"):
 *   negative-number substitution · unknowns on both sides · double brackets ·
 *   factorising · inequalities · quadratics
 *
 * Context register: neutral international (metric, generic currency, no locale slang).
 * Answer format: brain §5 Rule 6. Hints: brain §5 Rule 5 (conceptual → procedural → near-complete).
 */

const skillsUsed = {
  s7: {
    'expr/N1':  ['alg.expr.language', 'alg.expr.like-terms-single'],
    'expr/N2':  ['alg.expr.substitute-positive', 'alg.expr.expand-single'],
    'lineq/N1': ['alg.lineq.solve-one-step', 'alg.lineq.solve-two-step', 'alg.lineq.negative-coefficient'],
  },
};

const seeds = {

  // ── s7 · expr · N1 — Algebraic language and collecting like terms ─────────────

  'camb-s7-expr-n1-01': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'translate', skills: ['alg.expr.language'], legacySubTopic: 'translate-expression',
    prompt: 'A taxi charges a fixed fee of 5 dollars plus 2 dollars for each kilometre travelled. Write an expression for the cost of a journey of k kilometres.',
    answer: '2k + 5',
    hints: [
      'A fixed fee happens once; a charge "for each kilometre" depends on how far you go.',
      'The distance charge is 2 multiplied by k. The fixed fee is added on.',
      'Write the term in k first, then add the fixed fee: 2k + ?',
    ],
  },
  'camb-s7-expr-n1-02': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'translate', skills: ['alg.expr.language'], legacySubTopic: 'translate-expression',
    prompt: 'Write an expression for the total number of minutes in h hours.',
    answer: '60h',
    hints: [
      'This is a formula: one hour always contains the same number of minutes.',
      'There are 60 minutes in 1 hour, so h hours contain 60 lots of h.',
      'Write it as a single term: 60 × h = ?',
    ],
  },
  'camb-s7-expr-n1-03': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'simplify', skills: ['alg.expr.like-terms-single'], legacySubTopic: 'like-terms-single',
    prompt: 'Simplify: 4x + 3x', expression: '4x + 3x', answer: '7x',
    hints: [
      'These are like terms — both contain the same variable, x.',
      'Add the coefficients: 4 + 3.',
      '(4 + 3)x = ?',
    ],
  },
  'camb-s7-expr-n1-04': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'simplify', skills: ['alg.expr.like-terms-single'], legacySubTopic: 'like-terms-single',
    prompt: 'Simplify: 6m + m + 2m', expression: '6m + m + 2m', answer: '9m',
    hints: [
      'All three terms contain the same variable, m, so they are like terms.',
      'A term written as just m means 1m. Add 6 + 1 + 2.',
      'The coefficients total 9, so the answer is ?m',
    ],
  },
  'camb-s7-expr-n1-05': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'simplify', skills: ['alg.expr.like-terms-single'], legacySubTopic: 'like-terms-single',
    prompt: 'Simplify: 8y + 5 + 3y + 2', expression: '8y + 5 + 3y + 2', answer: '11y + 7',
    hints: [
      'Only like terms can be collected. The y terms are like each other; the numbers are like each other.',
      'Collect 8y + 3y, then collect 5 + 2 separately.',
      '11y and 7 are not like terms, so the answer has two parts: 11y + ?',
    ],
  },
  'camb-s7-expr-n1-06': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N1', track: 'step',
    op: 'simplify', skills: ['alg.expr.like-terms-single'], legacySubTopic: 'like-terms-single',
    prompt: 'A shop sells n notebooks in the morning and 3n notebooks in the afternoon. It also sells 4 notebooks online. Write and simplify an expression for the total sold.',
    expression: 'n + 3n + 4', answer: '4n + 4',
    hints: [
      'Write the three amounts as a sum first, then look for like terms.',
      'n and 3n are like terms; the 4 is a separate constant term.',
      'n + 3n = 4n, and the 4 stays as it is: 4n + ?',
    ],
  },

  // ── s7 · expr · N2 — Substitution and expanding a single bracket ──────────────

  'camb-s7-expr-n2-01': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'evaluate', skills: ['alg.expr.substitute-positive'], legacySubTopic: 'substitute-positive',
    prompt: 'Evaluate 3x + 2 when x = 4',
    expression: '3x + 2', substVar: 'x', substValue: '4', answer: '14',
    hints: [
      'Substitute means replace the variable with the value you are given.',
      'Replace x with 4, so 3x becomes 3 × 4.',
      '3 × 4 = 12, then add 2: ?',
    ],
  },
  'camb-s7-expr-n2-02': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'evaluate', skills: ['alg.expr.substitute-positive'], legacySubTopic: 'substitute-positive',
    prompt: 'Evaluate 5a − 3 when a = 6',
    expression: '5a - 3', substVar: 'a', substValue: '6', answer: '27',
    hints: [
      'Replace the variable a with the value 6, then work out the arithmetic.',
      '5a means 5 × a, so 5a becomes 5 × 6.',
      '5 × 6 = 30, then subtract 3: ?',
    ],
  },
  'camb-s7-expr-n2-03': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'evaluate', skills: ['alg.expr.substitute-positive'], legacySubTopic: 'substitute-positive',
    prompt: 'The cost C dollars of hiring a bicycle for h hours is given by the formula C = 4h + 5. Find the cost of hiring a bicycle for 3 hours.',
    expression: '4h + 5', substVar: 'h', substValue: '3', answer: '17',
    hints: [
      'A formula tells you how to work out C once you know h. Substitute the value of h.',
      'Replace h with 3, so 4h becomes 4 × 3.',
      '4 × 3 = 12, then add the fixed 5: ?',
    ],
  },
  'camb-s7-expr-n2-04': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'expand', skills: ['alg.expr.expand-single'], legacySubTopic: 'expand-single',
    prompt: 'Expand: 3(x + 2)', expression: '3(x + 2)', answer: '3x + 6',
    hints: [
      'Expanding means multiplying the number outside the bracket by everything inside it.',
      'Multiply 3 by x, then multiply 3 by 2.',
      '3 × x = 3x and 3 × 2 = 6, so the answer is 3x + ?',
    ],
  },
  'camb-s7-expr-n2-05': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'expand', skills: ['alg.expr.expand-single'], legacySubTopic: 'expand-single',
    prompt: 'Expand: 4(2y + 5)', expression: '4(2y + 5)', answer: '8y + 20',
    hints: [
      'Every term inside the bracket must be multiplied by the number outside.',
      'Multiply 4 by 2y, then multiply 4 by 5.',
      '4 × 2y = 8y and 4 × 5 = 20, so the answer is 8y + ?',
    ],
  },
  'camb-s7-expr-n2-06': {
    frameId: 'CAMB', bandId: 's7', unitId: 'expr', levelId: 'N2', track: 'step',
    op: 'expand', skills: ['alg.expr.expand-single'], legacySubTopic: 'expand-single',
    prompt: 'Expand: 5(3n − 1)', expression: '5(3n - 1)', answer: '15n - 5',
    hints: [
      'Multiply the number outside by both terms inside — including the one being subtracted.',
      'Multiply 5 by 3n, then multiply 5 by 1. The subtraction sign stays.',
      '5 × 3n = 15n and 5 × 1 = 5, so the answer is 15n − ?',
    ],
  },

  // ── s7 · lineq · N1 — Linear equations, unknown on one side only ──────────────

  'camb-s7-lineq-n1-01': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.solve-one-step'], legacySubTopic: 'solve-one-step',
    prompt: 'Solve: 2x = 8', expression: '2x = 8', answer: 'x = 4',
    hints: [
      'To solve an equation you undo what has been done to the unknown.',
      'x has been multiplied by 2, so divide both sides by 2.',
      '8 ÷ 2 = ?',
    ],
  },
  'camb-s7-lineq-n1-02': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.solve-one-step'], legacySubTopic: 'solve-one-step',
    prompt: 'Solve: x + 7 = 12', expression: 'x + 7 = 12', answer: 'x = 5',
    hints: [
      'Undo the operation applied to x, doing the same thing to both sides.',
      '7 has been added to x, so subtract 7 from both sides.',
      '12 − 7 = ?',
    ],
  },
  'camb-s7-lineq-n1-03': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.solve-two-step'], legacySubTopic: 'solve-two-step',
    prompt: 'Solve: 3x + 5 = 14', expression: '3x + 5 = 14', answer: 'x = 3',
    hints: [
      'Two things have been done to x. Undo them in reverse order: the addition first.',
      'Subtract 5 from both sides to get 3x on its own.',
      '3x = 9, so divide both sides by 3: ?',
    ],
  },
  'camb-s7-lineq-n1-04': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.solve-two-step'], legacySubTopic: 'solve-two-step',
    prompt: 'Solve: 4x − 3 = 17', expression: '4x - 3 = 17', answer: 'x = 5',
    hints: [
      'Undo the subtraction first, then the multiplication.',
      '3 has been subtracted, so add 3 to both sides.',
      '4x = 20, so divide both sides by 4: ?',
    ],
  },
  'camb-s7-lineq-n1-05': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.solve-two-step'], legacySubTopic: 'solve-two-step',
    prompt: 'A number is multiplied by 6, and then 4 is added. The result is 28. Form an equation and solve it to find the number.',
    expression: '6x + 4 = 28', answer: 'x = 4',
    hints: [
      'Call the unknown number x and write down what happens to it, in order.',
      'Multiplied by 6 gives 6x; adding 4 gives 6x + 4, and this equals 28.',
      'Subtract 4 from both sides to get 6x = 24, then divide by 6: ?',
    ],
  },
  'camb-s7-lineq-n1-06': {
    frameId: 'CAMB', bandId: 's7', unitId: 'lineq', levelId: 'N1', track: 'step',
    op: 'solve', skills: ['alg.lineq.negative-coefficient'], legacySubTopic: 'negative-coefficient',
    prompt: 'Solve: 9 − 2x = 7', expression: '9 - 2x = 7', answer: 'x = 1',
    hints: [
      'The unknown is still on one side only, but this time it is being subtracted.',
      'Subtract 9 from both sides. That leaves −2x on the left.',
      '−2x = −2, so divide both sides by −2: ?',
    ],
  },

};

const draws = {
  'CAMB-s7-expr-N1':  { test: ['camb-s7-expr-n1-04', 'camb-s7-expr-n1-05', 'camb-s7-expr-n1-06'],
                        final: ['camb-s7-expr-n1-05', 'camb-s7-expr-n1-02'] },
  'CAMB-s7-expr-N2':  { test: ['camb-s7-expr-n2-02', 'camb-s7-expr-n2-04', 'camb-s7-expr-n2-06'],
                        final: ['camb-s7-expr-n2-03', 'camb-s7-expr-n2-05'] },
  'CAMB-s7-lineq-N1': { test: ['camb-s7-lineq-n1-03', 'camb-s7-lineq-n1-04', 'camb-s7-lineq-n1-06'],
                        final: ['camb-s7-lineq-n1-05', 'camb-s7-lineq-n1-06'] },
};

const lang = 'en';

const _seedExports = { lang, skillsUsed, seeds, draws };
if (typeof module !== 'undefined') module.exports = _seedExports;
if (typeof window !== 'undefined') window.SeedCambridgeS7 = _seedExports;
