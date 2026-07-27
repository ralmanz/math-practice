#!/usr/bin/env node
'use strict';
/**
 * Generates frontend/content/skill-graph.js from docs/curriculum_structure_authority.md §5.
 * The doc is the source of truth; this keeps code from drifting away from it.
 * Re-run after any §5 edit:  node scripts/gen-skill-graph.js
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const doc = fs.readFileSync(path.join(ROOT, 'docs/curriculum_structure_authority.md'), 'utf8');

const TRACKS = new Set(['S', 'S★', 'M', 'O']);
const skills = [];
let strand = null;

for (const line of doc.split('\n')) {
  const h = line.match(/^### 5\.\d+ — `([a-z.]+)`/);
  if (h) { strand = h[1]; continue; }
  const c = line.split('|').map(s => s.trim());
  if (c.length !== 9) continue;
  const m = c[1].match(/^`([a-z][a-z0-9.\-]+)`$/);
  if (!m || !TRACKS.has(c[5])) continue;
  skills.push({
    id: m[1], strand,
    es: c[2], en: c[3],
    op: c[4] === '—' ? null : c[4],
    track: c[5] === 'S★' ? 'S*' : c[5],
    prereqs: (c[6].match(/`[a-z][a-z0-9.\-]+`/g) || []).map(s => s.replace(/`/g, '')),
    legacySubTopic: c[7] === '—' ? null : c[7].replace(/`/g, ''),
  });
}

if (!skills.length) { console.error('No skills parsed — did §5 change shape?'); process.exit(1); }

const ids = new Set(skills.map(s => s.id));
const bad = [];
for (const s of skills) {
  if (!s.es || !s.en) bad.push(`${s.id}: missing label`);
  s.prereqs.forEach(p => { if (!ids.has(p)) bad.push(`${s.id}: dangling prereq ${p}`); });
}
if (bad.length) { console.error('INVALID:\n' + bad.join('\n')); process.exit(1); }

const body = skills.map(s =>
  `  ${JSON.stringify(s.id)}: { strand: ${JSON.stringify(s.strand)}, ` +
  `es: ${JSON.stringify(s.es)}, en: ${JSON.stringify(s.en)}, ` +
  `op: ${JSON.stringify(s.op)}, track: ${JSON.stringify(s.track)}, ` +
  `prereqs: ${JSON.stringify(s.prereqs)}, legacySubTopic: ${JSON.stringify(s.legacySubTopic)} },`
).join('\n');

const counts = skills.reduce((a, s) => (a[s.track] = (a[s.track] || 0) + 1, a), {});

const out = `(function () {
'use strict';

/**
 * LAYER A — the curriculum-agnostic skill graph.
 *
 * GENERATED FILE — do not edit by hand.
 * Source of truth: docs/curriculum_structure_authority.md §5
 * Regenerate:      node scripts/gen-skill-graph.js
 *
 * ${skills.length} skills · track split ${Object.entries(counts).map(([k, v]) => k + ':' + v).join(' ')}
 *   S  = existing op, the step engine grades it today
 *   S* = step-gradable in principle, needs a new op or validator first
 *   M  = MCQ track, engine not built
 *   O  = out of Nuvo delivery
 *
 * Frames (Layer B) may only REFERENCE these ids. Adding a skill is a Layer A
 * change and belongs in the doc first.
 */

const skills = {
${body}
};

/** legacySubTopic -> skill id. Lets the pre-migration engine resolve new content. */
const legacyToSkill = Object.freeze(Object.fromEntries(
  Object.entries(skills).filter(([, s]) => s.legacySubTopic).map(([id, s]) => [s.legacySubTopic, id])
));

/** skill id -> legacySubTopic (null when the skill has no seeded history). */
const skillToLegacy = Object.freeze(Object.fromEntries(
  Object.entries(skills).map(([id, s]) => [id, s.legacySubTopic])
));

function getSkill(id) { return skills[id] || null; }

function label(id, lang) {
  const s = skills[id];
  if (!s) return id;
  return (lang === 'es' ? s.es : s.en) || s.en || s.es;
}

/** All transitive prerequisites of a skill, nearest first. */
function prereqClosure(id, seen) {
  seen = seen || new Set();
  const s = skills[id];
  if (!s) return [];
  for (const p of s.prereqs) {
    if (seen.has(p)) continue;
    seen.add(p);
    prereqClosure(p, seen);
  }
  return [...seen];
}

/** True when every prerequisite of \`id\` is present in \`mastered\`. */
function isUnlocked(id, mastered) {
  const s = skills[id];
  if (!s) return false;
  const held = mastered instanceof Set ? mastered : new Set(mastered || []);
  return s.prereqs.every(p => held.has(p));
}

/** Skills the student is ready for but has not yet mastered. */
function nextAvailable(mastered) {
  const held = mastered instanceof Set ? mastered : new Set(mastered || []);
  return Object.keys(skills).filter(id => !held.has(id) && isUnlocked(id, held));
}

const _exports = {
  skills, legacyToSkill, skillToLegacy,
  getSkill, label, prereqClosure, isUnlocked, nextAvailable,
};
if (typeof module !== 'undefined') module.exports = _exports;
if (typeof window !== 'undefined') window.SkillGraph = _exports;
})();
`;

fs.writeFileSync(path.join(ROOT, 'frontend/content/skill-graph.js'), out);
console.log(`skill-graph.js written — ${skills.length} skills, tracks ${JSON.stringify(counts)}`);
