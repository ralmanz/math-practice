# Audit fixes status (Part 3)

Snapshot aligned with `nuvo_decisions_audit_fixes.md` and repo state. Update when new fixes land.

| Decision | Fix | Status |
|----------|-----|--------|
| Symbol-table integrity (C2) | FIX-A | ✅ `checkEquivalence` + `clearall`; asymmetric `=` guard |
| Band rubric (B5/B6) | FIX-B | ✅ Per-step array + hard-fail + `ASSESSMENT_REJECTION_LIMIT` |
| Final-check `=` routing (C4) | FIX-ISFINAL | ✅ `equivInput` + `checkFinalAnswer()` |
| Accept-any-root | FIX-D | ✅ `satisfiesEquation`, seeds, keypad `any-root` |
| `op` in arch doc (A3) | D-OP | ✅ Canonical schema + routing contract |
| Structure conflict (D3) | D-STRUCT | ✅ Option (a) — `curriculum_structure_authority.md` |
| Orphan topic re-home | D-STRUCT-2 | ✅ U3–U5 slots + re-home table in authority doc; arch §0 + brain §7 |
| Brain doc re-cut (D1) | D-BRAIN | ✅ U1–U5 section in `curriculum_brain.md` §7; legacy niveles deprecated |
| Seed re-author (D2) | D-SEEDS | 🟡 U1/U2 bank matches structure (36 seeds); U3+ authoring — see `d_seeds_authoring.md` |
| Sci-notation form-check | FIX-SCINOT | ⏸ No `op` in U1–U2; defer until level assigns graded sci-notation |
| Abs-value ≥ union | FIX-ABSGE | ✅ `checkInequality` union + comma branches |
| `=` toggle UX (C4) | B-TOGGLE | 📐 Design brief only — `design-equals-toggle.md` |
| Wire app to `validateAgainstSeed` | FIX-WIRE-APP | ✅ (not in original table) |
| Placement ace (B2) | B2 partial | ✅ Gate + `?mode=placement`; full B1 flow open |
| Bare-number nudge | Prompt C | ⏸ Held per audit |
