'use strict';

/**
 * Frame registry + student→frame resolution.
 *
 * A curriculum is a property of the ACCOUNT, not of the URL. There is no
 * curriculum picker and no ?curriculum= filter for a signed-in student: the
 * student record says which frame and band they are on, and the app renders
 * that. The URL param survives only for guest mode, where there is no account.
 *
 * Load order in a page:
 *   <script src="content/frames/meduca.js"></script>
 *   <script src="content/frames/camb.js"></script>
 *   <script src="content/frames/index.js"></script>
 */

const REGISTRY = (typeof window !== 'undefined' && window.Frames) ? window.Frames : {};

/**
 * Legacy student records carry { curriculum, grade } instead of { frame, band }.
 * Map the old vocabulary onto canonical coordinates.
 *
 * PAA is deliberately absent: the frame is retired and MEDUCA content does not
 * exist yet, so PAA students must keep falling through to the legacy renderer.
 * Returning null here is what makes that happen.
 */
const LEGACY_CURRICULUM_TO_FRAME = {
  cambridge: { frame: 'CAMB', bandPrefix: 's' },   // grade 7 → s7
  'ib-myp':  { frame: 'IB',   bandPrefix: 'myp' }, // grade 1 → myp1
  ccss:      { frame: 'CCSS', bandPrefix: 'g' },   // grade 6 → g6
  meduca:    { frame: 'MEDUCA', bandPrefix: 'g' }, // grade 7 → g7
};

function getFrame(id) {
  return REGISTRY[String(id || '').toUpperCase()] || null;
}

function getBand(frameId, bandId) {
  const f = getFrame(frameId);
  if (!f) return null;
  return (f.bands || []).find(b => b.id === bandId) || null;
}

/**
 * Resolve a student record to { frame, band, frameDef, bandDef } or null.
 * null means "this account has no canonical frame — use the legacy renderer".
 */
function resolveStudentFrame(student) {
  if (!student) return null;

  // Canonical fields win.
  if (student.frame && student.band) {
    const frameDef = getFrame(student.frame);
    const bandDef = getBand(student.frame, student.band);
    if (frameDef && bandDef) {
      return { frame: frameDef.id, band: bandDef.id, frameDef, bandDef };
    }
    return null;
  }

  // Legacy { curriculum, grade }.
  const map = LEGACY_CURRICULUM_TO_FRAME[String(student.curriculum || '').toLowerCase()];
  if (!map || !student.grade) return null;
  const bandId = map.bandPrefix + String(student.grade).trim();
  const frameDef = getFrame(map.frame);
  const bandDef = getBand(map.frame, bandId);
  if (!frameDef || !bandDef) return null;
  return { frame: frameDef.id, band: bandDef.id, frameDef, bandDef };
}

/**
 * Flatten a band into the ordered list of levels the home page renders.
 * Sequential progression: the first level is open, each next one unlocks when the
 * previous is complete. `gate: 'none'` marks a level as always open.
 *
 * `progress` is the student's progress map, keyed the way coordinates.js emits:
 *   progress['CAMB:s7:expr']['N1'] === 'complete' | 'concepts_done' | …
 */
function bandLevels(frameId, bandDef, progress, manifest) {
  const rows = [];
  let prevComplete = true; // first level is always reachable

  // Only show levels that actually have a lesson record. A level whose skills
  // have no seeds yet must not render a clickable pill that 404s.
  const published = manifest && manifest[`${frameId}/${bandDef.id}`];
  const isPublished = (u, l) => !published || published.indexOf(`${u}/${l}`) >= 0;

  for (const unit of bandDef.units || []) {
    const progKey = `${frameId}:${bandDef.id}:${unit.id}`;
    const unitProg = (progress || {})[progKey] || {};
    for (const level of unit.levels || []) {
      if (!isPublished(unit.id, level.id)) continue;
      const status = unitProg[level.id];
      const complete = status === 'complete';
      let state;
      if (complete) state = 'complete';
      else if (level.gate === 'none' || prevComplete) state = 'available';
      else state = 'locked';

      rows.push({ unit, level, state, coord: { frame: frameId, band: bandDef.id, unit: unit.id, level: level.id } });
      prevComplete = complete;
    }
  }
  return rows;
}

const _exports = { REGISTRY, LEGACY_CURRICULUM_TO_FRAME, getFrame, getBand, resolveStudentFrame, bandLevels };
if (typeof module !== 'undefined') module.exports = _exports;
if (typeof window !== 'undefined') window.FrameRegistry = _exports;
