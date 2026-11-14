import {author} from '../lib/author';
export const site = {
  name: '凡思筆記',
  author: author.approved && author.name ? author.name : '作者署名待確認',
  description: '在文字、聲音與想像之間，展開一頁新的風景。',
  socialLinks: [] as { label: string; url: string }[],
  comments: { provider: null },
  contact: { provider: null },
};
export const url = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export { topics, series } from '../lib/model.mjs';
export const nav = [
  ['', '首頁'],
  ['articles/', '探索文章'],
  ['series/fansiwei/', '凡思維'],
  ['podcast/', '凡思聲'],
  ['works/', '小說與出版'],
  ['about/', '關於作者'],
];
