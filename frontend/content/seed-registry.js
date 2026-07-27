(function () {
'use strict';

/**
 * Seed registry — one lookup across every seed bank.
 *
 * The practice engine used to reach straight into `window.SeedPAA` and filter on
 * PAA-shaped `unitId`/`levelId` ('U1'/'N1'). Cambridge seeds carry canonical
 * coordinates ('CAMB'/'s7'/'expr'/'N1'), so that lookup found nothing and the
 * lesson rendered with zero problems.
 *
 * This merges all banks and resolves three ways:
 *   byId('camb-s7-lineq-n1-01')        — what a lesson record's practiceProblems lists
 *   forCoord({frame,band,unit,level})  — canonical
 *   forLegacy('U1','N1')               — the old PAA shape, unchanged
 *
 * Load AFTER the seed banks:
 *   <script src="content/seed-paa-algebra.js"></script>
 *   <script src="content/seed-cambridge-s7.js"></script>
 *   <script src="content/seed-registry.js"></script>
 */

const OP_TO_TYPE = {
  simplify: 'Simplify', expand: 'Expand', factor: 'Factorize',
  solve: 'Solve', evaluate: 'Evaluate', translate: 'Translate',
  inequality: 'Solve', scientific: 'Simplify',
};

/** Collect every bank exposed on window (SeedPAA, SeedCambridgeS7, …). */
function banks() {
  const out = [];
  if (typeof window === 'undefined') return out;
  for (const k of Object.keys(window)) {
    if (!/^Seed[A-Z]/.test(k)) continue;
    const b = window[k];
    if (b && b.seeds && typeof b.seeds === 'object') out.push({ name: k, lang: b.lang || 'es', bank: b });
  }
  return out;
}

/** id -> { ...seed, id, lang, bankName } across all banks. */
function index() {
  const all = {};
  for (const { name, lang, bank } of banks()) {
    for (const [id, s] of Object.entries(bank.seeds)) {
      all[id] = Object.assign({}, s, { id, lang: s.lang || lang, bankName: name });
    }
  }
  return all;
}

/** Convert a seed into the shape the practice engine expects. */
function toProblem(s) {
  if (!s) return null;
  const p = {
    id: s.id,
    question: s.prompt,
    prompt: s.prompt,
    answer: s.answer,
    type: OP_TO_TYPE[s.op] || 'Simplify',
    op: s.op,
    subTopics: s.subTopics || (s.legacySubTopic ? [s.legacySubTopic] : []),
    skills: s.skills || [],
    unitId: s.unitId,
    levelId: s.levelId,
    hints: s.hints || [],
  };
  if (s.acceptAnyRoot) p.acceptAnyRoot = true;
  const src = s.sourceExpression || s.sourceEquation;
  if (src) p.sourceExpression = src;
  if (s.expression != null && String(s.expression).trim() !== '') {
    p.expression = String(s.expression).trim();
  }
  if (s.substVar && s.substValue != null) {
    p.substVar = String(s.substVar).trim();
    p.substValue = String(s.substValue).trim();
  }
  return p;
}

function byId(id) { return toProblem(index()[id]); }

/** Resolve an ordered list of ids (a lesson record's practiceProblems). */
function byIds(ids) {
  const all = index();
  return (ids || []).map(id => toProblem(all[id])).filter(Boolean);
}

/** All seeds at a canonical coordinate. */
function forCoord(coord) {
  if (!coord) return [];
  return Object.values(index())
    .filter(s => s.frameId === coord.frame && s.bandId === coord.band &&
                 s.unitId === coord.unit && s.levelId === coord.level)
    .map(toProblem);
}

/** All seeds at a legacy PAA coordinate. Unchanged behaviour for live students. */
function forLegacy(unitId, levelId) {
  return Object.values(index())
    .filter(s => !s.frameId && s.unitId === unitId && s.levelId === levelId)
    .map(toProblem);
}

const _exports = { OP_TO_TYPE, banks, index, toProblem, byId, byIds, forCoord, forLegacy };
if (typeof module !== 'undefined') module.exports = _exports;
if (typeof window !== 'undefined') window.SeedRegistry = _exports;
})();
