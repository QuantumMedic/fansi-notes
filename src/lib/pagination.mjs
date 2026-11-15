export function pageSlice(total, size, requested = 1) {
 const pages = Math.max(1, Math.ceil(total / size));
 const page = Math.min(pages, Math.max(1, Math.trunc(requested) || 1));
 return { page, pages, start: (page - 1) * size, end: Math.min(page * size, total) };
}
export function pageNumbers(page, pages) {
 const numbers = [...new Set([1, pages, page - 1, page, page + 1])].filter(n => n >= 1 && n <= pages).sort((a,b)=>a-b);
 const result=[];
 for (const n of numbers) { const previous=result.at(-1); if(typeof previous==='number' && n-previous>1) result.push(n-previous===2?previous+1:'…'); result.push(n); }
 return result;
}
