#!/usr/bin/env node
// Coordinate resolver tests — run: node scripts/test-coordinates.js
'use strict';
process.chdir(__dirname);
const C=require('../frontend/content/coordinates.js');
let bad=0;
function t(label,params,expect){
  const r=C.resolve(new URLSearchParams(params));
  const got=r?{form:r.form,path:r.lessonPath,key:r.kvKey,pu:r.progress.unit,ps:r.progress.stage}:null;
  const ok=JSON.stringify(got)===JSON.stringify(expect);
  if(!ok)bad++;
  console.log(`${ok?'PASS':'FAIL'} ${label}`);
  if(!ok)console.log('   got  '+JSON.stringify(got)+'\n   want '+JSON.stringify(expect));
}
console.log('── legacy links must keep hitting legacy KV (no live student breaks) ──');
t('PAA/algebra/1','curriculum=PAA&unit=algebra&stage=1',
  {form:'legacy',path:'/lesson/PAA/algebra/1',key:'lesson:PAA:algebra:level1',pu:'algebra',ps:'1'});
t('PAA/aritmetica/3','curriculum=PAA&unit=aritmetica&stage=3',
  {form:'legacy',path:'/lesson/PAA/aritmetica/3',key:'lesson:PAA:aritmetica:level3',pu:'aritmetica',ps:'3'});
t('cambridge legacy &level=','curriculum=cambridge&unit=1&level=1',
  {form:'legacy',path:'/lesson/cambridge/1/1',key:'lesson:cambridge:1:level1',pu:'1',ps:'1'});

console.log('\n── canonical ──');
t('CAMB/s7/expr/N1','frame=CAMB&band=s7&unit=expr&level=N1',
  {form:'canonical',path:'/lesson/CAMB/s7/expr/N1',key:'lesson:CAMB:s7:expr:N1',pu:'CAMB:s7:expr',ps:'N1'});
t('lowercase frame normalises','frame=camb&band=s7&unit=lineq&level=N1',
  {form:'canonical',path:'/lesson/CAMB/s7/lineq/N1',key:'lesson:CAMB:s7:lineq:N1',pu:'CAMB:s7:lineq',ps:'N1'});

console.log('\n── ambiguity: unknown frame + stage must fall to legacy, not canonical ──');
t('unknown frame word','frame=WAT&band=x&unit=algebra&level=1&curriculum=PAA&stage=1',
  {form:'legacy',path:'/lesson/PAA/algebra/1',key:'lesson:PAA:algebra:level1',pu:'algebra',ps:'1'});
t('nothing usable','guest=true',null);

console.log('\n── redirect flag flips one coordinate at a time ──');
C.LEGACY_TO_CANONICAL['PAA/algebra/1'].redirect=true;
t('PAA/algebra/1 after flip','curriculum=PAA&unit=algebra&stage=1',
  {form:'legacy-redirected',path:'/lesson/MEDUCA/g7/expr/N3',key:'lesson:MEDUCA:g7:expr:N3',pu:'algebra',ps:'1'});
C.LEGACY_TO_CANONICAL['PAA/algebra/1'].redirect=false;
t('PAA/algebra/2 unaffected','curriculum=PAA&unit=algebra&stage=2',
  {form:'legacy',path:'/lesson/PAA/algebra/2',key:'lesson:PAA:algebra:level2',pu:'algebra',ps:'2'});

console.log('\n── g10 rows are PROVISIONAL and must ship with redirect:false ──');
['PAA/algebra/5','PAA/algebra/6'].forEach(k=>{
  const ok=C.LEGACY_TO_CANONICAL[k].redirect===false; if(!ok)bad++;
  console.log(`${ok?'PASS':'FAIL'} ${k} redirect=false`);
});
console.log(bad?`\n${bad} FAILED`:'\nAll coordinate cases pass.');
process.exit(bad?1:0);
