# D-STRUCT — Curriculum Structure Authority

**Version:** 3.0 — Panama-wide, algebra 6–12, bilingual. 2026-07-27
**Reference frame:** `MEDUCA` · **Retired frame:** `PAA` ([§7.5](#75--retired-frame-paa))
**Scope:** Algebra strand only, grades 6–12, Spanish and English.
**Status:** Skill graph **DRAFT** · all four frames **DRAFT** (MEDUCA `g10`–`g12` **PROVISIONAL**)
**This pass:** Documentation only. No code changed. See [§11](#11--migration-path).

**Supersedes:** v2.0 (same day — PAA-centric, superseded by the scope change in [§1](#1--what-changed-in-v30)) · v1.0 (2026-05-18, archived at `curriculum_structure_authority_v1_archived.md`) · `assessment_architecture.md` §0 · `curriculum_brain.md` §4.

**Does not supersede:** `curriculum_brain.md` remains the authority on *content quality* — vocabulary, misconceptions, hint style, difficulty calibration, word-problem context. This doc governs *structure* only.

---

## 1 — What changed in v3.0

**The product changed shape.** v1.0 and v2.0 described a UTP entrance-exam prep tool. v3.0 describes an algebra platform for **any student in any Panamanian school, grades 6–12, in either language**. That is a different addressable market and a different structure.

Three consequences:

**PAA is retired, and it costs no content.** This is the payoff of the two-layer model. The 72 validated seeds were never bound to PAA — they bind to *skills*. `u1-n1-01` ("Simplifica: 4x + 3x") was `like-terms-single`; it is now `alg.expr.like-terms-single`, and MEDUCA 7°, Cambridge s7, MYP 1 and CCSS g6 all pick it up unchanged. Retiring PAA retires a lookup table, not a problem bank. The frame is preserved in [§7.5](#75--retired-frame-paa) rather than deleted, so the seeds' provenance stays traceable.

**MEDUCA is the reference frame, not merely the default.** Panamanian private schools are MEDUCA-accredited *even when* they teach IB, Cambridge or American programs — MET, TRAIL, USP, Casco/KCSP, Balboa Academy and Isaac Rabin all hold MEDUCA accreditation alongside their international curriculum. MEDUCA is therefore the one frame every school in the country already maps to. Making it the reference frame means every other frame declares its offset *from* MEDUCA, which is how a real Panamanian school actually reasons about its own program.

**Algebra-only is an engine constraint, stated as one.** The step engine grades algebra. Geometry, trigonometry, statistics, probability and calculus appear in every one of these curricula at these grades and are **out of Nuvo delivery** — not because they don't matter but because nothing here can validate them. Each frame below lists what it drops, so the gap is visible rather than implied.

---

## 2 — The two-layer model

```
┌───────────────────────────────────────────────────────────────┐
│  LAYER B — CURRICULUM FRAMES          (many, cheap to add)     │
│                                                                │
│    MEDUCA        CAMB          IB           CCSS               │
│    (reference)   LS + IGCSE    MYP + DP     6-8 + HS           │
│       │            │            │             │                │
│       └────────────┴────────────┴─────────────┘                │
│          each frame SELECTS and ORDERS skill IDs               │
│          + declares language, edition, and what it drops       │
└────────────────────────────┬───────────────────────────────────┘
                             │  references (never defines)
┌────────────────────────────▼───────────────────────────────────┐
│  LAYER A — SKILL GRAPH             (one, curriculum-agnostic)   │
│                                                                │
│    alg.expr.like-terms-single ──prereq──▶ alg.lineq.solve-…    │
│    { id, es, en, op, track, prereqs[], legacySubTopic }         │
│                                                                │
│    ▲ seeds bind here.  ▲ Algebrite validates here.             │
│    ▲ student mastery is recorded here.                          │
└────────────────────────────────────────────────────────────────┘
```

**The invariant:** a frame may only *reference* skill IDs. A curriculum needing a skill the graph lacks means the skill is added to Layer A first — reviewed, given an `op`, a `track` and `prereqs` — and only then referenced. A frame never defines a skill inline. This is the rule that stops four registries from drifting apart again.

### What each layer owns

| | Layer A — Skill graph | Layer B — Frame |
|---|---|---|
| Answers | "What can Nuvo teach and grade?" | "What does *this* school's program want, in what order?" |
| Changes when | The engine gains a capability | A board publishes a new syllabus edition |
| Bound to | Seeds, Algebrite ops, student mastery | URLs, lesson cards, school-facing marketing |
| Count | One, global | One per curriculum × band |
| Language | IDs English (stable); `es` **and** `en` labels both required | Declares a default, both always available |

### What this buys

1. **A new frame costs one file and zero re-authored problems.** Adding IB MYP reuses the entire existing seed bank.
2. **Placement is portable across schools.** A student transferring from a MEDUCA public school to a Cambridge private school carries a mastered-*skill* set. Both frames read it directly.
3. **Gaps between programs become mechanical, not anecdotal** — see [§8](#8--cross-frame-alignment-matrix).
4. **A school can be sold its own program.** "Aligned to your 9° program" is checkable against [§7.1](#71--frame-meduca--reference-frame), not a claim.

---

## 3 — Canonical coordinate system

```
frame / band / unit / level
```

| Part | Meaning | Examples |
|---|---|---|
| `frame` | Curriculum + edition | `MEDUCA`, `CAMB`, `IB`, `CCSS` |
| `band` | That curriculum's own division | MEDUCA `g6`…`g12` · Cambridge `s7`…`s9`, `igcse` · IB `myp1`…`myp5`, `dp` · CCSS `g6`…`g8`, `alg1`, `alg2` |
| `unit` | Unit within the band | `expr`, `lineq`, `factor`, `quad` |
| `level` | Level within the unit | `N1`, `N2`, `N3` |

All four parts are opaque strings. **No part is ever a bare integer** — that was the v1.0 defect that produced the `stage=4|5|6` hack.

**Default coordinate for a new signup:** `MEDUCA / <band from student's grade> / …`. Grade is the one thing every Panamanian student knows about themselves; curriculum is often not.

### Legacy URL shim

`?curriculum=PAA&unit=algebra&stage=N` links are live in the WhatsApp funnel and in student hands. They must resolve, not 404. They redirect to the **MEDUCA** frame at the band whose skills match:

| Legacy PAA | Redirects to | Rationale |
|---|---|---|
| `PAA/algebra/1` | `MEDUCA/g7/expr/N3` | like terms |
| `PAA/algebra/2` | `MEDUCA/g8/expr/N1` | substitution, algebraic language |
| `PAA/algebra/3` | `MEDUCA/g9/factor/N1` | expand + common factor |
| `PAA/algebra/4` | `MEDUCA/g9/lineq/N1` | linear equations |
| `PAA/algebra/5` | `MEDUCA/g10/lineq/N1` | both sides *(PROVISIONAL band)* |
| `PAA/algebra/6` | `MEDUCA/g10/ineq/N1` | inequalities *(PROVISIONAL band)* |

**Frozen.** No new legacy coordinates are minted. The last two rows land in PROVISIONAL bands — verify [§7.1](#71--frame-meduca--reference-frame) `g10` before relying on them.

---

## 4 — Skill ID grammar and bilingual labels

```
<strand>.<topic>.<skill>
```

Lowercase, kebab within segments, dot-separated. **IDs are always English** and never translated — they are database keys, not prose. Both `es` and `en` labels are **required** on every skill; a skill with one missing is an incomplete record, not a valid one.

| Strand | Covers |
|---|---|
| `num` | Number sets, index laws, standard form, surds, complex numbers |
| `alg.expr` | Expressions: language, parts, like terms, substitution, single brackets, common factor |
| `alg.poly` | Polynomial arithmetic, special products, factoring, division, factor/remainder theorem |
| `alg.rat` | Algebraic fractions and rational equations |
| `alg.rad` | Radical expressions and equations |
| `alg.lineq` | Linear equations |
| `alg.ineq` | Inequalities and absolute value |
| `alg.quad` | Quadratics |
| `alg.sys` | Systems of equations |
| `alg.explog` | Exponential and logarithmic algebra |
| `alg.func` | Functions and graphs |
| `alg.seq` | Sequences and series |

### Field schema

| Field | Type | Notes |
|---|---|---|
| `id` | string | Canonical, immutable once published |
| `es`, `en` | string | **Both required.** Student-facing. |
| `op` | enum | `simplify` `expand` `factor` `evaluate` `translate` `solve` `inequality` `scientific` · `mcq` · `—` |
| `track` | enum | See below |
| `prereqs` | string[] | Skill IDs. **This is the real DAG.** |
| `legacySubTopic` | string \| null | Existing `subTopicEnum` value. Non-null ⇒ validated seeds exist ⇒ **never rename**. |

### Track vocabulary — what the engine can actually do

| Track | Meaning | Work required |
|---|---|---|
| **S** | Existing op; the step engine grades this **today** | Authoring only |
| **S★** | Step-gradable in principle, but needs a **new op or validator** that does not exist yet | Engineering **and** authoring |
| **M** | MCQ track — engine not built | Blocked |
| **O** | Out of Nuvo delivery | None; documented so the gap is visible |

Today's op set is `simplify · expand · factor · evaluate · translate · solve · inequality`. Anything needing more than those is **S★**.

`S` vs `S★` is the distinction that keeps a roadmap honest. A frame full of S★ skills is not "nearly done" — it is unbuilt. This matters most at the top of the range: almost everything IB DP and CCSS Algebra II need is S★.

---
## 5 — Layer A: the skill graph

Algebra strand only. `legacy` non-empty ⇒ validated seeds already exist.

### 5.1 — `num` — Números / Number

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `num.int.operations` | Operaciones con enteros | Integer operations | evaluate | O | — | — |
| `num.rat.operations` | Operaciones con racionales | Rational number operations | evaluate | O | `num.int.operations` | — |
| `num.real.set` | Conjunto de los reales | The real number set | — | O | `num.rat.operations` | — |
| `num.exp.product` | Ley del producto de potencias | Product law of indices | simplify | S | `num.rat.operations` | `exponent-product` |
| `num.exp.power` | Potencia de una potencia | Power of a power | simplify | S | `num.exp.product` | `exponent-power` |
| `num.exp.quotient` | Cociente de potencias | Quotient law of indices | simplify | S | `num.exp.product` | `exponent-quotient` |
| `num.exp.negative` | Exponentes negativos | Negative indices | simplify | S | `num.exp.quotient` | — |
| `num.exp.fractional` | Exponentes fraccionarios | Fractional indices | simplify | S★ | `num.exp.negative`, `num.rad.simplify` | — |
| `num.sci.normalize` | Notación científica | Standard form | scientific | S★ | `num.exp.product` | `scientific` |
| `num.rad.simplify` | Simplificar radicales | Simplifying surds | simplify | S★ | `num.exp.power` | — |
| `num.rad.rationalize` | Racionalizar el denominador | Rationalising the denominator | simplify | S★ | `num.rad.simplify` | — |
| `num.cx.form` | Números complejos a+bi | Complex numbers a+bi | — | S★ | `num.rad.simplify`, `alg.quad.discriminant` | — |
| `num.cx.operations` | Operaciones con complejos | Complex number operations | simplify | S★ | `num.cx.form` | — |

### 5.2 — `alg.expr` — Expresiones algebraicas / Algebraic expressions

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.expr.language` | Lenguaje algebraico | Algebraic language | translate | S | `num.rat.operations` | `translate-expression` |
| `alg.expr.parts` | Término, coeficiente, grado | Term, coefficient, degree | — | O | `alg.expr.language` | — |
| `alg.expr.like-terms-single` | Términos semejantes, una variable | Like terms, one variable | simplify | S | `alg.expr.language` | `like-terms-single` |
| `alg.expr.like-terms-multi` | Términos semejantes, varias variables | Like terms, several variables | simplify | S | `alg.expr.like-terms-single` | `like-terms-multi` |
| `alg.expr.like-terms-negative` | Términos semejantes con negativos | Like terms with negatives | simplify | S | `alg.expr.like-terms-single` | `like-terms-negative` |
| `alg.expr.substitute-positive` | Sustituir valores positivos | Substituting positive values | evaluate | S | `alg.expr.like-terms-single` | `substitute-positive` |
| `alg.expr.substitute-negative` | Sustituir valores negativos | Substituting negative values | evaluate | S | `alg.expr.substitute-positive` | `substitute-negative` |
| `alg.expr.substitute-power` | Sustituir en potencias | Substituting into powers | evaluate | S | `alg.expr.substitute-negative` | `substitute-power` |
| `alg.expr.expand-single` | Expandir un paréntesis | Expanding a single bracket | expand | S | `alg.expr.like-terms-single` | `expand-single` |
| `alg.expr.expand-simplify` | Expandir y simplificar | Expand and simplify | expand | S | `alg.expr.expand-single`, `alg.expr.like-terms-negative` | `expand-simplify` |
| `alg.expr.factor-common` | Factor común | Common factor | factor | S | `alg.expr.expand-single` | `factor-common` |

### 5.3 — `alg.poly` — Polinomios / Polynomials

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.poly.add-sub` | Suma y resta de polinomios | Adding and subtracting polynomials | simplify | S | `alg.expr.like-terms-negative` | — |
| `alg.poly.mul-mono` | Multiplicación por monomio | Multiplying by a monomial | expand | S | `alg.expr.expand-single`, `num.exp.product` | — |
| `alg.poly.div-mono` | División entre monomio | Dividing by a monomial | simplify | S | `alg.poly.mul-mono`, `num.exp.quotient` | — |
| `alg.poly.mul-binomial` | Producto de dos binomios | Expanding double brackets | expand | S | `alg.poly.mul-mono` | — |
| `alg.poly.special-square` | Trinomio cuadrado perfecto | Perfect square trinomial | factor | S | `alg.poly.mul-binomial` | — |
| `alg.poly.special-diff-squares` | Diferencia de cuadrados | Difference of two squares | factor | S | `alg.poly.mul-binomial` | — |
| `alg.poly.factor-trinomial` | Trinomio x²+bx+c | Factorising x²+bx+c | factor | S | `alg.poly.special-square` | — |
| `alg.poly.factor-trinomial-lead` | Trinomio ax²+bx+c, a≠1 | Factorising ax²+bx+c | factor | S | `alg.poly.factor-trinomial` | — |
| `alg.poly.factor-grouping` | Factorización por agrupación | Factorising by grouping | factor | S | `alg.expr.factor-common` | — |
| `alg.poly.factor-cubes` | Suma y diferencia de cubos | Sum and difference of cubes | factor | S | `alg.poly.factor-trinomial` | — |
| `alg.poly.remainder` | Residuo (evaluar en x=−a) | Remainder by evaluation | evaluate | S | `alg.expr.substitute-negative` | `remainder` |
| `alg.poly.div-long` | División larga de polinomios | Polynomial long division | simplify | S★ | `alg.poly.div-mono`, `alg.poly.mul-binomial` | — |
| `alg.poly.factor-theorem` | Teorema del factor | Factor theorem | factor | S★ | `alg.poly.div-long`, `alg.poly.remainder` | — |

### 5.4 — `alg.rat` — Fracciones algebraicas / Algebraic fractions

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.rat.simplify` | Simplificar fracciones algebraicas | Simplifying algebraic fractions | simplify | S | `alg.poly.factor-trinomial` | — |
| `alg.rat.mul-div` | Multiplicar y dividir | Multiplying and dividing | simplify | S | `alg.rat.simplify` | — |
| `alg.rat.add-sub` | Sumar y restar | Adding and subtracting | simplify | S | `alg.rat.simplify` | — |
| `alg.rat.complex-fraction` | Fracciones compuestas | Compound fractions | simplify | S★ | `alg.rat.add-sub`, `alg.rat.mul-div` | — |
| `alg.rat.equation` | Ecuación racional | Rational equations | solve | S | `alg.rat.simplify`, `alg.lineq.both-sides` | `rational-equation` |
| `alg.rat.direct-variation` | Variación directa | Direct variation | solve | S | `alg.lineq.proportion` | — |
| `alg.rat.inverse-variation` | Variación inversa | Inverse variation | solve | S | `alg.rat.equation` | `inverse-variation` |
| `alg.rat.partial-fractions` | Fracciones parciales | Partial fractions | simplify | S★ | `alg.rat.add-sub`, `alg.sys.three-var` | — |

### 5.5 — `alg.rad` — Radicales / Radicals

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.rad.simplify-expr` | Simplificar expresiones radicales | Simplifying radical expressions | simplify | S★ | `num.rad.simplify`, `alg.expr.like-terms-negative` | — |
| `alg.rad.equation` | Ecuaciones con radicales | Radical equations | solve | S★ | `alg.rad.simplify-expr`, `alg.quad.solve-factor` | — |

### 5.6 — `alg.lineq` — Ecuaciones lineales / Linear equations

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.lineq.solve-one-step` | Ecuación de un paso | One-step equations | solve | S | `alg.expr.like-terms-single` | `solve-one-step` |
| `alg.lineq.solve-two-step` | Ecuación de dos pasos | Two-step equations | solve | S | `alg.lineq.solve-one-step` | `solve-two-step` |
| `alg.lineq.negative-coefficient` | Coeficiente negativo | Negative coefficient | solve | S | `alg.lineq.solve-two-step`, `alg.expr.like-terms-negative` | `negative-coefficient` |
| `alg.lineq.proportion` | Proporciones y razones | Ratio and proportion | solve | S | `alg.lineq.solve-two-step` | `proportion` |
| `alg.lineq.translate` | Traducir enunciado → ecuación | Word problem → equation | translate | S | `alg.expr.language`, `alg.lineq.solve-two-step` | `translate-equation` |
| `alg.lineq.brackets` | Ecuación con paréntesis | Equations with brackets | solve | S | `alg.lineq.solve-two-step`, `alg.expr.expand-single` | `brackets` |
| `alg.lineq.both-sides` | Incógnita en ambos lados | Unknown on both sides | solve | S | `alg.lineq.negative-coefficient` | `both-sides` |
| `alg.lineq.both-sides-brackets` | Ambos lados con paréntesis | Both sides with brackets | solve | S | `alg.lineq.both-sides`, `alg.lineq.brackets` | `both-sides-brackets` |
| `alg.lineq.fractions` | Ecuación con coeficientes fraccionarios | Equations with fractional coefficients | solve | S | `alg.lineq.both-sides-brackets` | — |
| `alg.lineq.rearrange-formula` | Despejar una variable | Changing the subject | solve | S | `alg.lineq.both-sides-brackets` | — |

### 5.7 — `alg.ineq` — Inecuaciones / Inequalities

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.ineq.solve-positive` | Inecuación lineal | Linear inequalities | inequality | S | `alg.lineq.solve-two-step` | `inequality-positive` |
| `alg.ineq.flip` | Invertir el signo | Reversing the inequality | inequality | S | `alg.ineq.solve-positive`, `alg.lineq.negative-coefficient` | `inequality-flip` |
| `alg.ineq.compound` | Inecuación compuesta | Compound inequalities | inequality | S | `alg.ineq.flip` | — |
| `alg.ineq.absolute-value` | Valor absoluto | Absolute value inequalities | inequality | S | `alg.ineq.compound` | `absolute-value` |
| `alg.ineq.absolute-value-union` | Valor absoluto por unión | Absolute value, union solution | inequality | S | `alg.ineq.absolute-value` | `absolute-value-union` |
| `alg.ineq.quadratic` | Inecuación cuadrática | Quadratic inequalities | inequality | S★ | `alg.ineq.flip`, `alg.quad.solve-factor` | — |
| `alg.ineq.rational` | Inecuación racional | Rational inequalities | inequality | S★ | `alg.ineq.quadratic`, `alg.rat.simplify` | — |
| `alg.ineq.number-line` | Región en la recta numérica | Number line regions | mcq | M | `alg.ineq.solve-positive` | — |
| `alg.ineq.system-graph` | Sistema de inecuaciones (gráfico) | Systems of inequalities | mcq | M | `alg.ineq.solve-positive`, `alg.func.line-equation` | — |

### 5.8 — `alg.quad` — Cuadráticas / Quadratics

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.quad.solve-factor` | Cuadrática por factorización | Solving by factorising | solve | S | `alg.poly.factor-trinomial`, `alg.lineq.solve-one-step` | `quadratic-factor` |
| `alg.quad.any-root` | Aceptar cualquier raíz | Accept any valid root | solve | S | `alg.quad.solve-factor` | `quadratic-any-root` |
| `alg.quad.formula` | Fórmula general | Quadratic formula | solve | S★ | `alg.quad.solve-factor`, `num.rad.simplify` | — |
| `alg.quad.complete-square` | Completar el cuadrado | Completing the square | solve | S★ | `alg.quad.formula` | — |
| `alg.quad.discriminant` | Discriminante | The discriminant | evaluate | S★ | `alg.quad.formula` | — |
| `alg.quad.roots-sum-product` | Suma y producto de raíces | Sum and product of roots | evaluate | S★ | `alg.quad.formula` | — |
| `alg.quad.vertex-form` | Forma canónica / vértice | Vertex form | simplify | S★ | `alg.quad.complete-square` | — |
| `alg.quad.graph` | Gráfica de la parábola | Graphing parabolas | mcq | M | `alg.quad.vertex-form`, `alg.func.read-graph` | — |

### 5.9 — `alg.sys` — Sistemas / Systems

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.sys.substitution` | Sistema 2×2 por sustitución | 2×2 by substitution | solve | S | `alg.lineq.both-sides` | `system-substitution` |
| `alg.sys.elimination` | Sistema 2×2 por eliminación | 2×2 by elimination | solve | S | `alg.sys.substitution` | `system-elimination` |
| `alg.sys.model` | Modelado verbal → sistema | Word problem → system | translate, solve | S | `alg.sys.elimination`, `alg.lineq.translate` | `system-model` |
| `alg.sys.three-var` | Sistema 3×3 | 3×3 systems | solve | S★ | `alg.sys.elimination` | — |
| `alg.sys.nonlinear` | Sistema no lineal | Non-linear systems | solve | S★ | `alg.sys.substitution`, `alg.quad.solve-factor` | — |
| `alg.sys.graphical` | Solución gráfica | Graphical solution | mcq | M | `alg.sys.substitution`, `alg.func.line-equation` | — |

### 5.10 — `alg.explog` — Exponenciales y logaritmos / Exponentials and logarithms

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.explog.same-base` | Ecuación exponencial de igual base | Exponential equations, same base | solve | S★ | `num.exp.power`, `alg.lineq.solve-two-step` | — |
| `alg.explog.log-definition` | Definición de logaritmo | Definition of a logarithm | evaluate | S★ | `alg.explog.same-base` | — |
| `alg.explog.log-laws` | Leyes de logaritmos | Laws of logarithms | simplify | S★ | `alg.explog.log-definition` | — |
| `alg.explog.log-equation` | Ecuación logarítmica | Logarithmic equations | solve | S★ | `alg.explog.log-laws` | — |
| `alg.explog.exp-equation` | Ecuación exponencial con logaritmos | Exponential equations using logs | solve | S★ | `alg.explog.log-laws` | — |
| `alg.explog.growth-model` | Modelos de crecimiento y decaimiento | Growth and decay models | solve | S★ | `alg.explog.exp-equation` | — |

### 5.11 — `alg.func` — Funciones / Functions

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.func.notation` | Notación f(x) | Function notation f(x) | evaluate | S | `alg.expr.substitute-negative` | — |
| `alg.func.domain-range` | Dominio y rango | Domain and range | mcq | M | `alg.func.notation` | — |
| `alg.func.composite` | Función compuesta | Composite functions | evaluate | S★ | `alg.func.notation` | — |
| `alg.func.inverse` | Función inversa | Inverse functions | solve | S★ | `alg.func.composite`, `alg.lineq.rearrange-formula` | — |
| `alg.func.piecewise` | Función definida por tramos | Piecewise functions | evaluate | S★ | `alg.func.notation`, `alg.ineq.compound` | — |
| `alg.func.transformations` | Transformaciones de gráficas | Graph transformations | mcq | M | `alg.func.notation`, `alg.quad.vertex-form` | — |
| `alg.func.slope` | Pendiente | Gradient | mcq | M | `alg.lineq.solve-two-step` | — |
| `alg.func.line-equation` | Ecuación de la recta | Equation of a line | mcq | M | `alg.func.slope` | — |
| `alg.func.read-graph` | Lectura de gráficas | Reading graphs | mcq | M | `alg.func.line-equation` | — |
| `alg.func.rate-of-change` | Razón de cambio | Rate of change | mcq | M | `alg.func.line-equation` | — |

### 5.12 — `alg.seq` — Sucesiones y series / Sequences and series

| ID | es | en | op | track | prereqs | legacy |
|---|---|---|---|---|---|---|
| `alg.seq.term-to-term` | Regla término a término | Term-to-term rule | mcq | M | `num.int.operations` | — |
| `alg.seq.nth-term` | Término general (aritmética) | nth term, arithmetic | evaluate | S★ | `alg.seq.term-to-term`, `alg.expr.language` | — |
| `alg.seq.geometric-nth` | Término general (geométrica) | nth term, geometric | evaluate | S★ | `alg.seq.nth-term`, `num.exp.power` | — |
| `alg.seq.arithmetic-series` | Suma de una serie aritmética | Arithmetic series | evaluate | S★ | `alg.seq.nth-term` | — |
| `alg.seq.geometric-series` | Suma de una serie geométrica | Geometric series | evaluate | S★ | `alg.seq.geometric-nth` | — |
| `alg.seq.infinite-geometric` | Serie geométrica infinita | Infinite geometric series | evaluate | S★ | `alg.seq.geometric-series` | — |
| `alg.seq.sigma` | Notación sigma | Sigma notation | evaluate | S★ | `alg.seq.arithmetic-series` | — |
| `alg.seq.quadratic-pattern` | Patrón cuadrático | Quadratic sequences | mcq | M | `alg.seq.nth-term`, `alg.quad.solve-factor` | — |
| `alg.seq.binomial-theorem` | Teorema del binomio | Binomial theorem | expand | S★ | `alg.poly.mul-binomial`, `alg.seq.geometric-nth` | — |

---

## 6 — Layer B: frame schema

```js
{
  id:        'MEDUCA',
  name:      'Ministerio de Educación de Panamá',
  authority: 'MEDUCA',
  edition:   '2014',               // ministry/board document year — never mutated
  region:    'PA',
  reference: true,                 // exactly one frame may set this
  language:  { default: 'es', available: ['es', 'en'] },
  bands: [{
    id: 'g7', label: { es: '7.º grado', en: 'Grade 7' }, age: '12–13',
    units: [{
      id: 'expr', label: { es: 'Expresiones algebraicas', en: 'Algebraic expressions' },
      levels: [{ id: 'N1', skills: ['alg.expr.language'], gate: 'all' }]
    }]
  }],
  dropped:   ['geometry', 'statistics', 'probability'],   // in the syllabus, out of Nuvo
  constraints: { calculator: false, answerFormat: 'exact' },
  status:    'DRAFT'
}
```

### Status vocabulary

| Status | Means | Seeds allowed? |
|---|---|---|
| `LOCKED` | Ronel approved; changes need a dated entry in [§12](#12--changelog) | Yes |
| `DRAFT` | Proposed, grounded in a cited source, awaiting approval | No |
| `PROVISIONAL` | Source exists and is cited but **has not been read**; placement inferred | **No — verify first** |

`PROVISIONAL` is not a weaker `DRAFT`. It marks where we are guessing, so the guess cannot quietly harden into product.

### Frame inventory

| Frame | Bands | Language default | Panamanian schools | Status |
|---|---|---|---|---|
| `MEDUCA` | `g6`–`g12` | es | All — public, and private by accreditation | DRAFT · `g10`–`g12` PROVISIONAL |
| `CAMB` | `s7`–`s9`, `igcse` | en | Casco/KCSP, MET, Isaac Rabin | DRAFT |
| `IB` | `myp1`–`myp5`, `dp` | en | MET, Boston School, Isaac Rabin | DRAFT · `myp5`, `dp` PROVISIONAL |
| `CCSS` | `g6`–`g8`, `alg1`, `alg2` | en | Balboa Academy, TRAIL, USP | DRAFT |

---

## 7 — The frames

### 7.1 — Frame `MEDUCA` — reference frame

**Authority:** Ministerio de Educación de Panamá · **Edition:** 2014 · **Default language:** es
**Grounding:** `g7`–`g9` sequenced from the MEDUCA-aligned *Mi Aula* guides (Enseña por Panamá), which follow the official 7°–9° program guide-by-guide. `g6` and `g10`–`g12` are **PROVISIONAL** — see [§13](#13--sources).
**Dropped from Nuvo:** geometría, medición, estadística, probabilidad, trigonometría (10°–12°). Present in the program; not gradable here.

**`g6` — 6.º grado (primaria)** — ⚠ PROVISIONAL

| Unit | Level | Skills |
|---|---|---|
| `num` Números | N1 | `num.int.operations`, `num.rat.operations` |
| `pattern` Patrones | N1 | `alg.seq.term-to-term`, `alg.expr.language` |

**`g7` — 7.º grado**

| Unit | Level | Skills | Source guide |
|---|---|---|---|
| `num` Números | N1 | `num.int.operations`, `num.rat.operations` | "Desafíos con números enteros 1–4", "racionales 1–3" |
| `expr` Expresiones algebraicas | N1 | `alg.expr.language`, `alg.expr.parts` | "Introducción a expresiones algebraicas"; "Términos de una expresión" |
| | N2 | `alg.expr.substitute-positive` | "Valor numérico y grado" |
| | N3 | `alg.expr.like-terms-single`, `alg.expr.like-terms-multi` | "Términos semejantes" |

**`g8` — 8.º grado**

| Unit | Level | Skills |
|---|---|---|
| `num` Números reales | N1 | `num.real.set`, `num.exp.product`, `num.exp.power`, `num.rad.simplify` |
| `expr` Expresiones algebraicas | N1 | `alg.expr.language`, `alg.expr.substitute-negative`, `alg.expr.like-terms-negative` |
| `poly` Operaciones con polinomios | N1 | `alg.poly.add-sub` |
| | N2 | `alg.poly.mul-mono`, `alg.poly.mul-binomial`, `alg.expr.expand-single` |
| | N3 | `alg.poly.div-mono`, `num.exp.quotient` |

**`g9` — 9.º grado**

| Unit | Level | Skills |
|---|---|---|
| `factor` Factorización | N1 | `alg.expr.factor-common`, `alg.poly.factor-grouping` |
| | N2 | `alg.poly.special-square`, `alg.poly.special-diff-squares` |
| | N3 | `alg.poly.factor-trinomial`, `alg.poly.factor-cubes` |
| `rat` Fracciones algebraicas | N1 | `alg.rat.simplify` |
| | N2 | `alg.rat.add-sub`, `alg.rat.mul-div` |
| `lineq` Ecuaciones | N1 | `alg.lineq.solve-one-step`, `alg.lineq.solve-two-step` |
| | N2 | `alg.lineq.brackets`, `alg.lineq.both-sides` |
| `sys` Sistemas | N1 | `alg.sys.substitution`, `alg.sys.elimination` |

**`g10` — 10.º grado** — ⚠ PROVISIONAL

| Unit | Level | Skills |
|---|---|---|
| `num` Números reales | N1 | `num.real.set`, `num.exp.negative`, `num.rad.rationalize` |
| `lineq` Ecuaciones e inecuaciones | N1 | `alg.lineq.both-sides-brackets`, `alg.lineq.fractions`, `alg.lineq.rearrange-formula` |
| | N2 | `alg.ineq.solve-positive`, `alg.ineq.flip`, `alg.ineq.compound` |
| `func` Relaciones y funciones | N1 | `alg.func.notation`, `alg.func.slope`, `alg.func.line-equation` |

**`g11` — 11.º grado** — ⚠ PROVISIONAL

| Unit | Level | Skills |
|---|---|---|
| `quad` Función cuadrática | N1 | `alg.quad.solve-factor`, `alg.quad.formula`, `alg.quad.discriminant` |
| | N2 | `alg.quad.complete-square`, `alg.quad.vertex-form` |
| `explog` Exponencial y logarítmica | N1 | `alg.explog.same-base`, `alg.explog.log-definition` |
| | N2 | `alg.explog.log-laws`, `alg.explog.log-equation` |
| `func` Funciones | N1 | `alg.func.domain-range`, `alg.func.composite`, `alg.func.inverse` |

**`g12` — 12.º grado** — ⚠ PROVISIONAL (lowest confidence in the doc)

| Unit | Level | Skills |
|---|---|---|
| `seq` Sucesiones y series | N1 | `alg.seq.nth-term`, `alg.seq.arithmetic-series` |
| | N2 | `alg.seq.geometric-nth`, `alg.seq.geometric-series` |
| `poly` Funciones polinómicas | N1 | `alg.poly.div-long`, `alg.poly.factor-theorem` |
| `rat` Funciones racionales | N1 | `alg.rat.equation`, `alg.rat.complex-fraction` |

**⚠ Edition risk.** MEDUCA is mid-way through a **rediseño curricular for 2026** covering 276 asignaturas across preescolar, primaria, premedia and media. When it publishes, it becomes `MEDUCA` edition `2026` as a **separate frame** — students mid-progress stay on 2014 rather than silently changing curriculum. This is why `edition` is mandatory and immutable.

---

### 7.2 — Frame `CAMB` — Cambridge

**Authority:** Cambridge Assessment International Education · **Default language:** en
**Grounding:** `s7`–`s9` from `curriculum_brain.md` §1 (Lower Secondary, verified). `igcse` from the 0580 Mathematics syllabus structure — **PROVISIONAL at subtopic granularity**, since the full syllabus document was not read.
**Dropped from Nuvo:** geometry, mensuration, trigonometry, vectors and transformations, probability, statistics, coordinate geometry, and IGCSE E2.10 differentiation.

| Band | Unit | Level | Skills |
|---|---|---|---|
| `s7` | `expr` | N1 | `alg.expr.language`, `alg.expr.parts`, `alg.expr.like-terms-single` |
| | | N2 | `alg.expr.substitute-positive`, `alg.expr.expand-single` |
| | `lineq` | N1 | `alg.lineq.solve-one-step`, `alg.lineq.solve-two-step`, `alg.lineq.negative-coefficient` |
| | `seq` | N1 | `alg.seq.term-to-term` |
| `s8` | `expr` | N1 | `alg.expr.like-terms-negative`, `alg.expr.substitute-negative`, `alg.expr.substitute-power` |
| | | N2 | `alg.expr.expand-simplify`, `alg.expr.factor-common` |
| | `lineq` | N1 | `alg.lineq.both-sides`, `alg.lineq.rearrange-formula` |
| | `seq` | N1 | `alg.seq.nth-term` |
| | `func` | N1 | `alg.func.slope`, `alg.func.line-equation` |
| `s9` | `poly` | N1 | `alg.poly.mul-binomial`, `alg.poly.special-square`, `alg.poly.special-diff-squares` |
| | | N2 | `alg.poly.factor-trinomial` |
| | `lineq` | N1 | `alg.lineq.brackets`, `alg.lineq.both-sides-brackets`, `alg.lineq.fractions` |
| | `ineq` | N1 | `alg.ineq.solve-positive`, `alg.ineq.flip` |
| | `sys` | N1 | `alg.sys.substitution`, `alg.sys.elimination` |
| | `func` | N1 | `alg.func.notation`, `alg.func.domain-range` |
| `igcse` ⚠ | `num` | N1 | `num.exp.negative`, `num.exp.fractional`, `num.sci.normalize`, `num.rad.simplify` |
| | `poly` | N1 | `alg.poly.factor-trinomial-lead`, `alg.poly.factor-grouping` |
| | `rat` | N1 | `alg.rat.simplify`, `alg.rat.add-sub`, `alg.rat.mul-div`, `alg.rat.equation` |
| | `quad` | N1 | `alg.quad.solve-factor`, `alg.quad.formula` |
| | | N2 | `alg.quad.complete-square`, `alg.quad.discriminant` |
| | `ineq` | N1 | `alg.ineq.compound`, `alg.ineq.system-graph` |
| | `sys` | N1 | `alg.sys.nonlinear` |
| | `seq` | N1 | `alg.seq.geometric-nth`, `alg.seq.quadratic-pattern` |
| | `func` | N1 | `alg.func.composite`, `alg.func.inverse` |
| | `rat` (var.) | N2 | `alg.rat.direct-variation`, `alg.rat.inverse-variation` |

---

### 7.3 — Frame `IB` — International Baccalaureate

**Authority:** International Baccalaureate Organization · **Default language:** en
**⚠ Structural caveat, and it is not a small one:** **MYP does not prescribe a fixed syllabus.** Schools set their own scope and sequence within the MYP framework. The bands below are the *typical standard track at international schools*, per `curriculum_brain.md` §3 — they are a reasonable default, **not a syllabus**. Any school partnership must confirm against that school's own scope-and-sequence document. This is a genuine difference in kind from MEDUCA, Cambridge and CCSS, all of which do prescribe.
**Grounding:** `myp1`–`myp4` from `curriculum_brain.md` §3 (verified). `myp5` and `dp` **PROVISIONAL** — no source read.
**Dropped from Nuvo:** geometry and trigonometry, statistics and probability, and all of DP calculus (Topic 5). For DP that is most of the course; see the warning below.

| Band | Unit | Level | Skills |
|---|---|---|---|
| `myp1` | `expr` | N1 | `alg.expr.language`, `alg.expr.like-terms-single`, `alg.expr.substitute-positive` |
| | `lineq` | N1 | `alg.lineq.solve-one-step`, `alg.lineq.solve-two-step`, `alg.lineq.translate` |
| `myp2` | `expr` | N1 | `alg.expr.expand-single`, `alg.expr.factor-common`, `alg.expr.like-terms-negative` |
| | `lineq` | N1 | `alg.lineq.both-sides` |
| | `ineq` | N1 | `alg.ineq.solve-positive` |
| | `seq` | N1 | `alg.seq.nth-term` |
| | `func` | N1 | `alg.func.slope`, `alg.func.line-equation` |
| `myp3` | `poly` | N1 | `alg.poly.mul-binomial`, `alg.poly.factor-trinomial`, `alg.poly.special-diff-squares` |
| | `sys` | N1 | `alg.sys.substitution`, `alg.sys.elimination` |
| | `lineq` | N1 | `alg.lineq.rearrange-formula` |
| | `ineq` | N1 | `alg.ineq.flip`, `alg.ineq.compound` |
| | `func` | N1 | `alg.func.notation`, `alg.func.domain-range` |
| `myp4` | `quad` | N1 | `alg.quad.solve-factor`, `alg.quad.formula` |
| | | N2 | `alg.quad.complete-square`, `alg.quad.discriminant` |
| | `explog` | N1 | `alg.explog.same-base`, `alg.explog.growth-model` |
| | `func` | N1 | `alg.func.composite`, `alg.func.inverse` |
| | `ineq` | N1 | `alg.ineq.system-graph` |
| `myp5` ⚠ | `poly` | N1 | `alg.poly.factor-trinomial-lead`, `alg.poly.div-long` |
| | `rat` | N1 | `alg.rat.simplify`, `alg.rat.add-sub`, `alg.rat.equation` |
| | `quad` | N1 | `alg.quad.vertex-form`, `alg.quad.roots-sum-product` |
| | `rad` | N1 | `alg.rad.simplify-expr`, `alg.rad.equation` |
| `dp` ⚠ | `seq` | N1 | `alg.seq.arithmetic-series`, `alg.seq.geometric-series`, `alg.seq.sigma` |
| | | N2 | `alg.seq.infinite-geometric`, `alg.seq.binomial-theorem` |
| | `explog` | N1 | `alg.explog.log-laws`, `alg.explog.log-equation`, `alg.explog.exp-equation` |
| | `func` | N1 | `alg.func.composite`, `alg.func.inverse`, `alg.func.transformations`, `alg.func.piecewise` |
| | `poly` | N1 | `alg.poly.factor-theorem` |
| | `num` | N1 | `num.cx.form`, `num.cx.operations` *(HL only)* |
| | `rat` | N1 | `alg.rat.partial-fractions` *(HL only)* |
| | `sys` | N1 | `alg.sys.three-var` *(HL only)* |

**⚠ Be honest about DP.** IB Diploma Mathematics (AA/AI, SL/HL) is dominated by calculus, statistics and trigonometry — all out of Nuvo delivery. What remains gradable here is DP Topic 1 (Number and Algebra) and part of Topic 2 (Functions). Nuvo can support the *algebra* of DP; it cannot prepare a student for the DP exam, and should never be marketed as if it could. Every `dp` skill above is **S★** — none is gradable today.

---

### 7.4 — Frame `CCSS` — Common Core

**Authority:** Common Core State Standards · **Default language:** en
**Grounding:** `g6`–`g8` from `curriculum_brain.md` §2 (verified). `alg1`, `alg2` from the CCSS High School conceptual categories — **PROVISIONAL**.
**Dropped from Nuvo:** geometry, statistics and probability, modelling-as-practice, and the graphing-heavy portions of F-IF.
Standard codes are annotations *on* skills, never a replacement for skill IDs — a single standard like 6.EE.3 spans several Nuvo skills, which is exactly why the standards-code spine was rejected.

| Band | Unit | Level | Skills | Codes |
|---|---|---|---|---|
| `g6` | `expr` | N1 | `alg.expr.language`, `alg.expr.parts` | 6.EE.1–2 |
| | | N2 | `alg.expr.like-terms-single`, `alg.expr.substitute-positive`, `alg.expr.expand-single`, `alg.expr.factor-common` | 6.EE.3–4 |
| | `lineq` | N1 | `alg.lineq.solve-one-step` | 6.EE.5–7 |
| | `ineq` | N1 | `alg.ineq.number-line` | 6.EE.8 |
| `g7` | `expr` | N1 | `alg.expr.like-terms-negative`, `alg.expr.substitute-negative` | 7.EE.1–2 |
| | `lineq` | N1 | `alg.lineq.solve-two-step`, `alg.lineq.brackets`, `alg.lineq.translate` | 7.EE.4a |
| | `ineq` | N1 | `alg.ineq.solve-positive`, `alg.ineq.flip` | 7.EE.4b |
| `g8` | `num` | N1 | `num.exp.product`, `num.exp.power`, `num.exp.quotient`, `num.exp.negative`, `num.sci.normalize` | 8.EE.1–4 |
| | `lineq` | N1 | `alg.lineq.both-sides`, `alg.lineq.both-sides-brackets` | 8.EE.7 |
| | `sys` | N1 | `alg.sys.substitution`, `alg.sys.elimination`, `alg.sys.model`, `alg.sys.graphical` | 8.EE.8 |
| | `func` | N1 | `alg.func.notation`, `alg.func.rate-of-change`, `alg.func.slope` | 8.F.1–5 |
| `alg1` ⚠ | `poly` | N1 | `alg.poly.add-sub`, `alg.poly.mul-binomial`, `alg.poly.factor-trinomial` | A-APR.1, A-SSE.2 |
| | `quad` | N1 | `alg.quad.solve-factor`, `alg.quad.formula`, `alg.quad.complete-square` | A-REI.4 |
| | `explog` | N1 | `alg.explog.same-base`, `alg.explog.growth-model` | F-LE.1–2 |
| | `lineq` | N1 | `alg.lineq.rearrange-formula`, `alg.lineq.fractions` | A-CED.4 |
| | `ineq` | N1 | `alg.ineq.compound`, `alg.ineq.system-graph` | A-REI.12 |
| `alg2` ⚠ | `poly` | N1 | `alg.poly.factor-trinomial-lead`, `alg.poly.div-long`, `alg.poly.factor-theorem`, `alg.poly.factor-cubes` | A-APR.2–6 |
| | `rat` | N1 | `alg.rat.simplify`, `alg.rat.add-sub`, `alg.rat.mul-div`, `alg.rat.equation` | A-APR.7, A-REI.2 |
| | `rad` | N1 | `alg.rad.simplify-expr`, `alg.rad.equation` | N-RN.1–2 |
| | `num` | N1 | `num.cx.form`, `num.cx.operations` | N-CN.1–2 |
| | `explog` | N1 | `alg.explog.log-laws`, `alg.explog.log-equation`, `alg.explog.exp-equation` | F-LE.4 |
| | `seq` | N1 | `alg.seq.arithmetic-series`, `alg.seq.geometric-series`, `alg.seq.sigma` | A-SSE.4 |
| | `func` | N1 | `alg.func.composite`, `alg.func.inverse`, `alg.func.transformations` | F-BF.1, 3–4 |

---

### 7.5 — Retired frame: `PAA`

**Retired 2026-07-27.** Preserved for provenance, not for delivery. Do not route students here; do not author against it.

The UTP Prueba de Admisión frame (v1.0 D-STRUCT / D-STRUCT-2, LOCKED 2026-05-18) organised algebra into U1–U5 for entrance-exam prep. All 34 of its `subTopicEnum` values and all 72 of its validated seeds **survive intact** as skill-bound content in [§5](#5--layer-a-the-skill-graph) — the `legacy` column is the audit trail. Nothing was thrown away.

Its unit map, for tracing a seed back to its origin: U1 expresiones (like terms → substitution → expand/factor) · U2 ecuaciones e inecuaciones lineales · U3 cuadráticas, racionales, exponentes · U4 sistemas · U5 rectas y funciones (MCQ). Full detail in `curriculum_structure_authority_v1_archived.md`.

**Still true and worth carrying forward:** the KV lesson records in `worker/seed-paa-algebra.js` never matched even the PAA frame — they ship a pre-D-STRUCT model mixing five operations into "Nivel 1". Those records are now stale against *every* frame and are the first thing the migration deletes ([§11](#11--migration-path) step 0).

**If exam prep ever returns**, it returns as a frame like any other — `PAA` edition whatever — selecting skills that by then already exist. That is the point of the architecture.

---

## 8 — Cross-frame alignment matrix

Keyed on skill IDs, so a script can verify every cell against [§7](#7--the-frames). MEDUCA first — everything else reads as an offset from it. `—` = not in that frame's delivery at these bands. `?` = PROVISIONAL band.

| Skill | MEDUCA | Cambridge | IB MYP/DP | CCSS |
|---|---|---|---|---|
| `alg.expr.language` | g7 | s7 | myp1 | g6 |
| `alg.expr.like-terms-single` | g7 | s7 | myp1 | g6 |
| `alg.expr.substitute-positive` | g7 | s7 | myp1 | g6 |
| `alg.expr.like-terms-negative` | g8 | s8 | myp2 | g7 |
| `alg.expr.substitute-negative` | g8 | s8 | — | g7 |
| `alg.expr.expand-single` | g8 | s7 | myp2 | g6 |
| `alg.expr.factor-common` | **g9** | s8 | myp2 | **g6** |
| `alg.lineq.solve-one-step` | **g9** | **s7** | **myp1** | **g6** |
| `alg.lineq.solve-two-step` | g9 | s7 | myp1 | g7 |
| `alg.lineq.brackets` | g9 | s9 | — | g7 |
| `alg.lineq.both-sides` | g9 | s8 | myp2 | g8 |
| `alg.lineq.rearrange-formula` | g10? | s8 | myp3 | alg1? |
| `alg.ineq.solve-positive` | **g10?** | s9 | **myp2** | **g7** |
| `alg.ineq.flip` | g10? | s9 | myp3 | g7 |
| `alg.ineq.absolute-value` | **—** | **—** | **—** | **—** |
| `alg.poly.add-sub` | g8 | — | — | alg1? |
| `alg.poly.mul-binomial` | **g8** | s9 | myp3 | alg1? |
| `alg.poly.factor-trinomial` | g9 | s9 | myp3 | alg1? |
| `alg.poly.factor-cubes` | **g9** | — | — | alg2? |
| `alg.poly.div-long` | g12? | — | myp5? | alg2? |
| `alg.rat.simplify` | **g9** | igcse? | myp5? | alg2? |
| `alg.rat.add-sub` | g9 | igcse? | myp5? | alg2? |
| `alg.quad.solve-factor` | g11? | igcse? | myp4 | alg1? |
| `alg.quad.formula` | g11? | igcse? | myp4 | alg1? |
| `alg.quad.complete-square` | g11? | igcse? | myp4 | alg1? |
| `alg.sys.substitution` | **g9** | s9 | myp3 | g8 |
| `alg.sys.elimination` | g9 | s9 | myp3 | g8 |
| `num.exp.product` | g8 | igcse? | — | g8 |
| `num.sci.normalize` | — | igcse? | — | g8 |
| `num.rad.simplify` | g8 | igcse? | myp5? | alg2? |
| `num.cx.form` | — | — | dp? (HL) | alg2? |
| `alg.explog.same-base` | g11? | — | myp4 | alg1? |
| `alg.explog.log-laws` | g11? | — | dp? | alg2? |
| `alg.func.notation` | g10? | s9 | myp3 | g8 |
| `alg.func.composite` | g11? | igcse? | myp4 | alg2? |
| `alg.seq.nth-term` | g12? | s8 | myp2 | g8 |
| `alg.seq.geometric-series` | g12? | — | dp? | alg2? |

### What the matrix exposes

**One-step equations land three years apart.** Cambridge s7, CCSS g6 and MYP 1 all put them at age ~11–12. MEDUCA puts them at **9°**, age ~14–15. Meanwhile MEDUCA teaches `factor-common` at 9° while CCSS does it at g6, and MEDUCA teaches `factor-cubes` — which appears in *no other frame at these bands*.

This is the single most important structural fact in the document. **MEDUCA is not "behind"** — it is differently ordered: heavy expression manipulation early, equations late. A Panamanian public-school 9th-grader and a Balboa Academy 8th-grader have close to disjoint algebra skill sets, and neither is ahead of the other. Any product that presents a single linear difficulty ladder will mis-serve at least one of them.

**Inequalities are absent from MEDUCA Premedia entirely** (`g7`–`g9`), while CCSS does them at g7 and MYP at myp2. MEDUCA students meet inequalities in 10° at the earliest — and `g10` is PROVISIONAL, so even that is unverified. A student switching from a public school to a Cambridge or IB private school at 9°/10° walks into a topic their classmates met two to three years earlier. **This is the highest-value tutoring gap in the whole matrix**, and it is now a mechanical finding rather than a hunch.

**`alg.ineq.absolute-value` is now an orphan in every frame.** It survives in the graph because 34 validated seeds exist for it — inherited from PAA U2-N3. It belongs to no current frame. Either a frame claims it (MEDUCA `g10` is the likely home once verified) or it becomes documented dead content. Do not leave this unresolved.

**Cross-frame band naming is not a difficulty ordering.** `myp1` ≠ `g6` ≠ `s7` in age, rigour or sequence. The matrix maps *where a skill appears*, never *how hard it is there*. Difficulty calibration stays in `curriculum_brain.md`.

---

## 9 — Progression and placement

**The DAG lives on skills, not on units or grades.** A level unlocks when every `prereqs` entry of every skill it contains is mastered, unless the frame sets `gate: 'none'` (explicit override for on-ramp levels).

**Placement is one function, not four.** The placement test measures *skills* and returns a mastered-skill set. Frame-specific placement is then `frame.firstLevelWhereNotAllPrereqsHeld(masteredSkills)` — one implementation serving MEDUCA, Cambridge, IB and CCSS alike.

**This is what makes the Panamanian case work.** A student says "9° en un colegio Cambridge." Grade and curriculum disagree about what they know; the skill set does not. Placement reads skills and puts them where they actually are, in whichever frame they present.

**Diagnostics become teachable.** The tutor-facing payload stops being "failed U2-N3" and becomes "holds `alg.ineq.solve-positive`, missing `alg.ineq.flip`" — which says what to teach in the session.

**Unchanged from `assessment_architecture.md`** (still authoritative): binary ace gate with two rejection-pattern guards; 4-band rubric (Mastery / Solid / Shaky / Fail) at 7–9 / 4–6 / 0–3; adjacent rejections `[1,1]` = Fail; no automated retake loop — not-passed hands off to human tutoring; `stepScore` and `mcqScore` stored separately, never averaged.

---

## 10 — Authoring invariants

1. **Frames reference skills; they never define them.** New skill → Layer A first, with `op`, `track`, `prereqs`, reviewed.
2. **Skill IDs are immutable once published.** Rename = new ID + deprecation entry. Student mastery records point at these strings.
3. **Never rename a `legacySubTopic`.** Those 34 values are live in `frontend/content/seed-paa-algebra.js` and in student records — retiring the PAA *frame* does not touch them.
4. **Both `es` and `en` labels are required.** A skill with one missing is incomplete, not valid.
5. **`edition` is mandatory and never mutated.** A syllabus revision creates a *new* frame; in-progress students stay on the old one.
6. **No seeds against `PROVISIONAL` frames or bands.** Verify against the source document first.
7. **S★ is not S.** A roadmap that counts S★ skills as available is wrong. Every `dp` skill and most of `alg2` is S★.
8. **Exactly one frame sets `reference: true`.** Currently MEDUCA.
9. **IB MYP bands are defaults, not syllabus.** Any school partnership confirms against that school's own scope and sequence.
10. **`curriculum_brain.md` still governs content quality.** This doc says *which* skill; the brain doc says whether the problem is any good.
11. **Structural decisions get a dated entry in [§12](#12--changelog).** No silent edits to `LOCKED` frames.

---

## 11 — Migration path

Doc-only pass. Sequenced code work this unblocks:

| # | Step | Touches | Risk | Blocked by |
|---|---|---|---|---|
| 0 | **Delete the stale PAA KV lesson records** | `worker/seed-paa-algebra.js` | Low — they match no frame | none |
| 1 | Extract Layer A to `frontend/content/skill-graph.js` (es + en) | new file | None — additive | §5 approved |
| 2 | `legacySubTopic` → skill ID resolver; keep `subTopicEnum` unrenamed | `seed-paa-algebra.js` | Low | 1 |
| 3 | Author `frames/meduca.js` from [§7.1](#71--frame-meduca--reference-frame) | new file | Low | 2 |
| 4 | Canonical coordinates + legacy PAA shim | `worker/src/index.js`, `lesson.html`, `home.html`, `app.html` | **High — live routing** | 3 |
| 5 | Grade/curriculum picker replaces the PAA funnel entry | `index.html`, `home.html` | Med — front door | 4 |
| 6 | Seed MEDUCA `g8`–`g9` gaps (polynomials, algebraic fractions) | seed files | Low — additive | 3 |
| 7 | Author `frames/camb.js`, `frames/ib.js`, `frames/ccss.js` | new files | Low | 4 |
| 8 | Verify PROVISIONAL bands against sources; promote | this doc | None | source access |
| 9 | Build new validators for S★ ops | `math-validation.js` | Med | 8 |

Steps 1–3 are additive and safe to land behind existing behaviour. **Step 4 is the only dangerous one** — it touches live student routing, and the shim in [§3](#3--canonical-coordinate-system) is what makes it survivable. Never leave the product broken for students.

**Content reality check.** Of the ~50 skills the four frames need at `g6`–`g9` equivalents, 34 are seeded. The near-term authoring gap is MEDUCA `g8`–`g9` — polynomial arithmetic and algebraic fractions, which PAA never needed and which sit at the centre of the Panamanian public-school program. That is step 6, and it is the highest-leverage authoring work available.

---

## 12 — Changelog

| Date | Decision | Status |
|---|---|---|
| 2026-05-18 | **D-STRUCT / D-STRUCT-2.** Seeds authoritative over prose; five-unit PAA scaffold. | Superseded — frame retired 2026-07-27, seeds preserved |
| 2026-07-27 | **D-STRUCT-3.** Two-layer model: curriculum-agnostic skill graph + frames. Standards-code spine and per-curriculum silos rejected. | Approved (approach) |
| 2026-07-27 | **D-STRUCT-7.** Product scope: UTP exam prep → Panama-wide algebra, grades 6–12, bilingual. **PAA frame retired.** | Approved (direction) |
| 2026-07-27 | **D-STRUCT-8.** `MEDUCA` is the reference frame — grounded in the fact that Panamanian private schools are MEDUCA-accredited regardless of their international program. | Approved (direction) |
| 2026-07-27 | **D-STRUCT-9.** Scope limited to the algebra strand by engine constraint; every frame documents what it drops. | Approved (direction) |
| 2026-07-27 | **D-STRUCT-10.** Layer A expanded to 105 skills, algebra 6–12, `es` + `en` on every row; all 34 legacy subTopics preserved. | **DRAFT — needs Ronel** |
| 2026-07-27 | **D-STRUCT-11.** Four frames drafted: MEDUCA `g6`–`g12`, CAMB `s7`–`igcse`, IB `myp1`–`dp`, CCSS `g6`–`alg2`. | **DRAFT — needs Ronel** |
| 2026-07-27 | **D-STRUCT-13.** CAMB `s7` corrected: `alg.lineq.negative-coefficient` added. Found while authoring Stage 7 content — `curriculum_brain.md` §1 lists `9 − 2x = 7` as Stage 7, but §7.2 omitted the skill. | Corrected |
| 2026-07-27 | **D-STRUCT-12.** `S` / `S★` track split introduced to separate authoring work from engineering work. | **DRAFT — needs Ronel** |

### Open, not decided here

- **Who claims `alg.ineq.absolute-value`?** 34 seeds exist; no frame currently uses it. MEDUCA `g10` is the likely home, pending verification.
- **What does a student pick at signup** — grade only, grade + school, or grade + curriculum? Grade alone is the only thing they reliably know.
- **Do the three non-MEDUCA frames get built now or held?** They cost one file each, but each needs its own seeds at the top bands.
- **Is IB DP worth a frame at all**, given that Nuvo can serve only Topic 1 and part of Topic 2, and every skill there is S★?
- **MEDUCA 2026 rediseño** — track now or wait for publication?
- The prereq edges are a **pedagogical** claim. The graph is well-formed; whether the ordering matches how a real student learns is Ronel's call.

---

## 13 — Sources

**Read and verified**

- `frontend/content/seed-paa-algebra.js` — `subTopicEnum` (34), `seeds` (72), `draws`. Runtime truth for the legacy mapping.
- `worker/seed-paa-algebra.js` — stale KV lesson records; migration step 0.
- `docs/curriculum_structure_authority.md` v1.0 → `curriculum_structure_authority_v1_archived.md`.
- `docs/assessment_architecture.md` §0 · `frontend/content/curriculum_brain.md` §§1–4.
- [Mi Aula — Matemáticas, guías 7°/8°/9° (Enseña por Panamá, MEDUCA-aligned)](https://hub.ensenaporpanama.com/matematicas/) — grade-by-grade grounding for MEDUCA `g7`–`g9`.
- [Best IB Schools in Panama](https://world-schools.com/best-ib-schools-in-panama/) · [International Schools in Panama City](https://www.doris.school/international-schools/panama/panama-city) — school/curriculum landscape and MEDUCA accreditation of private schools.

**Cited but NOT read — verify before promoting any PROVISIONAL band**

- [Programa de Matemática 7.º, 8.º y 9.º — Guías MEDUCA](https://guias.meduca.gob.pa/sites/default/files/2024-02/programa-matematica-7-8-9-web.pdf)
- [Premedia Matemática 7-8-9, 2014](https://www.meduca.gob.pa/wp-content/uploads/2025/04/programas-educacion-basica-general-premedia-matematica-7-8-9-2014.pdf)
- [Media Académica Matemática 10.º, 2014](https://www.meduca.gob.pa/wp-content/uploads/2025/04/programas-educacion-media-academica-matematica-10-2014.pdf)
- [Media Académica Matemática 11.º, 2014](https://www.meduca.gob.pa/wp-content/uploads/2025/04/Programas-Educacion-MEDIA-ACADEMICA-matematica-11-2014.pdf)
- [Guía de Aprendizaje Matemática 12.º](https://guias.meduca.gob.pa/sites/default/files/2022-02/Matem%C3%A1tica_12%C2%B0%20Media%20Acad%C3%A9mica.pdf)
- [MEDUCA — Planes y programas de estudio](https://www.meduca.gob.pa/planes-y-programas-de-estudio/)
- Cambridge IGCSE Mathematics 0580 syllabus (2025–2027) — full subtopic list not read.
- IB DP Mathematics AA/AI guides — not read.
- CCSS High School Algebra I / II conceptual categories — not read at cluster granularity.

**Context**

- [MEDUCA: rediseño curricular 2026, 276 asignaturas](https://www.ecotvpanama.com/nacionales/meduca-aclara-no-se-eliminaran-materias-el-nuevo-rediseno-curricular-2026-n6064567) — edition risk for the reference frame.

---

## 14 — Verification run

Executed against `frontend/content/seed-paa-algebra.js`, 2026-07-27. Re-run before promoting any frame to `LOCKED`.

| Check | Result |
|---|---|
| Skills defined in [§5](#5--layer-a-the-skill-graph) | **105** |
| Track split S / S★ / M / O | **52 / 37 / 12 / 4** |
| Skills missing an `es` or `en` label | **none** |
| `legacySubTopic` ↔ `subTopicEnum` | **34 ↔ 34, bijective** — nothing lost retiring PAA, nothing invented |
| Dangling prereqs | none |
| Cycles in the prereq DAG | none |
| Skills referenced by a frame but undefined | none |
| Skills defined but referenced by no frame | none |

**Read the track split before planning anything.** Only **52 of 105** skills are gradable by the engine as it stands. **37 are S★** — they need a new op or validator built before a single problem can be graded, and they cluster exactly where the upper bands live: IB `dp` is 100% S★, CCSS `alg2` is nearly so, MEDUCA `g11`–`g12` heavily so. Grades 6–9 across all four frames are almost entirely S, which is why that range is the honest near-term product.

**Not verified — known open:**

- Every band marked ⚠ ([§7](#7--the-frames)): MEDUCA `g6`, `g10`–`g12` · Cambridge `igcse` · IB `myp5`, `dp` · CCSS `alg1`, `alg2`. Status `PROVISIONAL` exists to carry exactly this, and no seeds may be authored against them.
- **IB MYP bands are not a syllabus** — MYP does not prescribe one. They are typical-school defaults and must be confirmed per school.
- The prereq edges are a **pedagogical** claim, not a mechanical one. The graph is acyclic and well-formed; whether `alg.expr.like-terms-single` truly precedes `alg.lineq.solve-one-step` for a real student is Ronel's judgement, and the likeliest place the graph is wrong.
- `alg.ineq.absolute-value` and `alg.ineq.absolute-value-union` have seeds but **no owning frame** — the only skills in the graph in that state.
