#!/usr/bin/env node
'use strict';
/**
 * Assert every built lesson record contains the fields lesson.html actually renders.
 *
 * The Intro rendered nearly empty because build-lessons emitted `ruleTitle` but
 * coverIntroHtml() gates the rule card on `rule`, and emitted no `hook`, so the
 * machine never appeared. Both files were individually "correct" — the contract
 * between them was never checked. This checks it.
 *
 * Run: node scripts/test-lesson-records.js
 */
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = '/tmp/lesson-record-check';

let bad = 0;
const t = (l, ok, detail) => { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'} ${l}${ok || !detail ? '' : ' — ' + detail}`); };

// What lesson.html reads. Keep in sync with coverIntroHtml() / hookFromLesson().
const REQUIRED_INTRO = ['rule', 'ruleTitle', 'ruleChips', 'goals'];

for (const [frame, band] of [['CAMB', 's7']]) {
  fs.rmSync(OUT, { recursive: true, force: true });
  execSync(`node ${path.join(ROOT, 'scripts/build-lessons.js')} ${frame} ${band} --out ${OUT}`, { cwd: ROOT, stdio: 'pipe' });
  const files = fs.readdirSync(OUT);
  console.log(`\n── ${frame}/${band} — ${files.length} records ──`);

  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    const tag = `${d.unit}/${d.level}`;

    for (const k of REQUIRED_INTRO) {
      const v = d.intro && d.intro[k];
      t(`${tag} intro.${k}`, !!v && (!Array.isArray(v) || v.length > 0), 'missing or empty — section will not render');
    }

    // The hook is what makes the Intro worth looking at.
    const h = d.intro && d.intro.hook;
    t(`${tag} intro.hook`, !!h, 'no hook — Intro renders as a static card');
    if (h) {
      t(`${tag} hook is a real puzzle`, h.a !== 0, 'a=0 is not a rule');
      t(`${tag} hook options include the answer`, h.options.includes(h.answer));
      t(`${tag} hook options are distinct`, new Set(h.options).size === h.options.length);
      // A distractor must not produce the same input->output mapping.
      const f2 = (s) => {
        const m = String(s).replace(/[−–]/g, '-').replace(/\s+/g, '').match(/^(\d*)([a-z])(?:([+-])(\d+))?$/i);
        if (!m) return null;
        const a = m[1] === '' ? 1 : +m[1];
        const b = m[3] ? (m[3] === '-' ? -1 : 1) * +m[4] : 0;
        return (x) => a * x + b;
      };
      const ans = f2(h.answer);
      const collide = h.options.filter(o => o !== h.answer).some(o => {
        const g = f2(o); return g && [1, 2, 5, 10].every(x => g(x) === ans(x));
      });
      t(`${tag} no colliding distractor`, !collide, 'a wrong option behaves identically');
    }

    t(`${tag} has practice problems`, (d.practiceProblems || []).length > 0);
    t(`${tag} language declared`, !!d.language);
  }
}

console.log(bad ? `\n${bad} FAILED` : '\nEvery lesson record satisfies the render contract.');
process.exit(bad ? 1 : 0);
