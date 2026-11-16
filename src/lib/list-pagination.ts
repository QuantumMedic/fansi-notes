import { pageSlice, pageNumbers } from './pagination.mjs';
export function listPagination(root: HTMLElement, list: HTMLElement, status: HTMLElement, size: number) {
 let matches: HTMLElement[] = [], page = 1;
 const buttons = root.querySelector<HTMLElement>('[data-page-buttons]')!;
 const range = root.querySelector<HTMLElement>('[data-page-range]')!;
 status.tabIndex = -1;
 function render() {
  const slice = pageSlice(matches.length, size, page); page = slice.page;
  matches.forEach((row, i) => { row.hidden = i < slice.start || i >= slice.end; });
  root.hidden = matches.length <= size;
  range.textContent = `第 ${slice.start + 1}–${slice.end} 筆，共 ${matches.length} 筆 · 第 ${page}／${slice.pages} 頁`;
  buttons.replaceChildren();
  const button = (label: string, target: number, disabled = false, current = false) => {
   const el = document.createElement('button'); el.type = 'button'; el.textContent = label;
   el.dataset.page = String(target); el.disabled = disabled;
   if(current) el.setAttribute('aria-current','page');
   el.setAttribute('aria-label', /^\d+$/.test(label) ? `第 ${label} 頁` : label);
   buttons.append(el);
  };
  button('← 上一頁',page-1,page===1);
  for(const n of pageNumbers(page,slice.pages)) {
   if(typeof n==='number') button(String(n),n,false,n===page);
   else { const gap=document.createElement('span'); gap.textContent='…'; gap.setAttribute('aria-hidden','true'); buttons.append(gap); }
  }
  button('下一頁 →',page+1,page===slice.pages);
 }
 buttons.addEventListener('click', event => {
  const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button[data-page]');
  if(!button || button.disabled) return;
  page=Number(button.dataset.page); render();
  status.focus({preventScroll:true});
  status.scrollIntoView({block:'start',behavior:'instant'});
 });
 return { update() { matches=[...list.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.hidden); page=1; render(); } };
}
