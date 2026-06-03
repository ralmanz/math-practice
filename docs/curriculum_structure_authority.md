# D-STRUCT — Curriculum structure authority

**Status:** LOCKED 2026-05-18 (Ronel: proceed with option **(a)** below).  
**Supersedes:** conflicting level definitions in `assessment_architecture.md` Section 0 (U1–U2 only) and PAA Álgebra “3 niveles” in `curriculum_brain.md` §7.

---

## Decision

**Option (a):** The **five-unit scaffold (U1–U5)** from assessment architecture stays the platform shape. **Level topics and `op` / `subTopic` enums for units that have deployed seeds** are authoritative in `frontend/content/seed-paa-algebra.js`. Architecture Section 0 and the brain doc are updated to match those seeds for U1–U2. U3–U5 keep the architecture doc’s planned topics until corresponding seeds exist (option (b)’s “re-author everything to old Section 0” is **not** chosen).

**Not chosen — option (b):** Treat pre-seed architecture level bullets as authoritative and rewrite all U1–U2 seeds + brain to match (e.g. exponentes in U1-N2, sucesiones in U1-N3).

---

## Why (a)

| Source | Issue if unchanged |
|--------|-------------------|
| Deployed seeds | 36 problems, `subTopicEnum`, `draws`, and `op` routing already built and validated |
| Architecture U1-N2/N3 (old) | Exponentes / sucesiones — **no seeds** |
| Brain PAA (old) | Single Álgebra unit, 3 niveles mixing U1+U2 topics — **does not match** seed split |
| `CURRICULUM_SEED_MAP` | Was mapping PAA `stage` 1–3 → U1 only; **U2 seeds unreachable** |

---

## Authoritative matrix (U1–U2, from seeds)

### U1 — Expresiones algebraicas

| Level | Topics (student-facing) | Allowed `op` values | `subTopicEnum` tags |
|-------|-------------------------|---------------------|---------------------|
| **N1** | Términos semejantes; simplificar expresiones lineales | `simplify` | `like-terms-single`, `like-terms-multi`, `like-terms-negative` |
| **N2** | Evaluar expresiones; traducir enunciados a expresión | `evaluate`, `translate` | `substitute-positive`, `substitute-negative`, `substitute-power`, `translate-expression` |
| **N3** | Expandir un factor; factorizar factor común | `expand`, `factor` | `expand-single`, `expand-simplify`, `factor-common` |

### U2 — Ecuaciones e inecuaciones lineales

| Level | Topics (student-facing) | Allowed `op` values | `subTopicEnum` tags |
|-------|-------------------------|---------------------|---------------------|
| **N1** | Ecuaciones lineales (un lado / dos pasos; coeficientes negativos) | `solve` | `solve-one-step`, `solve-two-step`, `negative-coefficient` |
| **N2** | Ecuaciones ambos lados; paréntesis | `solve` | `both-sides`, `brackets`, `both-sides-brackets` |
| **N3** | Inecuaciones lineales; valor absoluto (doble desigualdad) | `inequality` | `inequality-positive`, `inequality-flip`, `absolute-value` |

### U3–U5 (locked topic slots — D-STRUCT-2 2026-05-18; seeds not yet authored)

| Unit | Level | Topics (delivery) | `op` (planned) | Notes |
|------|-------|-------------------|----------------|-------|
| **U3** | N1 | Cuadráticas factorizables; “una solución” (`acceptAnyRoot`); residuo polinómico básico (evaluar en x=−a) | solve, evaluate | Reference seed `u3-n1-01` |
| | N2 | Ecuaciones racionales (denominador lineal); **variación inversa** | solve | Trabajo simbólico; no radical como respuesta final |
| | N3 | **Leyes de exponentes** (simbólicas); **notación científica** normalizada | simplify, evaluate (+ `scientific` TBD) | FIX-SCINOT cuando exista `op`; radicales solo como paso intermedio |
| **U4** | N1 | Sistemas 2×2 sustitución (enteros) | solve | `x=…, y=…` |
| | N2 | Sistemas 2×2 eliminación | solve | |
| | N3 | Modelado verbal → sistema | translate, solve | |
| **U5** | N1 | Pendiente; recta; lectura gráfica básica; **recta numérica / región** (MCQ) | mcq | SVG embebido |
| | N2 | Dominio, rango, f(x); patrones / **sucesiones** (reconocimiento) | mcq | Sucesiones: formato MCQ, no motor paso |
| | N3 | Gráficas, coordenadas, funciones (creciente/decreciente, etc.) | mcq | Temas gráficos fuera del motor |

**U2-N1 addendum (no new level):** proporciones y razones → ecuación lineal (`solve` / `translate` en contexto). Se autoran en el banco U2-N1 existente cuando toque D-SEEDS.

---

## D-STRUCT-2 — Re-home orphaned topics (2026-05-18)

Topics displaced when U1–U2 were locked to deployed seeds. **3 niveles/unidad** and **U5 MCQ-only** are unchanged; **no new unit count**.

| Former home (pre-D-STRUCT) | Decision | Slot or note |
|----------------------------|----------|----------------|
| Leyes de exponentes (simbólicas) | **In-scope, required** | **U3-N3** — `simplify` / `evaluate`; enums TBD (`exponent-product`, `exponent-power`, `exponent-quotient`) |
| Notación científica (`a×10^n` normalizada) | **In-scope** | **U3-N3** — mismo nivel que exponentes; `op` TBD (`scientific`) → FIX-SCINOT |
| Sucesiones aritméticas (término general, n dado) | **PAA in-scope, not step** | **U5-N2 MCQ** — reconocimiento de patrón / fórmula; no `op` Algebrite |
| Proporciones / razón → ecuación | **In-scope** | **U2-N1** — ampliar seeds `solve`/`translate` (subTopic TBD `proportion`) |
| Variación inversa | **In-scope** | **U3-N2** — `solve` |
| Ecuaciones racionales lineales | **In-scope** | **U3-N2** — `solve` (ya planificado) |
| Residuo polinómico (x+a) | **In-scope** | **U3-N1** — `evaluate` junto a cuadráticas |
| Cuadráticas factorizables | **In-scope** | **U3-N1** — `solve` (+ `acceptAnyRoot` cuando aplique) |
| Ecuaciones / expresiones radicales (respuesta final) | **Out of Nuvo PAA step delivery** | PAA prohíbe radical en “suplir”; paso intermedio validable en U3-N2 |
| Recta numérica / región sombreada (inecuación gráfica) | **Out of step; in PAA via MCQ** | **U5-N1** (MCQ + SVG) |
| Operaciones polinomio (suma/resta/producto) | **In-scope** | Cubierto por **U1** (expand/factor/simplify) + profundización **U3-N1** |
| Pendiente/gráficas/funciones gráficas | **Out of step; in PAA via MCQ** | **U5** (ya decidido) |
| Geometría · Datos y Probabilidad (unidades PAA) | **Out of Nuvo PAA algebra delivery** | Examen PAA; producto aparte / tutoría (brain §7 Unidad 1 aritmética sí en Nuvo) |
| Logaritmos, complejos, trig avanzada, matrices, 3+ incógnitas | **Out of Nuvo PAA delivery** | Fuera de alcance motor + guía PAA práctica |

**Structural choice rejected:** widening beyond five units — mantener U1–U5; densidad en U3-N3 para exponentes + sci-notation.

---

## PAA product URL mapping (transitional)

Legacy PAA **Álgebra** uses `lesson.html?curriculum=PAA&unit=algebra&stage=N`.

| `stage` | Platform coords | Notes |
|---------|-----------------|--------|
| 1 | U1 N1 | unchanged |
| 2 | U1 N2 | unchanged |
| 3 | U1 N3 | unchanged |
| 4 | U2 N1 | **new** — use until home/lesson UI exposes 6 levels or splits units |
| 5 | U2 N2 | **new** |
| 6 | U2 N3 | **new** |

`frontend/home.html` still renders **3 levels** for Álgebra; U2 is reachable via `stage=4|5|6` or future UI work (**D-SEEDS-map** in [implementation_deferred.md](implementation_deferred.md)).

---

## Downstream work unlocked

1. **D-SEEDS** — continue authoring within U1/U2 enums; start U3 when ready.
2. **D-BRAIN** — align PAA §7 narrative + walkthrough table to U1/U2 rows above (U3–U5 prose from architecture).
3. **FIX-SCINOT** — scoped to **U3-N3** (`scientific` op TBD). **FIX-ABSGE** — done (U2-N3 `|·|≥k`).
4. **D-SEEDS** — U2-N1 proporciones; U3 per table above; U5 MCQ packs.

---

## Files touched by D-STRUCT / D-STRUCT-2

- `docs/assessment_architecture.md` — Section 0 (U1–U5 level bullets)
- `frontend/content/curriculum_brain.md` — PAA Álgebra §7 U1–U5 tables + D-STRUCT-2 out-of-delivery note
- `frontend/app.html` — `CURRICULUM_SEED_MAP` stages 4–6 → U2
- `docs/d_seeds_authoring.md` — backlog aligned to D-STRUCT-2
