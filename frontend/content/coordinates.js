'use strict';

/**
 * Coordinate resolver — D-STRUCT v3.0 §3.
 *
 * Canonical address:  frame / band / unit / level      e.g. CAMB/s7/expr/N1
 * Legacy address:     curriculum / unit / stage        e.g. PAA/algebra/1
 *
 * Both forms resolve here. Nothing else in the app should parse these params.
 *
 * ── Why legacy still resolves to legacy KV ──────────────────────────────────
 * D-STRUCT §3 maps old PAA links onto MEDUCA bands. That mapping is CORRECT but
 * not yet ACTIONABLE: no MEDUCA lesson records exist in KV. Redirecting a live
 * student link to MEDUCA/g7/expr/N3 today would 404 them.
 *
 * So legacy params keep resolving to legacy KV keys until the MEDUCA content
 * lands. The §3 mapping is encoded below as LEGACY_TO_CANONICAL and switched on
 * per-coordinate by `redirect: true` — flip a row the moment its MEDUCA lesson
 * exists, one at a time, verifiable in isolation. No big-bang cutover.
 */

/** D-STRUCT §3 legacy URL shim. FROZEN — no new rows are ever minted. */
const LEGACY_TO_CANONICAL = {
  'PAA/algebra/1': { frame: 'MEDUCA', band: 'g7',  unit: 'expr',  level: 'N3', redirect: false },
  'PAA/algebra/2': { frame: 'MEDUCA', band: 'g8',  unit: 'expr',  level: 'N1', redirect: false },
  'PAA/algebra/3': { frame: 'MEDUCA', band: 'g9',  unit: 'factor', level: 'N1', redirect: false },
  'PAA/algebra/4': { frame: 'MEDUCA', band: 'g9',  unit: 'lineq', level: 'N1', redirect: false },
  // g10 is PROVISIONAL — these two must not be flipped until §7.1 g10 is verified.
  'PAA/algebra/5': { frame: 'MEDUCA', band: 'g10', unit: 'lineq', level: 'N1', redirect: false },
  'PAA/algebra/6': { frame: 'MEDUCA', band: 'g10', unit: 'ineq',  level: 'N2', redirect: false },
};

const KNOWN_FRAMES = ['MEDUCA', 'CAMB', 'IB', 'CCSS'];

function isCanonicalFrame(v) {
  return KNOWN_FRAMES.indexOf(String(v || '').toUpperCase()) >= 0;
}

/** KV key + worker path for a canonical coordinate. */
function canonicalKey(c) { return `lesson:${c.frame}:${c.band}:${c.unit}:${c.level}`; }
function canonicalPath(c) {
  return `/lesson/${encodeURIComponent(c.frame)}/${encodeURIComponent(c.band)}` +
         `/${encodeURIComponent(c.unit)}/${encodeURIComponent(c.level)}`;
}

/** KV key + worker path for a legacy coordinate. Unchanged from the old scheme. */
function legacyKey(l) { return `lesson:${l.curriculum}:${l.unit}:level${l.stage}`; }
function legacyPath(l) {
  return `/lesson/${encodeURIComponent(l.curriculum)}/${encodeURIComponent(l.unit)}` +
         `/${encodeURIComponent(l.stage)}`;
}

/**
 * Resolve URL params into everything the app needs.
 *
 * Accepts either:
 *   ?frame=CAMB&band=s7&unit=expr&level=N1        (canonical)
 *   ?curriculum=PAA&unit=algebra&stage=1          (legacy)
 *
 * Returns null when neither form is present.
 *
 * `progress` is ALWAYS the legacy {unit, stage} shape — student progress records
 * are keyed on it and must not be rewritten by a routing change.
 */
function resolve(params) {
  const get = (k) => (params && typeof params.get === 'function' ? params.get(k) : (params || {})[k]) || '';

  const frame = get('frame');
  const band  = get('band');
  const rawUnit  = get('unit');
  const rawLevel = get('level');
  const stage = get('stage');
  const curriculum = get('curriculum');

  // ── Canonical form ────────────────────────────────────────────────────────
  if (frame && band && rawUnit && rawLevel && isCanonicalFrame(frame)) {
    const c = { frame: frame.toUpperCase(), band, unit: rawUnit, level: rawLevel };
    return {
      form: 'canonical', canonical: c, legacy: null,
      kvKey: canonicalKey(c), lessonPath: canonicalPath(c),
      progress: { unit: `${c.frame}:${c.band}:${c.unit}`, stage: c.level },
    };
  }

  // ── Legacy form ───────────────────────────────────────────────────────────
  const lStage = stage || rawLevel;
  if (curriculum && rawUnit && lStage) {
    const l = { curriculum, unit: rawUnit, stage: String(lStage) };
    const mapped = LEGACY_TO_CANONICAL[`${l.curriculum}/${l.unit}/${l.stage}`];

    if (mapped && mapped.redirect) {
      const c = { frame: mapped.frame, band: mapped.band, unit: mapped.unit, level: mapped.level };
      return {
        form: 'legacy-redirected', canonical: c, legacy: l,
        kvKey: canonicalKey(c), lessonPath: canonicalPath(c),
        // Progress stays on the legacy keys so existing records keep resolving.
        progress: { unit: l.unit, stage: l.stage },
      };
    }

    return {
      form: 'legacy', canonical: mapped ? { ...mapped } : null, legacy: l,
      kvKey: legacyKey(l), lessonPath: legacyPath(l),
      progress: { unit: l.unit, stage: l.stage },
    };
  }

  return null;
}

/** Build a lesson.html query string for a canonical coordinate. */
function toQuery(c, extra) {
  const q = new URLSearchParams();
  q.set('frame', c.frame); q.set('band', c.band);
  q.set('unit', c.unit);   q.set('level', c.level);
  Object.entries(extra || {}).forEach(([k, v]) => { if (v != null && v !== '') q.set(k, String(v)); });
  return q.toString();
}

const _exports = {
  LEGACY_TO_CANONICAL, KNOWN_FRAMES,
  resolve, toQuery, canonicalKey, canonicalPath, legacyKey, legacyPath, isCanonicalFrame,
};
if (typeof module !== 'undefined') module.exports = _exports;
if (typeof window !== 'undefined') window.Coordinates = _exports;
