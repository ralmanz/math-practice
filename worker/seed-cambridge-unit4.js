#!/usr/bin/env node
// seed-cambridge-unit4.js — Seed Cambridge Unit 4 Level 1 lesson with balance-scale visuals.
// Run from worker/: node seed-cambridge-unit4.js

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const NAMESPACE_ID = 'bd9a4b14857d4df993a2c065d0804b41';
const LESSON_KEY   = 'lesson:cambridge:4:level1';

function runWrangler(args) {
  return spawnSync('npx', ['wrangler', ...args], {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

function kvPut(key, value) {
  const tmpFile = path.join(os.tmpdir(), 'nuvo-cambridge-unit4-' + Date.now() + '.json');
  fs.writeFileSync(tmpFile, value, 'utf8');
  try {
    const result = runWrangler([
      'kv', 'key', 'put',
      '--remote',
      '--namespace-id=' + NAMESPACE_ID,
      key,
      '--path=' + tmpFile,
    ]);
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || 'KV put failed');
    }
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

// ── Balance-scale builder ────────────────────────────────────────────────────
// state: 'balanced' | 'tilt-left' | 'tilt-right'
function balanceScale({ left, right, status, statusKind = 'balanced', operation, tilt = 'balanced' }) {
  const tiltClass = tilt === 'tilt-left' ? ' tilt-left' : tilt === 'tilt-right' ? ' tilt-right' : '';
  const opHtml = operation
    ? `<div class="balance-operation"><span class="op-label">Apply to both sides</span><span>${operation}</span></div>`
    : '';
  const statusHtml = status
    ? `<div class="balance-status ${statusKind}">${status}</div>`
    : '';
  return `
    <div class="balance-board">
      ${opHtml}
      <div class="balance-sides">
        <div class="balance-side">
          <div class="balance-side-label">Left side</div>
          <div class="balance-pan${left ? '' : ' empty'}">${left || '—'}</div>
        </div>
        <div class="balance-side">
          <div class="balance-side-label">Right side</div>
          <div class="balance-pan${right ? '' : ' empty'}">${right || '—'}</div>
        </div>
      </div>
      <div class="balance-bar-wrap">
        <div class="balance-bar${tiltClass}"></div>
      </div>
      <div class="balance-pivot"></div>
      <div class="balance-base"></div>
      ${statusHtml}
    </div>
  `;
}

// ── Lesson content ───────────────────────────────────────────────────────────
const lesson = {
  curriculum: 'cambridge',
  unit: '4',
  level: '1',
  title: 'Two-step equations',
  subtitle: 'Undo operations in reverse order, keeping both sides balanced.',
  badge: 'Cambridge Stage 8 · Unit 4 · Level 1',
  rules: [
    'An equation is a balance — both sides are equal',
    'Whatever you do to one side, you must do to the other',
    'Undo operations in reverse order: undo addition/subtraction first, then multiplication/division',
    'Goal: get the variable alone on one side',
  ],
  formulas: [
    'ax + b = c  →  ax = c - b  →  x = (c - b) / a',
    'If you subtract from one side, subtract from the other',
    'If you divide one side, divide the other',
  ],
  conceptVoice: [
    'A two-step equation has a variable buried under two operations.',
    'Think of the equation as a balance scale: both sides weigh the same.',
    'To find the variable, undo each operation, but apply the same change to both sides so the scale stays balanced.',
    'Always undo addition or subtraction first, then undo multiplication or division.',
  ].join(' '),
  conceptVisual: balanceScale({
    left: '3x + 5',
    right: '14',
    status: 'Both sides are equal — the scale is balanced',
    statusKind: 'balanced',
  }),
  example: {
    start: '3x + 5 = 14',
    annotation: 'Solve for x',
    narration_intro: 'We want to find the value of x. The equation 3x + 5 = 14 has two operations — multiplication and addition. We undo them in reverse order.',
    formulas: [
      'Step 1: subtract 5 from both sides → 3x = 9',
      'Step 2: divide both sides by 3 → x = 3',
      'Check: 3(3) + 5 = 9 + 5 = 14 ✓',
    ],
    steps: [
      {
        equation: '3x + 5 = 14',
        annotation: 'Starting equation',
        narration: 'Start with the equation. The left side is 3x plus 5. The right side is 14. The two sides are equal.',
        visual: balanceScale({
          left: '3x + 5',
          right: '14',
          status: 'Balanced — both sides are equal',
          statusKind: 'balanced',
        }),
      },
      {
        equation: '3x + 5 − 5 = 14 − 5',
        annotation: 'Undo the +5: subtract 5 from both sides',
        narration: 'To peel away the +5, subtract 5 from both sides. The same change happens on both sides, so the scale stays balanced.',
        visual: balanceScale({
          left: '3x + 5 − 5',
          right: '14 − 5',
          operation: '− 5',
          status: 'Same change on both sides keeps it balanced',
          statusKind: 'balanced',
        }),
      },
      {
        equation: '3x = 9',
        annotation: 'Simplify: 5 − 5 cancels on the left, 14 − 5 = 9 on the right',
        narration: 'On the left, plus 5 minus 5 cancels. On the right, 14 minus 5 is 9. Now the equation is simpler.',
        visual: balanceScale({
          left: '3x',
          right: '9',
          status: 'Still balanced — equation is simpler',
          statusKind: 'balanced',
        }),
      },
      {
        equation: '3x ÷ 3 = 9 ÷ 3',
        annotation: 'Undo the ×3: divide both sides by 3',
        narration: 'Now undo the multiplication. Divide both sides by 3. Doing the same thing to both sides keeps the scale balanced.',
        visual: balanceScale({
          left: '3x ÷ 3',
          right: '9 ÷ 3',
          operation: '÷ 3',
          status: 'Same change on both sides keeps it balanced',
          statusKind: 'balanced',
        }),
      },
      {
        equation: 'x = 3',
        annotation: 'Solved — and check: 3(3) + 5 = 14 ✓',
        narration: 'The answer is x equals 3. Check by substituting back: three times three is nine, plus five is fourteen. The scale balances.',
        visual: balanceScale({
          left: 'x',
          right: '3',
          status: 'x is alone — solved!',
          statusKind: 'balanced',
        }),
      },
    ],
  },
};

function main() {
  console.log('Writing ' + LESSON_KEY + ' to remote KV...');
  kvPut(LESSON_KEY, JSON.stringify(lesson));
  console.log('Done. Seeded:', LESSON_KEY);
}

main();
