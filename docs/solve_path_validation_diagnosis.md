# Solve-path validation — diagnosis & fix plan (VERIFIED against Algebrite)

**Context:** Confirming the step engine validates (a) a two-root quadratic and (b) a 2×2 system before authoring U3/U4 seeds. Findings below are **executed against real Algebrite 1.4.0**, not inferred. Engine: `math-validation.js` (`checkEquivalence` / `checkIsFinal`); driver: `app.html` (`submitStep`, comma shortcut).

---

## How completion works (confirmed)

- `checkIsFinal(student, answer, type)` simply delegates to `checkEquivalence(student, answer, type)`.
- `checkEquivalence` has a **comma branch**: if either side splits on commas into >1 part, it matches parts **order-independently** (greedy pairwise, `usedB` set) and requires equal part counts. This is genuinely correct for multi-value answers — order independence works.
- Single parts route to: inequality path (Solve + relational), equation path (both sides contain `=`), or raw `simplify((A)-(B))`.
- `app.html` adds a **comma shortcut**: comma in input → skip step-equivalence, go straight to `checkIsFinal`, and on success skip the form check too.

---

## VERIFIED TEST RESULTS

Two-root quadratic, expected answer `x=3, x=4`:

| Input | Result | Correct? |
|-------|--------|----------|
| `x=3, x=4` | valid:true | ✅ |
| `x=4, x=3` (order) | true *in isolation*, **false after any prior Solve call** | ⚠️ state-dependent |
| `3, 4` (bare) | valid:false | ❌ should pass |
| `4, 3` (bare, order) | valid:false | ❌ should pass |
| one root `3` or `x=3` | valid:false | ➖ correct *if* full set required; **no per-seed "one root OK" flag exists** |
| wrong `3, 5` | valid:false | ✅ |

2×2 system, expected `x=4, y=3`:

| Input | Result | Correct? |
|-------|--------|----------|
| `x=4, y=3` | valid:true | ✅ |
| `y=3, x=4` (order) | valid:true | ✅ |
| `4, 3` (bare) | valid:false | ❌ (arguably should pass; see Bug 2) |
| partial `x=4` | valid:false | ➖ no partial-solution state |
| wrong `x=3, y=4` | valid:false | ✅ |

The order-independence machinery is sound. The failures cluster around **two real bugs plus one missing feature**, and one of the bugs is severe.

---

## BUG 1 — Global symbol-table poisoning (SEVERE, session-wide)

**Verified:** after certain Solve validations, `Algebrite.run('x')` returns `4` (or `3`) instead of `x`. The symbol stays bound for the rest of the session, so `simplify(x-4)` returns `0` and every later validation is silently contaminated. **This is why the same input gives different answers depending on what ran before it.**

**Exact trigger:** comparing a **bare number against an equation**, e.g. student types `3` (or `3, 4`) and a target part is `x=3`. The bare side has no `=`, so neither the equation nor inequality branch fires; it falls through to raw `simplify((3)-(x=3))`. **Algebrite reads `x=3` as an assignment**, binds `x:=3` globally, and returns garbage (`-nil+3`). 

Confirmed: `simplify((3)-(x=3))` → `-nil+3`, and afterwards `x` → `3`.

**Consequences:**
- Bare-number two-root answers (`3, 4`) fail — and *also poison the session*.
- The `x=4, x=3` order case flips between true/false depending on whether a poisoning call ran earlier. Non-deterministic grading.
- Any seed where a student submits a bare numeric step gets validated against a polluted table for the rest of that session.

**Fix:**
1. **Reset Algebrite symbol state between validations.** Call `Algebrite.run('clearall')` (verified to restore `x`→`x`) at the **start of every `checkEquivalence` top-level call** — or more surgically, after any `subst`/equation evaluation. `clearall` is confirmed to clear the binding.
2. **Never let a bare-vs-equation comparison reach raw `simplify`.** In the comma/part matcher and single-part router: if exactly one side contains `=` and the other is a bare value, normalize the bare side to `var = value` before comparing (or extract both sides' value and compare numerically). A bare `3` matched against `x=3` should mean "x = 3."
3. Guard `simplify` inputs so a raw `=` can never be passed to Algebrite as an assignment.

This is the priority fix — it's not a U3/U4-specific edge case, it corrupts grading globally.

---

## BUG 2 — Bare-number answers don't match equation-form expected answers

Even with poisoning fixed, `3, 4` won't match `x=3, x=4` because `3 ~ x=3` is structurally a bare-vs-equation compare that the router doesn't handle (it currently falls to the raw-simplify path that Bug 1 fixes by guarding).

**Decision needed:** should `3, 4` be an accepted form for a two-root answer, or do we require `x=3, x=4`? PAA answers are often bare (the suplir-respuesta grid is numeric). Recommended: **accept bare-number forms** by canonicalizing both sides — if expected is `x=3` and student gives `3`, compare the values. Make the expected-answer author-side canonical (store roots as a value set) so the matcher compares values, not surface forms.

---

## BUG 3 — Band scoring out of sync with locked rubric (CONFIRMED, `app.html` line ~1623)

`recordUnitTestQuestionResult()`:
```
reached & 0 rejections    → Mastery (3)
reached & rejections <= 2 → Solid   (2)   ← WRONG: rubric says Solid = exactly 1
reached & else (3,4..)    → Shaky   (1)   ← WRONG: rubric says Shaky = 2–3 only
not reached               → Fail    (0)
```
**Locked rubric:** Mastery 0 rej · Solid **1** · Shaky **2–3** · Fail = not reached **OR >3 on one step (per-step ceiling) OR 2-in-3 window**.

Missing entirely: per-step ceiling and 2-in-3 window. Code tracks a single flat `unitTestRejections` vs `UNIT_TEST_REJECTION_LIMIT = 5` — not per-step, not windowed. Fix in the same pass; the bands are the gate.

---

## Acceptance criteria (re-verified targets)

Two-root (U3):
- [ ] `3, 4` / `4, 3` accepted (bare, order-independent) — needs Bug 1 + Bug 2
- [ ] `x=3, x=4` / `x=4, x=3` accepted deterministically (Bug 1)
- [ ] per-seed flag: "any one root suffices" vs "full set required"
- [ ] partial-root state (later)

2×2 system (U4):
- [ ] `x=4, y=3` / `y=3, x=4` accepted (already ✅)
- [ ] decide bare `4, 3` acceptance (Bug 2 decision)
- [ ] decide whether worked solve is gated or only final answer accepted (design)
- [ ] partial (one var) state (later)

Band scoring (blocking, both):
- [ ] Solid = exactly 1; Shaky = 2–3; per-step >3 → Fail; 2-in-3 → Fail
- [ ] per-step + windowed rejection tracking, not a flat counter

---

## Severity order for the fix pass
1. **Bug 1 (symbol poisoning)** — corrupts grading session-wide, non-deterministic. Fix first.
2. **Bug 3 (band rubric)** — the gate is wrong; independent, mechanical.
3. **Bug 2 (bare-number matching)** — needed for clean PAA-style answers; partly resolved by Bug 1's guard.
4. Per-seed "one root" flag + partial-solution states — design, can follow.

---

## ADDENDUM — verified after UI screenshot + "one root, single slot" decision

**UI context:** the `ans` tab provides structured answer-form buttons (`x =`, `y =`, `,`) and templates `x = N, x = N` (two-root) and `x = N, y = N` (system). The equation form is the *encouraged* input path.

**Verified — template equation-form is clean and correct:**
- `x=3, x=4`, `x=4, x=3`, `x=4, y=3`, `y=3, x=4` all → valid:true, order-independent.
- Template runs leave `x` and `y` **unbound** (`x=x, y=y`) — no poisoning when the student uses the buttons.

**Verified — the natural-typing trap still bites:** a bare `3, 4` returns false AND leaves `x=4` bound, so the *next* problem's `x=4, x=3` (which should pass) returns false. Confirms Bug 1 must be fixed at the engine level even though the UI discourages bare input. The structured UI makes the bug *intermittent and input-path-dependent* — passes template testing, breaks for natural typers.

**Decisions locked:**
- Bare-number answers are **not** first-class; the `x = N` template form is canonical. Bare input is guarded (must not poison) but may return "not in expected form."
- **One root suffices = per-seed flag → single-slot template (`x = N`) + accept any one valid root.**

**NEW finding — "one root suffices" needs a validator path, not just a flag:**
- Storing a single canonical root (`x=3`): a student answering the *other* valid root (`x=4`) is wrongly marked false. ❌
- Substituting student `x=N` into the original equation is the correct model. Manual subst confirmed: `subst(3,x,x²−7x+12)=0`, `subst(4,...)=0`, `subst(5,...)=2`. ✅
- BUT the engine's existing substitution branch only fires when the **expected** side is `x=value` (it substitutes expected→student). The "one root" case is the reverse orientation (student `x=value` → substitute into the original equation). **No engine path exists for this today.**

**Fix for one-root (new Prompt D):** add a Solve validator path — when the seed is flagged `acceptAnyRoot: true` and carries the original equation, parse student `x=N`, `subst(N, x, originalLHS−originalRHS)`, accept if Algebrite-zero. Reuse the existing `subst`+`isAlgebriteZero` machinery; just add the reverse orientation. Must run under the Bug 1 clearall guard (subst binds the symbol otherwise).

**Revised fix order:** Bug 1 (poisoning) → Bug 3 (band rubric) → Prompt D (one-root validator + flag) → Bug 2/Prompt C (bare-input guard, now lower priority since UI handles the common path).
