import { z } from 'zod';
import taxonomy from '../data/taxonomy.json' with { type: 'json' };
export const { series, topics, public_series: publicSeries } = taxonomy;
export const topicAliases = taxonomy.topic_aliases;
export const canonicalTopic = (id, registry = taxonomy) => registry.topic_aliases?.[id] || id;
export const publicSeriesSlug = (type) => publicSeries.find(s => s.types.includes(type) || s.slug === type)?.slug || type;
export const matchesSeries = (type, selected) => !selected || (publicSeries.find(s => s.slug === selected)?.types.includes(type) ?? type === selected);
export const makeClassificationSchema = (registry = taxonomy) =>
  z.object({
    content_type: z
      .string()
      .refine((v) => registry.series.some((x) => x.slug === v), '未知作品系列'),
    topics: z
      .array(z.string().transform((v) => canonicalTopic(v, registry)).refine((v) => registry.topics.some((x) => x.slug === v), '未知主題'))
      .min(1, '主要主題必填')
      .max(2, '最多一個次要主題')
      .refine((v) => new Set(v).size === v.length, '主次主題不可重複'),
    keywords: z.array(z.string().min(1)).default([]),
  });
export const classificationSchema = makeClassificationSchema();
export const seriesName = (id) => publicSeries.find((x) => x.slug === publicSeriesSlug(id))?.name || '系列待確認';
export const topicName = (id) => topics.find((x) => x.slug === canonicalTopic(id))?.name || id;
export const statusName = (status) =>
  ({
    demo: '合成測試分類',
    proposed: '分類建議・待審核',
    confirmed: '分類已確認',
    pending: '分類待確認',
  })[status];
