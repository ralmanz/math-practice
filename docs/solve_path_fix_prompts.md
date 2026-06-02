# Claude Code prompts — solve-path validation fixes

Four prompts, in priority order. Each is self-contained and scope-bounded. Run and verify one before the next. **A and C touch `math-validation.js`; B touches `app.html`.** Do not combine them.

---

## PROMPT A — Fix global symbol-table poisoning (`math-validation.js`)  `[SEVERE — do first]`

```
In math-validation.js, there is a severe bug: certain Solve validations leave a variable
bound in Algebrite's global symbol table (e.g. `x` becomes 3), which silently corrupts every
subsequent validation in the session. Confirmed: after comparing a bare number against an
equation, `Algebrite.run('x')` returns a number instead of 'x', and `simplify(x-4)` returns 0.

Root cause: when one side is a bare value (no '=') and the other is an equation like "x=3",
neither the equation nor inequality branch fires, so it falls through to
`Algebrite.run('simplify((3)-(x=3))')`. Algebrite interprets `x=3` as an ASSIGNMENT and binds
x globally.

Fix two things, minimally:

1. At the very start of the top-level `checkEquivalence` call (before any branching), reset
   Algebrite's symbol state with `Algebrite.run('clearall')`. This guarantees a clean table per
   validation. IMPORTANT: only do this once at entry of the OUTER call — the function recurses
   for comma parts; do not clearall inside the recursion or you'll wipe state mid-comparison.
   Use a wrapper or a flag so the recursive calls skip the clearall.

2. Guard against ever passing a raw '=' into `Algebrite.run('simplify(...)')`. Before the
   fall-through `simplify((normA)-(normB))`, assert that neither normA nor normB contains a
   standalone '=' (use the existing containsEquals helper). If either does at that point, return
   { valid: null, parseError: true } instead of calling simplify — that input should have been
   routed to equationEquivalence and reaching raw simplify with an '=' is always a bug.

Do NOT change the comma-matching logic, the equation/inequality routing, or any scoring. Verify
after: `x=3, x=4` ~ `x=3, x=4` still true; `x=4, x=3` ~ `x=3, x=4` true and DETERMINISTIC across
repeated calls; `x=4, y=3` and `y=3, x=4` ~ `x=4, y=3` both true; and `Algebrite.run('x')` returns
'x' after any sequence of validations.
```

**Verification (already confirmed correct in isolation):** template forms pass and leave `x`/`y` unbound. The fix's job is to make that hold *regardless of prior calls*.

---

## PROMPT B — Sync band scoring to locked rubric (`app.html`)  `[BLOCKING — independent]`

```
In app.html, the function recordUnitTestQuestionResult() (around line 1623) scores unit-test
questions on the wrong rubric and is missing two required rules. It currently does:
  0 rejections -> Mastery(3); <=2 -> Solid(2); else -> Shaky(1); not reached -> Fail(0).

The locked rubric is:
  - Mastery (3): reached, 0 rejections
  - Solid   (2): reached, exactly 1 rejection
  - Shaky   (1): reached, 2 or 3 rejections (isolated)
  - Fail    (0): NOT reached, OR a hard pattern tripped — see below.

Two hard-fail patterns must override to Fail(0) even if the answer was reached:
  - per-step ceiling: more than 3 rejections on any SINGLE step
  - 2-in-3 window: 2 or more rejections within any window of 3 consecutive steps

This requires tracking rejections PER STEP, not as one flat total. Today the code uses a single
`unitTestRejections` counter and `UNIT_TEST_REJECTION_LIMIT = 5`. Replace that with per-step
rejection tracking:
  - maintain an array, one entry per step attempted, holding that step's rejection count
  - `=`-notation misses are excluded from all counts (consistent with existing rejectEqualsNotationMiss)
  - total rejections = sum, used for the Solid/Shaky bands
  - per-step ceiling check: any entry > 3 -> Fail
  - 2-in-3 window check: any 3 consecutive entries summing to >= 2 -> Fail

Rewrite recordUnitTestQuestionResult() to compute the band from this per-step structure, and update
wherever rejections are recorded so they increment the current step's entry. Keep the existing
result shape ({ level, points, rating, rejections, problemId }) but `rejections` is now the total.

Do NOT change the comma shortcut, the validation calls, or any UI flow. After: a question reached
with one isolated rejection scores Solid(2); two isolated rejections Shaky(1); four rejections on
one step Fail(0); rejections on steps 1 and 3 (a 2-in-3 window) Fail(0).
```

**Note:** decide whether `UNIT_TEST_REJECTION_LIMIT` (the hard "give up and advance" cap) stays as a separate UX limit or is removed. Recommend keeping it as a generous session cap (e.g. 5) *in addition to* the rubric — it's the "stop torturing the student" backstop, not the scoring rule. Flag this in the prompt if you want it preserved.

---

## PROMPT D — Add "accept any root" validator path + per-seed flag  `[after A & B]`

```
Add support for "one root suffices" Solve problems (PAA asks "¿cuál es una solución?" — any single
valid root is correct), per-seed.

Seed model: add an optional boolean field `acceptAnyRoot` to a problem/seed. When true, the seed
must also carry the original equation it was derived from, in a field `sourceEquation` (e.g.
"x^2-7x+12=0"). The answer-form template should render a SINGLE slot (`x = N`) for these seeds
rather than the two-slot `x = N, x = N`.

In math-validation.js, add a new validator path used ONLY when acceptAnyRoot is set. The existing
substitution branch in equationEquivalence only fires when the EXPECTED side is "var = value" and
substitutes expected->student; the one-root case is the reverse: the STUDENT gives "x = N" and we
must verify N satisfies the original equation. Implement:

  function satisfiesEquation(studentStep, sourceEquation):
    - parse studentStep "x = N" -> varName, value (reuse existing '=' parsing)
    - build expr = normalize(LHS) - normalize(RHS) from sourceEquation (reuse equationToExpr)
    - result = Algebrite.run(`simplify(subst(${value}, ${varName}, ${expr}))`)
    - return isAlgebriteZero(result)
    - run under the Prompt-A clearall guarantee; subst binds the symbol otherwise

Wire it so that when a Solve seed has acceptAnyRoot:true, checkIsFinal routes to satisfiesEquation
against sourceEquation instead of comparing to a fixed answer string. A student answering EITHER
valid root passes; a non-root fails. Confirmed math: subst(3,x,x^2-7x+12)=0, subst(4,..)=0,
subst(5,..)=2.

Do NOT change behavior for seeds without acceptAnyRoot. Two-root "full set required" seeds keep
using the existing comma-matching against "x=3, x=4".
```

---

## PROMPT C — Bare-input guard / nudge (`math-validation.js` + `app.html`)  `[lowest priority — UI mostly handles it]`

Optional. Since the `ans` template encourages `x = N` form, bare-number input is the uncommon path. Prompt A already prevents bare input from *poisoning* state. This prompt only improves the *message* when a student types a bare number against an equation-form answer (return/show "put your answer in the form x = …" rather than a plain wrong). Draft only if real-student testing shows natural typers hitting it. **Hold for now.**

---

## Run order & verification
1. **A** → verify symbol table stays clean across repeated/mixed validations (the determinism test).
2. **B** → verify the four band cases (Solid=1, Shaky=2–3, ceiling>3→Fail, 2-in-3→Fail).
3. **D** → verify either root passes a single-slot seed; non-root fails; full-set seeds unaffected.
4. **C** → hold.

A, B, D are all independent in code surface (A/D in `math-validation.js` but non-overlapping functions; B in `app.html`). Safe to do sequentially with a verify between each. Per the "minimal targeted prompts" rule, each changes only its named behavior; anything beyond that scope is a rollback.
```
