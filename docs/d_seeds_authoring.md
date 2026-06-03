# D-SEEDS — Authoring checklist (content)

**Owner:** Ronel. **Engine:** ready for all current `op` values.

## Already aligned (no re-author required for structure)

- `frontend/content/seed-paa-algebra.js`: **36 seeds** U1 + U2, each with `unitId`, `levelId`, `op`, `subTopics` ∈ `subTopicEnum`, `draws` for test/final.
- Authority matrix: `docs/curriculum_structure_authority.md`.

## Per new seed

1. Pick `(unitId, levelId)` from brain §7 U1–U5 table.
2. Set `op` from allowed list for that level.
3. Choose 1–3 `subTopics` from `subTopicEnum[unitId][levelId]`.
4. Validate `answer` with Algebrite (worker audit or manual).
5. For “una solución” quadratics: `acceptAnyRoot: true` + `sourceExpression`.
6. For `\|inner\| ≥ k` (or `>`): store canonical **`answer` as `abs(inner) >= k`** (or `>`). Do **not** pre-split into a comma union on the seed — the comparator expands to two branches. Students may answer with a comma union (`x<=a,x>=b`) or spaced **`or` / `o`** (`x <= a or x >= b`); keypad **`union`** mode for these seeds. Requires FIX-ABSGE ✅.
7. Ronel sign-off against `curriculum_brain.md` vocab/errors for that level.
8. Run `node worker/seed-paa-algebra.js` after edits; map stage in `CURRICULUM_SEED_MAP` / home UI when adding U2+ to product surface.

## Backlog (D-STRUCT-2 topic slots)

| Unit | Seeds | Topics per level (authority doc) |
|------|-------|----------------------------------|
| U2-N1 | 6 existentes | + proporciones/razón (`proportion` subTopic TBD) |
| U3 | 0 (+1 ref `u3-n1-01`) | N1 quad+residuo · N2 racional+variación inversa · N3 exponentes+sci-notation |
| U4 | 0 | 2×2 solve, comma answers |
| U5 | 0 | MCQ + SVG; N2 sucesiones/patrones |
