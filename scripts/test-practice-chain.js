#!/usr/bin/env node
'use strict';
/**
 * End-to-end: home link -> lesson params -> app.html params -> resolved problems.
 * This is the chain that was silently broken for Cambridge: every hop looked fine
 * in isolation, and the handoff between them dropped the coordinate.
 * Run: node scripts/test-practice-chain.js
 */
const path=require('path'),fs=require('fs'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let bad=0;
const t=(l,got,want)=>{const ok=JSON.stringify(got)===JSON.stringify(want);if(!ok)bad++;
  console.log(`${ok?'PASS':'FAIL'} ${l}`);if(!ok)console.log('   got  '+JSON.stringify(got)+'\n   want '+JSON.stringify(want));};

// Load the browser modules the way a page does.
const win={};
const ctx=vm.createContext({window:win,console,URLSearchParams,fetch:undefined,module:undefined});
for(const f of ['frontend/content/coordinates.js','frontend/content/frames/meduca.js',
                'frontend/content/frames/camb.js','frontend/content/frames/index.js',
                'frontend/content/seed-paa-algebra.js','frontend/content/seed-cambridge-s7.js',
                'frontend/content/seed-registry.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
}
const C=win.Coordinates, R=win.FrameRegistry, S=win.SeedRegistry;
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'frontend/content/lesson-manifest.json'),'utf8'));

console.log('── 1. home builds the level link from the account ──');
const rows=R.bandLevels('CAMB',R.getBand('CAMB','s7'),{},manifest);
const target=rows.find(r=>r.unit.id==='lineq');
const homeQuery=C.toQuery(target.coord,{student:'ron'});
t('home emits canonical params', homeQuery, 'frame=CAMB&band=s7&unit=lineq&level=N1&student=ron');

console.log('\n── 2. lesson.html resolves them ──');
const lc=C.resolve(new URLSearchParams(homeQuery));
t('form is canonical', lc.form, 'canonical');
t('fetches the right KV path', lc.lessonPath, '/lesson/CAMB/s7/lineq/N1');
t('progress key', `${lc.progress.unit}|${lc.progress.stage}`, 'CAMB:s7:lineq|N1');

console.log('\n── 3. lesson.html hands app.html the SAME form (the broken hop) ──');
// mirrors coordParams() in lesson.html
const coordParams = lc.form==='canonical'
  ? {frame:lc.canonical.frame,band:lc.canonical.band,unit:lc.canonical.unit,level:lc.canonical.level}
  : {curriculum:'?',unit:'?',stage:'?'};
const appQuery=new URLSearchParams(Object.assign({},coordParams,{mode:'practice'})).toString();
t('app.html gets canonical params', appQuery, 'frame=CAMB&band=s7&unit=lineq&level=N1&mode=practice');
const ac=C.resolve(new URLSearchParams(appQuery));
t('app.html re-resolves it', ac && ac.form, 'canonical');

console.log('\n── 4. the practice engine finds problems ──');
const probs=S.forCoord(ac.canonical);
t('6 problems at CAMB/s7/lineq/N1', probs.length, 6);
t('all English (no PAA leakage)', probs.every(p=>/^[\x00-\x7F]*$/.test(p.question.replace(/[−×÷]/g,''))), true);
t('every problem has an answer', probs.every(p=>!!p.answer), true);
t('every problem has 3 hints', probs.every(p=>p.hints.length===3), true);
console.log('   sample:', probs[0].question, '->', probs[0].answer);

console.log('\n── 5. lesson record ordering wins when present ──');
const built=require('child_process').execSync(`node ${path.join(ROOT,'scripts/build-lessons.js')} CAMB s7 --out /tmp/chain`,{cwd:ROOT}).toString();
const rec=JSON.parse(fs.readFileSync('/tmp/chain/lesson_CAMB_s7_lineq_N1.json','utf8'));
const ordered=S.byIds(rec.practiceProblems);
t('byIds resolves every listed problem', ordered.length, rec.practiceProblems.length);
t('order matches the record', ordered.map(p=>p.id), rec.practiceProblems);

console.log('\n── 6. legacy PAA path is untouched ──');
const pc=C.resolve(new URLSearchParams('curriculum=PAA&unit=algebra&stage=1'));
t('still legacy', pc.form, 'legacy');
t('still legacy KV key', pc.kvKey, 'lesson:PAA:algebra:level1');
t('PAA seeds still resolve', S.forLegacy('U1','N1').length, 6);
t('PAA seeds are Spanish', /[áéíóúñ¿]/i.test(S.forLegacy('U1','N1').map(p=>p.question).join('')), true);

console.log(bad?`\n${bad} FAILED`:'\nPractice chain intact end to end.');
process.exit(bad?1:0);
