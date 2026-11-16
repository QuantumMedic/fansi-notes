import {LIMITS,fail,idOK,publicFields} from './shared.mjs';
export const visibleRoot=`c.parent_id IS NULL AND (c.status='published' OR (c.status='deleted' AND EXISTS(SELECT 1 FROM comments r WHERE r.parent_id=c.id AND r.author=1 AND r.status='published')))`;
export async function replies(db,parent,cursor=0){
 const rows=(await db.prepare(`SELECT seq,${publicFields} FROM comments WHERE parent_id=? AND author=1 AND status='published' AND seq>? ORDER BY seq LIMIT ?`).bind(parent,cursor,LIMITS.replies+1).all()).results;
 return {comments:rows.slice(0,LIMITS.replies).map(({seq,...r})=>r),next:rows.length>LIMITS.replies?rows[LIMITS.replies-1].seq:null};
}
export async function readThread(db,thread,url){
 const cursor=Number(url.searchParams.get('cursor')||0),reply=url.searchParams.get('reply'),focus=url.searchParams.get('focus');
 if(!Number.isSafeInteger(cursor)||cursor<0)fail(400,'invalid_cursor');
 if(reply||focus){const id=reply||focus;if(!idOK(id))fail(400,'invalid_id');const row=await db.prepare(`SELECT c.* FROM comments c WHERE c.id=? AND c.thread=? AND ${visibleRoot}`).bind(id,thread).first();if(!row)fail(404,'not_found');if(reply)return replies(db,id,cursor);}
 const rows=(await db.prepare(`SELECT c.seq,${publicFields.split(',').map(x=>'c.'+x).join(',')} FROM comments c WHERE c.thread=? AND ${visibleRoot} AND (?=0 OR c.seq<?) AND (? IS NULL OR c.id=?) ORDER BY c.seq DESC LIMIT ?`).bind(thread,cursor,cursor,focus,focus,LIMITS.roots+1).all()).results;
 const total=(await db.prepare(`SELECT COUNT(*) n FROM comments c WHERE c.thread=? AND ${visibleRoot}`).bind(thread).first()).n;
 const page=rows.slice(0,LIMITS.roots),comments=[];
 for(const {seq,...r} of page)comments.push({...r,replies:await replies(db,r.id)});
 return {comments,total,next:!focus&&rows.length>LIMITS.roots?page.at(-1).seq:null};
}
