// calculator.js — shared math keyboard
// Usage: const calc = attachCalculator(inputEl, containerEl [, { onSubmit }])
// Returns: { setTarget(el), clear(), closePanels() }

(function () {
  const CSS = `
.calc-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.calc-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.calc-row {
  display: flex;
  gap: 6px;
}
.calc-row .calc-btn {
  flex: 1;
  min-width: 0;
}
.calc-btn {
  min-height: 48px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border, #E8E8E4);
  border-radius: 8px;
  font-family: var(--mono, monospace);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  background: var(--card, #FFFFFF);
  color: var(--text, #1A1A1A);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.1s, transform 0.08s, border-color 0.1s;
}
.calc-btn:hover  { background: #EBEBEA; }
.calc-btn:active { background: #DCDCDA; transform: scale(0.95); }
.calc-btn.num { background: #F5F5F3; }
.calc-btn.num:hover  { background: #EBEBEA; }
.calc-btn.num:active { background: #DCDCDA; transform: scale(0.95); }
.calc-btn.op { background: var(--accent-bg, #F0FAF3); color: var(--accent, #2D6A4F); border-color: var(--accent-light, #D8F3DC); }
.calc-btn.op:hover  { background: #E3F7EB; }
.calc-btn.op:active { background: #C8EDD5; transform: scale(0.95); }
.calc-btn.var { background: #EEF2FF; color: #4338CA; border-color: #C7D2FE; }
.calc-btn.var:hover  { background: #E2E8FF; }
.calc-btn.var:active { background: #C7D2FE; transform: scale(0.95); }
.calc-btn.special { background: #FFF8E7; color: #92680D; border-color: #F0D897; }
.calc-btn.special:hover  { background: #FFF0CC; }
.calc-btn.special:active { background: #F0D897; transform: scale(0.95); }
.calc-btn.backspace { background: var(--wrong-bg, #FDE8E6); color: var(--wrong, #C1453B); border-color: #F5C6C3; font-size: 1.1rem; }
.calc-btn.backspace:hover  { background: #FAD0CD; }
.calc-btn.backspace:active { background: #F0ACAA; transform: scale(0.95); }
.calc-btn.submit {
  background: var(--accent, #2D6A4F);
  color: white;
  border-color: var(--accent, #2D6A4F);
  font-family: var(--sans, sans-serif);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
}
.calc-btn.submit:hover  { background: #265E44; }
.calc-btn.submit:active { background: #1E4D38; transform: scale(0.95); }
.calc-toggles {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}
.toggle-btn {
  padding: 6px 16px;
  border: 1.5px solid var(--border, #E8E8E4);
  border-radius: 20px;
  background: var(--card, #FFFFFF);
  font-family: var(--sans, sans-serif);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-secondary, #6B6B6B);
  transition: background 0.1s, border-color 0.1s, color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.toggle-btn:hover  { background: var(--accent-bg, #F0FAF3); border-color: var(--accent, #2D6A4F); color: var(--accent, #2D6A4F); }
.toggle-btn:active { background: var(--accent-light, #D8F3DC); border-color: var(--accent, #2D6A4F); color: var(--accent, #2D6A4F); transform: scale(0.95); }
.toggle-btn.active { background: var(--accent-bg, #F0FAF3); border-color: var(--accent, #2D6A4F); color: var(--accent, #2D6A4F); font-weight: 600; }
.toggle-btn.active:hover  { background: #E3F7EB; }
.toggle-btn.active:active { background: var(--accent-light, #D8F3DC); transform: scale(0.95); }
.calc-panel {
  display: none;
  background: #F2F2EF;
  border: 1.5px solid var(--border, #E8E8E4);
  border-radius: 10px;
  padding: 8px;
}
.panel-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.panel-buttons .calc-btn {
  flex: 0 1 calc(14.28% - 6px);
  min-width: 44px;
  min-height: 44px;
  font-size: 0.95rem;
}
.frac-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
  gap: 1px;
  pointer-events: none;
}
.frac-icon .fi-n {
  border-bottom: 1.5px solid currentColor;
  padding: 0 3px;
  font-size: 0.72em;
}
.frac-icon .fi-d {
  padding: 0 3px;
  font-size: 0.72em;
}
@media (max-width: 500px) {
  .calc-btn { min-height: 44px; font-size: 0.95rem; }
  .panel-buttons .calc-btn { min-height: 40px; }
}
`;

  function injectStyles() {
    if (document.getElementById('calc-module-styles')) return;
    const s = document.createElement('style');
    s.id = 'calc-module-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function buildHTML(withSubmit) {
    const submitRow = withSubmit
      ? `<div class="calc-row"><button class="calc-btn submit" data-submit>Check ✓</button></div>`
      : '';

    return `
<div class="calc-main">
  <div class="calc-row">
    <button class="calc-btn num" data-insert="7">7</button>
    <button class="calc-btn num" data-insert="8">8</button>
    <button class="calc-btn num" data-insert="9">9</button>
    <button class="calc-btn backspace" data-backspace>⌫</button>
  </div>
  <div class="calc-row">
    <button class="calc-btn num" data-insert="4">4</button>
    <button class="calc-btn num" data-insert="5">5</button>
    <button class="calc-btn num" data-insert="6">6</button>
    <button class="calc-btn op"  data-insert=" + ">+</button>
    <button class="calc-btn op"  data-insert=" - ">−</button>
  </div>
  <div class="calc-row">
    <button class="calc-btn num" data-insert="1">1</button>
    <button class="calc-btn num" data-insert="2">2</button>
    <button class="calc-btn num" data-insert="3">3</button>
    <button class="calc-btn op"  data-insert=" × ">×</button>
    <button class="calc-btn op"  data-insert=" / ">÷</button>
  </div>
  <div class="calc-row">
    <button class="calc-btn num" data-insert="0">0</button>
    <button class="calc-btn num" data-insert=".">.</button>
    <button class="calc-btn op"  data-insert="(">(</button>
    <button class="calc-btn op"  data-insert=")">)</button>
  </div>
  <div class="calc-row">
    <button class="calc-btn var" data-insert="x">x</button>
    <button class="calc-btn var" data-insert="y">y</button>
    <button class="calc-btn var" data-insert="z">z</button>
    <button class="calc-btn var" data-insert="a">a</button>
    <button class="calc-btn var" data-insert="b">b</button>
    <button class="calc-btn var" data-insert="c">c</button>
  </div>
  <div class="calc-row">
    <button class="calc-btn special" data-insert="²">²</button>
    <button class="calc-btn special" data-insert="³">³</button>
    <button class="calc-btn special" data-insert="^">^</button>
    <button class="calc-btn op"      data-insert=" = ">=</button>
    <button class="calc-btn op"      data-insert=" ">space</button>
  </div>
  ${submitRow}
</div>

<div class="calc-toggles">
  <button class="toggle-btn" data-toggle="abc">abc</button>
  <button class="toggle-btn" data-toggle="ops">ops</button>
  <button class="toggle-btn" data-toggle="greek">αβ</button>
  <button class="toggle-btn" data-toggle="ans">ans</button>
</div>

<div class="calc-panel" data-panel="abc">
  <div class="panel-buttons">
    <button class="calc-btn var" data-insert="d">d</button>
    <button class="calc-btn var" data-insert="e">e</button>
    <button class="calc-btn var" data-insert="f">f</button>
    <button class="calc-btn var" data-insert="g">g</button>
    <button class="calc-btn var" data-insert="h">h</button>
    <button class="calc-btn var" data-insert="i">i</button>
    <button class="calc-btn var" data-insert="j">j</button>
    <button class="calc-btn var" data-insert="k">k</button>
    <button class="calc-btn var" data-insert="l">l</button>
    <button class="calc-btn var" data-insert="m">m</button>
    <button class="calc-btn var" data-insert="n">n</button>
    <button class="calc-btn var" data-insert="o">o</button>
    <button class="calc-btn var" data-insert="p">p</button>
    <button class="calc-btn var" data-insert="q">q</button>
    <button class="calc-btn var" data-insert="r">r</button>
    <button class="calc-btn var" data-insert="s">s</button>
    <button class="calc-btn var" data-insert="t">t</button>
    <button class="calc-btn var" data-insert="u">u</button>
    <button class="calc-btn var" data-insert="v">v</button>
    <button class="calc-btn var" data-insert="w">w</button>
  </div>
</div>

<div class="calc-panel" data-panel="ops">
  <div class="panel-buttons">
    <button class="calc-btn special" data-frac title="Fraction">
      <span class="frac-icon"><span class="fi-n">a</span><span class="fi-d">b</span></span>
    </button>
    <button class="calc-btn special" data-insert="√">√</button>
    <button class="calc-btn special" data-insert="⁴">⁴</button>
    <button class="calc-btn special" data-insert="⁵">⁵</button>
    <button class="calc-btn special" data-insert="⁶">⁶</button>
    <button class="calc-btn special" data-insert="⁷">⁷</button>
    <button class="calc-btn special" data-insert="⁸">⁸</button>
    <button class="calc-btn special" data-insert="⁹">⁹</button>
    <button class="calc-btn op"      data-insert=" = ">=</button>
    <button class="calc-btn op"      data-insert=" ≠ ">≠</button>
    <button class="calc-btn op"      data-insert=" ≤ ">≤</button>
    <button class="calc-btn op"      data-insert=" ≥ ">≥</button>
    <button class="calc-btn op"      data-insert=" ± ">±</button>
  </div>
</div>

<div class="calc-panel" data-panel="greek">
  <div class="panel-buttons">
    <button class="calc-btn special" data-insert="α">α</button>
    <button class="calc-btn special" data-insert="β">β</button>
    <button class="calc-btn special" data-insert="θ">θ</button>
    <button class="calc-btn special" data-insert="π">π</button>
    <button class="calc-btn special" data-insert="Δ">Δ</button>
    <button class="calc-btn special" data-insert="λ">λ</button>
    <button class="calc-btn special" data-insert="μ">μ</button>
  </div>
</div>

<div class="calc-panel" data-panel="ans">
  <div class="panel-buttons">
    <button class="calc-btn op" data-insert="x = " style="flex:1 1 auto;">x =</button>
    <button class="calc-btn op" data-insert="y = " style="flex:1 1 auto;">y =</button>
    <button class="calc-btn op" data-insert=", " style="flex:1 1 auto;">,</button>
    <button class="calc-btn op" data-insert="x = , x = " style="flex:1 1 100%;">x = N, x = N</button>
  </div>
</div>
`;
  }

  window.attachCalculator = function (inputEl, containerEl, options) {
    options = options || {};
    injectStyles();

    containerEl.classList.add('calc-wrapper');
    containerEl.innerHTML = buildHTML(!!options.onSubmit);

    var target = inputEl;

    function insert(symbol) {
      if (!target) return;
      var el = target;
      var start = el.selectionStart;
      var end   = el.selectionEnd;
      var val   = el.value;
      el.value  = val.slice(0, start) + symbol + val.slice(end);
      var newPos = start + symbol.length;
      el.setSelectionRange(newPos, newPos);
      el.focus();
    }

    // Inserts a fraction template ()/(). Positions cursor inside the numerator.
    function insertFrac() {
      if (!target) return;
      var el    = target;
      var start = el.selectionStart;
      var end   = el.selectionEnd;
      var val   = el.value;
      var tpl   = '()/()';
      el.value  = val.slice(0, start) + tpl + val.slice(end);
      // Place cursor after the opening '(' of the numerator
      el.setSelectionRange(start + 1, start + 1);
      el.focus();
    }

    function backspace() {
      if (!target) return;
      var el    = target;
      var start = el.selectionStart;
      var end   = el.selectionEnd;
      if (start === 0 && end === 0) return;
      if (start !== end) {
        el.value = el.value.slice(0, start) + el.value.slice(end);
        el.setSelectionRange(start, start);
      } else {
        el.value = el.value.slice(0, start - 1) + el.value.slice(start);
        el.setSelectionRange(start - 1, start - 1);
      }
      el.focus();
    }

    function closePanels() {
      containerEl.querySelectorAll('[data-panel]').forEach(function (p) {
        p.style.display = 'none';
      });
      containerEl.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.classList.remove('active');
      });
    }

    // Insert buttons
    containerEl.querySelectorAll('[data-insert]').forEach(function (btn) {
      btn.addEventListener('click', function () { insert(btn.dataset.insert); });
    });

    // Fraction template button
    containerEl.querySelectorAll('[data-frac]').forEach(function (btn) {
      btn.addEventListener('click', insertFrac);
    });

    // Backspace
    var bsBtn = containerEl.querySelector('[data-backspace]');
    if (bsBtn) bsBtn.addEventListener('click', backspace);

    // Submit (optional)
    if (options.onSubmit) {
      var submitBtn = containerEl.querySelector('[data-submit]');
      if (submitBtn) submitBtn.addEventListener('click', options.onSubmit);
    }

    // Toggle panels
    containerEl.querySelectorAll('[data-toggle]').forEach(function (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var name = toggleBtn.dataset.toggle;
        containerEl.querySelectorAll('[data-panel]').forEach(function (panel) {
          var pname = panel.dataset.panel;
          var btn   = containerEl.querySelector('[data-toggle="' + pname + '"]');
          if (pname === name) {
            var nowOpen = panel.style.display !== 'block';
            panel.style.display = nowOpen ? 'block' : 'none';
            btn.classList.toggle('active', nowOpen);
          } else {
            panel.style.display = 'none';
            if (btn) btn.classList.remove('active');
          }
        });
      });
    });

    return {
      setTarget: function (el) { target = el; },
      clear:     function ()   { if (target) target.value = ''; },
      closePanels: closePanels,
    };
  };
}());
