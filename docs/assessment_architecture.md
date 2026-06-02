# Nuvo Studio — Assessment Architecture

**Status:** Design complete — Sections 0–6 locked, data model consolidated (see Canonical data model). This is the authoritative design reference for the assessment / data-model work; Claude Code prompts are written only after the model is finalized.

**Scope note:** This is an *architecture* doc, distinct from `frontend/content/curriculum_brain.md` (which validates *content*). Assessment and data-model decisions live here, never in the brain doc.

---

## Journey map (sections)

0. Algebra curriculum units (U1–U5, DAG) — **LOCKED**
1. Placement test — **LOCKED**
2. Unit structure & a single level attempt — **LOCKED**
3. Unit completion (scoring, borderline, regeneration engine) — **LOCKED**
4. Not-passed handoff to human tutoring + progression graph — **LOCKED**
5. Final test (unlock after all units pass, countdown, no auto-submit) — **LOCKED**
6. Dual-track scoring (stepScore / mcqScore) + sub-topic diagnostics — **LOCKED**

---

## Section 0 — Algebra curriculum units  `[LOCKED]`

**Scope:** The platform is Algebra-only at launch. Aritmética, Geometría, and Datos are parked — their problem formats (number sense, geometric figures, data displays) don't fit the current step-based engine.

### Unit inventory

| ID | Name | Engine | Notes |
|----|------|--------|-------|
| U1 | Expresiones algebraicas | Step-based | Includes arithmetic sequences as Level 3 |
| U2 | Ecuaciones e inecuaciones lineales | Step-based | Includes inverse variation |
| U3 | Cuadráticas, racionales y radicales | Step-based | Single unit; split only if failure data warrants |
| U4 | Sistemas de ecuaciones | Step-based | 2×2 linear systems, substitution & elimination |
| U5 | Rectas, funciones y gráficas | MCQ-only | Graphical/reading tasks; step engine not applicable |

### Level inventory (3 levels per unit, N1 → N3)

**U1 — Expresiones algebraicas**
- N1: Traducción verbal → algebraica; simplificación de expresiones
- N2: Leyes de exponentes (producto, potencia, cociente); notación científica
- N3: Sucesiones aritméticas (término general, valor dado n, encontrar n dado el término)

**U2 — Ecuaciones e inecuaciones lineales**
- N1: Ecuaciones lineales de una variable (incluyendo proporciones)
- N2: Inecuaciones lineales; representación gráfica en recta numérica
- N3: Variación inversa; ecuaciones con expresiones racionales lineales simples

**U3 — Cuadráticas, racionales y radicales**
- N1: Ecuaciones cuadráticas (factorización, raíces enteras)
- N2: Ecuaciones racionales (denominador lineal); expresiones radicales
- N3: Ecuaciones radicales; problemas combinados cuadrático/racional

**U4 — Sistemas de ecuaciones**
- N1: Sistemas 2×2 por sustitución (solución entera)
- N2: Sistemas 2×2 por eliminación
- N3: Sistemas expresados como problemas verbales (modelado + resolución)

**U5 — Rectas, funciones y gráficas** *(MCQ-only)*
- N1: Pendiente; ecuación de la recta; interpretación gráfica
- N2: Dominio y rango; evaluación de funciones; notación f(x)
- N3: Lectura de gráficas; coordenadas; desplazamientos de puntos en el plano

### Prerequisite DAG (within Algebra)

```
U1 → U2 → U3
          ↓
     U4 (sibling of U3, both unlock after U2)
          ↓
     U5 (unlocks after U2 + U3 both pass)
```

Formal edges:
- U2 requires U1 passed
- U3 requires U2 passed
- U4 requires U2 passed
- U5 requires U2 passed **and** U3 passed

A not-passed unit blocks only its descendants in this DAG, not its siblings.

### PAA coverage confirmation

Validated against the official PAA Guía de estudio and the College Board Prueba de práctica (Parte 3, 55 ejercicios). All Algebra problems observed map cleanly to U1–U5 with no orphaned topics. Geometría and Estadística problems are confirmed parked.

---

## Section 1 — Placement test  `[LOCKED]`

**Purpose:** measure *unaided* ability, to decide per-(unit, level) skips.

### Structure
- One test instance covering the whole curriculum; questions tagged by `(unit, level)`.
- Results fan out into per-(unit, level) skip decisions.
- 2 questions per level.

### Modality
- Full `app.html` — the real step-based tool, not MCQ.
- Rationale: free-form algebraic input is un-gameable (can't guess/back-solve like MCQ), and the student feels the engine from the first moment.
- **Hints OFF** — it's a test; it measures what the student can do alone.

### Regression routing (per unit)
- Test the **highest** level first (e.g. N3).
- Ace → entire unit skipped; all its levels `placedOut: true`, status `passed`.
- Fail → drop one level and test (N2). Ace N2 → N1 also placed out; student starts at N3.
- Fail N2 → test N1; etc. Fail N1 → unit starts from scratch.
- Acing a level implies mastery of all levels below it.
- **Requires the curriculum to be fully progressive across units *and* levels.**

### Ace gate (per question)
Reached the correct answer, **and**:
- no single step exceeds **3** non-notation rejections (4th rejection on one step → question not aced); **and**
- no **3-consecutive-step window** holds more than **1** non-notation rejection (i.e. 2 rejections within any 3-step window → not aced).

**Window rule, precise:** slide a window of *up to* 3 consecutive steps across the per-step rejection counts; if **any** window sums to ≥2, the pattern is tripped. This means adjacent rejections on two steps (`[1,1]`) trip it, and 2 rejections on a single step (`[2]`) trip it (a 1-wide window summing to 2). Only well-separated rejections survive — `[1,0,0,1]` does not trip (no 3-window holds both). "Clustered" = within 3 consecutive steps, by design: clustering is the failure mode being caught, so tighter clusters must fail at least as readily as looser ones.

A level is aced only if **both** its questions are aced.

Two failure modes this catches:
- *concentrated* struggle (brute-forcing one step) → per-step ceiling
- *sustained / clustered* struggle (feeling the way through) → 2-in-3 window

### Excluded / logged-only
- `=`-notation misses never count toward any gate (consistent with the unit-test rule).
- Scattered rejections under both limits still ace.
- Clean-run flag and time-to-answer are **logged only** (seed the per-student model); they do not gate.

### Thresholds (tunable against real data)
- per-step ceiling = 3
- window rule = 2-in-3

### Accepted tradeoff
Gate strictness biases toward false-fails (redo a known unit) over false-aces (skip a unit with a real gap) — the safer direction for a skip gate, since a redundant unit costs time while a missed gap surfaces at the final test. Cost is first-impression for a capable student with clustered slips. Loosen if testing shows too many capable students dropping a level.

---

## Section 2 — Unit structure & a single level attempt  `[LOCKED]`

### Unit structure
- A unit = 3 progressive levels (N1 → N2 → N3) **+ one unit test** (9 questions, 3 per level) administered after the level content. *(Unit-test scoring & completion = Section 3.)*

### Single level content stages
`Conceptos → Práctica`, with **Ejemplos as an always-available, non-gating aid** alongside.

- **Conceptos** — the rule / teaching. **Soft-gates Práctica**: completing it once unlocks practice; does not re-lock for returning students.
- **Ejemplos** — voluntary aided supplement, *not* a gate and *not* a sequential locked step. On-demand worked example(s) the student can consult before or **during** Práctica. Suppressed in all assessment contexts (see cross-cutting rule).
  - Owns the worked example (removes the prior Conceptos/Ejemplo duplication).
  - Representation tracks are optional/per-content: **Simbólico is the always-present default**; Visual / Fórmula / Voz are authored only where they add value. UI shows only the tabs with authored content for that level.
- **Práctica** — **fixed authored set of 4–6 problems** (no runtime generation). Completion bar = **clear most (N–1 of N)** to mark the level `content_complete`.

### Cross-cutting rule — aid availability
Aid (Ejemplos, and hints generally) is available during **learning** (Conceptos, Práctica) and **suppressed in every assessment**: placement, unit test, final. Keeps "measure unaided ability" consistent everywhere.

### Level lifecycle states
`not_started → in_progress → content_complete → { passed | borderline | failed }`
- `content_complete` = Conceptos done **+** Práctica cleared to the N–1 bar. Ejemplos never affects status.
- `placedOut: true` from placement sets status directly to `passed`.

---

## Section 3 — Unit completion  `[LOCKED]`

### Unit test
- 9 questions, 3 per level, taken once all three levels are `content_complete`.
- Every question instance is generated by the regeneration engine (see below) — including first attempts — so there is no single canonical answer key to share. Each instance is Algebrite-validated before serving.

### Per-question band rubric (shared with placement)
Same rejection logic everywhere; `=`-notation misses excluded throughout.
- **Fail (0)** — answer not reached, *or* a hard pattern tripped: single step > 3 non-notation rejections, *or* the 2-in-3 window (strict sliding window of up to 3 consecutive steps summing to ≥2 — see Section 1 "Window rule, precise"; adjacent pairs `[1,1]` and single-step doubles `[2]` both trip it).
- **Shaky (1)** — reached the answer with 2–3 isolated rejections (no window/ceiling violation).
- **Solid (2)** — reached the answer with 1 rejection.
- **Mastery (3)** — clean, 0 rejections.

Consistency identity: *would-ace placement* ≡ *non-Fail on the unit test*. The unit test just adds resolution inside the passing zone. The ceiling-3 / window-2-in-3 knob is a single global tuning point across placement and unit tests.

### Per-level scoring & completion
- Level score = sum of its 3 questions → 0–9.
- **7–9 pass · 4–6 borderline · 0–3 fail.**
- **Borderline blocks** completion (soft-fail, not soft-pass). Effective rule: **≥7 passes; < 7 is flagged for tutoring** (Section 4). The 4–6 vs 0–3 split survives only as remediation intensity/messaging (sharpen vs. rebuild) — pinned in Section 4.
- A unit completes only when **all three levels individually pass** (≥7).
- Floor check: M+M+Shaky = 7 is the minimum passing combination; a single Failed question caps a level at 6 → borderline. Strict by design; loosen the global window/ceiling if data shows it's too harsh.

### Regeneration engine (parametric, deterministic) — `DEFERRED (design preserved for future implementation)`
**Status:** deferred along with the automated retake loop (see Section 4). Both its consumers — remediation practice and retake tests — are now handled by human tutoring, so the engine is not built now. First unit-test instances serve the authored seed problems directly. The full design below is retained verbatim for when automated remediation is on the table.

Powers **both** remediation practice **and** retake test instances. **Not** AI generation — Claude does not invent problems at runtime.
- Each authored problem is a **template**: parameter slots (numbers, variable letter) + an authored **valid parameter space** (ranges, sign, divisibility, "answer is a positive integer," for quadratics "discriminant a perfect square / roots rational").
- Constraints must bound **difficulty**, not just validity — generated instances must be *peers* so the 7/4 thresholds mean the same thing for everyone. (Same structure ≠ same difficulty: `(x−2)(x−3)` vs `(x−47)(x−53)`.)
- Engine samples within the space → **Algebrite-validates each instance before serving** (mandatory for graded retake instances; a malformed test variant would mis-grade the gate).
- The authored unit of content is now the **template + constraints**, not a single frozen problem. Stays inside "deterministic before probabilistic" and "content authored explicitly."
- Dependency: the pending two-root quadratic / 2×2 system seeds need tight constraint authoring before they can be safely regenerated.

---

## Section 4 — Not-passed handoff + progression graph  `[LOCKED]`

### No automated retake loop (deferred)
Remediation after a failed unit test is **handed to human tutoring**, not automated. Rationale: remediation-after-failure is the hardest pedagogical moment and there is no validated automated strategy yet; this is where the human tutor steps in. Defer until real student-failure data exists.

- A level scoring < 7 → marked not-passed and **flagged for tutoring**. Unit stays incomplete. No regenerated practice, no review-lock, no auto-retake.
- The diagnostic (band per level: borderline vs. fail, + sub-topic tags) becomes the **payload the tutor sees** — wires into the teacher-inbox / "Ask Ronel" work. Scoring feeds a human, not an engine.
- Borderline-vs-fail intensity (sharpen vs. rebuild) collapses on the automation side (both → tutoring) but survives as tutor-facing context.
- How a tutor *clears* a flagged level: **manual mark-resolved.** The tutor decides the level is remediated and clears the flag directly; no system-administered re-test is required. (A tutor may re-administer informally, but clearing the flag is a manual action, not a gated retake.) Keeps remediation fully in human hands and avoids building retake-test infrastructure before there's failure data to justify it.

### Progression = per-curriculum prerequisite graph (DAG)
Progression is **not** a hardcoded universal rule; it is an **authored dependency graph, specific to each curriculum** (PAA, Cambridge, Common Core, IB MYP author their own). A linear chain is just a degenerate graph.

- Node = `(unit, level)`. Edge = "unlocks." A node opens when its prerequisites are satisfied (passed or placed-out).
- **Intra-unit levels stay linear** (N1 → N2 → N3) — preserves the Section 1 regression-placement assumption.
- A not-passed node blocks only its **descendants**, not its parallel **siblings** — so a flagged unit awaiting tutoring blocks what depends on it while the student keeps working available branches. (This resolves the earlier "does a not-passed unit block forward progress" question.)

### PAA graph — Algebra-only (launch)
The launch curriculum is Algebra-only; the live progression graph is the U1–U5 DAG locked in **Section 0**:

```
U1 → U2 → U3
          ↓
     U4 (sibling of U3, both unlock after U2)
          ↓
     U5 (unlocks after U2 + U3 both pass)
```

- U2 requires U1 passed; U3 requires U2; U4 requires U2; U5 requires U2 **and** U3.
- Intra-unit levels stay linear (N1 → N2 → N3).
- A not-passed unit blocks only its descendants, not its siblings (e.g. a flagged U3 awaiting tutoring blocks U5 but not U4).

The earlier four-area shape (Aritmética / Geometría / Datos as parallel branches) is **parked** along with those units; it returns only if/when non-Algebra content is added and its formats fit an engine.

---

## Section 5 — Final test  `[LOCKED]`

**Purpose:** measure *retention across the whole curriculum* once every unit is passed. It is the comprehensive readiness check; the unit tests prove each unit in isolation, the final proves they hold together.

### Unlock
- Unlocks only when **all units pass** (every U1–U5 at `passed`, whether earned or placed-out). A unit flagged for tutoring (Section 4) keeps the final locked until cleared.

### Modality (inherits cross-cutting rules)
- **Step-based `app.html` for U1–U4** questions; **MCQ for U5** (per Section 0, U5 is MCQ-only).
- **Hints / Ejemplos suppressed** (cross-cutting aid rule — "measure unaided ability").
- Same per-question **band rubric** (Fail/Shaky/Solid/Mastery) for step questions; `=`-notation misses excluded throughout.

### Countdown — visible, no auto-submit
- Timer is shown and counts to zero. **Expiry does not force-submit or lock input.**
- Past zero: a "time's up" indicator shows; the student can still finish and submit manually.
- Logged-only signals (do not gate): `overtime: bool`, `overtimeSeconds`. Same philosophy as the placement clean-run flag — captured for the per-student model, never punitive. (The real PAA is hard-timed, so overtime is worth measuring, not enforcing inside the learning tool.)

### Composition
- **2 questions per level**, sampling the full (unit, level) grid: 5 units × 3 levels × 2 = **30 questions**.
- Step-based: U1–U4 = 12 levels × 2 = **24 step questions**. MCQ: U5 = 3 levels × 2 = **6 MCQ**.
- The per-level count is a **config flag** (`finalQuestionsPerLevel`, default 2) so it can drop to 1 (→ 15 questions) for early real-student testing without re-authoring.
- Step questions are served by the **same authored seeds** as unit tests (the regeneration engine remains deferred per Section 3; first final instances serve seeds directly).

### Scoring — per-unit floors, no single aggregate
The final **re-applies the unit-test bar per unit** rather than inventing a new aggregate. A student must clear **every** unit's floor; bombing one unit cannot be averaged away by strength elsewhere (the exact gap a comprehensive final exists to catch — consistent with the Section 1 tradeoff note).

- **U1–U4 (step track):** each unit = 3 levels × 2 = 6 questions, scored 0–18 on the band rubric. Per-unit floor mirrors the ≥7-of-9 unit-test ratio (0.78) → **≥14 of 18**.
- **U5 (MCQ track):** 6 MCQ scored by correctness. Same 0.78 bar → **≥5 of 6 correct**.
- **Final passes only when all five units clear their floor.** One config knob (`finalUnitFloorRatio`, default 0.78) applied per unit.

### Mixed-engine scoring — dual-track (first bite of Section 6)
The final is the first place dual-track scoring actually gates. **U1–U4 gate on `stepScore`; U5 gates on `mcqScore`. No cross-aggregation** — the two tracks are never blended into one number. This is the dual-track separation Section 6 formalizes, applied here.

### Result shape — per-unit readiness map, not a grade
Because scoring is five independent per-unit verdicts (four step-scored, one MCQ-scored), **there is no single final score.** "Did I pass the final?" = "did every unit clear its floor?" The student-facing result is a **per-unit readiness map** (pass / below-floor per unit), which is more honest than a blended percentage and routes remediation precisely.

### Failing the final — flag per failing unit, no dead-end
Consistent with Section 4 (no automated retake loop):
- A unit that misses its floor on the final → **flagged for tutoring**, same payload (band + sub-topic tags), same **manual mark-resolved** clear.
- Units that cleared their floor are **not** re-flagged; only the specific weak units route to a human.
- The final does **not** dead-end the student. (Resolves the "student dead-end after test completion" pending item for the fail case.)
- **[OPEN]** What a *passed* final unlocks / leads to next — the post-pass destination is still undefined (carries the "dead-end after completion" item for the pass case).

---

## Section 6 — Dual-track scoring + sub-topic diagnostics  `[LOCKED]`

**Purpose:** formalize the two scoring tracks (already gating the final test) and the deterministic sub-topic diagnostic that feeds both the tutoring payload (Section 4) and the student readiness map (Section 5).

### Two tracks, partitioned by unit — no shadow layer
The tracks are **not** two readings of one question. They partition the curriculum by unit:
- **Step track** — U1–U4. Scored on the band rubric (Fail 0 / Shaky 1 / Solid 2 / Mastery 3). `stepScore` is the band-points sum at the relevant grain (per-level 0–9, per-unit 0–18 on the final).
- **MCQ track** — U5 only. Scored by correctness; `mcqScore` = correct / total.

`stepScore` and `mcqScore` are **never blended** into a single number, anywhere. A step-based unit already measures mastery directly and un-gameably, so there is **no MCQ exposure layer shadowing U1–U4** — the brain doc's earlier "exposure measured separately" idea is dropped for step units. If exposure-style measurement is ever wanted for a step unit, it returns as a deliberate future decision, not a default-on shadow.

### Sub-topic tags (controlled vocabulary)
Every authored seed problem carries 1–3 `subTopic` tags from a **closed per-level enum**. No free-text, no AI-derived tags.
- **Authored by Ronel**, per level, validated against the brain doc — same content workflow as everything else. The architecture fixes the *shape* (closed enum, ≤3 tags/problem); the actual vocabularies are a content task.
- **Level-scoped:** a tag belongs to `(unit, level)`. The same word at different levels is a different tag — `factoring@U3-N1` ≠ `factoring@U1-N1`. Keeps each level's diagnostic self-contained.
- **Multiplicity:** up to 3 tags per problem (a combined U3-N3 problem can legitimately carry `factoring` + `rational-simplify`). Cap keeps diagnostics legible.
- **[OPEN — content]** The per-level tag enums themselves; filled during seed authoring, not an architecture blocker.

### Diagnostic — deterministic, no prose
Computed **per flagged unit, within a single test instance** (unit test or final). Emits a ranked list; each entry:
- `subTopic` — the tag
- `weight` — **severity score**, not raw count (definition below)
- `worstBand` — most severe band seen on problems carrying the tag (Fail > Shaky > Solid)
- `occurrences` — count of tagged problems that contributed

**Severity (weight)** = sum of *inverted band points* over the tagged problems: **Fail = 3, Shaky = 2, Solid = 1, Mastery = 0.** An aced tag contributes 0; a tag failed twice scores 6 and ranks top. Reuses the existing band rubric — no new scoring concept — and surfaces *weak-and-recurring* to the top of the tutor payload. Rank by `weight` desc, ties broken by `worstBand`. Fully deterministic, no AI.

### Stateless property (store inputs, not output)
The diagnostic is a **pure function of `(tagged seeds, this instance's per-question bands)`** — no state, no history. The tutor payload (Section 4) and the student readiness detail (Section 5) are both *views* over this one computation, so they cannot drift apart. **Store the inputs (tagged seeds + per-question results); recompute the diagnostic on demand** rather than persisting it.

### Cross-attempt aggregation — `DEFERRED`
No longitudinal roll-up, no cross-instance trend, no exposure index. Store `mcqScore` raw (correct/total) per level/unit and step results per question as already modeled. The diagnostic computes within one instance only. Aggregating across a student's history is a **conscious future decision**, marked deferred so it isn't an accidental omission.

---

## Canonical data model  `[CONSOLIDATED]`

Single source of truth for the assessment data model. Supersedes the fragmented per-section sketches. Two domains: **authored content** (curriculum-level, shared across students, version-controlled in the repo) and **student state** (per-student, lives in the `STUDENTS` KV namespace).

### A. Authored content (shared, in-repo)

The unit of authored content is the **seed**. Templates/constraints from the Section 3 regeneration engine are deferred — seeds are served directly for now.

```
seed[seedId] = {
  unitId,            // U1–U5
  levelId,           // N1–N3
  track,             // "step" (U1–U4) | "mcq" (U5)
  subTopics,         // [tag] — 1–3, from the closed per-level enum (level-scoped; Section 6)

  // step seeds (U1–U4):
  prompt,            // problem statement
  answer,            // Algebrite-validated canonical answer / solve-path

  // mcq seeds (U5):
  // prompt, options[], correctOption

  // DEFERRED (regeneration engine, Section 3): paramSlots, validParameterSpace, difficultyConstraints
}
```

```
ejemplos[levelId] = {            // authored aid, per level (Section 2)
  representations: {             // only authored tracks present; UI renders tabs accordingly
    simbolico,                   // always present (default)
    visual?, formula?, voz?      // optional, per content
  }
}
```

```
subTopicEnum[unitId][levelId] = [tag, ...]   // closed per-level vocabulary (Section 6)
// [OPEN — content] enums authored by Ronel against the brain doc during seed authoring
```

Curriculum structure (units, levels, DAG edges) is authored config:
```
curriculum.units   = [ { unitId, name, track, levels: [N1, N2, N3] } ]   // Section 0
curriculum.dag     = [ { from, to } ]   // prereq edges; U5 has two: {U2→U5},{U3→U5}
curriculum.config  = { finalQuestionsPerLevel: 2, finalUnitFloorRatio: 0.78,
                       perStepCeiling: 3, windowRule: "2-in-3" }   // global tuning knobs (Sections 1, 3)
```

### B. Student state (per-student, KV)

```
student.progress[unitId][levelId] = {
  status,            // not_started | in_progress | content_complete | passed | borderline | failed
  placedOut,         // bool — set by placement; status → passed
  conceptosDone,     // bool — soft-gate for Práctica (Section 2)
  practiceCleared,   // int — count cleared toward the N−1 bar
  ejemplosViews,     // int — logged aid-consultation signal; never gates
  unitTest: {
    questions: [ { seedId, band, points, rejections, reachedAnswer } ],  // 3 per level
    levelScore,      // 0–9 (sum of question points)
    outcome          // pass (>=7) | borderline (4-6, blocks) | fail (0-3)
  },
  tutorFlag: { flagged, clearedBy, clearedAt }   // Section 4 — manual mark-resolved
}
```

```
student.finalTest = {              // one instance per student, spans all units (Section 5)
  unlocked,                        // bool — true only when every unit passed
  startedAt, submittedAt,
  overtime, overtimeSeconds,       // logged only; never gates
  units: {
    [unitId]: {
      track,                       // "step" | "mcq"
      questions: [ { seedId, band, points, rejections, reachedAnswer } ],  // step: 6/unit
      unitScore,                   // step: 0–18
      mcqCorrect, mcqTotal,        // mcq (U5): correct / 6
      cleared                      // step: unitScore >= 14 · mcq: mcqCorrect >= 5  (0.78 floor)
    }
  },
  passed,                          // bool — every unit cleared; no aggregate score stored
  flaggedUnits                     // [unitId] — below floor, routed to tutoring
}
```

### C. Computed, not stored

The **sub-topic diagnostic** is a pure function of `(tagged seeds, per-question bands)` — recomputed on demand, never persisted (Section 6 stateless property). Emitted shape:
```
diagnostic[unitId] = [                              // ranked, per flagged unit, within one instance
  { subTopic, weight, worstBand, occurrences }      // weight = Σ inverted band pts (Fail3/Shaky2/Solid1/Mastery0)
]                                                   // rank: weight desc, tie → worstBand
```

### D. KV key conventions (`STUDENTS` namespace)

One student = one logical record. Keep data updated together under one key to avoid multi-read/write churn (matches the "batch related data" KV guidance).

```
student:{studentId}:profile        → { name, createdAt, placementDone, ... }
student:{studentId}:progress        → full progress[unitId][levelId] map (single blob)
student:{studentId}:finalTest       → finalTest object
student:{studentId}:log             → append-only event signals (overtime, ejemplosViews, timings)
```

- `progress` is stored as **one blob per student**, not a key per level — the whole map is read on load and rewritten on any level transition (last-write-wins is acceptable; one student edits their own record).
- Authored content (`seed`, `ejemplos`, `subTopicEnum`, `curriculum.*`) does **not** live in KV — it ships in the repo / frontend bundle and is read-only at runtime.
- No diagnostic is stored (domain C); recompute from `progress`/`finalTest` + seeds.

## Pending (carried from prior sessions)
- Two-root quadratic (x=3, x=4) & 2×2 system (x=4, y=3) Solve-path validation confirmation
- MCQ / SVG build
- "Ask Ronel" split + teacher inbox
- Student dead-end after test completion
- Yappy payments; UptimeRobot
- Web-canvas vs. native-iPad (PencilKit) handwriting fork
- Sync the brain doc Claude Code reads from to the latest version before any new build
