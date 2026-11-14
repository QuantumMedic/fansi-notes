import {matchesSeries, canonicalTopic} from './taxonomy.mjs';
export const normalizeSearch = (text) => text.normalize('NFKC').toLocaleLowerCase();
export function prepareSearch(text, topics, type) { return {text:normalizeSearch(text),topics:new Set(topics.map(t => canonicalTopic(t))),type}; }
export function matchesPrepared(record, {q='',topic='',contentType=''}={}) {
 return matchesSeries(record.type,contentType)&&(!topic||record.topics.has(canonicalTopic(topic)))&&normalizeSearch(q).trim().split(/\s+/).every(term=>record.text.includes(term));
}
export function matchesSearch(text,topics,type,filters={}) {return matchesPrepared(prepareSearch(text,topics,type),filters);}
