export function matchesSearch(text, topics, type, { q = '', topic = '', contentType = '' } = {}) {
  return (
    (!contentType || type === contentType) &&
    (!topic || topics.includes(topic)) &&
    q
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .every((term) => text.toLocaleLowerCase().includes(term))
  );
}
