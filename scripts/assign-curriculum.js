#!/usr/bin/env node
'use strict';
/**
 * Assign a curriculum (frame + band) to a student account.
 *
 *   TEACHER_SECRET=… node scripts/assign-curriculum.js ron CAMB s7
 *   TEACHER_SECRET=… node scripts/assign-curriculum.js ron CAMB s7 --dry
 *
 * The curriculum is a property of the ACCOUNT — this is the only way it gets set.
 * There is no in-app curriculum picker and no ?curriculum= override for a
 * signed-in student.
 *
 * Uses the authenticated PUT /student/:id/profile endpoint. Never touches
 * Cloudflare directly, so it cannot affect other projects on the account.
 */
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WORKER = process.env.WORKER_URL || 'https://math-practice-proxy.ronelalmanza20.workers.dev';

const [studentId, frameId, bandId, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry');

if (!studentId || !frameId || !bandId) {
  console.error('usage: assign-curriculum.js <studentId> <FRAME> <band> [--dry]');
  console.error('example: assign-curriculum.js ron CAMB s7');
  process.exit(1);
}

// Validate against the real frame definition before writing anything.
let frame;
try {
  frame = require(path.join(ROOT, 'frontend/content/frames', frameId.toLowerCase() + '.js'));
} catch {
  console.error(`No frame "${frameId}". Available: MEDUCA, CAMB`);
  process.exit(1);
}
const band = (frame.bands || []).find(b => b.id === bandId);
if (!band) {
  console.error(`Band "${bandId}" not in ${frameId}. Available: ${(frame.bands || []).map(b => b.id).join(', ')}`);
  process.exit(1);
}
if (band.status === 'PROVISIONAL') {
  console.error(`REFUSING: ${frameId}/${bandId} is PROVISIONAL — no verified content. Pick another band.`);
  process.exit(1);
}

(async () => {
  let student = null;
  try {
    const res = await fetch(`${WORKER}/student/${encodeURIComponent(studentId)}`);
    if (!res.ok) { console.error(`Student "${studentId}" not found (${res.status})`); process.exit(1); }
    student = await res.json();
  } catch (e) {
    // --dry still validates the frame/band offline, which is the useful half.
    if (!dry) { console.error(`Cannot reach worker: ${e.message}`); process.exit(1); }
    console.log(`\n(offline — cannot read the current record; validating frame/band only)`);
    student = {};
  }

  console.log(`\n${studentId} — ${student.name || '(no name)'}`);
  console.log(`  before: frame=${student.frame || '—'} band=${student.band || '—'} ` +
              `curriculum=${student.curriculum || '—'} grade=${student.grade || '—'}`);
  console.log(`  after:  frame=${frame.id} band=${band.id}`);

  const units = (band.units || []).map(u => `${u.id}(${(u.levels || []).length})`).join(' ');
  console.log(`  band units: ${units}`);

  if (dry) { console.log('\n--dry, nothing written.'); return; }

  const secret = process.env.TEACHER_SECRET;
  if (!secret) { console.error('\nTEACHER_SECRET not set'); process.exit(1); }

  const put = await fetch(`${WORKER}/student/${encodeURIComponent(studentId)}/profile`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/json' },
    // `name` is required by the endpoint; preserve whatever is already there.
    body: JSON.stringify({ name: student.name || studentId, frame: frame.id, band: band.id }),
  });
  console.log(put.ok ? '\nOK — assigned.' : `\nFAILED ${put.status} ${await put.text()}`);
  if (!put.ok) process.exitCode = 1;
})();
