export function validatePublicationRelations(relations, articles, books) {
  const seen = new Set();
  for (const r of relations) {
    const key = `${r.article_work_id}:${r.publication_work_id}`;
    if (
      r.approved !== true ||
      !articles.some((a) => a.work_id === r.article_work_id) ||
      !books.some((b) => b.work_id === r.publication_work_id) ||
      seen.has(key)
    )
      throw Error('作品關聯必須核准、使用存在的 work_id 且不可重複');
    seen.add(key);
  }
  return relations;
}
