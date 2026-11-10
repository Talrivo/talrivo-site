import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildReview, checks, statuses, reviewInquiry } from '../insights/sample-review-tool.mjs';

const blank = buildReview();
assert.equal((blank.match(/Status: Not tested/g) || []).length, 6);
assert.doesNotMatch(blank, /Status: Meets agreed criteria/);
assert.match(blank, /No sample is approved automatically/);
assert.equal(checks.length, 6);
assert.equal(statuses.length, 4);
const text = buildReview({sample:'G946\nSample B',device:'PC <sample>',connection:'2.4GHz / USB-C',
  results:{voice:{status:'Issue to resolve',note:'Mic failed after mode switch'},playback:{status:'Unknown'},fit:{status:'Not applicable'}},
  followup:'Retest the receiver and microphone'});
assert.match(text, /Model \/ sample ID: G946 Sample B/);
assert.match(text, /PC <sample>/);
assert.match(text, /Status: Issue to resolve\nObserved result \/ evidence reference: Mic failed after mode switch/);
assert.match(text, /Status: Not applicable/);
assert.equal((text.match(/Status: Not tested/g)||[]).length,4);
assert.match(buildReview({sample:'x'.repeat(500)}), /Model \/ sample ID: x{300}\nDevice/);
const html=readFileSync('insights/evaluate-gaming-headset-sample-before-bulk-order/index.html','utf8');
assert.match(html, /type="module" src="\.\.\/sample-review-tool\.mjs/);
for (const [id] of checks) {
  assert.ok(html.includes(`name="${id}-status"`));
  assert.ok(html.includes(`name="${id}-note"`));
}
const script=readFileSync('insights/sample-review-tool.mjs','utf8');
assert.doesNotMatch(script,/\.innerHTML|fetch\(|sendBeacon|localStorage|sessionStorage|gtag\(/);
assert.match(script,/output.textContent = buildReview/);
assert.match(html,/<noscript>[\s\S]*?wireless-gaming-headset-sample-review.txt/);
console.log('Sample review checks passed: blank/unknown outcomes remain untested; notes and model version retained; bounded input; text-only output; no storage, transmission or lead event.');

// Exercise the user flow without opening an OS printer dialog or sending data.
const { setupReview } = await import('../insights/sample-review-tool.mjs');
const nodes = new Map();
for (const id of ['input[name="sample"]','#sample-review-inquiry','#sample-review-form','#sample-review-controls','#sample-review-output','#sample-review-status','#sample-review-editor','#sample-review-panel','#sample-review-preview','#sample-review-download','#sample-review-print']) {
  nodes.set(id, {value:'',handlers:{},hidden:true,textContent:'',addEventListener(name, handler){ this.handlers[name]=handler; }});
}
const classes = new Set();
const fakeDoc={querySelector:id=>nodes.get(id),body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}}};
const windowEvents={};
let prints=0;
const fakeWindow={location:{hash:'#sample-review-tool',search:'?model=g936'},addEventListener:(name,handler)=>{windowEvents[name]=handler;},print(){
  prints++;
  assert.ok(classes.has('printing-sample-review'));
  assert.match(nodes.get('#sample-review-output').textContent,/Model \/ sample ID: QA model/);
  windowEvents.afterprint();
}};
const NativeFormData=globalThis.FormData;
try {
  globalThis.FormData=class { get(key){return {'sample':'QA model','voice-status':'Issue to resolve','voice-note':'QA microphone issue'}[key] || '';} };
  setupReview(fakeDoc,fakeWindow);
  assert.equal(nodes.get('#sample-review-panel').open,true);
  assert.equal(nodes.get('input[name="sample"]').value,'G936');
  assert.match(nodes.get('#sample-review-inquiry').href,/product=g936&/);
  nodes.get('input[name="sample"]').value='G938 QA sample';
  nodes.get('input[name="sample"]').handlers.input();
  assert.match(nodes.get('#sample-review-inquiry').href,/product=g938&/);
  assert.equal(nodes.get('#sample-review-controls').disabled,false);
  assert.match(html, /id="sample-review-controls" disabled/);
  nodes.get('#sample-review-preview').handlers.click();
  assert.equal(nodes.get('#sample-review-editor').hidden,false);
  assert.match(nodes.get('#sample-review-output').textContent,/QA microphone issue/);
  nodes.get('#sample-review-print').handlers.click();
  assert.equal(prints,1);
  assert.equal(classes.size,0);
  fakeWindow.print=()=>{throw Error('Printer unavailable');};
  nodes.get('#sample-review-print').handlers.click();
  assert.equal(classes.size,0);
  assert.match(nodes.get('#sample-review-status').textContent,/Download your review instead/);
  let stopped=false;
  nodes.get('#sample-review-form').handlers.submit({preventDefault(){stopped=true;}});
  assert.equal(stopped,true);
} finally {globalThis.FormData=NativeFormData;}
console.log('Review UI checks passed: direct-link opening, populated preview, print-only content, state restoration, print fallback and prevented submission.');

for (const model of ['G936','G938','G946']) {
 assert.match(reviewInquiry(model+' sample A'), new RegExp('product='+model.toLowerCase()+'&'));
}
for (const input of ['G9360','javascript:alert(1)','<script>','Unknown model','Customer email@example.com']) {
 assert.equal(reviewInquiry(input),'/contact/?product=wireless-gaming-headsets&inquiry=quick-question&reference=sample-evaluation-guide#inquiry-form');
}
assert.match(buildReview({sample:'G936 private note'}),/Product inquiry: https:\/\/talrivo.com\/contact\/\?product=g936&/);
assert.doesNotMatch(reviewInquiry('G936 private note'),/private|note/);
console.log('Model context checks passed: known model prefill, edited model destination, unknown-code fallback and no buyer notes in inquiry URLs.');


for (const [folder,model] of [['g935-wireless','g935'],['g941-tri-mode-anc','g941'],['g946-rgb','g946'],['g947-foldable','g947']]) {
  const page=readFileSync(`gaming-headsets/${folder}/index.html`,'utf8');
  assert.ok(page.includes(`evaluate-gaming-headset-sample-before-bulk-order/?model=${model}#sample-review-tool`));
  assert.match(reviewInquiry(model.toUpperCase()),new RegExp(`product=${model}&`));
}
const g946=readFileSync('gaming-headsets/g946-rgb/index.html','utf8');
for (const reference of ['g946-headset-only','g946-wireless-charging-dock']) {
  assert.ok(g946.includes(`product=g946&amp;inquiry=sample&amp;reference=${reference}`));
}
assert.match(g946,/evaluate-gaming-headset-sample-before-bulk-order\/#review-worksheet/);
console.log('Extended model-to-review checks passed; G946 configuration inquiry links and blank worksheet remain available.');
