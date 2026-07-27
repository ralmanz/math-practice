#!/usr/bin/env node
'use strict';
/**
 * Build lesson records from a frame + the skill graph + seeds, and optionally
 * POST them to the worker.
 *
 *   node scripts/build-lessons.js CAMB s7                 # print JSON, write nothing
 *   node scripts/build-lessons.js CAMB s7 --out ./out     # write files to disk
 *   node scripts/build-lessons.js CAMB s7 --push          # POST to the worker
 *
 * --push requires TEACHER_SECRET in the environment and uses the authenticated
 * POST /lesson/:frame/:band/:unit/:level endpoint. It does NOT use wrangler and
 * never touches the Cloudflare account directly, so it cannot affect any other
 * project sharing that account.
 *
 * Refuses to build a PROVISIONAL band (D-STRUCT invariant 6).
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const G = require(path.join(ROOT, 'frontend/content/skill-graph.js'));
const C = require(path.join(ROOT, 'frontend/content/coordinates.js'));

const WORKER = process.env.WORKER_URL || 'https://math-practice-proxy.ronelalmanza20.workers.dev';

const [frameId, bandId, ...flags] = process.argv.slice(2);
if (!frameId || !bandId) {
  console.error('usage: build-lessons.js <FRAME> <band> [--out DIR] [--push]');
  process.exit(1);
}
const outIdx = flags.indexOf('--out');
const outDir = outIdx >= 0 ? flags[outIdx + 1] : null;
const push   = flags.includes('--push');

const frame = require(path.join(ROOT, 'frontend/content/frames', frameId.toLowerCase() + '.js'));
const band  = (frame.bands || []).find(b => b.id === bandId);
if (!band) { console.error(`band ${bandId} not in frame ${frameId}`); process.exit(1); }
if (band.status === 'PROVISIONAL') {
  console.error(`REFUSING: ${frameId}/${bandId} is PROVISIONAL. Verify the source before building lessons.`);
  process.exit(1);
}

// Index every seed by skill id.
const seedsBySkill = {};
for (const f of fs.readdirSync(path.join(ROOT, 'frontend/content')).filter(f => /^seed-.*\.js$/.test(f))) {
  const mod = require(path.join(ROOT, 'frontend/content', f));
  const modLang = mod.lang || 'es';
  for (const [id, s] of Object.entries(mod.seeds || {})) {
    const skills = s.skills && s.skills.length
      ? s.skills
      : (s.subTopics || []).map(t => G.legacyToSkill[t]).filter(Boolean);
    for (const sk of skills) (seedsBySkill[sk] = seedsBySkill[sk] || []).push({ id, lang: modLang, ...s });
  }
}

const lang = (frame.language && frame.language.default) || 'es';
const pick = (o) => (o && typeof o === 'object' ? (o[lang] || o.en || o.es) : o);

const built = [];
for (const unit of band.units || []) {
  for (const level of unit.levels || []) {
    const gradable = level.skills.filter(s => G.skills[s] && G.skills[s].track === 'S');
    // Only seeds written in this frame's language. A Cambridge lesson must never
    // serve Spanish PAA prompts just because the skill ids happen to match.
    const seeds = gradable.flatMap(s => (seedsBySkill[s] || []).filter(x => x.lang === lang));
    if (!seeds.length) {
      const other = gradable.flatMap(s => seedsBySkill[s] || []).length;
      console.warn(`  skip ${frameId}/${bandId}/${unit.id}/${level.id} — no ${lang} seeds` +
        (other ? ` (${other} exist in another language — translate or author)` : ''));
      continue;
    }
    const coord = { frame: frame.id, band: band.id, unit: unit.id, level: level.id };
    // Prefer a two-step equation (ax + b = c): it makes a real machine hook.
    const first = seeds.find(s => /^\s*\d*[a-z]\s*[+\-]\s*\d+\s*=/.test(String(s.expression || '')))
               || seeds.find(s => String(s.expression || '').includes('='));

    built.push({
      coord,
      key: C.canonicalKey(coord),
      data: {
        id: `${frame.id}-${band.id}-${unit.id}-${level.id}`.toLowerCase(),
        frame: frame.id, band: band.id, unit: unit.id, level: level.id,
        language: lang,
        title: pick(unit.label),
        subtitle: gradable.map(s => G.label(s, lang)).join(' · '),
        skills: level.skills,
        intro: {
          ruleTitle: `${pick(frame.name)} — ${pick(band.label)}`,
          ruleChips: gradable.map(s => G.label(s, lang)),
        },
        example: first ? { start: first.expression } : undefined,
        practiceProblems: seeds.map(s => s.id),
      },
    });
  }
}

// Publish manifest: which coordinates actually have a lesson record. home.html
// renders only these, so a level with no seeds never shows a clickable pill that
// would 404. Merged across bands so one file covers every frame.
const manifestPath = path.join(ROOT, 'frontend/content/lesson-manifest.json');
let manifest = {};
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch {}
manifest[`${frame.id}/${band.id}`] = built.map(b => `${b.coord.unit}/${b.coord.level}`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nmanifest updated: ${manifestPath.replace(ROOT + '/', '')}`);

console.log(`\n${frameId}/${bandId} — ${built.length} lesson records`);
for (const b of built) console.log(`  ${b.key}  (${b.data.practiceProblems.length} problems)`);

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const b of built) {
    fs.writeFileSync(path.join(outDir, b.key.replace(/:/g, '_') + '.json'), JSON.stringify(b.data, null, 2));
  }
  console.log(`\nwritten to ${outDir}`);
}

if (push) {
  const secret = process.env.TEACHER_SECRET;
  if (!secret) { console.error('\n--push needs TEACHER_SECRET in the environment'); process.exit(1); }
  (async () => {
    for (const b of built) {
      const res = await fetch(WORKER + C.canonicalPath(b.coord), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/json' },
        body: JSON.stringify(b.data),
      });
      console.log(`  ${res.ok ? 'OK  ' : 'FAIL'} ${b.key} → ${res.status}`);
      if (!res.ok) process.exitCode = 1;
    }
  })();
}
