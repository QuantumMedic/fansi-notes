export function compareBrowse(a,b,mode='newest'){
 if(mode==='popular'){
  if(a.rank==null&&b.rank!=null)return 1;if(b.rank==null&&a.rank!=null)return -1;
  if(a.rank!=null&&b.rank!=null&&a.rank!==b.rank)return a.rank-b.rank;
 }
 return (b.date-a.date)*(mode==='oldest'?-1:1)||a.id.localeCompare(b.id);
}
