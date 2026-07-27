# Deploy prompt — D-STRUCT v3.0 step 4

Everything below is **already written and tested** in the repo. This document covers only the two things that need credentials I don't have: deploying the worker, and writing the Cambridge lesson records to KV.

Paste the fenced block into Claude Code, or just run the commands yourself — they're short.

---

## What already landed (do not re-implement)

| File | What it does |
|---|---|
| `frontend/content/skill-graph.js` | 105 skills. **Generated** — edit the doc, then `node scripts/gen-skill-graph.js` |
| `frontend/content/frames/meduca.js`, `camb.js` | Layer B frames with per-band `status` |
| `frontend/content/coordinates.js` | Resolves both address forms; owns the legacy shim |
| `frontend/content/seed-cambridge-s7.js` | 18 English Stage 7 seeds, Algebrite-verified |
| `worker/src/index.js` | **New** 4-part lesson route, added *above* the 3-part route |
| `frontend/lesson.html` | Uses the resolver; Conceptos removed; interactive Intro hook |
| `frontend/lesson-phase-nav.js` | Phase 2 dropped from the nav |
| `frontend/lang.js` | `hook_*` keys, es + en |
| `scripts/` | `gen-skill-graph`, `build-lessons`, `validate-structure`, `validate-seeds`, `test-coordinates` |

**Nothing student-facing changes until the worker is deployed.** The 3-part legacy route is untouched, and every legacy row in `LEGACY_TO_CANONICAL` ships with `redirect: false`, so existing PAA links keep resolving to existing KV keys.

---

## Pre-flight — all four must pass

```bash
cd ~/Desktop/nuvo-studio/math-practice
node scripts/validate-structure.js    # expect: 105 skills, legacy 34/34, "Structure OK."
node scripts/validate-seeds.js        # expect: {"PASS":78,"FAIL":0,...}
node scripts/test-coordinates.js      # expect: "All coordinate cases pass."
node scripts/build-lessons.js CAMB s7 # expect: 3 lesson records, 6 problems each
```

Stop if any of these fail. Do not deploy past a red check.

---

## Step 1 — Deploy the worker

```bash
cd ~/Desktop/nuvo-studio/math-practice/worker
npx wrangler deploy
```

> ⚠ **Villa Coco shares this Cloudflare account.** Confirm `wrangler.toml` names the Nuvo worker and the `STUDENTS` KV namespace before deploying. Deploy from `worker/` only — never from the account root.

Verify the new route exists and the old one still works:

```bash
W=https://math-practice-proxy.ronelalmanza20.workers.dev
curl -s -o /dev/null -w "legacy  %{http_code}\n" $W/lesson/PAA/algebra/1        # want 200
curl -s -o /dev/null -w "canon   %{http_code}\n" $W/lesson/CAMB/s7/expr/N1      # want 404 (not written yet)
```

A 404 on the canonical route is the **correct** result here — it proves the route matched and the key is simply empty. A 500 means the route is broken; roll back.

---

## Step 2 — Write the Cambridge Stage 7 lesson records

Uses the authenticated `POST /lesson/...` endpoint, **not** wrangler — so it cannot touch any other project on the account.

```bash
cd ~/Desktop/nuvo-studio/math-practice
export TEACHER_SECRET='<the worker TEACHER_SECRET>'
node scripts/build-lessons.js CAMB s7 --push
```

Expect three `OK` lines:

```
OK   lesson:CAMB:s7:expr:N1
OK   lesson:CAMB:s7:expr:N2
OK   lesson:CAMB:s7:lineq:N1
```

Then confirm:

```bash
curl -s $W/lesson/CAMB/s7/lineq/N1 | head -c 300     # want the JSON, not an error
```

---

## Step 3 — Look at it

```
https://nuvostudio.club/lesson.html?frame=CAMB&band=s7&unit=lineq&level=N1&guest=true
```

Check, in this order:

1. Phase nav shows **two** steps (Intro → Práctica), not three. No "Conceptos".
2. The Intro opens with the machine hook. Tap two numbers → the guess chips appear → a correct guess reveals the rule.
3. "Begin Lesson" goes straight to practice.
4. Problems are **English** — if any Spanish text appears, stop and report it; the language filter has a hole.

Then regression-check a live student path:

```
https://nuvostudio.club/lesson.html?curriculum=PAA&unit=algebra&stage=1&guest=true
```

This must still load exactly as before. It is the single most important check in this document.

---

## Rollback

`git revert` the commit and `npx wrangler deploy` from `worker/`. The KV records written in step 2 are additive under new keys — they harm nothing if left, and the frontend never requests them unless a canonical URL is used.

---

## Do NOT do in this pass

- Do not change `home.html` link builders. The front door stays on legacy URLs until Cambridge content is proven.
- Do not flip any `redirect: true` in `coordinates.js`. Those rows point at MEDUCA lessons that **do not exist yet**; flipping one 404s live students. Flip one row only after that specific MEDUCA lesson is in KV and verified.
- Do not build any PROVISIONAL band — `build-lessons.js` refuses, by design. Don't work around it.
- Do not delete the stale PAA KV records yet. They still serve live links.
- Do not touch `subTopicEnum` in `seed-paa-algebra.js`. Those 34 strings are in student progress records.

---

## Known-open, deliberately not fixed here

- **`home.html` has no Cambridge entry point.** Stage 7 is reachable only by typing the canonical URL. The grade/curriculum picker is migration step 5.
- **`alg.seq.term-to-term` has no seeds**, so `CAMB/s7/seq/N1` builds nothing — the builder skips it and says so.
- **`inequality` and `scientific` ops have no validator.** 8 existing seeds have never been machine-checked in either direction.
- **The Spanish seed bank duplicates the English one** for shared skills (`4x + 3x` exists twice). Per the seed-language decision. Merging later is mechanical but grows with each stage authored.
