// math-validation.js — shared Algebrite equivalence checks (equations + linear inequalities)
// Requires global Algebrite (load before this script).
(function (global) {
  'use strict';

  const REL_OPS = ['<=', '>=', '<', '>'];
  const FLIP_OP = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };
  const NUM_EPS = 1e-9;

  function create(Algebrite) {
    if (!Algebrite || typeof Algebrite.run !== 'function') {
      throw new Error('MathValidation.create requires Algebrite');
    }

    function equationToExpr(str) {
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '=' &&
            str[i - 1] !== '!' && str[i - 1] !== '<' && str[i - 1] !== '>' &&
            str[i + 1] !== '=') {
          const left  = str.slice(0, i).trim();
          const right = str.slice(i + 1).trim();
          return `(${left}) - (${right})`;
        }
      }
      return str;
    }

    function containsEquals(str) {
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '=' &&
            str[i - 1] !== '!' && str[i - 1] !== '<' && str[i - 1] !== '>' &&
            str[i + 1] !== '=') {
          return true;
        }
      }
      return false;
    }

    function containsRelational(str) {
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '<' && str[i + 1] !== '=' && str[i - 1] !== '=') return true;
        if (str[i] === '>' && str[i + 1] !== '=' && str[i - 1] !== '=') return true;
      }
      return false;
    }

    function splitRelational(str) {
      const s = String(str).trim();
      for (let i = 0; i < s.length; i++) {
        if (s[i] === '<') {
          if (s[i + 1] === '=') {
            return { left: s.slice(0, i).trim(), op: '<=', right: s.slice(i + 2).trim() };
          }
          if (s[i - 1] !== '=') {
            return { left: s.slice(0, i).trim(), op: '<', right: s.slice(i + 1).trim() };
          }
        }
        if (s[i] === '>') {
          if (s[i + 1] === '=') {
            return { left: s.slice(0, i).trim(), op: '>=', right: s.slice(i + 2).trim() };
          }
          if (s[i - 1] !== '=') {
            return { left: s.slice(0, i).trim(), op: '>', right: s.slice(i + 1).trim() };
          }
        }
      }
      return null;
    }

    function normalize(input) {
      let s = input.trim();
      s = s.replace(/²/g, '^2');
      s = s.replace(/³/g, '^3');
      s = s.replace(/⁴/g, '^4');
      s = s.replace(/⁵/g, '^5');
      s = s.replace(/⁶/g, '^6');
      s = s.replace(/⁷/g, '^7');
      s = s.replace(/⁸/g, '^8');
      s = s.replace(/⁹/g, '^9');
      s = s.replace(/\bsubst\b/gi, '\x02');
      s = s.replace(/\bfloat\b/gi, '\x03');
      s = s.replace(/\bgcd\b/gi, '\x04');
      s = s.replace(/\blcm\b/gi, '\x05');
      s = s.replace(/×/g, '*');
      s = s.replace(/÷/g, '/');
      s = s.replace(/−/g, '-');
      s = s.replace(/sqrt/gi, '\x01');
      s = s.replace(/√\(/g, '\x01(');
      s = s.replace(/√(\d+)/g, '\x01($1)');
      s = s.replace(/√([a-zA-Z])/g, '\x01($1)');
      s = s.replace(/(\d)\x01/g, '$1*\x01');
      s = s.replace(/\)\x01/g, ')*\x01');
      s = s.replace(/([a-zA-Z])\x01/g, '$1*\x01');
      s = s.replace(/(\d)([a-zA-Z])/g, '$1*$2');
      s = s.replace(/([a-zA-Z])([a-zA-Z])/g, '$1*$2');
      s = s.replace(/o\*r/g, 'or');
      s = s.replace(/a\*nd/g, 'and');
      s = s.replace(/(\d)\(/g, '$1*(');
      s = s.replace(/\)\(/g, ')*(');
      s = s.replace(/([a-zA-Z])\(/g, '$1*(');
      s = s.replace(/\)([a-zA-Z])/g, ')*$1');
      s = s.replace(/\)(\d)/g, ')*$1');
      s = s.replace(/\x01/g, 'sqrt');
      s = s.replace(/\x02/g, 'subst');
      s = s.replace(/\x03/g, 'float');
      s = s.replace(/\x04/g, 'gcd');
      s = s.replace(/\x05/g, 'lcm');
      return s;
    }

    function isAlgebriteZero(result) {
      const s = String(result == null ? '' : result).trim();
      if (s === '0') return true;
      const n = parseFloat(s);
      return Number.isFinite(n) && Math.abs(n) < NUM_EPS;
    }

    function algebriteFloat(expr) {
      // User-facing rhs (e.g. "8/2"); internal Algebrite calls pass pre-built expr as-is
      const inner = /\bsubst\s*\(/.test(expr) ? expr : normalize(expr);
      const raw = Algebrite.run(`float(simplify(${inner}))`).trim();
      if (!raw || raw.toLowerCase().includes('stop') || raw.toLowerCase().includes('error')) {
        return null;
      }
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : null;
    }

    function flipRelationalOp(op) {
      return FLIP_OP[op] || op;
    }

    function numsClose(a, b) {
      return Math.abs(a - b) < NUM_EPS;
    }

    /** @returns {{ varName: string, op: string, value: number } | null} */
    function canonicalFromSolvedInequality(left, op, right) {
      const lv = left.trim();
      const rv = right.trim();
      if (/^[a-zA-Z]$/.test(lv)) {
        const value = algebriteFloat(rv);
        if (value == null) return null;
        return { varName: lv, op, value };
      }
      if (/^[a-zA-Z]$/.test(rv)) {
        const value = algebriteFloat(lv);
        if (value == null) return null;
        return { varName: rv, op: flipRelationalOp(op), value };
      }
      return null;
    }

    /** ax + b {op} 0  →  x {canonicalOp} boundary */
    function canonicalFromUnsolvedInequality(left, op, right) {
      const diffExpr = normalize(`(${left}) - (${right})`);
      const diff = Algebrite.run(`simplify(${diffExpr})`).trim();
      if (!diff || diff.toLowerCase().includes('stop') || diff.toLowerCase().includes('error')) {
        return null;
      }

      const at0Raw = Algebrite.run(`float(subst(0, x, ${diff}))`).trim();
      const at1Raw = Algebrite.run(`float(subst(1, x, ${diff}))`).trim();
      const at0 = parseFloat(at0Raw);
      const at1 = parseFloat(at1Raw);
      if (!Number.isFinite(at0) || !Number.isFinite(at1)) return null;

      const a = at1 - at0;
      const b = at0;
      if (Math.abs(a) < NUM_EPS) return null;

      const boundary = -b / a;
      let canonicalOp = op;
      if (a < 0) canonicalOp = flipRelationalOp(op);

      return { varName: 'x', op: canonicalOp, value: boundary };
    }

    function canonicalLinearInequality(str) {
      const parts = splitRelational(str);
      if (!parts) return null;

      const solved = canonicalFromSolvedInequality(parts.left, parts.op, parts.right);
      if (solved) return solved;

      return canonicalFromUnsolvedInequality(parts.left, parts.op, parts.right);
    }

    function canonicalsMatch(c1, c2) {
      if (!c1 || !c2) return false;
      if (c1.varName !== c2.varName) return false;
      if (c1.op !== c2.op) return false;
      return numsClose(c1.value, c2.value);
    }

    function inequalityEquivalence(a, b) {
      const t0 = performance.now();
      console.log('[inequalityEquivalence] entry', { a, b });

      const cA = canonicalLinearInequality(a);
      const cB = canonicalLinearInequality(b);
      console.log('[inequalityEquivalence] canonical', { cA, cB });

      if (!cA || !cB) {
        return { valid: null, parseError: true };
      }
      if (canonicalsMatch(cA, cB)) {
        console.log(`[inequalityEquivalence] matched in ${(performance.now() - t0).toFixed(1)}ms`);
        return { valid: true };
      }
      return { valid: false };
    }

    function equationEquivalence(a, b, problemType) {
      const t0 = performance.now();
      console.log('[equationEquivalence] entry', { a, b, problemType });

      const normA = normalize(equationToExpr(a));
      const normB = normalize(equationToExpr(b));
      console.log('[equationEquivalence] normalized', { normA, normB });

      const diffResult = Algebrite.run(`simplify((${normA}) - (${normB}))`);
      const diffTrimmed = diffResult.trim();
      console.log(`[equationEquivalence] diff="${diffTrimmed}" in ${(performance.now() - t0).toFixed(1)}ms`);

      if (isAlgebriteZero(diffTrimmed)) {
        console.log(`[equationEquivalence] matched via diff in ${(performance.now() - t0).toFixed(1)}ms`);
        return { valid: true };
      }
      if (!diffTrimmed || diffTrimmed.toLowerCase().includes('stop') || diffTrimmed.toLowerCase().includes('error')) {
        return { valid: null, parseError: true };
      }

      if (problemType === 'Solve') {
        let varPart = null, valPart = null;
        for (let i = 0; i < b.length; i++) {
          if (b[i] === '=' &&
              b[i - 1] !== '!' && b[i - 1] !== '<' && b[i - 1] !== '>' &&
              b[i + 1] !== '=') {
            varPart = normalize(b.slice(0, i).trim());
            valPart = normalize(b.slice(i + 1).trim());
            break;
          }
        }
        if (varPart && /^[a-zA-Z]$/.test(varPart)) {
          const subResult = Algebrite.run(`simplify(subst(${valPart}, ${varPart}, ${normA}))`).trim();
          console.log(`[equationEquivalence] subst(${valPart}, ${varPart}, normA)="${subResult}" in ${(performance.now() - t0).toFixed(1)}ms`);
          if (isAlgebriteZero(subResult)) {
            console.log(`[equationEquivalence] matched via substitution in ${(performance.now() - t0).toFixed(1)}ms`);
            return { valid: true };
          }
          if (!subResult || subResult.toLowerCase().includes('stop') || subResult.toLowerCase().includes('error')) {
            return { valid: null, parseError: true };
          }
          return { valid: false };
        }
      }

      return { valid: false };
    }

    function ineqUni(s) { return s.replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/−/g, '-').replace(/\s+/g, ''); }
    function fnum(s) { try { return Number(Algebrite.run(`float(${s})`)); } catch (e) { return NaN; } }
    function isZeroNum(a, b) { return !Number.isNaN(a) && !Number.isNaN(b) && Math.abs(a - b) < 1e-9; }
    function detectVar(s) {
      const set = new Set(s.replace(/abs/g, '').replace(/[^a-zA-Z]/g, '').split(''));
      return [...set];
    }
    function ineqLinearAB(expr, v) {
      const a = fnum(`coeff((${expr}),${v},1)`);
      const b = fnum(`coeff((${expr}),${v},0)`);
      if (Number.isNaN(a) || Number.isNaN(b)) return null;
      const hideg = fnum(`coeff((${expr}),${v},2)`);
      if (Number.isNaN(hideg) || Math.abs(hideg) > 1e-9) return null;
      return { a, b };
    }
    function ineqFlip(op) { return { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[op]; }
    function ineqNormalize(raw) {
      const s = ineqUni(raw);
      const v = detectVar(s);
      if (v.length !== 1) return { indeterminate: 'var-count' };
      const x = v[0];
      const comp = s.match(/^(.+?)(<=|<)([a-zA-Z])(<=|<)(.+)$/);
      if (comp && comp[3] === x) {
        const lo = fnum(comp[1]), hi = fnum(comp[5]);
        if (Number.isNaN(lo) || Number.isNaN(hi)) return { indeterminate: 'interval-bound' };
        return { kind: 'interval', var: x, loOp: comp[2], lo, hiOp: comp[4], hi };
      }
      const abs = s.match(/^abs\((.+?)\)(<=|>=|<|>)(.+)$/);
      if (abs) {
        const inner = abs[1], op = abs[2], k = fnum(abs[3]);
        if (Number.isNaN(k)) return { indeterminate: 'abs-k' };
        if (op === '>' || op === '>=') return { indeterminate: 'abs-union-deferred' };
        if (k < 0) return { indeterminate: 'abs-empty' };
        const ab = ineqLinearAB(inner, x); if (!ab) return { indeterminate: 'abs-nonlinear' };
        let lo = (-k - ab.b) / ab.a, hi = (k - ab.b) / ab.a;
        if (ab.a < 0) { const t = lo; lo = hi; hi = t; }
        const bound = (op === '<') ? '<' : '<=';
        return { kind: 'interval', var: x, loOp: bound, lo, hiOp: bound, hi };
      }
      const m = s.match(/^(.+?)(<=|>=|<|>)(.+)$/);
      if (!m) return { indeterminate: 'no-relation' };
      const ab = ineqLinearAB(`(${m[1]})-(${m[3]})`, x);
      if (!ab) return { indeterminate: 'nonlinear-or-multivar' };
      if (isZeroNum(ab.a, 0)) return { indeterminate: 'no-variable' };
      let op2 = m[2], k = -ab.b / ab.a;
      if (ab.a < 0) op2 = ineqFlip(m[2]);
      return { kind: 'linear', var: x, op: op2, k };
    }
    function checkInequality(studentRaw, canonicalRaw) {
      Algebrite.run('clearall');
      const can = ineqNormalize(canonicalRaw);
      const stu = ineqNormalize(studentRaw);
      if (can.indeterminate) return { verdict: 'indeterminate', reason: 'canonical:' + can.indeterminate };
      if (stu.indeterminate) return { verdict: 'indeterminate', reason: 'student:' + stu.indeterminate };
      if (stu.kind !== can.kind) return { verdict: 'reject', reason: 'kind-mismatch' };
      if (stu.var !== can.var) return { verdict: 'reject', reason: 'var-mismatch' };
      if (stu.kind === 'linear') {
        return { verdict: (stu.op === can.op && isZeroNum(stu.k, can.k)) ? 'accept' : 'reject' };
      }
      const ok = stu.loOp === can.loOp && stu.hiOp === can.hiOp &&
        isZeroNum(stu.lo, can.lo) && isZeroNum(stu.hi, can.hi);
      return { verdict: ok ? 'accept' : 'reject' };
    }

    function fcNorm(s) { return s.replace(/−/g, '-').replace(/\s+/g, ''); }
    function fcSplitTopLevel(s) {
      const terms = []; let depth = 0, cur = '';
      for (const ch of s) {
        if (ch === '(') depth++; else if (ch === ')') depth--;
        if ((ch === '+' || ch === '-') && depth === 0 && cur.length > 0) { terms.push(cur); cur = ch; }
        else cur += ch;
      }
      if (cur.length > 0) terms.push(cur);
      return terms;
    }
    function fcSignature(term) {
      let t = term.replace(/^[+-]/, '');
      t = t.replace(/^[0-9]*\.?[0-9]*(?:\/[0-9]+)?/, '');
      return t.split('').sort().join('');
    }
    function fcHasParens(s) { return /[()]/.test(s); }
    function fcIsCollectedNoParens(s) {
      if (fcHasParens(s)) return false;
      const seen = new Set();
      for (const sig of fcSplitTopLevel(s).map(fcSignature)) { if (seen.has(sig)) return false; seen.add(sig); }
      return true;
    }
    function fcIsProductForm(s) { return fcSplitTopLevel(s).length === 1 && fcHasParens(s); }
    function fcLeadingFactor(s) { const m = s.match(/^([+-]?[0-9]+(?:\/[0-9]+)?)\*?\(/); return m ? m[1] : null; }
    function fcMulFix(s) { return s.replace(/([0-9])\(/g, '$1*(').replace(/\)([0-9a-zA-Z])/g, ')*$1'); }
    function fcEquiv(a, b) {
      try { return String(Algebrite.run(`simplify((${fcMulFix(a)})-(${fcMulFix(b)}))`)) === '0'; }
      catch (e) { return null; }
    }
    function formCheck(op, studentRaw, canonicalRaw) {
      Algebrite.run('clearall');
      const student = fcNorm(studentRaw), canonical = fcNorm(canonicalRaw);
      const eq = fcEquiv(student, canonical);
      if (eq === null) return { verdict: 'indeterminate', reason: 'eval-fail' };
      if (eq === false) return { verdict: 'reject', reason: 'not-equivalent' };
      if (op === 'simplify' || op === 'expand') {
        return fcIsCollectedNoParens(student) ? { verdict: 'accept' }
          : { verdict: 'reject', reason: fcHasParens(student) ? 'form:has-parens' : 'form:not-collected' };
      }
      if (op === 'factor') {
        if (!fcIsProductForm(student)) return { verdict: 'reject', reason: 'form:not-a-product' };
        const sf = fcLeadingFactor(student), cf = fcLeadingFactor(canonical);
        if (cf === null) return { verdict: 'indeterminate', reason: 'canonical-factor-parse' };
        if (sf === null) return { verdict: 'reject', reason: 'form:no-factor-extracted' };
        Algebrite.run('clearall');
        return String(Algebrite.run(`(${sf})-(${cf})`)) === '0'
          ? { verdict: 'accept' } : { verdict: 'reject', reason: 'form:not-greatest-factor' };
      }
      return { verdict: 'indeterminate', reason: 'unknown-op' };
    }

    function hasBalancedParens(str) {
      let depth = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') depth--;
        if (depth < 0) return false;
      }
      return depth === 0;
    }

    function checkEquivalenceInner(exprA, exprB, problemType) {
      const t0 = performance.now();
      console.log('[checkEquivalence] entry', { exprA, exprB, problemType });

      if (!hasBalancedParens(exprA) || !hasBalancedParens(exprB)) {
        console.log('[checkEquivalence] unbalanced parens', { exprA, exprB });
        return { valid: null, parseError: true };
      }

      const partsA = exprA.split(',').map(s => s.trim()).filter(Boolean);
      const partsB = exprB.split(',').map(s => s.trim()).filter(Boolean);
      if (partsA.length > 1 || partsB.length > 1) {
        if (partsA.length !== partsB.length) {
          console.log('[checkEquivalence] comma part count mismatch', { partsA, partsB });
          return { valid: false };
        }
        const usedB = new Set();
        for (const pa of partsA) {
          let matched = false;
          for (let i = 0; i < partsB.length; i++) {
            if (!usedB.has(i) && checkEquivalenceInner(pa, partsB[i], problemType).valid === true) {
              usedB.add(i);
              matched = true;
              break;
            }
          }
          if (!matched) {
            console.log('[checkEquivalence] no match for comma part:', pa);
            return { valid: false };
          }
        }
        console.log(`[checkEquivalence] comma parts all matched in ${(performance.now() - t0).toFixed(1)}ms`);
        return { valid: true };
      }

      try {
        if (problemType === 'Solve' &&
            (containsRelational(exprA) || containsRelational(exprB)) &&
            !containsEquals(exprA) && !containsEquals(exprB)) {
          const result = inequalityEquivalence(exprA, exprB);
          console.log(`[checkEquivalence] exit via inequalityEquivalence in ${(performance.now() - t0).toFixed(1)}ms`, result);
          return result;
        }

        if (containsEquals(exprA) && containsEquals(exprB) && problemType !== 'Evaluate') {
          const result = equationEquivalence(exprA, exprB, problemType);
          console.log(`[checkEquivalence] exit via equationEquivalence in ${(performance.now() - t0).toFixed(1)}ms`, result);
          return result;
        }

        const normA = normalize(exprA);
        const normB = normalize(exprB);
        if (containsEquals(normA) !== containsEquals(normB)) {
          console.log('[checkEquivalence] asymmetric = in Algebrite simplify path', { normA, normB });
          return { valid: null, parseError: true };
        }
        console.log('[checkEquivalence] Algebrite call', { normA, normB });
        const diffResult = Algebrite.run(`simplify((${normA}) - (${normB}))`);
        const diffTrimmed = diffResult.trim();
        console.log(`[checkEquivalence] Algebrite result="${diffTrimmed}" in ${(performance.now() - t0).toFixed(1)}ms`);
        if (isAlgebriteZero(diffTrimmed)) return { valid: true };
        if (!diffTrimmed || diffTrimmed.toLowerCase().includes('stop') || diffTrimmed.toLowerCase().includes('error')) {
          return { valid: null, parseError: true };
        }
        return { valid: false };
      } catch (e) {
        console.error('[checkEquivalence] Algebrite threw:', e);
        return { valid: null, parseError: true };
      }
    }

    function checkEquivalence(exprA, exprB, problemType) {
      Algebrite.run('clearall');
      return checkEquivalenceInner(exprA, exprB, problemType);
    }

    function checkIsFinal(studentStep, expectedAnswer, problemType) {
      return checkEquivalence(studentStep, expectedAnswer, problemType);
    }

    function mapVerdictToEquivResult(result) {
      if (result.verdict === 'accept') return { valid: true };
      if (result.verdict === 'reject') return { valid: false, reason: result.reason };
      return { valid: null, indeterminate: true, reason: result.reason };
    }

    function validateAgainstSeed(studentRaw, seed) {
      const studentInput = String(studentRaw).replace(/^\s*=\s*/, '');
      const op = seed && seed.op;
      switch (op) {
        case 'inequality':
          return mapVerdictToEquivResult(checkInequality(studentInput, seed.answer));
        case 'simplify':
        case 'expand':
        case 'factor':
          return mapVerdictToEquivResult(formCheck(op, studentInput, seed.answer));
        case 'solve':
        case 'evaluate':
        case 'translate':
        default:
          return checkEquivalence(studentInput, seed.answer, seed.type || seed.problemType);
      }
    }

    return {
      normalize,
      isAlgebriteZero,
      checkEquivalence,
      checkIsFinal,
      containsRelational,
      canonicalLinearInequality,
      checkInequality,
      formCheck,
      validateAgainstSeed,
    };
  }

  global.MathValidation = { create };
})(typeof window !== 'undefined' ? window : global);
