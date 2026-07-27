#!/usr/bin/env node
'use strict';
/**
 * Structural validator for Layer A (skill graph) and Layer B (frames).
 * Exit 1 on any violation, so this can gate a deploy.
 *   node scripts/validate-structure.js
 */
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const G = require(path.join(ROOT, 'frontend/content/skill-graph.js'));

const errors = [], warnings = [];
const ids = new Set(Object.keys(G.skills));

// ── Layer A ──────────────────────────────────────────────────────────────────
for (const [id, s] of Object.entries(G.skills)) {
  if (!s.es || !s.en) errors.push(`skill ${id}: missing es/en label`);
  if (!['S', 'S*', 'M', 'O'].includes(s.track)) errors.push(`skill ${id}: bad track "${s.track}"`);
  s.prereqs.forEach(p => { if (!ids.has(p)) errors.push(`skill ${id}: dangling prereq ${p}`); });
}

// acyclic
const state = {};
(function checkCycles() {
  const walk = (n, stack) => {
    if (state[n] === 1) { errors.push(`cycle: ${[...stack, n].join(' -> ')}`); return; }
    if (state[n] === 2) return;
    state[n] = 1;
    (G.skills[n] ? G.skills[n].prereqs : []).forEach(p => walk(p, [...stack, n]));
    state[n] = 2;
  };
  ids.forEach(n => walk(n, []));
})();

// legacy mapping is bijective against the live seed enum
const { subTopicEnum } = require(path.join(ROOT, 'frontend/content/seed-paa-algebra.js'));
const enumVals = new Set();
for (const u of Object.values(subTopicEnum)) for (const l of Object.values(u)) l.forEach(v => enumVals.add(v));
for (const v of enumVals) if (!G.legacyToSkill[v]) errors.push(`subTopic "${v}" has no skill — seeds would orphan`);
for (const v of Object.keys(G.legacyToSkill)) if (!enumVals.has(v)) errors.push(`legacySubTopic "${v}" is not a real subTopic`);

// ── Layer B ──────────────────────────────────────────────────────────────────
const frameDir = path.join(ROOT, 'frontend/content/frames');
const frames = fs.existsSync(frameDir)
  ? fs.readdirSync(frameDir).filter(f => f.endsWith('.js')).map(f => require(path.join(frameDir, f)))
  : [];

let referenced = new Set(), refCount = 0, referenceFrames = 0;
const provisionalBands = new Set();
for (const fr of frames) {
  if (fr.reference) referenceFrames++;
  if (!fr.language || !fr.language.default) errors.push(`frame ${fr.id}: no language.default`);
  if (!fr.edition) errors.push(`frame ${fr.id}: edition is mandatory and immutable`);
  for (const b of fr.bands || []) {
    for (const u of b.units || []) {
      for (const l of u.levels || []) {
        if (!l.skills || !l.skills.length) errors.push(`${fr.id}/${b.id}/${u.id}/${l.id}: no skills`);
        for (const sk of l.skills || []) {
          refCount++;
          if (!ids.has(sk)) errors.push(`${fr.id}/${b.id}/${u.id}/${l.id}: undefined skill ${sk}`);
          else referenced.add(sk);
        }
        if (b.status === 'PROVISIONAL') provisionalBands.add(`${fr.id}/${b.id}`);
      }
    }
  }
}
if (referenceFrames !== 1) errors.push(`exactly one frame must set reference:true (found ${referenceFrames})`);

// ── Seeds bind to real skills ────────────────────────────────────────────────
for (const f of fs.readdirSync(path.join(ROOT, 'frontend/content')).filter(f => /^seed-.*\.js$/.test(f))) {
  const mod = require(path.join(ROOT, 'frontend/content', f));
  for (const [id, s] of Object.entries(mod.seeds || {})) {
    for (const sk of s.skills || []) if (!ids.has(sk)) errors.push(`${f} :: ${id}: undefined skill ${sk}`);
    // Invariant 6: no seeds authored against a PROVISIONAL band
    if (s.frameId && s.bandId && provisionalBands.has(`${s.frameId}/${s.bandId}`)) {
      errors.push(`${f} :: ${id}: authored against PROVISIONAL band ${s.frameId}/${s.bandId} — verify the source first`);
    }
    if (s.legacySubTopic && !G.legacyToSkill[s.legacySubTopic]) {
      errors.push(`${f} :: ${id}: legacySubTopic "${s.legacySubTopic}" unknown`);
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const tracks = Object.values(G.skills).reduce((a, s) => (a[s.track] = (a[s.track] || 0) + 1, a), {});
console.log(`Layer A  ${ids.size} skills  ${JSON.stringify(tracks)}  legacy ${Object.keys(G.legacyToSkill).length}/${enumVals.size}`);
console.log(`Layer B  ${frames.length} frames  ${refCount} skill references  ${referenced.size} distinct`);
const orphans = [...ids].filter(i => !referenced.has(i));
if (orphans.length) console.log(`\nSkills in no frame (${orphans.length}): ${orphans.join(', ')}`);
if (warnings.length) console.log('\nWARNINGS:\n' + warnings.map(w => '  ' + w).join('\n'));
if (errors.length) { console.error('\nERRORS:\n' + errors.map(e => '  ' + e).join('\n')); process.exit(1); }
console.log('\nStructure OK.');
