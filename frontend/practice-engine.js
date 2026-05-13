// practice-engine.js — shared practice/test engine
// Exposes window.PracticeEngine = { init(config), destroy() }
// config: { studentId, curriculum, unit, stage, mode, problems, container, onComplete }
// mode: "practice" | "test"

(function () {
  'use strict';

  const PROXY_URL = 'https://math-practice-proxy.ronelalmanza20.workers.dev';

  // ── Injected styles ────────────────────────────────────────────────────────
  const PE_CSS = `
  .pe-wrap {
    --pe-correct:    #2D6A4F;
    --pe-correct-bg: #D8F3DC;
    --pe-wrong:      #C1453B;
    --pe-wrong-bg:   #FDE8E6;
    --pe-nudge:      #B8860B;
    --pe-nudge-bg:   #FFF8E7;
    --pe-unsure:     #5A6B7A;
    --pe-unsure-bg:  #EDF1F5;
  }
  @keyframes peSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes peSpin { to { transform: rotate(360deg); } }

  .pe-progress-bar-container {
    display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
  }
  .pe-progress-bar {
    flex: 1; height: 6px; background: var(--border, #E8E8E4); border-radius: 3px; overflow: hidden;
  }
  .pe-progress-fill {
    height: 100%; background: var(--accent, #2D6A4F); border-radius: 3px;
    transition: width 0.4s ease; width: 0%;
  }
  .pe-progress-text {
    font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #6B6B6B); white-space: nowrap;
  }
  .pe-test-notice {
    background: var(--pe-nudge-bg); color: var(--pe-nudge);
    border: 1.5px solid #F5D06A; border-radius: 10px;
    padding: 10px 14px; font-size: 0.88rem; font-weight: 600;
    margin-bottom: 20px; text-align: center;
    animation: peSlideIn 0.25s ease;
  }
  .pe-wrap .problem-card {
    background: var(--card, #FFFFFF); border: 1.5px solid var(--border, #E8E8E4);
    border-radius: 14px; padding: 28px; margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .pe-wrap .problem-label {
    font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--accent, #2D6A4F); margin-bottom: 10px;
  }
  .pe-wrap .problem-text {
    font-family: var(--mono, monospace); font-size: 1.15rem;
    font-weight: 500; line-height: 1.6; color: var(--text, #1A1A1A);
  }
  .pe-wrap .step-entry {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; border-radius: 10px; margin-bottom: 6px;
    animation: peSlideIn 0.25s ease;
  }
  .pe-wrap .step-entry.correct { background: var(--pe-correct-bg); }
  .pe-wrap .step-entry .step-icon { font-size: 1rem; margin-top: 1px; flex-shrink: 0; }
  .pe-wrap .step-entry .step-text { font-family: var(--mono, monospace); font-size: 0.92rem; line-height: 1.5; }
  .pe-wrap .feedback {
    padding: 12px 14px; border-radius: 10px; margin-bottom: 14px;
    font-size: 0.88rem; line-height: 1.5; animation: peSlideIn 0.25s ease; display: none;
  }
  .pe-wrap .feedback.wrong  { background: var(--pe-wrong-bg);  color: var(--pe-wrong);  display: block; }
  .pe-wrap .feedback.nudge  { background: var(--pe-nudge-bg);  color: var(--pe-nudge);  display: block; }
  .pe-wrap .feedback.unsure { background: var(--pe-unsure-bg); color: var(--pe-unsure); display: block; }
  .pe-wrap .feedback.reveal {
    background: var(--accent-bg, #F0FAF3); color: var(--accent, #2D6A4F);
    display: block; font-family: var(--mono, monospace);
  }
  .pe-input-area { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .pe-step-input {
    width: 100%; padding: 12px 14px; border: 1.5px solid var(--border, #E8E8E4);
    border-radius: 10px; font-family: var(--mono, monospace); font-size: 1rem;
    background: var(--card, #FFFFFF); color: var(--text, #1A1A1A);
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .pe-step-input:focus { border-color: var(--accent, #2D6A4F); }
  .pe-wrap .math-preview {
    display: none; font-family: var(--mono, monospace); font-size: 1.05rem;
    padding: 10px 14px; background: var(--accent-bg, #F0FAF3);
    border: 1.5px solid var(--accent-light, #D8F3DC); border-radius: 10px;
    line-height: 2.2; color: var(--text, #1A1A1A); min-height: 48px;
  }
  .pe-wrap .math-preview.visible { display: block; }
  .pe-wrap .math-frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px; }
  .pe-wrap .math-num  { border-bottom: 1.5px solid currentColor; padding: 0 4px; text-align: center; line-height: 1.5; }
  .pe-wrap .math-den  { padding: 0 4px; text-align: center; line-height: 1.5; }
  .pe-calc-grid.disabled .calc-btn   { opacity: 0.45; pointer-events: none; }
  .pe-calc-grid.disabled .toggle-btn { opacity: 0.45; pointer-events: none; }
  .pe-wrap .loading-indicator {
    display: none; align-items: center; gap: 8px;
    font-size: 0.82rem; color: var(--text-secondary, #6B6B6B); padding: 8px 0;
  }
  .pe-wrap .loading-indicator.show { display: flex; }
  .pe-wrap .spinner {
    width: 16px; height: 16px; border: 2px solid var(--border, #E8E8E4);
    border-top-color: var(--accent, #2D6A4F); border-radius: 50%;
    animation: peSpin 0.7s linear infinite; flex-shrink: 0;
  }
  .pe-wrap .completed-card {
    background: var(--pe-correct-bg); border: 1.5px solid var(--pe-correct);
    border-radius: 14px; padding: 24px; text-align: center;
    margin-bottom: 20px; animation: peSlideIn 0.3s ease;
  }
  .pe-wrap .completed-card .check { font-size: 2rem; margin-bottom: 8px; }
  .pe-wrap .completed-card h3 { color: var(--pe-correct); font-size: 1.1rem; margin-bottom: 4px; }
  .pe-wrap .completed-card p  { color: var(--pe-correct); font-size: 0.88rem; opacity: 0.8; }
  .pe-next-btn {
    width: 100%; padding: 14px; background: var(--accent, #2D6A4F); color: white;
    border: none; border-radius: 10px; font-family: var(--sans, sans-serif);
    font-weight: 600; font-size: 1rem; cursor: pointer; transition: opacity 0.2s;
  }
  .pe-next-btn:hover { opacity: 0.9; }
  .pe-mcq-options {
    display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
  }
  .pe-mcq-btn {
    width: 100%; padding: 12px 16px; text-align: left;
    border: 1.5px solid var(--border, #E8E8E4);
    border-radius: 10px; background: var(--card, #FFFFFF);
    font-family: var(--sans, sans-serif); font-size: 0.95rem;
    font-weight: 500; color: var(--text, #1A1A1A);
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    display: flex; align-items: center; gap: 10px;
  }
  .pe-mcq-btn:hover:not(:disabled) { border-color: var(--accent, #2D6A4F); background: var(--accent-bg, #F0FAF3); }
  .pe-mcq-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pe-mcq-btn.pe-mcq-correct { background: var(--pe-correct-bg); border-color: var(--pe-correct); color: var(--pe-correct); }
  .pe-mcq-btn.pe-mcq-wrong   { background: var(--pe-wrong-bg);   border-color: var(--pe-wrong);   color: var(--pe-wrong); }
  .pe-mcq-letter {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--accent-bg, #F0FAF3); color: var(--accent, #2D6A4F);
    font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
  }
  .pe-mcq-btn.pe-mcq-correct .pe-mcq-letter { background: var(--pe-correct); color: white; }
  .pe-mcq-btn.pe-mcq-wrong   .pe-mcq-letter { background: var(--pe-wrong);   color: white; }
  @media (max-width: 500px) {
    .pe-wrap .problem-card { padding: 20px; }
    .pe-wrap .problem-text { font-size: 1rem; }
  }
  `;

  function injectStyles() {
    if (document.getElementById('pe-module-styles')) return;
    const s = document.createElement('style');
    s.id = 'pe-module-styles';
    s.textContent = PE_CSS;
    document.head.appendChild(s);
  }

  // ── Pure math helpers (verbatim from app.html) ─────────────────────────────

  // ── Convert "L = R" equation to difference form "(L) - (R)" ──
  // Splits on the first standalone = (not !=, <=, >=, ==)
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
    return str; // no standalone = found, return as-is
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

  // ── Normalize input for Algebrite ──
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
    s = s.replace(/×/g, '*');
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
    s = s.replace(/o\*r/g, 'or');    // restore "or" mangled by letter-letter rule
    s = s.replace(/a\*nd/g, 'and');  // restore "and" (and → a*nd in one pass)
    s = s.replace(/(\d)\(/g, '$1*(');
    s = s.replace(/\)\(/g, ')*(');
    s = s.replace(/([a-zA-Z])\(/g, '$1*(');
    s = s.replace(/\)([a-zA-Z])/g, ')*$1');
    s = s.replace(/\)(\d)/g, ')*$1');
    s = s.replace(/\x01/g, 'sqrt');
    return s;
  }

  // ── Check algebraic equivalence via Algebrite ──
  function equationEquivalence(a, b, problemType) {
    const t0 = performance.now();
    console.log('[equationEquivalence] entry', { a, b, problemType });

    const normA = normalize(equationToExpr(a));
    const normB = normalize(equationToExpr(b));
    console.log('[equationEquivalence] normalized', { normA, normB });

    // Direct diff — works for all types and intermediate Solve steps (e.g. 8x=-8 from 8x-4=-12)
    const diffResult = Algebrite.run(`simplify((${normA}) - (${normB}))`);
    const diffTrimmed = diffResult.trim();
    console.log(`[equationEquivalence] diff="${diffTrimmed}" in ${(performance.now()-t0).toFixed(1)}ms`);

    if (diffTrimmed === '0') {
      console.log(`[equationEquivalence] matched via diff in ${(performance.now()-t0).toFixed(1)}ms`);
      return { valid: true };
    }
    if (!diffTrimmed || diffTrimmed.toLowerCase().includes('stop') || diffTrimmed.toLowerCase().includes('error')) {
      return { valid: null, parseError: true };
    }

    // For Solve: substitution handles final "x = value" answers where diff ≠ 0 due to coefficient scaling
    // e.g. 8x+8 vs x+1: diff is 7x+7, but subst(-1, x, 8x+8) = 0 ✓
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
      // Only substitute if varPart is a single variable (e.g. "x"), not a compound like "8*x"
      if (varPart && /^[a-zA-Z]$/.test(varPart)) {
        const subResult = Algebrite.run(`simplify(subst(${valPart}, ${varPart}, ${normA}))`).trim();
        console.log(`[equationEquivalence] subst(${valPart}, ${varPart}, normA)="${subResult}" in ${(performance.now()-t0).toFixed(1)}ms`);
        if (subResult === '0') {
          console.log(`[equationEquivalence] matched via substitution in ${(performance.now()-t0).toFixed(1)}ms`);
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
      if (depth < 0) return false; // more closes than opens at this point
    }
    return depth === 0;
  }

  function checkEquivalence(exprA, exprB, problemType) {
    const t0 = performance.now();
    console.log('[checkEquivalence] entry', { exprA, exprB, problemType });

    // Guard: unbalanced parens would cause Algebrite parse errors
    if (!hasBalancedParens(exprA) || !hasBalancedParens(exprB)) {
      console.log('[checkEquivalence] unbalanced parens', { exprA, exprB });
      return { valid: null, parseError: true };
    }

    // Handle comma-separated answers (e.g. multiple solutions: x = 1, x = -1)
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
      console.log(`[checkEquivalence] comma parts all matched in ${(performance.now()-t0).toFixed(1)}ms`);
      return { valid: true };
    }

    try {
      if (containsEquals(exprA) && containsEquals(exprB) && problemType !== 'Evaluate') {
        const result = equationEquivalence(exprA, exprB, problemType);
        console.log(`[checkEquivalence] exit via equationEquivalence in ${(performance.now()-t0).toFixed(1)}ms`, result);
        return result;
      }
      const normA = normalize(exprA);
      const normB = normalize(exprB);
      console.log('[checkEquivalence] Algebrite call', { normA, normB });
      const diffResult = Algebrite.run(`simplify((${normA}) - (${normB}))`);
      const diffTrimmed = diffResult.trim();
      console.log(`[checkEquivalence] Algebrite result="${diffTrimmed}" in ${(performance.now()-t0).toFixed(1)}ms`);
      if (diffTrimmed === '0') return { valid: true };
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

  function extractExpression(questionText) {
    return questionText
      .replace(/^(expand and simplify|expand|factorise|factorize|simplify|solve|evaluate|find|calculate)\s+/i, '')
      .trim();
  }

  // ── Fetch with 10s timeout ──
  function fetchWithTimeout(url, options, ms = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => {
      console.warn(`[fetchWithTimeout] TIMED OUT after ${ms}ms: ${url}`);
      controller.abort();
    }, ms);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Render math expression as HTML with stacked fractions and superscripts ──
  function renderMath(text) {
    let s = escapeHtml(text);

    // Unicode superscripts → <sup>
    s = s.replace(/²/g, '<sup>2</sup>');
    s = s.replace(/³/g, '<sup>3</sup>');
    s = s.replace(/⁴/g, '<sup>4</sup>');
    s = s.replace(/⁵/g, '<sup>5</sup>');
    s = s.replace(/⁶/g, '<sup>6</sup>');
    s = s.replace(/⁷/g, '<sup>7</sup>');
    s = s.replace(/⁸/g, '<sup>8</sup>');
    s = s.replace(/⁹/g, '<sup>9</sup>');
    // ^N notation
    s = s.replace(/\^(\d+)/g, '<sup>$1</sup>');

    // Stacked fractions — applied in specificity order so parens are respected
    // (A)/(B)
    s = s.replace(/\(([^()]*)\)\/\(([^()]*)\)/g, (_, n, d) =>
      `<span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span>`
    );
    // (A)/B  — parenthesized numerator, simple denominator
    s = s.replace(/\(([^()]*)\)\/([\w]+)/g, (_, n, d) =>
      `<span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span>`
    );
    // A/(B)  — simple numerator, parenthesized denominator
    s = s.replace(/([\w]+)\/\(([^()]*)\)/g, (_, n, d) =>
      `<span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span>`
    );
    // A/B  — both sides are plain word-char tokens with no surrounding spaces
    // (e.g. 1/2, x/y typed without spaces).  The ÷ button inserts " / " with
    // spaces so it intentionally doesn't match here.
    s = s.replace(/([\w]+)\/([\w]+)/g, (_, n, d) =>
      `<span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span>`
    );

    return s;
  }

  // ── Canonical form for raw form-check comparison ──
  // Normalises variable order within additive terms so that commutativity of
  // addition doesn't cause false "wrong form" nudges.
  function canonicalFormForCheck(expr) {
    let s = normalize(expr).replace(/\s/g, '').toLowerCase();
    // Strip redundant parentheses around a single atom: (3) → 3, (x) → x
    let prev;
    do {
      prev = s;
      s = s.replace(/\(([a-z0-9]+)\)/g, '$1');
    } while (s !== prev);
    // Sort single-variable additive terms within parenthesised groups.
    // Only applies when the group contains purely letters, digits and '+' (no
    // '*', '-', '/') so that compound or subtraction terms are left alone.
    s = s.replace(/\(([^()]+)\)/g, function (match, inner) {
      if (inner.includes('+') && /^[a-z0-9+]+$/.test(inner)) {
        const terms = inner.split('+').sort();
        return '(' + terms.join('+') + ')';
      }
      return match;
    });
    return s;
  }

  // ── Claude API helpers ─────────────────────────────────────────────────────

  async function askClaudeToInterpret(input) {
    const t0 = performance.now();
    console.log('[askClaudeToInterpret] entry', { input });
    try {
      const response = await fetchWithTimeout(PROXY_URL + '/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "The student tried to write a math expression but it couldn't be parsed. Convert their input to a valid algebraic expression using standard notation. Return ONLY the expression, nothing else.",
          messages: [{ role: 'user', content: input }]
        })
      });
      if (!response.ok) {
        console.warn('[askClaudeToInterpret] response not ok:', response.status);
        return null;
      }
      const data = await response.json();
      const result = data.content.map(c => c.text || '').join('').trim() || null;
      console.log(`[askClaudeToInterpret] exit in ${(performance.now()-t0).toFixed(1)}ms:`, result);
      return result;
    } catch (e) {
      console.error(`[askClaudeToInterpret] error after ${(performance.now()-t0).toFixed(1)}ms:`, e);
      return null;
    }
  }

  async function askClaudeForHint(problem, history, currentExpr, wrongInput) {
    const t0 = performance.now();
    console.log('[askClaudeForHint] entry', { currentExpr, wrongInput });
    try {
      const stepsText = history.length > 0
        ? `Previous correct steps:\n${history.map((s, i) => `  Step ${i + 1}: ${s}`).join('\n')}\n\n`
        : '';
      const response = await fetchWithTimeout(PROXY_URL + '/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "You are a warm, encouraging math tutor for a 7th grade student. The student made an error. Give a small hint pointing toward the error without revealing the correct answer. Keep it to 1-2 sentences.",
          messages: [{
            role: 'user',
            content: `Problem type: ${problem.type || 'unknown'}\nProblem: ${problem.question}\nExpected answer: ${problem.answer}\n\n${stepsText}Current expression: ${currentExpr}\nStudent wrote (incorrect): ${wrongInput}\n\nGive a gentle hint.`
          }]
        })
      });
      if (!response.ok) {
        console.warn('[askClaudeForHint] response not ok:', response.status);
        return null;
      }
      const data = await response.json();
      const result = data.content.map(c => c.text || '').join('').trim() || null;
      console.log(`[askClaudeForHint] exit in ${(performance.now()-t0).toFixed(1)}ms:`, result);
      return result;
    } catch (e) {
      console.error(`[askClaudeForHint] error after ${(performance.now()-t0).toFixed(1)}ms:`, e);
      return null;
    }
  }

  // NOTE: formCheckAttempts is passed as 4th parameter (was outer-scope var in app.html)
  async function askClaudeFormCheck(studentStep, expectedAnswer, problemType, formCheckAttempts) {
    const t0 = performance.now();
    console.log('[askClaudeFormCheck] entry', { studentStep, expectedAnswer, problemType, formCheckAttempts });
    let hintInstruction;
    if (formCheckAttempts === 0) {
      hintInstruction = "STRICT RULE: Your feedback must contain ZERO specifics. Do NOT mention any variables, numbers, coefficients, factors, or anything about the structure of the answer. ONLY say something like 'Correct so far, but keep going!' or 'You're on the right track — this can be simplified further.' Nothing else. NEVER hint at what to do next.";
    } else if (formCheckAttempts === 1) {
      hintInstruction = "STRICT RULE: Give a direction only — no specifics. You may say something like 'Can you factor out anything else?' or 'Look more carefully at what terms have in common.' Do NOT mention any specific variables, numbers, or coefficients. Do NOT describe what the answer looks like. NEVER reveal the target form.";
    } else if (formCheckAttempts === 2) {
      hintInstruction = "STRICT RULE: You may mention the TYPE of thing to look for, but still no specific values. For example: 'There is a common variable you can still factor out' or 'The coefficient outside can be simplified further.' Do NOT name which variable or what the coefficient is. Do NOT show or describe the final answer form.";
    } else {
      hintInstruction = "You may now be explicit. Show the expected form and explain clearly what the student should have written.";
    }
    try {
      const typeContext = problemType ? `The problem type is: ${problemType}. ` : '';
      const response = await fetchWithTimeout(PROXY_URL + '/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `${typeContext}The teacher expects the answer in this form: ${expectedAnswer}. The student wrote: ${studentStep}. Both are mathematically equivalent (already verified). Is the student's answer in the SAME STRUCTURAL FORM as the teacher's? Same level of factoring, same grouping, same simplification level. NEVER reveal the final answer form until attempt 3 or higher. NEVER mention specific variables or coefficients to factor out until attempt 2 or higher. ${hintInstruction} Respond with ONLY a JSON object: { "match": true/false, "feedback": "brief message if no match" }`,
          messages: [{ role: 'user', content: `Teacher's expected form: ${expectedAnswer}\nStudent's answer: ${studentStep}` }]
        })
      });
      if (!response.ok) {
        console.warn('[askClaudeFormCheck] response not ok:', response.status);
        return null;
      }
      const data = await response.json();
      const text = data.content.map(c => c.text || '').join('').trim();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) {
        console.warn('[askClaudeFormCheck] could not parse JSON from response:', text);
        return null;
      }
      const result = JSON.parse(text.slice(start, end + 1));
      console.log(`[askClaudeFormCheck] exit in ${(performance.now()-t0).toFixed(1)}ms:`, result);
      return result;
    } catch (e) {
      console.error(`[askClaudeFormCheck] error after ${(performance.now()-t0).toFixed(1)}ms:`, e);
      return null;
    }
  }

  async function askClaudeForReveal(problem, history, currentExpr) {
    const t0 = performance.now();
    console.log('[askClaudeForReveal] entry', { currentExpr });
    try {
      const stepsText = history.length > 0
        ? `Previous correct steps:\n${history.map((s, i) => `  Step ${i + 1}: ${s}`).join('\n')}\n\n`
        : '';
      const response = await fetchWithTimeout(PROXY_URL + '/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "You are a math tutor for a 7th grade student. The student is struggling. Return ONLY the algebraic expression for a valid next step from their current position. Nothing else — no explanation, just the expression.",
          messages: [{
            role: 'user',
            content: `Problem type: ${problem.type || 'unknown'}\nProblem: ${problem.question}\nExpected answer: ${problem.answer}\n\n${stepsText}Current expression: ${currentExpr}\n\nWhat is a valid next step? Return only the expression.`
          }]
        })
      });
      if (!response.ok) {
        console.warn('[askClaudeForReveal] response not ok:', response.status);
        return null;
      }
      const data = await response.json();
      const result = data.content.map(c => c.text || '').join('').trim() || null;
      console.log(`[askClaudeForReveal] exit in ${(performance.now()-t0).toFixed(1)}ms:`, result);
      return result;
    } catch (e) {
      console.error(`[askClaudeForReveal] error after ${(performance.now()-t0).toFixed(1)}ms:`, e);
      return null;
    }
  }

  async function askClaudeForTranslateHint(problem, wrongInput) {
    const t0 = performance.now();
    console.log('[askClaudeForTranslateHint] entry', { wrongInput });
    try {
      const response = await fetchWithTimeout(PROXY_URL + '/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "You are a warm, encouraging math tutor for a 7th grade student learning to translate word phrases into algebraic expressions. The student made an error. Give a short hint that guides them to think about what each part of the phrase means mathematically — for example, which operation the phrase implies, or what plays the role of the coefficient. Never reveal the correct algebraic expression. Keep it to 1-2 sentences.",
          messages: [{
            role: 'user',
            content: `Word phrase: ${problem.question}\nStudent wrote: ${wrongInput}\n\nGive a gentle hint without revealing the answer.`
          }]
        })
      });
      if (!response.ok) {
        console.warn('[askClaudeForTranslateHint] response not ok:', response.status);
        return null;
      }
      const data = await response.json();
      const result = data.content.map(c => c.text || '').join('').trim() || null;
      console.log(`[askClaudeForTranslateHint] exit in ${(performance.now()-t0).toFixed(1)}ms:`, result);
      return result;
    } catch (e) {
      console.error(`[askClaudeForTranslateHint] error after ${(performance.now()-t0).toFixed(1)}ms:`, e);
      return null;
    }
  }

  // ── Instance factory ────────────────────────────────────────────────────────

  function createInstance(config) {
    const studentId  = config.studentId  || null;
    const mode       = config.mode       || 'practice';
    const problems   = config.problems   || [];
    const container  = config.container;
    const onComplete = config.onComplete || null;

    // Guard: empty problems list
    if (problems.length === 0) {
      if (onComplete) {
        if (mode === 'test') onComplete({ passed: false, score: 0, total: 0 });
        else                 onComplete({ askRonelProblems: [] });
      }
      return { destroy() {} };
    }

    // ── Per-instance state ──────────────────────────────────────────────────
    let currentIndex      = 0;
    let stepHistory       = [];
    let wrongCount        = 0;
    let formCheckAttempts = 0;
    let askRonelProblems  = [];
    // testResults[i] = true (correct) | false (incorrect) | null (not yet)
    const testResults = new Array(problems.length).fill(null);

    // ── DOM element refs (set after render) ────────────────────────────────
    let elProgressFill, elProgressText;
    let elProblemLabel, elProblemText;
    let elStepsContainer, elFeedback, elLoading;
    let elInputArea, elInput, elPreview, elCalcGrid;
    let elMcqOptions;
    let elCompletedCard, elNextBtn;
    let studentCalc = null;
    let _keydownHandler = null;

    // ── Render HTML into container ─────────────────────────────────────────
    function renderHTML() {
      injectStyles();
      container.innerHTML = `
        <div class="pe-wrap">
          ${mode === 'test' ? '<div class="pe-test-notice">Level test — no hints available</div>' : ''}
          <div class="pe-progress-bar-container">
            <div class="pe-progress-bar"><div class="pe-progress-fill"></div></div>
            <div class="pe-progress-text">1 / ${problems.length}</div>
          </div>
          <div class="problem-card">
            <div class="problem-label"></div>
            <div class="problem-text"></div>
          </div>
          <div class="pe-steps-container"></div>
          <div class="feedback" style="display:none;"></div>
          <div class="loading-indicator">
            <div class="spinner"></div>
            <span>Checking your step\u2026</span>
          </div>
          <div class="pe-mcq-options" style="display:none;"></div>
          <div class="pe-input-area">
            <input type="text" class="pe-step-input"
              placeholder="Type or tap buttons to enter your answer\u2026"
              autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            <div class="math-preview"></div>
            <div class="pe-calc-grid"></div>
          </div>
          <div class="completed-card" style="display:none;">
            <div class="check">\u2713</div>
            <h3>Nice work!</h3>
            <p>${mode === 'test' ? 'Correct! Moving on.' : 'You got it. Ready for the next one?'}</p>
          </div>
          <button class="pe-next-btn" style="display:none;">Next Problem \u2192</button>
        </div>
      `;

      const wrap = container.querySelector('.pe-wrap');
      elProgressFill   = wrap.querySelector('.pe-progress-fill');
      elProgressText   = wrap.querySelector('.pe-progress-text');
      elProblemLabel   = wrap.querySelector('.problem-label');
      elProblemText    = wrap.querySelector('.problem-text');
      elStepsContainer = wrap.querySelector('.pe-steps-container');
      elFeedback       = wrap.querySelector('.feedback');
      elLoading        = wrap.querySelector('.loading-indicator');
      elMcqOptions     = wrap.querySelector('.pe-mcq-options');
      elInputArea      = wrap.querySelector('.pe-input-area');
      elInput          = wrap.querySelector('.pe-step-input');
      elPreview        = wrap.querySelector('.math-preview');
      elCalcGrid       = wrap.querySelector('.pe-calc-grid');
      elCompletedCard  = wrap.querySelector('.completed-card');
      elNextBtn        = wrap.querySelector('.pe-next-btn');

      // Attach calculator
      studentCalc = window.attachCalculator(elInput, elCalcGrid, { onSubmit: () => submitStep() });

      // Live math preview (shows stacked fractions as student types)
      elInput.addEventListener('input', function () {
        const val = elInput.value.trim();
        if (!val) {
          elPreview.classList.remove('visible');
          elPreview.innerHTML = '';
        } else {
          const rendered = renderMath(val);
          // Only show the preview when fractions are present (otherwise plain text
          // is already visible in the input field — no need for a duplicate).
          const hasFrac = rendered.includes('math-frac') || rendered.includes('<sup>');
          if (hasFrac) {
            elPreview.innerHTML = rendered;
            elPreview.classList.add('visible');
          } else {
            elPreview.classList.remove('visible');
            elPreview.innerHTML = '';
          }
        }
      });

      // Enter key submits
      _keydownHandler = (e) => {
        if (e.key === 'Enter' && !elCalcGrid.classList.contains('disabled')) {
          submitStep();
        }
      };
      document.addEventListener('keydown', _keydownHandler);

      elNextBtn.addEventListener('click', nextProblem);

      // Start
      loadProblem(0);
    }

    // ── Engine helpers ──────────────────────────────────────────────────────

    function logStep(step, correct) {
      const problemId = problems[currentIndex] && problems[currentIndex].id;
      if (!studentId || !problemId) return;
      fetch(PROXY_URL + '/log-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          problemId,
          step,
          correct,
          ...(mode === 'test' ? { isTest: true } : {})
        })
      }).catch(() => {}); // fire-and-forget
    }

    function markProblemComplete() {
      // Bank problems are tracked via the progress endpoint at the lesson level.
      // This is a no-op for curriculum bank problems (same effective behaviour as
      // the original code when PROBLEM_ID URL param is not set).
    }

    function showLoading(text) {
      elLoading.querySelector('span').textContent = text || 'Thinking...';
      elLoading.classList.add('show');
    }

    function hideLoading() {
      elLoading.classList.remove('show');
    }

    function reenableInput() {
      elCalcGrid.classList.remove('disabled');
    }

    function addStepToHistory(text) {
      const div = document.createElement('div');
      div.className = 'step-entry correct';
      div.innerHTML = `<span class="step-icon">\u2713</span><span class="step-text">${renderMath(text)}</span>`;
      elStepsContainer.appendChild(div);
    }

    function showFeedback(type, message) {
      elFeedback.className = `feedback ${type}`;
      elFeedback.textContent = message;
      elFeedback.style.display = 'block';
    }

    function loadProblem(index) {
      currentIndex      = index;
      stepHistory       = [];
      wrongCount        = 0;
      formCheckAttempts = 0;

      const p = problems[index];
      const typeStr = p.type ? ` \u00b7 ${p.type}` : '';
      elProblemLabel.textContent    = `Problem ${index + 1} of ${problems.length}${typeStr}`;
      elProblemText.innerHTML       = renderMath(p.question);
      elStepsContainer.innerHTML    = '';
      elFeedback.className          = 'feedback';
      elFeedback.textContent        = '';
      elFeedback.style.display      = 'none';
      elCompletedCard.style.display = 'none';
      elNextBtn.style.display       = 'none';

      if (p.format === 'mcq') {
        elInputArea.style.display  = 'none';
        elMcqOptions.style.display = 'flex';
        elMcqOptions.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        letters.forEach(function(letter, i) {
          const btn = document.createElement('button');
          btn.className = 'pe-mcq-btn';
          btn.dataset.option = letter;
          const optText = (p.options || [])[i] || '';
          btn.innerHTML = `<span class="pe-mcq-letter">${letter}</span>${escapeHtml(optText)}`;
          btn.addEventListener('click', function() { submitMCQ(letter); });
          elMcqOptions.appendChild(btn);
        });
      } else {
        elMcqOptions.style.display = 'none';
        elInputArea.style.display  = 'flex';
        studentCalc.clear();
        studentCalc.closePanels();
        elCalcGrid.classList.remove('disabled');
      }

      updateProgress();
    }

    function updateProgress() {
      const total   = problems.length;
      const current = currentIndex + 1;
      elProgressText.textContent = `${current} / ${total}`;
      elProgressFill.style.width = `${(current / total) * 100}%`;
    }

    // ── Translate: single-step handler ─────────────────────────────────────
    async function submitTranslate(input, problem) {
      const t0 = performance.now();
      console.log('[submitTranslate] entry', { input });

      let isCorrect = false;

      // Primary: simplify(a - b) === '0'
      try {
        const normInput  = normalize(input);
        const normAnswer = normalize(problem.answer);
        const diff = Algebrite.run(`simplify((${normInput})-(${normAnswer}))`).trim();
        isCorrect = diff === '0';
        console.log(`[submitTranslate] diff="${diff}" isCorrect=${isCorrect} in ${(performance.now()-t0).toFixed(1)}ms`);
      } catch (e) {
        console.warn('[submitTranslate] Algebrite threw:', e);
      }

      // Fallback: ask Claude to rewrite input into standard notation, then re-check
      if (!isCorrect) {
        showLoading('Interpreting your input...');
        const interpreted = await askClaudeToInterpret(input);
        hideLoading();
        if (interpreted) {
          try {
            const diff2 = Algebrite.run(`simplify((${normalize(interpreted)})-(${normalize(problem.answer)}))`).trim();
            isCorrect = diff2 === '0';
            console.log(`[submitTranslate] fallback diff="${diff2}" isCorrect=${isCorrect}`);
          } catch (e) {
            console.warn('[submitTranslate] Algebrite (fallback) threw:', e);
          }
        }
      }

      logStep(input, isCorrect);

      if (isCorrect) {
        wrongCount = 0;
        stepHistory.push(input);
        addStepToHistory(input);
        elFeedback.style.display = 'none';
        markProblemComplete();
        if (mode === 'test') testResults[currentIndex] = true;
        elInputArea.style.display    = 'none';
        elCompletedCard.style.display = 'block';
        elNextBtn.style.display       = 'block';
        elNextBtn.textContent = currentIndex < problems.length - 1 ? 'Next Problem \u2192' : 'Finish \u2713';
      } else {
        wrongCount++;
        studentCalc.clear();

        if (mode !== 'test') {
          // Practice mode: hint at wrongCount >= 2
          if (wrongCount >= 2) {
            showLoading('Getting a hint...');
            const hint = await askClaudeForTranslateHint(problem, input);
            hideLoading();
            showFeedback('nudge', hint || "Think about what each part of the phrase means mathematically.");
          } else {
            showFeedback('wrong', "That's not quite right. Try writing the algebraic expression.");
          }
          reenableInput();
        } else {
          // Test mode: no hints, auto-skip after 3 wrong
          if (wrongCount >= 3) {
            testResults[currentIndex] = false;
            showFeedback('wrong', 'Incorrect. Moving to the next problem.');
            elInputArea.style.display = 'none';
            setTimeout(() => nextProblem(), 1500);
          } else {
            showFeedback('wrong', "That's not correct. Try again!");
            reenableInput();
          }
        }
      }
      console.log(`[submitTranslate] total time: ${(performance.now()-t0).toFixed(1)}ms`);
    }

    // ── Submit step (main handler) ──────────────────────────────────────────
    async function submitStep() {
      const input = elInput.value.trim();
      if (!input) return;

      elCalcGrid.classList.add('disabled');
      elFeedback.style.display = 'none';

      const problem = problems[currentIndex];

      // ── Translate: single-step, Algebrite.compare + Claude fallback, no form check ──
      if (problem.type === 'Translate') {
        await submitTranslate(input, problem);
        return;
      }

      const previousExpression = (problem.type === 'Evaluate' || problem.type === 'Rearrange' || problem.format === 'open')
        ? problem.answer
        : stepHistory.length > 0
          ? stepHistory[stepHistory.length - 1]
          : extractExpression(problem.question);

      const t0 = performance.now();
      console.log('[submitStep] entry', { input, problemType: problem.type, previousExpression });
      console.log('[submitStep] normalized input:', JSON.stringify(normalize(input)));

      let equiv;
      if (input.includes(',')) {
        console.log('[submitStep] comma answer — skipping step check, treating as final answer');
        equiv = checkIsFinal(input, problem.answer, problem.type);
        console.log(`[submitStep] checkIsFinal (comma shortcut) in ${(performance.now()-t0).toFixed(1)}ms:`, equiv);
      } else {
        equiv = checkEquivalence(previousExpression, input, problem.type);
        console.log(`[submitStep] checkEquivalence result in ${(performance.now()-t0).toFixed(1)}ms:`, equiv);

        if (equiv.valid === null) {
          showLoading('Interpreting your input...');
          console.log('[submitStep] asking Claude to interpret input...');
          const tI = performance.now();
          const interpreted = await askClaudeToInterpret(input);
          console.log(`[submitStep] Claude interpret returned in ${(performance.now()-tI).toFixed(1)}ms:`, interpreted);
          hideLoading();
          if (interpreted) equiv = checkEquivalence(previousExpression, interpreted, problem.type);
          if (equiv.valid === null) {
            showFeedback('unsure', "I couldn't understand your answer. Try rewriting it using the math buttons.");
            reenableInput();
            return;
          }
        }
      }

      if (equiv.valid === true) {
        wrongCount = 0;
        stepHistory.push(input);
        addStepToHistory(input);
        logStep(input, true);
        elFeedback.style.display = 'none';

        const isFinal = checkIsFinal(input, problem.answer, problem.type);
        console.log('[submitStep] checkIsFinal:', isFinal);
        if (isFinal.valid === true) {
          if (input.includes(',')) {
            console.log('[submitStep] comma answer — skipping form check, marking complete');
            markProblemComplete();
            if (mode === 'test') testResults[currentIndex] = true;
            elInputArea.style.display    = 'none';
            elCompletedCard.style.display = 'block';
            elNextBtn.style.display       = 'block';
            elNextBtn.textContent = currentIndex < problems.length - 1 ? 'Next Problem \u2192' : 'Finish \u2713';
          } else {
            const useRawMatch = !(problem.modules?.includes('formCheck'));
            let formMatches, formFeedback;
            if (useRawMatch) {
              const rawA = canonicalFormForCheck(input);
              const rawB = canonicalFormForCheck(problem.answer);
              formMatches  = rawA === rawB;
              formFeedback = null;
              console.log('[submitStep] canonical form match:', formMatches, { rawA, rawB });
            } else {
              showLoading('Checking answer form...');
              console.log('[submitStep] calling askClaudeFormCheck...');
              const tF = performance.now();
              const formCheck = await askClaudeFormCheck(input, problem.answer, problem.type, formCheckAttempts);
              console.log(`[submitStep] askClaudeFormCheck returned in ${(performance.now()-tF).toFixed(1)}ms:`, formCheck);
              hideLoading();
              if (formCheck === null) {
                if (mode !== 'test') {
                  askRonelProblems.push(problem.question);
                }
                showFeedback('unsure', "I couldn't verify your answer right now — save this one for Ronel to check.");
                studentCalc.clear();
                reenableInput();
                return;
              }
              formMatches  = formCheck.match === true;
              formFeedback = formCheck.feedback;
            }

            if (formMatches) {
              console.log('[submitStep] problem complete — updating DOM');
              markProblemComplete();
              if (mode === 'test') testResults[currentIndex] = true;
              elInputArea.style.display    = 'none';
              elCompletedCard.style.display = 'block';
              elNextBtn.style.display       = 'block';
              elNextBtn.textContent = currentIndex < problems.length - 1 ? 'Next Problem \u2192' : 'Finish \u2713';
            } else {
              formCheckAttempts++;
              showFeedback('nudge', formFeedback || 'Correct value, but try to simplify or factor further!');
              studentCalc.clear();
              reenableInput();
            }
          }
        } else {
          studentCalc.clear();
          reenableInput();
        }
      } else {
        wrongCount++;
        logStep(input, false);
        studentCalc.clear();

        if (mode === 'test') {
          // Test mode: no hints, auto-skip after 3 wrong
          if (wrongCount >= 3) {
            testResults[currentIndex] = false;
            showFeedback('wrong', 'Incorrect. Moving to the next problem.');
            elInputArea.style.display = 'none';
            setTimeout(() => nextProblem(), 1500);
          } else {
            showFeedback('wrong', "That step doesn't look right. Try again!");
            reenableInput();
          }
        } else {
          // Practice mode: pre-written hints take priority over Claude hints
          const preHints = problem.hints || [];
          if (preHints.length > 0) {
            const hintIdx = Math.min(wrongCount - 1, preHints.length - 1);
            showFeedback('nudge', preHints[hintIdx]);
            reenableInput();
          } else if (wrongCount >= 4) {
            showLoading('Getting help...');
            console.log('[submitStep] calling askClaudeForReveal...');
            const tR = performance.now();
            const nextStep = await askClaudeForReveal(problem, stepHistory, previousExpression);
            console.log(`[submitStep] askClaudeForReveal returned in ${(performance.now()-tR).toFixed(1)}ms:`, nextStep);
            hideLoading();
            showFeedback('reveal', nextStep
              ? `Here's a valid next step: ${nextStep}`
              : "That step doesn't look right. Keep trying!");
            reenableInput();
          } else if (wrongCount >= 2) {
            showLoading('Getting a hint...');
            console.log('[submitStep] calling askClaudeForHint...');
            const tH = performance.now();
            const hint = await askClaudeForHint(problem, stepHistory, previousExpression, input);
            console.log(`[submitStep] askClaudeForHint returned in ${(performance.now()-tH).toFixed(1)}ms:`, hint);
            hideLoading();
            showFeedback('nudge', hint || "That step doesn't look right. Try again!");
            reenableInput();
          } else {
            showFeedback('wrong', "That step doesn't look right. Try again!");
            reenableInput();
          }
        }
      }
      console.log(`[submitStep] total time: ${(performance.now()-t0).toFixed(1)}ms`);
    }

    // ── MCQ answer handler ───────────────────────────────────────────────────
    function submitMCQ(letter) {
      const problem = problems[currentIndex];
      const isCorrect = letter === problem.answer;
      logStep(letter, isCorrect);

      // Flash selected button
      const selectedBtn = elMcqOptions.querySelector(`[data-option="${letter}"]`);
      if (isCorrect) {
        selectedBtn.className = 'pe-mcq-btn pe-mcq-correct';
        // Disable all options
        elMcqOptions.querySelectorAll('.pe-mcq-btn').forEach(function(b) { b.disabled = true; });
        elFeedback.style.display = 'none';
        if (mode === 'test') testResults[currentIndex] = true;
        setTimeout(function() {
          elMcqOptions.style.display = 'none';
          elCompletedCard.style.display = 'block';
          elNextBtn.style.display = 'block';
          elNextBtn.textContent = currentIndex < problems.length - 1 ? 'Next Problem \u2192' : 'Finish \u2713';
        }, 500);
      } else {
        wrongCount++;
        selectedBtn.className = 'pe-mcq-btn pe-mcq-wrong';
        setTimeout(function() { selectedBtn.className = 'pe-mcq-btn'; }, 700);

        if (mode === 'test') {
          if (wrongCount >= 3) {
            testResults[currentIndex] = false;
            elMcqOptions.querySelectorAll('.pe-mcq-btn').forEach(function(b) { b.disabled = true; });
            showFeedback('wrong', 'Incorrect. Moving to the next problem.');
            setTimeout(function() { nextProblem(); }, 1500);
          } else {
            showFeedback('wrong', "That's not correct. Try again!");
          }
        } else {
          // Practice mode: pre-written hints
          const preHints = problem.hints || [];
          if (preHints.length > 0) {
            const hintIdx = Math.min(wrongCount - 1, preHints.length - 1);
            showFeedback('nudge', preHints[hintIdx]);
          } else {
            showFeedback('wrong', "That's not correct. Try again!");
          }
        }
      }
    }

    function nextProblem() {
      if (currentIndex < problems.length - 1) {
        loadProblem(currentIndex + 1);
      } else {
        // All problems done
        if (mode === 'test') {
          const correct   = testResults.filter(r => r === true).length;
          const total     = problems.length;
          // Pass threshold: all correct if ≤ 2 problems, else ≥ 2/3 (rounded up)
          const threshold = total <= 2 ? total : Math.ceil(total * 2 / 3);
          const passed    = correct >= threshold;
          if (onComplete) onComplete({ passed, score: correct, total });
        } else {
          if (onComplete) onComplete({ askRonelProblems });
        }
      }
    }

    // ── Start engine ────────────────────────────────────────────────────────
    renderHTML();

    return {
      destroy() {
        if (_keydownHandler) document.removeEventListener('keydown', _keydownHandler);
        container.innerHTML = '';
        studentCalc = null;
      }
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────────
  let _instance = null;

  window.PracticeEngine = {
    init(config) {
      if (_instance) this.destroy();
      _instance = createInstance(config);
    },
    destroy() {
      if (_instance) {
        _instance.destroy();
        _instance = null;
      }
    }
  };

}());
