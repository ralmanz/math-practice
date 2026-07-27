#!/usr/bin/env node
'use strict';
/**
 * Guard against the script-redeclaration bug (fixed in ab92d2d).
 *
 * Classic <script> tags all share one global scope. Two files that each declare
 * `const seeds` at top level throw a SyntaxError on the second one — and the
 * browser reports it against that file, then carries on. Everything downstream
 * silently does nothing. That is exactly how the Cambridge home render failed
 * while looking, from the outside, like a caching problem.
 *
 * This turns that class of failure into a build-time error:
 *   1. Every content script loaded by a <script src> tag must be IIFE-wrapped.
 *   2. No two of them may declare the same top-level binding.
 *
 * Run: node scripts/check-globals.js     (exit 1 on violation)
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');

const errors = [];

// Every JS file under frontend/content is browser-loadable by design.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}
const files = walk(path.join(FRONTEND, 'content'));

const bindingsByFile = {};
for (const f of files) {
  const rel = path.relative(FRONTEND, f);
  const src = fs.readFileSync(f, 'utf8');

  if (!src.trimStart().startsWith('(function')) {
    errors.push(`${rel}: not IIFE-wrapped — its top-level consts leak into global scope`);
  }

  // Top-level bindings = declarations at column 0 outside the IIFE body would be
  // the danger; inside an IIFE they are safe. Collect them anyway so we can warn
  // about collisions if a file is ever unwrapped.
  const body = src.replace(/^\(function \(\) \{\n/, '');
  bindingsByFile[rel] = [...body.matchAll(/^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)]
    .map(m => m[1]);
}

// Which files does each page actually load together?
const pages = fs.readdirSync(FRONTEND).filter(f => f.endsWith('.html'));
for (const page of pages) {
  const html = fs.readFileSync(path.join(FRONTEND, page), 'utf8');
  const loaded = [...html.matchAll(/<script[^>]+src="([^"?]*content\/[^"?]+)/g)].map(m => m[1]);
  if (loaded.length < 2) continue;

  const seen = {};
  for (const rel of loaded) {
    for (const b of bindingsByFile[rel] || []) {
      if (seen[b]) {
        const bothWrapped = fs.readFileSync(path.join(FRONTEND, rel), 'utf8').trimStart().startsWith('(function')
          && fs.readFileSync(path.join(FRONTEND, seen[b]), 'utf8').trimStart().startsWith('(function');
        if (!bothWrapped) {
          errors.push(`${page}: "${b}" declared by both ${seen[b]} and ${rel} — one will silently fail`);
        }
      } else seen[b] = rel;
    }
  }
  console.log(`${page.padEnd(16)} ${loaded.length} content scripts`);
}

// Seed banks must be loadable together even if a page doesn't do it yet — the
// practice engine will need every bank at once.
const seedFiles = files.filter(f => /seed-.*\.js$/.test(path.basename(f)));
const seedSeen = {};
for (const f of seedFiles) {
  const rel = path.relative(FRONTEND, f);
  const wrapped = fs.readFileSync(f, 'utf8').trimStart().startsWith('(function');
  for (const b of bindingsByFile[rel] || []) {
    if (seedSeen[b] && !wrapped) {
      errors.push(`seed banks: "${b}" in both ${seedSeen[b]} and ${rel}, and ${rel} is unwrapped`);
    }
    seedSeen[b] = seedSeen[b] || rel;
  }
}
console.log(`seed banks      ${seedFiles.length} files, all wrapped: ${seedFiles.every(f => fs.readFileSync(f, 'utf8').trimStart().startsWith('(function'))}`);

if (errors.length) { console.error('\nERRORS:\n' + errors.map(e => '  ' + e).join('\n')); process.exit(1); }
console.log('\nNo global-scope collisions. All content scripts isolated.');
