# Push prompt — fix Cambridge Intro + practice (s7)

**The code is already written and tested on disk.** This is a commit-and-verify pass, not an implementation pass. Do not rewrite any of it.

Paste the fenced block into Claude Code, or run the commands yourself.

---

## Bug A — the Intro rendered nearly empty

`lesson.html`'s `coverIntroHtml()` gates the rule card on `intro.rule`, the goals list on `intro.goals`, and the hook on a derivable rule. `build-lessons.js` emitted only `ruleTitle` and `ruleChips` and no `hook`, so all three sections silently skipped and only "Tu recorrido" survived. The badge also printed the raw progress key — `CAMB · CAMB:S7:EXPR · NIVEL N1`.

Both files were individually correct; the **contract between them** was never checked. Fixed by emitting `rule`, `goals`, `problems` and an explicit `hook`, deriving the hook from the level's own answers rather than from `example.start` (which only exists on equation levels), and teaching `badgeHtml()` about canonical coordinates.

**This changes the lesson records, so KV must be rewritten — see Step 2b.**

---

## Bug B — Práctica came up empty

Four causes, each harmless alone:

1. `app.html` loaded only `seed-paa-algebra.js` — never the Cambridge bank.
2. `getLocalSeedProblems()` hardcoded `window.SeedPAA` and filtered on PAA-shaped `unitId`/`levelId` (`U1`/`N1`); Cambridge seeds carry `CAMB`/`s7`/`expr`/`N1`.
3. `app.html` never read canonical params.
4. **The decisive one:** `curriculumAppUrl()` in `lesson.html` built the app URL from the legacy variables, handing `app.html` `unit=CAMB:s7:expr` — the *progress key*, which is neither a valid canonical nor legacy unit. Fixing 1–3 alone would still have failed here.

No worker deploy. Frontend push **plus one KV rewrite** (Step 2b) because the lesson records themselves changed.

---

## Files in this change

| File | Change |
|---|---|
| `frontend/content/seed-registry.js` | **new** — merges all seed banks; resolves by id, canonical coord, or legacy coord |
| `frontend/app.html` | loads coordinates + both seed banks + registry; canonical branch tried before the untouched PAA path |
| `frontend/lesson.html` | `coordParams()` — emits whichever address form the page arrived on |
| `frontend/content/skill-graph.js` | IIFE-wrapped (was leaking `const skills`, `_exports` into global scope) |
| `frontend/content/seed-paa-algebra.js` | IIFE-wrapped + `lang: 'es'` |
| `frontend/content/seed-cambridge-s7.js` | IIFE-wrapped + `lang: 'en'` |
| `frontend/lang.js` | `home_no_published_levels` (es + en) |
| `scripts/check-globals.js` | **new** — fails the build on unwrapped scripts or duplicate top-level bindings |
| `scripts/test-practice-chain.js` | **new** — walks home → lesson → app → problems |
| `scripts/test-lesson-records.js` | **new** — asserts built records carry every field the Intro renders |
| `scripts/test-frames.js`, `scripts/assign-curriculum.js` | **new** — untracked until now |
| `scripts/gen-skill-graph.js` | emits IIFE-wrapped output so the wrap survives regeneration |
| `scripts/build-lessons.js`, `scripts/validate-structure.js` | manifest emission; skip `frames/index.js` when globbing frames |
| all three HTML files | cache busters unified to `20260727-dstruct3d` |

**The IIFE wraps are load-bearing here.** `app.html` now loads two seed banks in one global scope. Both declared `const seeds`, `const draws`, `const lang`, `const _seedExports`. Unwrapped, the second throws and PAA practice breaks instead of Cambridge being fixed.

---

## Step 1 — Pre-flight, all six must pass

```bash
cd ~/Desktop/nuvo-studio/math-practice
node scripts/check-globals.js        # "No global-scope collisions."
node scripts/validate-structure.js   # 105 skills, legacy 34/34, "Structure OK."
node scripts/validate-seeds.js       # {"PASS":78,"FAIL":0,...}
node scripts/test-coordinates.js     # "All coordinate cases pass."
node scripts/test-frames.js          # "All frame cases pass."
node scripts/test-practice-chain.js  # "Practice chain intact end to end."
node scripts/test-lesson-records.js  # "Every lesson record satisfies the render contract."
```

Stop on any failure. Do not push past a red check.

---

## Step 2 — Commit and push

```bash
git add frontend/content/seed-registry.js \
        frontend/content/skill-graph.js \
        frontend/content/seed-paa-algebra.js \
        frontend/content/seed-cambridge-s7.js \
        frontend/app.html frontend/lesson.html frontend/home.html frontend/lang.js \
        scripts/ docs/

git commit -m "Fix Cambridge Intro and practice: render contract and seed registry

app.html loaded only the PAA seed bank and resolved problems by PAA-shaped
unitId/levelId, so canonical Cambridge coordinates matched nothing. lesson.html
compounded it by handing app.html the progress key as 'unit'.

- seed-registry.js merges every bank; resolves by id, canonical or legacy coord
- app.html tries canonical first, falls through to the unchanged PAA path
- lesson.html emits whichever address form it arrived on
- IIFE-wrap skill-graph and both seed banks (app.html now loads two banks in
  one scope; they shared top-level const names)
- check-globals.js makes that class of failure a build error
- test-practice-chain.js covers home -> lesson -> app -> problems
- Intro: emit intro.rule/goals/problems/hook; derive the hook from the level's
  own answers, not example.start (absent on non-equation levels)
- badgeHtml: show frame/band labels, never the raw progress key
- test-lesson-records.js checks the build-lessons -> lesson.html render contract
- unify cache busters to 20260727-dstruct3d"

git push
```

Wait for GitHub Pages to publish (~1 min).

---

## Step 2b — Rewrite the s7 lesson records

Required this time: the records now carry `intro.rule`, `goals`, `problems` and `hook`. The old ones are why the Intro looked empty.

```bash
export TEACHER_SECRET='<the worker TEACHER_SECRET>'
node scripts/build-lessons.js CAMB s7 --push
```

Expect three `OK` lines. Then spot-check that the hook made it:

```bash
curl -s $W/lesson/CAMB/s7/lineq/N1 | python3 -m json.tool | grep -A6 '"hook"'
```

---

## Step 3 — Verify, in this order

**A. The Intro.** Sign in as `ron`, open `home.html` with no query string, click **Linear equations → Level 1**.

Expect: badge reads `Cambridge · Stage 7 · Level 1` (**not** `CAMB:S7:EXPR`); a purple "Try it first" card with a machine; tapping two numbers reveals guess chips; a correct guess reveals `6x + 4`. Below it, "The rule", "What you'll achieve" and "Your journey".

If the machine is missing, the KV records are stale — re-run Step 2b.

**B. Cambridge practice.** From that Intro, hit **Begin Lesson**.

Expect 6 English problems. "No problems found" means the frontend didn't take — check the console for a redeclaration error and confirm the loaded scripts carry `?v=20260727-dstruct3d`.

**C. PAA regression — the thing that must not break.**

```
https://nuvostudio.club/lesson.html?curriculum=PAA&unit=algebra&stage=1&guest=true
```

Must load and its practice must still serve **6 Spanish problems**. This is the check that matters most — `app.html` changed, and PAA students are live on it.

**D. Console must be clean.** Specifically no `Identifier 'seeds' has already been declared`. That error is silent in the UI and kills everything downstream — the failure mode from ab92d2d.

---

## Rollback

```bash
git revert HEAD && git push
```

Reverts the frontend. The Step 2b KV records are additive under existing keys — a
revert leaves the richer records in place, which is harmless: the old frontend
simply ignores the extra `intro` fields. The worker was not touched.

---

## Do NOT do in this pass

- Do not redeploy the worker. Unchanged in this commit; the 4-part route is already live.
- Do not unwrap any IIFE, and do not add a `<script src>` for a content file without re-running `check-globals.js`.
- Do not edit `lesson-manifest.json` by hand.
- Do not touch `subTopicEnum` in `seed-paa-algebra.js`.

---

## Known-open after this lands

- **`CAMB/s7/seq/N1` stays hidden** — `alg.seq.term-to-term` is MCQ-track and the MCQ engine doesn't exist. The manifest correctly omits it.
- **s8 is unseeded** — 3 buildable levels (expr/N1, expr/N2, lineq/N1), 18 seeds. Next content pass.
- **`inequality` and `scientific` ops still have no validator** — 8 existing seeds have never been machine-checked. Blocks s9 `ineq/N1`.
- **`home.html` has no guest entry for Cambridge** — reachable only by signed-in account or a typed canonical URL.
