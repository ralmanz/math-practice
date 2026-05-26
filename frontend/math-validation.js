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

    function hasBalancedParens(str) {
      let depth = 0;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') depth++;
        else if (str[i] === ')') depth--;
        if (depth < 0) return false;
      }
      return depth === 0;
    }

    function checkEquivalence(exprA, exprB, problemType) {
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
            if (!usedB.has(i) && checkEquivalence(pa, partsB[i], problemType).valid === true) {
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

    function checkIsFinal(studentStep, expectedAnswer, problemType) {
      return checkEquivalence(studentStep, expectedAnswer, problemType);
    }

    return {
      normalize,
      isAlgebriteZero,
      checkEquivalence,
      checkIsFinal,
      containsRelational,
      canonicalLinearInequality,
    };
  }

  global.MathValidation = { create };
})(typeof window !== 'undefined' ? window : global);
