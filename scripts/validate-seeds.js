#!/usr/bin/env node
'use strict';
/**
 * Seed validation harness — verifies every seed's stated answer against real Algebrite.
 * Never trust a seed that has not been through this. Static reasoning is not verification.
 *
 *   node scripts/validate-seeds.js frontend/content/seed-cambridge-s7.js
 *   node scripts/validate-seeds.js            # defaults to all seed-*.js in frontend/content
 *
 * Exit code 1 if any seed fails, so this can gate a deploy.
 */
const path = require('path');
const fs   = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A    = require(path.join(ROOT, 'node_modules/algebrite'));

const norm = s => String(s)
  .replace(/[−–]/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
  .replace(/\s+/g, '')
  .replace(/(\d)([a-zA-Z(])/g, '$1*$2')
  .replace(/\)([a-zA-Z(0-9])/g, ')*$1');

function equivalent(a, b) {
  try { A.run('clearall'); return A.run(`simplify((${a})-(${b}))`) === '0'; }
  catch (e) { return 'ERR:' + e.message; }
}

function checkSeed(id, s) {
  try {
    switch (s.op) {
      case 'simplify':
      case 'expand':
      case 'factor': {
        if (!s.expression) return ['SKIP', 'no expression field'];
        const ok = equivalent(norm(s.expression), norm(s.answer));
        return [ok === true ? 'PASS' : 'FAIL', `${s.expression} == ${s.answer}`];
      }
      case 'evaluate': {
        if (!s.expression || !s.substVar) return ['SKIP', 'no expression/substVar'];
        A.run('clearall');
        const v = A.run(`float(eval(${norm(s.expression)},${s.substVar},${norm(s.substValue)}))`);
        const ok = Math.abs(parseFloat(v) - parseFloat(s.answer)) < 1e-9;
        return [ok ? 'PASS' : 'FAIL', `${s.expression} @ ${s.substVar}=${s.substValue} -> ${v} (want ${s.answer})`];
      }
      case 'solve': {
        if (!s.expression || !s.expression.includes('=')) return ['SKIP', 'no equation'];
        // Verify by SUBSTITUTION: does the stated answer satisfy every equation?
        // More robust than roots() — handles systems, rational equations and acceptAnyRoot
        // uniformly, and answers the question we actually care about.
        const eqs  = s.expression.split(';').map(e => e.trim()).filter(Boolean);
        const pairs = String(s.answer).split(',').map(p => p.trim()).filter(Boolean)
          .map(p => { const m = p.match(/^([a-zA-Z])\s*=\s*(.+)$/); return m ? [m[1], m[2].trim()] : null; })
          .filter(Boolean);
        if (!pairs.length) return ['SKIP', `cannot parse answer "${s.answer}"`];

        for (const e of eqs) {
          const [lhs, rhs] = e.split('=');
          A.run('clearall');
          let expr = `(${norm(lhs)})-(${norm(rhs)})`;
          for (const [v, val] of pairs) expr = `eval(${expr},${v},${norm(val)})`;
          const r = A.run(`simplify(${expr})`);
          if (r !== '0') return ['FAIL', `${e} not satisfied by ${s.answer} (got ${r})`];
        }

        // Single-variable polynomial: also confirm the answer set is complete,
        // unless the seed explicitly accepts any one root.
        if (eqs.length === 1 && pairs.length === 1 && !s.acceptAnyRoot) {
          const [lhs, rhs] = eqs[0].split('=');
          const v = pairs[0][0];
          try {
            A.run('clearall');
            const num = A.run(`numerator(simplify((${norm(lhs)})-(${norm(rhs)})))`);
            const roots = A.run(`roots(${num},${v})`);
            if (roots && roots.startsWith('[') && roots.split(',').length > 1) {
              return ['FAIL', `${eqs[0]} has roots ${roots} but seed gives only ${s.answer} (set acceptAnyRoot?)`];
            }
          } catch (e) { /* non-polynomial: substitution check above already stands */ }
        }
        return ['PASS', `${s.expression} satisfied by ${s.answer}${s.acceptAnyRoot ? ' (acceptAnyRoot)' : ''}`];
      }
      case 'translate':
        // No expression to check against — correctness is a human judgement.
        return ['MANUAL', `answer="${s.answer}"`];
      default:
        return ['SKIP', `op="${s.op}" has no validator`];
    }
  } catch (e) { return ['ERROR', e.message]; }
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(path.join(ROOT, 'frontend/content'))
      .filter(f => /^seed-.*\.js$/.test(f))
      .map(f => path.join('frontend/content', f));

let totals = { PASS: 0, FAIL: 0, MANUAL: 0, SKIP: 0, ERROR: 0 };
const failures = [];

for (const rel of files) {
  const mod = require(path.resolve(ROOT, rel));
  const seeds = mod.seeds || {};
  console.log(`\n── ${rel} — ${Object.keys(seeds).length} seeds`);
  for (const [id, s] of Object.entries(seeds)) {
    const [status, detail] = checkSeed(id, s);
    totals[status] = (totals[status] || 0) + 1;
    if (status === 'FAIL' || status === 'ERROR') failures.push(`${rel} :: ${id} — ${detail}`);
    if (status !== 'PASS') console.log(`   ${status.padEnd(6)} ${id}  ${detail}`);
  }
  // draw integrity
  const ids = new Set(Object.keys(seeds));
  for (const [k, d] of Object.entries(mod.draws || {})) {
    [...(d.test || []), ...(d.final || [])].forEach(i => {
      if (!ids.has(i)) failures.push(`${rel} :: draw ${k} references missing seed ${i}`);
    });
  }
}

console.log('\n' + JSON.stringify(totals));
if (failures.length) { console.error('\nFAILURES:\n' + failures.map(f => '  ' + f).join('\n')); process.exit(1); }
console.log('All auto-verifiable seeds pass. MANUAL entries need human review.');
