'use strict';

/**
 * LAYER B — Frame: CAMB (Cambridge)
 * Source: docs/curriculum_structure_authority.md §7.2
 *
 * Cambridge Lower Secondary stages 7–9, then IGCSE Mathematics.
 * Panamanian schools: Casco/KCSP, MET, Isaac Rabin.
 *
 * s7–s9 are grounded in curriculum_brain.md §1 (verified).
 * ⚠ igcse is PROVISIONAL — the 0580 syllabus was not read at subtopic granularity.
 *   No seeds against it until it is.
 *
 * Seeded content so far: s7 (frontend/content/seed-cambridge-s7.js, 18 seeds).
 */

const frame = {
  id: 'CAMB',
  name: { es: 'Cambridge', en: 'Cambridge' },
  authority: 'Cambridge Assessment International Education',
  edition: 'Lower Secondary + IGCSE 0580',
  region: 'INT',
  reference: false,
  language: { default: 'en', available: ['en', 'es'] },
  status: 'DRAFT',
  dropped: ['geometry', 'mensuration', 'trigonometry', 'vectors', 'transformations',
            'probability', 'statistics', 'coordinate-geometry', 'differentiation'],
  constraints: { calculator: false, answerFormat: 'exact' },

  bands: [
    {
      id: 's7', label: { es: 'Etapa 7', en: 'Stage 7' }, age: '11–12', status: 'DRAFT',
      units: [
        { id: 'expr', label: { es: 'Expresiones algebraicas', en: 'Algebraic expressions' }, levels: [
          { id: 'N1', skills: ['alg.expr.language', 'alg.expr.parts', 'alg.expr.like-terms-single'], gate: 'none' },
          { id: 'N2', skills: ['alg.expr.substitute-positive', 'alg.expr.expand-single'], gate: 'all' },
        ] },
        { id: 'lineq', label: { es: 'Ecuaciones lineales', en: 'Linear equations' }, levels: [
          // negative-coefficient added per D-STRUCT-13: brain §1 lists 9 − 2x = 7 as Stage 7.
          { id: 'N1', skills: ['alg.lineq.solve-one-step', 'alg.lineq.solve-two-step', 'alg.lineq.negative-coefficient'], gate: 'all' },
        ] },
        { id: 'seq', label: { es: 'Sucesiones', en: 'Sequences' }, levels: [
          { id: 'N1', skills: ['alg.seq.term-to-term'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 's8', label: { es: 'Etapa 8', en: 'Stage 8' }, age: '12–13', status: 'DRAFT',
      units: [
        { id: 'expr', label: { es: 'Expresiones algebraicas', en: 'Algebraic expressions' }, levels: [
          { id: 'N1', skills: ['alg.expr.like-terms-negative', 'alg.expr.substitute-negative', 'alg.expr.substitute-power'], gate: 'all' },
          { id: 'N2', skills: ['alg.expr.expand-simplify', 'alg.expr.factor-common'], gate: 'all' },
        ] },
        { id: 'lineq', label: { es: 'Ecuaciones lineales', en: 'Linear equations' }, levels: [
          { id: 'N1', skills: ['alg.lineq.both-sides', 'alg.lineq.rearrange-formula'], gate: 'all' },
        ] },
        { id: 'seq', label: { es: 'Sucesiones', en: 'Sequences' }, levels: [
          { id: 'N1', skills: ['alg.seq.nth-term'], gate: 'all' },
        ] },
        { id: 'func', label: { es: 'Rectas y gráficas', en: 'Lines and graphs' }, levels: [
          { id: 'N1', skills: ['alg.func.slope', 'alg.func.line-equation'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 's9', label: { es: 'Etapa 9', en: 'Stage 9' }, age: '13–14', status: 'DRAFT',
      units: [
        { id: 'poly', label: { es: 'Polinomios', en: 'Polynomials' }, levels: [
          { id: 'N1', skills: ['alg.poly.mul-binomial', 'alg.poly.special-square', 'alg.poly.special-diff-squares'], gate: 'all' },
          { id: 'N2', skills: ['alg.poly.factor-trinomial'], gate: 'all' },
        ] },
        { id: 'lineq', label: { es: 'Ecuaciones lineales', en: 'Linear equations' }, levels: [
          { id: 'N1', skills: ['alg.lineq.brackets', 'alg.lineq.both-sides-brackets', 'alg.lineq.fractions'], gate: 'all' },
        ] },
        { id: 'ineq', label: { es: 'Inecuaciones', en: 'Inequalities' }, levels: [
          { id: 'N1', skills: ['alg.ineq.solve-positive', 'alg.ineq.flip'], gate: 'all' },
        ] },
        { id: 'sys', label: { es: 'Sistemas', en: 'Simultaneous equations' }, levels: [
          { id: 'N1', skills: ['alg.sys.substitution', 'alg.sys.elimination'], gate: 'all' },
        ] },
        { id: 'func', label: { es: 'Funciones', en: 'Functions' }, levels: [
          { id: 'N1', skills: ['alg.func.notation', 'alg.func.domain-range'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'igcse', label: { es: 'IGCSE', en: 'IGCSE' }, age: '14–16', status: 'PROVISIONAL',
      units: [
        { id: 'num', label: { es: 'Índices y forma estándar', en: 'Indices and standard form' }, levels: [
          { id: 'N1', skills: ['num.exp.negative', 'num.exp.fractional', 'num.sci.normalize', 'num.rad.simplify'], gate: 'all' },
        ] },
        { id: 'poly', label: { es: 'Factorización', en: 'Factorisation' }, levels: [
          { id: 'N1', skills: ['alg.poly.factor-trinomial-lead', 'alg.poly.factor-grouping'], gate: 'all' },
        ] },
        { id: 'rat', label: { es: 'Fracciones algebraicas', en: 'Algebraic fractions' }, levels: [
          { id: 'N1', skills: ['alg.rat.simplify', 'alg.rat.add-sub', 'alg.rat.mul-div', 'alg.rat.equation'], gate: 'all' },
          { id: 'N2', skills: ['alg.rat.direct-variation', 'alg.rat.inverse-variation'], gate: 'all' },
        ] },
        { id: 'quad', label: { es: 'Cuadráticas', en: 'Quadratics' }, levels: [
          { id: 'N1', skills: ['alg.quad.solve-factor', 'alg.quad.formula'], gate: 'all' },
          { id: 'N2', skills: ['alg.quad.complete-square', 'alg.quad.discriminant'], gate: 'all' },
        ] },
        { id: 'ineq', label: { es: 'Inecuaciones', en: 'Inequalities' }, levels: [
          { id: 'N1', skills: ['alg.ineq.compound', 'alg.ineq.system-graph'], gate: 'all' },
        ] },
        { id: 'sys', label: { es: 'Sistemas', en: 'Simultaneous equations' }, levels: [
          { id: 'N1', skills: ['alg.sys.nonlinear'], gate: 'all' },
        ] },
        { id: 'seq', label: { es: 'Sucesiones', en: 'Sequences' }, levels: [
          { id: 'N1', skills: ['alg.seq.geometric-nth', 'alg.seq.quadratic-pattern'], gate: 'all' },
        ] },
        { id: 'func', label: { es: 'Funciones', en: 'Functions' }, levels: [
          { id: 'N1', skills: ['alg.func.composite', 'alg.func.inverse'], gate: 'all' },
        ] },
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = frame;
if (typeof window !== 'undefined') { window.Frames = window.Frames || {}; window.Frames.CAMB = frame; }
