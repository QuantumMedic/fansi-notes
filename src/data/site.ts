import {interactions} from '../lib/interaction-config.ts';
import {author} from '../lib/author';
export const site = {
  name: '凡思筆記',
  author: author.approved && author.name ? author.name : '作者署名待確認',
  description: '在文字、聲音與想像之間，展開一頁新的風景。',
  socialLinks: author.approved && author.social_links.length ? author.social_links.map(link=>({...link,label:`${link.label} ↗`})) : [{ label: 'Instagram · @sci_fang2000 ↗', url: 'https://www.instagram.com/sci_fang2000/' }],
  comments: { provider: interactions.comments.enabled?'cloudflare':null },
  contact: { provider: interactions.contact.enabled?'formspree':null },
};
export const url = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export { topics, publicSeries as series } from '../lib/taxonomy.mjs';
export const nav = [
  ['', '首頁'],
  ['articles/', '探索文章'],
  ['series/fansiwei/', '凡思維'],
  ['podcast/', '凡思聲'],
  ['works/', '小說與出版'],
  ['about/', '關於作者'],
];
