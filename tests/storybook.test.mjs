import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync('src/components/Storybook.astro','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function harness(system=false,fine=true){
 const handlers={},styles=new Map(),attributes=new Map(),frames=new Map();let seq=0;
 const toggle={hidden:true,disabled:false,textContent:'',setAttribute:(k,v)=>attributes.set(k,v),addEventListener:(name,fn)=>handlers[`button:${name}`]=fn};
 const root={dataset:{},style:{setProperty:(k,v)=>styles.set(k,v)},querySelector:()=>toggle,addEventListener:(name,fn)=>handlers[name]=fn,getBoundingClientRect:()=>({left:0,top:0,width:1000,height:800})};
 const media={reduced:{matches:system,addEventListener:(_,fn)=>handlers.system=fn},fine:{matches:fine,addEventListener:(_,fn)=>handlers.fine=fn}};
 vm.runInNewContext(js,{document:{querySelector:()=>root},matchMedia:q=>q.includes('reduced')?media.reduced:media.fine,requestAnimationFrame:fn=>{frames.set(++seq,fn);return seq},cancelAnimationFrame:id=>frames.delete(id)});
 return {root,toggle,media,handlers,styles,attributes,frames,flush:()=>{for(const fn of frames.values())fn();frames.clear()}};
}
test('系統減少動態優先，切換偏好立即停止視差',()=>{const h=harness(true);assert.equal(h.root.dataset.motion,'off');assert.equal(h.toggle.disabled,true);assert.equal(h.attributes.get('aria-pressed'),'true');h.handlers.pointermove({clientX:900,clientY:600,pointerType:'mouse'});assert.equal(h.frames.size,0);h.media.reduced.matches=false;h.handlers.system();assert.equal(h.root.dataset.motion,'on');h.handlers.pointermove({clientX:900,clientY:600,pointerType:'mouse'});h.media.reduced.matches=true;h.handlers.system();assert.equal(h.frames.size,0);assert.equal(h.styles.get('--px'),'0px')});
test('視差合併每幀更新，手動關閉與離開重設；觸控不啟動',()=>{const h=harness();h.handlers.pointermove({clientX:900,clientY:600,pointerType:'mouse'});h.handlers.pointermove({clientX:1000,clientY:800,pointerType:'mouse'});assert.equal(h.frames.size,1);h.flush();assert.equal(h.styles.get('--px'),'4px');assert.equal(h.styles.get('--py'),'2.5px');h.handlers.pointerleave();assert.equal(h.styles.get('--px'),'0px');h.handlers['button:click']();assert.equal(h.root.dataset.motion,'off');h.handlers.pointermove({clientX:900,clientY:600,pointerType:'mouse'});assert.equal(h.frames.size,0);h.handlers['button:click']();h.handlers.pointermove({clientX:900,clientY:600,pointerType:'touch'});assert.equal(h.frames.size,0);h.media.fine.matches=false;h.handlers.pointermove({clientX:900,clientY:600,pointerType:'mouse'});assert.equal(h.frames.size,0)});
test('無 JS 的建置 HTML 仍含五個場景、說明與可用連結',()=>{const html=readFileSync('dist/index.html','utf8');for(const id of ['garden','sound','corridor','kingdom','desk']){assert.match(html,new RegExp(`data-target="${id}"`));assert.match(html,new RegExp(`id="preview-${id}"`))}assert.equal((html.match(/class="scene-link"/g)||[]).length,5);assert.doesNotMatch(html,/<iframe|<audio|<canvas/)});
