import {readFileSync,writeFileSync,mkdirSync,renameSync,existsSync,rmSync,realpathSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {z} from 'zod';
import {articleSchema,validateCatalog} from '../src/lib/model.mjs';
import {publicationSchema,validatePublications} from '../src/lib/publications.mjs';
const item=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('article'),metadata:articleSchema,body:z.string().min(1),source_url:z.url().optional(),public_authorization:z.literal(true)}).strict(),
 z.object({kind:z.literal('publication'),metadata:publicationSchema,source_url:z.url().optional(),public_authorization:z.literal(true)}).strict()
]);
export function planImport(input,{allowPublic=false,existingIds=[]}={}){
 const manifest=z.object({version:z.literal(1),items:z.array(item).min(1)}).strict().parse(input);
 const ids=new Set(existingIds),paths=new Set(),files={};const books=[];
 for(const row of manifest.items){const m=row.metadata;if(!m.synthetic&&!allowPublic)throw Error('正式作品需 M5-B 明確授權及 --allow-public');if(ids.has(m.work_id))throw Error('重複作品 ID，請走既有作品更新流程');ids.add(m.work_id);
 const path=row.kind==='article'?`articles/${m.slug}.md`:`publications/${m.slug}.json`;if(paths.has(path))throw Error('重複路由');paths.add(path);
 if(row.kind==='article')files[path]=`---\n${JSON.stringify(m)}\n---\n${row.body}\n`;else books.push(m);
 }
 validateCatalog(manifest.items.filter(x=>x.kind==='article').map(x=>x.metadata));validatePublications(books);
 if(books.length)files['publications.json']=JSON.stringify(books,null,2)+'\n';
 return files;
}
export function writeStage(files,output){const dest=resolve(output);const repo=realpathSync(new URL('..',import.meta.url));const parent=realpathSync(dirname(dest));if(parent===repo||parent.startsWith(repo+'/'))throw Error('輸出必須位於 Repository 外');if(existsSync(dest))throw Error('不覆寫既有匯入目錄');const temp=dest+'.staging-'+process.pid;if(existsSync(temp))throw Error('暫存目錄已存在');try{mkdirSync(temp);for(const [path,body] of Object.entries(files)){mkdirSync(dirname(join(temp,path)),{recursive:true});writeFileSync(join(temp,path),body,{flag:'wx'});}renameSync(temp,dest);}catch(e){rmSync(temp,{recursive:true,force:true});throw e;}}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{const args=process.argv.slice(2);const input=args[0];if(!input)throw Error('用法：node scripts/import-batch.mjs 清冊.json [--output 外部新目錄] [--allow-public]');const files=planImport(JSON.parse(readFileSync(input,'utf8')),{allowPublic:args.includes('--allow-public')});const pos=args.indexOf('--output');if(pos>=0){if(!args[pos+1])throw Error('缺少輸出目錄');writeStage(files,args[pos+1]);}console.log(JSON.stringify({valid:true,files:Object.keys(files).length,written:pos>=0}));}catch{console.error('匯入未完成：請檢查清冊格式、核准欄位、ID、日期與全新外部輸出目錄；未輸出稿件內容。');process.exitCode=1;}}
