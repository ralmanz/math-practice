(function () {
'use strict';

/**
 * LAYER A — the curriculum-agnostic skill graph.
 *
 * GENERATED FILE — do not edit by hand.
 * Source of truth: docs/curriculum_structure_authority.md §5
 * Regenerate:      node scripts/gen-skill-graph.js
 *
 * 105 skills · track split O:4 S:52 S*:37 M:12
 *   S  = existing op, the step engine grades it today
 *   S* = step-gradable in principle, needs a new op or validator first
 *   M  = MCQ track, engine not built
 *   O  = out of Nuvo delivery
 *
 * Frames (Layer B) may only REFERENCE these ids. Adding a skill is a Layer A
 * change and belongs in the doc first.
 */

const skills = {
  "num.int.operations": { strand: "num", es: "Operaciones con enteros", en: "Integer operations", op: "evaluate", track: "O", prereqs: [], legacySubTopic: null },
  "num.rat.operations": { strand: "num", es: "Operaciones con racionales", en: "Rational number operations", op: "evaluate", track: "O", prereqs: ["num.int.operations"], legacySubTopic: null },
  "num.real.set": { strand: "num", es: "Conjunto de los reales", en: "The real number set", op: null, track: "O", prereqs: ["num.rat.operations"], legacySubTopic: null },
  "num.exp.product": { strand: "num", es: "Ley del producto de potencias", en: "Product law of indices", op: "simplify", track: "S", prereqs: ["num.rat.operations"], legacySubTopic: "exponent-product" },
  "num.exp.power": { strand: "num", es: "Potencia de una potencia", en: "Power of a power", op: "simplify", track: "S", prereqs: ["num.exp.product"], legacySubTopic: "exponent-power" },
  "num.exp.quotient": { strand: "num", es: "Cociente de potencias", en: "Quotient law of indices", op: "simplify", track: "S", prereqs: ["num.exp.product"], legacySubTopic: "exponent-quotient" },
  "num.exp.negative": { strand: "num", es: "Exponentes negativos", en: "Negative indices", op: "simplify", track: "S", prereqs: ["num.exp.quotient"], legacySubTopic: null },
  "num.exp.fractional": { strand: "num", es: "Exponentes fraccionarios", en: "Fractional indices", op: "simplify", track: "S*", prereqs: ["num.exp.negative","num.rad.simplify"], legacySubTopic: null },
  "num.sci.normalize": { strand: "num", es: "Notación científica", en: "Standard form", op: "scientific", track: "S*", prereqs: ["num.exp.product"], legacySubTopic: "scientific" },
  "num.rad.simplify": { strand: "num", es: "Simplificar radicales", en: "Simplifying surds", op: "simplify", track: "S*", prereqs: ["num.exp.power"], legacySubTopic: null },
  "num.rad.rationalize": { strand: "num", es: "Racionalizar el denominador", en: "Rationalising the denominator", op: "simplify", track: "S*", prereqs: ["num.rad.simplify"], legacySubTopic: null },
  "num.cx.form": { strand: "num", es: "Números complejos a+bi", en: "Complex numbers a+bi", op: null, track: "S*", prereqs: ["num.rad.simplify","alg.quad.discriminant"], legacySubTopic: null },
  "num.cx.operations": { strand: "num", es: "Operaciones con complejos", en: "Complex number operations", op: "simplify", track: "S*", prereqs: ["num.cx.form"], legacySubTopic: null },
  "alg.expr.language": { strand: "alg.expr", es: "Lenguaje algebraico", en: "Algebraic language", op: "translate", track: "S", prereqs: ["num.rat.operations"], legacySubTopic: "translate-expression" },
  "alg.expr.parts": { strand: "alg.expr", es: "Término, coeficiente, grado", en: "Term, coefficient, degree", op: null, track: "O", prereqs: ["alg.expr.language"], legacySubTopic: null },
  "alg.expr.like-terms-single": { strand: "alg.expr", es: "Términos semejantes, una variable", en: "Like terms, one variable", op: "simplify", track: "S", prereqs: ["alg.expr.language"], legacySubTopic: "like-terms-single" },
  "alg.expr.like-terms-multi": { strand: "alg.expr", es: "Términos semejantes, varias variables", en: "Like terms, several variables", op: "simplify", track: "S", prereqs: ["alg.expr.like-terms-single"], legacySubTopic: "like-terms-multi" },
  "alg.expr.like-terms-negative": { strand: "alg.expr", es: "Términos semejantes con negativos", en: "Like terms with negatives", op: "simplify", track: "S", prereqs: ["alg.expr.like-terms-single"], legacySubTopic: "like-terms-negative" },
  "alg.expr.substitute-positive": { strand: "alg.expr", es: "Sustituir valores positivos", en: "Substituting positive values", op: "evaluate", track: "S", prereqs: ["alg.expr.like-terms-single"], legacySubTopic: "substitute-positive" },
  "alg.expr.substitute-negative": { strand: "alg.expr", es: "Sustituir valores negativos", en: "Substituting negative values", op: "evaluate", track: "S", prereqs: ["alg.expr.substitute-positive"], legacySubTopic: "substitute-negative" },
  "alg.expr.substitute-power": { strand: "alg.expr", es: "Sustituir en potencias", en: "Substituting into powers", op: "evaluate", track: "S", prereqs: ["alg.expr.substitute-negative"], legacySubTopic: "substitute-power" },
  "alg.expr.expand-single": { strand: "alg.expr", es: "Expandir un paréntesis", en: "Expanding a single bracket", op: "expand", track: "S", prereqs: ["alg.expr.like-terms-single"], legacySubTopic: "expand-single" },
  "alg.expr.expand-simplify": { strand: "alg.expr", es: "Expandir y simplificar", en: "Expand and simplify", op: "expand", track: "S", prereqs: ["alg.expr.expand-single","alg.expr.like-terms-negative"], legacySubTopic: "expand-simplify" },
  "alg.expr.factor-common": { strand: "alg.expr", es: "Factor común", en: "Common factor", op: "factor", track: "S", prereqs: ["alg.expr.expand-single"], legacySubTopic: "factor-common" },
  "alg.poly.add-sub": { strand: "alg.poly", es: "Suma y resta de polinomios", en: "Adding and subtracting polynomials", op: "simplify", track: "S", prereqs: ["alg.expr.like-terms-negative"], legacySubTopic: null },
  "alg.poly.mul-mono": { strand: "alg.poly", es: "Multiplicación por monomio", en: "Multiplying by a monomial", op: "expand", track: "S", prereqs: ["alg.expr.expand-single","num.exp.product"], legacySubTopic: null },
  "alg.poly.div-mono": { strand: "alg.poly", es: "División entre monomio", en: "Dividing by a monomial", op: "simplify", track: "S", prereqs: ["alg.poly.mul-mono","num.exp.quotient"], legacySubTopic: null },
  "alg.poly.mul-binomial": { strand: "alg.poly", es: "Producto de dos binomios", en: "Expanding double brackets", op: "expand", track: "S", prereqs: ["alg.poly.mul-mono"], legacySubTopic: null },
  "alg.poly.special-square": { strand: "alg.poly", es: "Trinomio cuadrado perfecto", en: "Perfect square trinomial", op: "factor", track: "S", prereqs: ["alg.poly.mul-binomial"], legacySubTopic: null },
  "alg.poly.special-diff-squares": { strand: "alg.poly", es: "Diferencia de cuadrados", en: "Difference of two squares", op: "factor", track: "S", prereqs: ["alg.poly.mul-binomial"], legacySubTopic: null },
  "alg.poly.factor-trinomial": { strand: "alg.poly", es: "Trinomio x²+bx+c", en: "Factorising x²+bx+c", op: "factor", track: "S", prereqs: ["alg.poly.special-square"], legacySubTopic: null },
  "alg.poly.factor-trinomial-lead": { strand: "alg.poly", es: "Trinomio ax²+bx+c, a≠1", en: "Factorising ax²+bx+c", op: "factor", track: "S", prereqs: ["alg.poly.factor-trinomial"], legacySubTopic: null },
  "alg.poly.factor-grouping": { strand: "alg.poly", es: "Factorización por agrupación", en: "Factorising by grouping", op: "factor", track: "S", prereqs: ["alg.expr.factor-common"], legacySubTopic: null },
  "alg.poly.factor-cubes": { strand: "alg.poly", es: "Suma y diferencia de cubos", en: "Sum and difference of cubes", op: "factor", track: "S", prereqs: ["alg.poly.factor-trinomial"], legacySubTopic: null },
  "alg.poly.remainder": { strand: "alg.poly", es: "Residuo (evaluar en x=−a)", en: "Remainder by evaluation", op: "evaluate", track: "S", prereqs: ["alg.expr.substitute-negative"], legacySubTopic: "remainder" },
  "alg.poly.div-long": { strand: "alg.poly", es: "División larga de polinomios", en: "Polynomial long division", op: "simplify", track: "S*", prereqs: ["alg.poly.div-mono","alg.poly.mul-binomial"], legacySubTopic: null },
  "alg.poly.factor-theorem": { strand: "alg.poly", es: "Teorema del factor", en: "Factor theorem", op: "factor", track: "S*", prereqs: ["alg.poly.div-long","alg.poly.remainder"], legacySubTopic: null },
  "alg.rat.simplify": { strand: "alg.rat", es: "Simplificar fracciones algebraicas", en: "Simplifying algebraic fractions", op: "simplify", track: "S", prereqs: ["alg.poly.factor-trinomial"], legacySubTopic: null },
  "alg.rat.mul-div": { strand: "alg.rat", es: "Multiplicar y dividir", en: "Multiplying and dividing", op: "simplify", track: "S", prereqs: ["alg.rat.simplify"], legacySubTopic: null },
  "alg.rat.add-sub": { strand: "alg.rat", es: "Sumar y restar", en: "Adding and subtracting", op: "simplify", track: "S", prereqs: ["alg.rat.simplify"], legacySubTopic: null },
  "alg.rat.complex-fraction": { strand: "alg.rat", es: "Fracciones compuestas", en: "Compound fractions", op: "simplify", track: "S*", prereqs: ["alg.rat.add-sub","alg.rat.mul-div"], legacySubTopic: null },
  "alg.rat.equation": { strand: "alg.rat", es: "Ecuación racional", en: "Rational equations", op: "solve", track: "S", prereqs: ["alg.rat.simplify","alg.lineq.both-sides"], legacySubTopic: "rational-equation" },
  "alg.rat.direct-variation": { strand: "alg.rat", es: "Variación directa", en: "Direct variation", op: "solve", track: "S", prereqs: ["alg.lineq.proportion"], legacySubTopic: null },
  "alg.rat.inverse-variation": { strand: "alg.rat", es: "Variación inversa", en: "Inverse variation", op: "solve", track: "S", prereqs: ["alg.rat.equation"], legacySubTopic: "inverse-variation" },
  "alg.rat.partial-fractions": { strand: "alg.rat", es: "Fracciones parciales", en: "Partial fractions", op: "simplify", track: "S*", prereqs: ["alg.rat.add-sub","alg.sys.three-var"], legacySubTopic: null },
  "alg.rad.simplify-expr": { strand: "alg.rad", es: "Simplificar expresiones radicales", en: "Simplifying radical expressions", op: "simplify", track: "S*", prereqs: ["num.rad.simplify","alg.expr.like-terms-negative"], legacySubTopic: null },
  "alg.rad.equation": { strand: "alg.rad", es: "Ecuaciones con radicales", en: "Radical equations", op: "solve", track: "S*", prereqs: ["alg.rad.simplify-expr","alg.quad.solve-factor"], legacySubTopic: null },
  "alg.lineq.solve-one-step": { strand: "alg.lineq", es: "Ecuación de un paso", en: "One-step equations", op: "solve", track: "S", prereqs: ["alg.expr.like-terms-single"], legacySubTopic: "solve-one-step" },
  "alg.lineq.solve-two-step": { strand: "alg.lineq", es: "Ecuación de dos pasos", en: "Two-step equations", op: "solve", track: "S", prereqs: ["alg.lineq.solve-one-step"], legacySubTopic: "solve-two-step" },
  "alg.lineq.negative-coefficient": { strand: "alg.lineq", es: "Coeficiente negativo", en: "Negative coefficient", op: "solve", track: "S", prereqs: ["alg.lineq.solve-two-step","alg.expr.like-terms-negative"], legacySubTopic: "negative-coefficient" },
  "alg.lineq.proportion": { strand: "alg.lineq", es: "Proporciones y razones", en: "Ratio and proportion", op: "solve", track: "S", prereqs: ["alg.lineq.solve-two-step"], legacySubTopic: "proportion" },
  "alg.lineq.translate": { strand: "alg.lineq", es: "Traducir enunciado → ecuación", en: "Word problem → equation", op: "translate", track: "S", prereqs: ["alg.expr.language","alg.lineq.solve-two-step"], legacySubTopic: "translate-equation" },
  "alg.lineq.brackets": { strand: "alg.lineq", es: "Ecuación con paréntesis", en: "Equations with brackets", op: "solve", track: "S", prereqs: ["alg.lineq.solve-two-step","alg.expr.expand-single"], legacySubTopic: "brackets" },
  "alg.lineq.both-sides": { strand: "alg.lineq", es: "Incógnita en ambos lados", en: "Unknown on both sides", op: "solve", track: "S", prereqs: ["alg.lineq.negative-coefficient"], legacySubTopic: "both-sides" },
  "alg.lineq.both-sides-brackets": { strand: "alg.lineq", es: "Ambos lados con paréntesis", en: "Both sides with brackets", op: "solve", track: "S", prereqs: ["alg.lineq.both-sides","alg.lineq.brackets"], legacySubTopic: "both-sides-brackets" },
  "alg.lineq.fractions": { strand: "alg.lineq", es: "Ecuación con coeficientes fraccionarios", en: "Equations with fractional coefficients", op: "solve", track: "S", prereqs: ["alg.lineq.both-sides-brackets"], legacySubTopic: null },
  "alg.lineq.rearrange-formula": { strand: "alg.lineq", es: "Despejar una variable", en: "Changing the subject", op: "solve", track: "S", prereqs: ["alg.lineq.both-sides-brackets"], legacySubTopic: null },
  "alg.ineq.solve-positive": { strand: "alg.ineq", es: "Inecuación lineal", en: "Linear inequalities", op: "inequality", track: "S", prereqs: ["alg.lineq.solve-two-step"], legacySubTopic: "inequality-positive" },
  "alg.ineq.flip": { strand: "alg.ineq", es: "Invertir el signo", en: "Reversing the inequality", op: "inequality", track: "S", prereqs: ["alg.ineq.solve-positive","alg.lineq.negative-coefficient"], legacySubTopic: "inequality-flip" },
  "alg.ineq.compound": { strand: "alg.ineq", es: "Inecuación compuesta", en: "Compound inequalities", op: "inequality", track: "S", prereqs: ["alg.ineq.flip"], legacySubTopic: null },
  "alg.ineq.absolute-value": { strand: "alg.ineq", es: "Valor absoluto", en: "Absolute value inequalities", op: "inequality", track: "S", prereqs: ["alg.ineq.compound"], legacySubTopic: "absolute-value" },
  "alg.ineq.absolute-value-union": { strand: "alg.ineq", es: "Valor absoluto por unión", en: "Absolute value, union solution", op: "inequality", track: "S", prereqs: ["alg.ineq.absolute-value"], legacySubTopic: "absolute-value-union" },
  "alg.ineq.quadratic": { strand: "alg.ineq", es: "Inecuación cuadrática", en: "Quadratic inequalities", op: "inequality", track: "S*", prereqs: ["alg.ineq.flip","alg.quad.solve-factor"], legacySubTopic: null },
  "alg.ineq.rational": { strand: "alg.ineq", es: "Inecuación racional", en: "Rational inequalities", op: "inequality", track: "S*", prereqs: ["alg.ineq.quadratic","alg.rat.simplify"], legacySubTopic: null },
  "alg.ineq.number-line": { strand: "alg.ineq", es: "Región en la recta numérica", en: "Number line regions", op: "mcq", track: "M", prereqs: ["alg.ineq.solve-positive"], legacySubTopic: null },
  "alg.ineq.system-graph": { strand: "alg.ineq", es: "Sistema de inecuaciones (gráfico)", en: "Systems of inequalities", op: "mcq", track: "M", prereqs: ["alg.ineq.solve-positive","alg.func.line-equation"], legacySubTopic: null },
  "alg.quad.solve-factor": { strand: "alg.quad", es: "Cuadrática por factorización", en: "Solving by factorising", op: "solve", track: "S", prereqs: ["alg.poly.factor-trinomial","alg.lineq.solve-one-step"], legacySubTopic: "quadratic-factor" },
  "alg.quad.any-root": { strand: "alg.quad", es: "Aceptar cualquier raíz", en: "Accept any valid root", op: "solve", track: "S", prereqs: ["alg.quad.solve-factor"], legacySubTopic: "quadratic-any-root" },
  "alg.quad.formula": { strand: "alg.quad", es: "Fórmula general", en: "Quadratic formula", op: "solve", track: "S*", prereqs: ["alg.quad.solve-factor","num.rad.simplify"], legacySubTopic: null },
  "alg.quad.complete-square": { strand: "alg.quad", es: "Completar el cuadrado", en: "Completing the square", op: "solve", track: "S*", prereqs: ["alg.quad.formula"], legacySubTopic: null },
  "alg.quad.discriminant": { strand: "alg.quad", es: "Discriminante", en: "The discriminant", op: "evaluate", track: "S*", prereqs: ["alg.quad.formula"], legacySubTopic: null },
  "alg.quad.roots-sum-product": { strand: "alg.quad", es: "Suma y producto de raíces", en: "Sum and product of roots", op: "evaluate", track: "S*", prereqs: ["alg.quad.formula"], legacySubTopic: null },
  "alg.quad.vertex-form": { strand: "alg.quad", es: "Forma canónica / vértice", en: "Vertex form", op: "simplify", track: "S*", prereqs: ["alg.quad.complete-square"], legacySubTopic: null },
  "alg.quad.graph": { strand: "alg.quad", es: "Gráfica de la parábola", en: "Graphing parabolas", op: "mcq", track: "M", prereqs: ["alg.quad.vertex-form","alg.func.read-graph"], legacySubTopic: null },
  "alg.sys.substitution": { strand: "alg.sys", es: "Sistema 2×2 por sustitución", en: "2×2 by substitution", op: "solve", track: "S", prereqs: ["alg.lineq.both-sides"], legacySubTopic: "system-substitution" },
  "alg.sys.elimination": { strand: "alg.sys", es: "Sistema 2×2 por eliminación", en: "2×2 by elimination", op: "solve", track: "S", prereqs: ["alg.sys.substitution"], legacySubTopic: "system-elimination" },
  "alg.sys.model": { strand: "alg.sys", es: "Modelado verbal → sistema", en: "Word problem → system", op: "translate, solve", track: "S", prereqs: ["alg.sys.elimination","alg.lineq.translate"], legacySubTopic: "system-model" },
  "alg.sys.three-var": { strand: "alg.sys", es: "Sistema 3×3", en: "3×3 systems", op: "solve", track: "S*", prereqs: ["alg.sys.elimination"], legacySubTopic: null },
  "alg.sys.nonlinear": { strand: "alg.sys", es: "Sistema no lineal", en: "Non-linear systems", op: "solve", track: "S*", prereqs: ["alg.sys.substitution","alg.quad.solve-factor"], legacySubTopic: null },
  "alg.sys.graphical": { strand: "alg.sys", es: "Solución gráfica", en: "Graphical solution", op: "mcq", track: "M", prereqs: ["alg.sys.substitution","alg.func.line-equation"], legacySubTopic: null },
  "alg.explog.same-base": { strand: "alg.explog", es: "Ecuación exponencial de igual base", en: "Exponential equations, same base", op: "solve", track: "S*", prereqs: ["num.exp.power","alg.lineq.solve-two-step"], legacySubTopic: null },
  "alg.explog.log-definition": { strand: "alg.explog", es: "Definición de logaritmo", en: "Definition of a logarithm", op: "evaluate", track: "S*", prereqs: ["alg.explog.same-base"], legacySubTopic: null },
  "alg.explog.log-laws": { strand: "alg.explog", es: "Leyes de logaritmos", en: "Laws of logarithms", op: "simplify", track: "S*", prereqs: ["alg.explog.log-definition"], legacySubTopic: null },
  "alg.explog.log-equation": { strand: "alg.explog", es: "Ecuación logarítmica", en: "Logarithmic equations", op: "solve", track: "S*", prereqs: ["alg.explog.log-laws"], legacySubTopic: null },
  "alg.explog.exp-equation": { strand: "alg.explog", es: "Ecuación exponencial con logaritmos", en: "Exponential equations using logs", op: "solve", track: "S*", prereqs: ["alg.explog.log-laws"], legacySubTopic: null },
  "alg.explog.growth-model": { strand: "alg.explog", es: "Modelos de crecimiento y decaimiento", en: "Growth and decay models", op: "solve", track: "S*", prereqs: ["alg.explog.exp-equation"], legacySubTopic: null },
  "alg.func.notation": { strand: "alg.func", es: "Notación f(x)", en: "Function notation f(x)", op: "evaluate", track: "S", prereqs: ["alg.expr.substitute-negative"], legacySubTopic: null },
  "alg.func.domain-range": { strand: "alg.func", es: "Dominio y rango", en: "Domain and range", op: "mcq", track: "M", prereqs: ["alg.func.notation"], legacySubTopic: null },
  "alg.func.composite": { strand: "alg.func", es: "Función compuesta", en: "Composite functions", op: "evaluate", track: "S*", prereqs: ["alg.func.notation"], legacySubTopic: null },
  "alg.func.inverse": { strand: "alg.func", es: "Función inversa", en: "Inverse functions", op: "solve", track: "S*", prereqs: ["alg.func.composite","alg.lineq.rearrange-formula"], legacySubTopic: null },
  "alg.func.piecewise": { strand: "alg.func", es: "Función definida por tramos", en: "Piecewise functions", op: "evaluate", track: "S*", prereqs: ["alg.func.notation","alg.ineq.compound"], legacySubTopic: null },
  "alg.func.transformations": { strand: "alg.func", es: "Transformaciones de gráficas", en: "Graph transformations", op: "mcq", track: "M", prereqs: ["alg.func.notation","alg.quad.vertex-form"], legacySubTopic: null },
  "alg.func.slope": { strand: "alg.func", es: "Pendiente", en: "Gradient", op: "mcq", track: "M", prereqs: ["alg.lineq.solve-two-step"], legacySubTopic: null },
  "alg.func.line-equation": { strand: "alg.func", es: "Ecuación de la recta", en: "Equation of a line", op: "mcq", track: "M", prereqs: ["alg.func.slope"], legacySubTopic: null },
  "alg.func.read-graph": { strand: "alg.func", es: "Lectura de gráficas", en: "Reading graphs", op: "mcq", track: "M", prereqs: ["alg.func.line-equation"], legacySubTopic: null },
  "alg.func.rate-of-change": { strand: "alg.func", es: "Razón de cambio", en: "Rate of change", op: "mcq", track: "M", prereqs: ["alg.func.line-equation"], legacySubTopic: null },
  "alg.seq.term-to-term": { strand: "alg.seq", es: "Regla término a término", en: "Term-to-term rule", op: "mcq", track: "M", prereqs: ["num.int.operations"], legacySubTopic: null },
  "alg.seq.nth-term": { strand: "alg.seq", es: "Término general (aritmética)", en: "nth term, arithmetic", op: "evaluate", track: "S*", prereqs: ["alg.seq.term-to-term","alg.expr.language"], legacySubTopic: null },
  "alg.seq.geometric-nth": { strand: "alg.seq", es: "Término general (geométrica)", en: "nth term, geometric", op: "evaluate", track: "S*", prereqs: ["alg.seq.nth-term","num.exp.power"], legacySubTopic: null },
  "alg.seq.arithmetic-series": { strand: "alg.seq", es: "Suma de una serie aritmética", en: "Arithmetic series", op: "evaluate", track: "S*", prereqs: ["alg.seq.nth-term"], legacySubTopic: null },
  "alg.seq.geometric-series": { strand: "alg.seq", es: "Suma de una serie geométrica", en: "Geometric series", op: "evaluate", track: "S*", prereqs: ["alg.seq.geometric-nth"], legacySubTopic: null },
  "alg.seq.infinite-geometric": { strand: "alg.seq", es: "Serie geométrica infinita", en: "Infinite geometric series", op: "evaluate", track: "S*", prereqs: ["alg.seq.geometric-series"], legacySubTopic: null },
  "alg.seq.sigma": { strand: "alg.seq", es: "Notación sigma", en: "Sigma notation", op: "evaluate", track: "S*", prereqs: ["alg.seq.arithmetic-series"], legacySubTopic: null },
  "alg.seq.quadratic-pattern": { strand: "alg.seq", es: "Patrón cuadrático", en: "Quadratic sequences", op: "mcq", track: "M", prereqs: ["alg.seq.nth-term","alg.quad.solve-factor"], legacySubTopic: null },
  "alg.seq.binomial-theorem": { strand: "alg.seq", es: "Teorema del binomio", en: "Binomial theorem", op: "expand", track: "S*", prereqs: ["alg.poly.mul-binomial","alg.seq.geometric-nth"], legacySubTopic: null },
};

/** legacySubTopic -> skill id. Lets the pre-migration engine resolve new content. */
const legacyToSkill = Object.freeze(Object.fromEntries(
  Object.entries(skills).filter(([, s]) => s.legacySubTopic).map(([id, s]) => [s.legacySubTopic, id])
));

/** skill id -> legacySubTopic (null when the skill has no seeded history). */
const skillToLegacy = Object.freeze(Object.fromEntries(
  Object.entries(skills).map(([id, s]) => [id, s.legacySubTopic])
));

function getSkill(id) { return skills[id] || null; }

function label(id, lang) {
  const s = skills[id];
  if (!s) return id;
  return (lang === 'es' ? s.es : s.en) || s.en || s.es;
}

/** All transitive prerequisites of a skill, nearest first. */
function prereqClosure(id, seen) {
  seen = seen || new Set();
  const s = skills[id];
  if (!s) return [];
  for (const p of s.prereqs) {
    if (seen.has(p)) continue;
    seen.add(p);
    prereqClosure(p, seen);
  }
  return [...seen];
}

/** True when every prerequisite of `id` is present in `mastered`. */
function isUnlocked(id, mastered) {
  const s = skills[id];
  if (!s) return false;
  const held = mastered instanceof Set ? mastered : new Set(mastered || []);
  return s.prereqs.every(p => held.has(p));
}

/** Skills the student is ready for but has not yet mastered. */
function nextAvailable(mastered) {
  const held = mastered instanceof Set ? mastered : new Set(mastered || []);
  return Object.keys(skills).filter(id => !held.has(id) && isUnlocked(id, held));
}

const _exports = {
  skills, legacyToSkill, skillToLegacy,
  getSkill, label, prereqClosure, isUnlocked, nextAvailable,
};
if (typeof module !== 'undefined') module.exports = _exports;
if (typeof window !== 'undefined') window.SkillGraph = _exports;
})();
