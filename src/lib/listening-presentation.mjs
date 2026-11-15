import { spotifyId, safeUrl } from './model.mjs';
import redirects from '../data/listening-redirects.json' with {type:'json'};

// Recognize episode destinations, never titles, show homepages or arbitrary references.
export function listeningDestination(href) {
  const spotify = spotifyId(href);
  if (spotify) return { key: `spotify:${spotify}`, label: '在 Spotify 收聽本集', href };
  if (!safeUrl(href, ['podcasts.apple.com'])) return null;
  const u = new URL(href);
  const show = u.pathname.match(/\/id(\d+)\/?$/)?.[1];
  const episode = u.searchParams.get('i');
  return show && /^\d+$/.test(episode || '')
    ? { key: `apple:${show}:${episode}`, label: '在 Apple Podcasts 收聽本集', href }
    : null;
}

// Relocate standalone episode captions and clearly labelled promotional paragraphs only.
// Source Markdown is untouched; original caption words and URL stay at their position
// as hidden provenance, while the actionable link is rendered once in the footer.
export function importedListeningPresentation(body = '', episodes = []) {
  if (!body.trim().startsWith('<div class="imported-original">'))
    return { html: null, links: [] };
  const links = new Map();
  // Exact verified source URLs only; this evidence never creates a work/GUID relation.
  const destinations = href => {
    const direct = listeningDestination(href);
    if (direct) return [direct];
    const evidence = redirects.find(r => r.source_url === href);
    return evidence ? [evidence.spotify_episode_url, evidence.apple_episode_url].filter(Boolean).map(listeningDestination).filter(Boolean) : [];
  };
  const confirmed = new Set(episodes.flatMap(e => [e.spotify_episode_url, e.apple_episode_url])
    .filter(Boolean).map(href => listeningDestination(href)?.key).filter(Boolean));
  // Repair only a broken promotional link whose visible URL is independently
  // present as a complete href in this same source. Never infer a GUID or title.
  const repaired = body.replace(/<a href="https:\/\/"([^>]*)>(<span>)?(https:\/\/spotifycreators-web\.app\.link\/[^<\s]+)(<\/span>)?<\/a>/g,
    (original, attrs, opening = '', encodedUrl, closing = '') => {
      const decoded = encodedUrl.replaceAll('&amp;', '&');
      return safeUrl(decoded, ['spotifycreators-web.app.link']) && body.includes(`href="${encodedUrl}"`)
        ? `<a href="${encodedUrl}"${attrs}>${opening}${encodedUrl}${closing}</a>` : original;
    });
  let html = repaired.replace(/<figcaption><a href="([^"]+)"(?:\s[^>]*)?>([^<]*)<\/a><\/figcaption>/g,
    (original, encodedHref, text) => {
      const href = encodedHref.replaceAll('&amp;', '&');
      const targets = destinations(href);
      if (!targets.length) return original;
      for (const destination of targets) if (!confirmed.has(destination.key)) links.set(destination.key, links.get(destination.key) || destination);
      return `<figcaption hidden data-original-podcast-link="${encodedHref}">${text}</figcaption>`;
    });
  html = html.replace(/<(p|div)><a href="([^"]+)"(?:\s[^>]*)?>(?:<span>)?([^<]*)(?:<\/span>)?<\/a><\/\1>/g,
    (original, tag, encodedHref, text) => {
      if (!/^(?:歡迎收聽|收聽|聆聽|Podcast|Spotify|Apple Podcasts|https:\/\/)/i.test(text.trim())) return original;
      const targets = destinations(encodedHref.replaceAll('&amp;', '&'));
      if (!targets.length) return original;
      for (const destination of targets) if (!confirmed.has(destination.key)) links.set(destination.key, links.get(destination.key) || destination);
      return `<${tag} hidden data-original-podcast-link="${encodedHref}">${text}</${tag}>`;
    });
  // This exact imported CTA heading belongs to the relocated source link,
  // not to the article's narrative. Preserve its text in hidden provenance.
  if (links.size || confirmed.size) html = html.replace(
    /<h2([^>]*)><span>歡迎至凡思聲收聽完整Podcasts<\/span><\/h2>(?=(?:<div[^>]*>|<picture>|<span hidden data-source-image-position="[^"]*"><\/span>|<\/picture>|<\/div>)*<div hidden data-original-podcast-link=)/g,
    '<h2$1 hidden data-original-podcast-heading><span>歡迎至凡思聲收聽完整Podcasts</span></h2>');
  return { html, links: [...links.values()] };
}
