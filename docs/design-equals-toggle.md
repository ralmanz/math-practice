# B-TOGGLE — `=` as structured UI state (design brief)

**Status:** DESIGN ONLY — do not implement in `app.html` until Ronel locks this wireframe.

## Problem

Requiring students to type a leading `=` on every step is keyboard-hostile and caused recurring bugs (strip logic in multiple places). **B-TOGGLE must replace all four touchpoints below** with one `normalizedStepInput(uiState)` — no ad-hoc strips left behind.

## Current `=` touchpoints (2026-05-18 — consolidate on implement)

**Intended order:** require `=` for notation UX (expression-chain types) → build `equivInput` (strip once for step math) → on finality, strip again only where the comparator still expects a bare expression (idempotent if already stripped).

| # | Location | When | What it does |
|---|----------|------|----------------|
| **1** | `app.html` `submitStep` | `problem.type` ∈ `Simplify` \| `Expand` \| `Factorize` (legacy `type` string, capitalized) | If line does not start with `=`, `rejectEqualsNotationMiss` (nudge/wrong; assessment may count rejection). Else `equivInput = expressionLineForEquivalence(input, type)` → `replace(/^=\s*/, '')`. |
| **2** | `app.html` `expressionLineForEquivalence` | Called from #1 and when building `previousExpression` from `stepHistory` | Same strip; used for **step** `checkEquivalence(previousExpression, equivInput, …)`. |
| **3** | `app.html` `checkFinalAnswer` | Every final check after a correct step (incl. comma shortcut) | If `problem.op` → `validateAgainstSeed(**rawInput**, problem)` (strip inside validator). Else `stripped = equivInput.replace(/^\s*=\s*/, '')` → `checkIsFinal(stripped, …)`. **Not double-penalized:** #1 already rejected missing `=`; second strip on `equivInput` is a no-op when prefix already removed. |
| **4** | `math-validation.js` `validateAgainstSeed` | `problem.op` seeds (authoritative final path) | `studentInput = String(studentRaw).replace(/^\s*=\s*/, '')` then route by `op`. Also used from `satisfiesEquation` for `acceptAnyRoot` (strip on `studentStep`). |

**Comma path (#3):** `submitStep` calls `checkFinalAnswer(input, equivInput, problem)` with **raw** `input` for `op` seeds and **stripped** `equivInput` for legacy `checkIsFinal` — same split as non-comma final.

**Op seeds vs notation rule:** `getLocalSeedProblems` sets `type: s.op` (lowercase, e.g. `simplify`). `EXPRESSION_EQUALS_NOTATION_TYPES` uses `Simplify` / `Expand` / `Factorize` — **op seeds do not hit #1 today**; only legacy KV/bank rows with capitalized `type` require leading `=`.

## Direction (locked intent, not locked UI)

- Per submission line: a **toggle** (or equivalent control) means “this step continues from the previous line.”
- When **on:** the engine stores/displays `=<expression>` as structured state — user does not type `=` in the text field.
- When **off:** input is a bare expression (intermediate work only).
- **Single normalization function** converts UI state → string passed to `checkEquivalence` / `checkIsFinal` (retires ad-hoc `.replace(/^\s*=\s*/, '')` scatter).

## Scope by problem type

| Type | Toggle default | Notes |
|------|----------------|-------|
| Simplify, Expand, Factorize | ON for step 2+ | Matches current notation rule |
| Solve, Evaluate, Translate | Final answer may use `ans` keypad (`x =`) | Comma / union answers unchanged |
| Assessment modes | Same rules; notation misses still excluded from rejection budget |

## Open questions (resolve before CODE prompt)

1. Visual: chip vs switch vs “=” key that latches?
2. Does toggle state persist when editing a line in step history?
3. How does toggle interact with Claude interpret fallback (interpret bare or prefixed)?

## Acceptance (for future CODE prompt)

- One `normalizedStepInput(uiState)` used everywhere before validation.
- Unit tests: toggle on → equivalence sees stripped RHS; toggle off on notation types → same nudge as today.
- No new false accepts on final check.
