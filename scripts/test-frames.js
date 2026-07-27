#!/usr/bin/env node
'use strict';
// Frame resolution + home page level model. Run: node scripts/test-frames.js
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window={Frames:{}};
window.Frames.MEDUCA=require(path.join(ROOT,'frontend/content/frames/meduca.js'));
window.Frames.CAMB  =require(path.join(ROOT,'frontend/content/frames/camb.js'));
const R=require(path.join(ROOT,'frontend/content/frames/index.js'));
let bad=0;
const t=(l,got,want)=>{const ok=JSON.stringify(got)===JSON.stringify(want);if(!ok)bad++;
  console.log(`${ok?'PASS':'FAIL'} ${l}`);if(!ok)console.log('   got  '+JSON.stringify(got)+'\n   want '+JSON.stringify(want))};
const key=r=>r?`${r.frame}/${r.band}`:null;

console.log('── account decides the curriculum ──');
t('canonical frame+band',      key(R.resolveStudentFrame({frame:'CAMB',band:'s7'})),'CAMB/s7');
t('legacy cambridge + grade 7',key(R.resolveStudentFrame({curriculum:'cambridge',grade:'7'})),'CAMB/s7');
t('legacy meduca + grade 9',   key(R.resolveStudentFrame({curriculum:'meduca',grade:'9'})),'MEDUCA/g9');
t('PAA falls through (retired)',key(R.resolveStudentFrame({curriculum:'PAA',grade:'1'})),null);
t('unknown band → legacy path',key(R.resolveStudentFrame({frame:'CAMB',band:'s99'})),null);
t('no curriculum at all',      key(R.resolveStudentFrame({})),null);
t('frame not yet authored',    key(R.resolveStudentFrame({curriculum:'ib-myp',grade:'1'})),null);

console.log('\n── level gating on CAMB/s7 ──');
const band=R.getBand('CAMB','s7');
const rows0=R.bandLevels('CAMB',band,{});
console.log('  units×levels:',rows0.map(r=>`${r.unit.id}/${r.level.id}:${r.state}`).join('  '));
t('fresh account: first level open', rows0[0].state,'available');
t('fresh account: second locked',    rows0[1].state,'locked');
t('lesson coord is canonical', rows0[0].coord, {frame:'CAMB',band:'s7',unit:'expr',level:'N1'});

const rows1=R.bandLevels('CAMB',band,{'CAMB:s7:expr':{N1:'complete'}});
t('completing N1 unlocks N2', rows1[1].state,'available');
t('N1 shows complete',        rows1[0].state,'complete');
t('N3 still locked',          rows1[2].state,'locked');

console.log('\n── progress key must match what coordinates.js emits ──');
const C=require(path.join(ROOT,'frontend/content/coordinates.js'));
const r=C.resolve(new URLSearchParams('frame=CAMB&band=s7&unit=expr&level=N1'));
t('progress key agreement', `${r.progress.unit}|${r.progress.stage}`, 'CAMB:s7:expr|N1');


console.log('\n── manifest filtering: unseeded levels must not render ──');
const fs2=require('fs');
const man=JSON.parse(fs2.readFileSync(path.join(ROOT,'frontend/content/lesson-manifest.json'),'utf8'));
const filtered=R.bandLevels('CAMB',R.getBand('CAMB','s7'),{},man);
console.log('  rendered:',filtered.map(r=>`${r.unit.id}/${r.level.id}`).join('  '));
const hasSeq=filtered.some(r=>r.unit.id==='seq');
t('seq/N1 (no seeds) is hidden', hasSeq, false);
t('exactly 3 published levels', filtered.length, 3);
t('first published level open', filtered[0].state, 'available');


console.log(bad?`\n${bad} FAILED`:'\nAll frame cases pass.');
process.exit(bad?1:0);
