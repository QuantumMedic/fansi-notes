import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {audit} from '../scripts/launch/release.mjs';
const name='googlee2f2c632a5a88e90.html';
const originalHash='657f46f8d0eea4175b9b4cfa19e8ff579568a418ea8fc31bf9811d28e4dc5ada';
test('Google ownership original bytes remain in public and every Astro build',()=>{
 const original=readFileSync('public/'+name);
 assert.equal(createHash('sha256').update(original).digest('hex'),originalHash);
 assert.deepEqual(readFileSync('dist/'+name),original);
 assert.ok(!readFileSync('dist/sitemap.xml','utf8').includes(name));
});
test('Release metadata exemption is limited to exact Google filename and original bytes',()=>{
 const dir=mkdtempSync(join(tmpdir(),'fansi-google-proof-'));
 try {
  const original=readFileSync('public/'+name);writeFileSync(join(dir,name),original);
  assert.deepEqual(audit(dir,'index'),[]);assert.deepEqual(audit(dir,'noindex'),[]);
  writeFileSync(join(dir,name),Buffer.concat([original,Buffer.from('modified')]));
  assert.ok(audit(dir,'index').some(x=>x.includes('canonical')));
  writeFileSync(join(dir,name),original);writeFileSync(join(dir,'other.html'),original);
  assert.ok(audit(dir,'index').some(x=>x==='other.html: canonical'));
 } finally {rmSync(dir,{recursive:true,force:true});}
});
