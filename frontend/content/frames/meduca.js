'use strict';

/**
 * LAYER B — Frame: MEDUCA (reference frame)
 * Source: docs/curriculum_structure_authority.md §7.1
 *
 * Ministerio de Educación de Panamá, 2014 programs.
 * This is the reference frame: every Panamanian school, public or private, is
 * MEDUCA-accredited, so every other frame is read as an offset from this one.
 *
 * A frame may only REFERENCE skill ids from skill-graph.js. It never defines a skill.
 *
 * ⚠ g6 and g10–g12 are PROVISIONAL — the official PDFs are published but were not
 * read. No seeds may be authored against a PROVISIONAL band.
 */

const frame = {
  id: 'MEDUCA',
  name: { es: 'Ministerio de Educación de Panamá', en: 'Panama Ministry of Education' },
  authority: 'MEDUCA',
  edition: '2014',
  region: 'PA',
  reference: true,
  language: { default: 'es', available: ['es', 'en'] },
  status: 'DRAFT',
  dropped: ['geometria', 'medicion', 'estadistica', 'probabilidad', 'trigonometria'],
  constraints: { calculator: false, answerFormat: 'exact' },

  bands: [
    {
      id: 'g6', label: { es: '6.º grado', en: 'Grade 6' }, age: '11–12', status: 'PROVISIONAL',
      units: [
        { id: 'num', label: { es: 'Números', en: 'Number' }, levels: [
          { id: 'N1', skills: ['num.int.operations', 'num.rat.operations'], gate: 'none' },
        ] },
        { id: 'pattern', label: { es: 'Patrones', en: 'Patterns' }, levels: [
          { id: 'N1', skills: ['alg.seq.term-to-term', 'alg.expr.language'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g7', label: { es: '7.º grado', en: 'Grade 7' }, age: '12–13', status: 'DRAFT',
      units: [
        { id: 'num', label: { es: 'Números', en: 'Number' }, levels: [
          { id: 'N1', skills: ['num.int.operations', 'num.rat.operations'], gate: 'none' },
        ] },
        { id: 'expr', label: { es: 'Expresiones algebraicas', en: 'Algebraic expressions' }, levels: [
          { id: 'N1', skills: ['alg.expr.language', 'alg.expr.parts'], gate: 'all' },
          { id: 'N2', skills: ['alg.expr.substitute-positive'], gate: 'all' },
          { id: 'N3', skills: ['alg.expr.like-terms-single', 'alg.expr.like-terms-multi'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g8', label: { es: '8.º grado', en: 'Grade 8' }, age: '13–14', status: 'DRAFT',
      units: [
        { id: 'num', label: { es: 'Números reales', en: 'Real numbers' }, levels: [
          { id: 'N1', skills: ['num.real.set', 'num.exp.product', 'num.exp.power', 'num.rad.simplify'], gate: 'all' },
        ] },
        { id: 'expr', label: { es: 'Expresiones algebraicas', en: 'Algebraic expressions' }, levels: [
          { id: 'N1', skills: ['alg.expr.language', 'alg.expr.substitute-negative', 'alg.expr.like-terms-negative'], gate: 'all' },
        ] },
        { id: 'poly', label: { es: 'Operaciones con polinomios', en: 'Polynomial operations' }, levels: [
          { id: 'N1', skills: ['alg.poly.add-sub'], gate: 'all' },
          { id: 'N2', skills: ['alg.poly.mul-mono', 'alg.poly.mul-binomial', 'alg.expr.expand-single'], gate: 'all' },
          { id: 'N3', skills: ['alg.poly.div-mono', 'num.exp.quotient'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g9', label: { es: '9.º grado', en: 'Grade 9' }, age: '14–15', status: 'DRAFT',
      units: [
        { id: 'factor', label: { es: 'Factorización', en: 'Factorisation' }, levels: [
          { id: 'N1', skills: ['alg.expr.factor-common', 'alg.poly.factor-grouping'], gate: 'all' },
          { id: 'N2', skills: ['alg.poly.special-square', 'alg.poly.special-diff-squares'], gate: 'all' },
          { id: 'N3', skills: ['alg.poly.factor-trinomial', 'alg.poly.factor-cubes'], gate: 'all' },
        ] },
        { id: 'rat', label: { es: 'Fracciones algebraicas', en: 'Algebraic fractions' }, levels: [
          { id: 'N1', skills: ['alg.rat.simplify'], gate: 'all' },
          { id: 'N2', skills: ['alg.rat.add-sub', 'alg.rat.mul-div'], gate: 'all' },
        ] },
        { id: 'lineq', label: { es: 'Ecuaciones', en: 'Equations' }, levels: [
          { id: 'N1', skills: ['alg.lineq.solve-one-step', 'alg.lineq.solve-two-step'], gate: 'all' },
          { id: 'N2', skills: ['alg.lineq.brackets', 'alg.lineq.both-sides'], gate: 'all' },
        ] },
        { id: 'sys', label: { es: 'Sistemas', en: 'Systems' }, levels: [
          { id: 'N1', skills: ['alg.sys.substitution', 'alg.sys.elimination'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g10', label: { es: '10.º grado', en: 'Grade 10' }, age: '15–16', status: 'PROVISIONAL',
      units: [
        { id: 'num', label: { es: 'Números reales', en: 'Real numbers' }, levels: [
          { id: 'N1', skills: ['num.real.set', 'num.exp.negative', 'num.rad.rationalize'], gate: 'all' },
        ] },
        { id: 'lineq', label: { es: 'Ecuaciones e inecuaciones', en: 'Equations and inequalities' }, levels: [
          { id: 'N1', skills: ['alg.lineq.both-sides-brackets', 'alg.lineq.fractions', 'alg.lineq.rearrange-formula'], gate: 'all' },
          { id: 'N2', skills: ['alg.ineq.solve-positive', 'alg.ineq.flip', 'alg.ineq.compound'], gate: 'all' },
        ] },
        { id: 'func', label: { es: 'Relaciones y funciones', en: 'Relations and functions' }, levels: [
          { id: 'N1', skills: ['alg.func.notation', 'alg.func.slope', 'alg.func.line-equation'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g11', label: { es: '11.º grado', en: 'Grade 11' }, age: '16–17', status: 'PROVISIONAL',
      units: [
        { id: 'quad', label: { es: 'Función cuadrática', en: 'Quadratic functions' }, levels: [
          { id: 'N1', skills: ['alg.quad.solve-factor', 'alg.quad.formula', 'alg.quad.discriminant'], gate: 'all' },
          { id: 'N2', skills: ['alg.quad.complete-square', 'alg.quad.vertex-form'], gate: 'all' },
        ] },
        { id: 'explog', label: { es: 'Exponencial y logarítmica', en: 'Exponential and logarithmic' }, levels: [
          { id: 'N1', skills: ['alg.explog.same-base', 'alg.explog.log-definition'], gate: 'all' },
          { id: 'N2', skills: ['alg.explog.log-laws', 'alg.explog.log-equation'], gate: 'all' },
        ] },
        { id: 'func', label: { es: 'Funciones', en: 'Functions' }, levels: [
          { id: 'N1', skills: ['alg.func.domain-range', 'alg.func.composite', 'alg.func.inverse'], gate: 'all' },
        ] },
      ],
    },
    {
      id: 'g12', label: { es: '12.º grado', en: 'Grade 12' }, age: '17–18', status: 'PROVISIONAL',
      units: [
        { id: 'seq', label: { es: 'Sucesiones y series', en: 'Sequences and series' }, levels: [
          { id: 'N1', skills: ['alg.seq.nth-term', 'alg.seq.arithmetic-series'], gate: 'all' },
          { id: 'N2', skills: ['alg.seq.geometric-nth', 'alg.seq.geometric-series'], gate: 'all' },
        ] },
        { id: 'poly', label: { es: 'Funciones polinómicas', en: 'Polynomial functions' }, levels: [
          { id: 'N1', skills: ['alg.poly.div-long', 'alg.poly.factor-theorem'], gate: 'all' },
        ] },
        { id: 'rat', label: { es: 'Funciones racionales', en: 'Rational functions' }, levels: [
          { id: 'N1', skills: ['alg.rat.equation', 'alg.rat.complex-fraction'], gate: 'all' },
        ] },
      ],
    },
  ],
};

if (typeof module !== 'undefined') module.exports = frame;
if (typeof window !== 'undefined') { window.Frames = window.Frames || {}; window.Frames.MEDUCA = frame; }
