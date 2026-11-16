"""Read-only whole-build route, fragment, image-alt and SEO audit (no network)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import xml.etree.ElementTree as ET

ROOT = Path('dist')
BASE = '/fansi-notes/'
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.refs, self.images, self.canonical, self.robots = path, set(), [], [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag in ('a', 'link', 'img', 'script', 'source'):
            value = a.get('href') or a.get('src')
            if value: self.refs.append(value)
        if tag == 'img': self.images.append(a)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'meta' and a.get('name') == 'robots': self.robots.append(a.get('content', ''))

def run():
    pages = {}
    for file in ROOT.rglob('*.html'):
        p = Page(file); p.feed(file.read_text()); pages[file] = p
    assert pages, 'Build must exist before auditing'
    failures, refs, images = [], 0, 0
    def target(path):
        f = ROOT / unquote(path.removeprefix(BASE))
        return f / 'index.html' if f.is_dir() else f
    for file, p in pages.items():
        for href in p.refs:
            u = urlsplit(href)
            if u.scheme or u.netloc: continue
            refs += 1
            if u.path and not u.path.startswith(BASE):
                failures.append(f'{file}: outside base {href}'); continue
            dest = target(u.path) if u.path else file
            if not dest.exists(): failures.append(f'{file}: missing {href}')
            elif u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:
                failures.append(f'{file}: missing fragment {href}')
        for image in p.images:
            images += 1
            if 'alt' not in image: failures.append(f'{file}: missing image alt')
        # Compatibility redirects are not normal reading pages.
        html = file.read_text()
        if 'http-equiv="refresh"' not in html:
            if len(p.canonical) != 1: failures.append(f'{file}: canonical count')
            elif not urlsplit(p.canonical[0]).path.startswith(BASE): failures.append(f'{file}: canonical base')
            if not any('noindex' in x for x in p.robots): failures.append(f'{file}: noindex missing')
    sitemap = ROOT / 'sitemap.xml'
    assert sitemap.exists(), 'Sitemap missing'
    locs = [e.text for e in ET.parse(sitemap).iter() if e.tag.endswith('}loc') or e.tag == 'loc']
    for loc in locs:
        path = urlsplit(loc).path
        if not path.startswith(BASE) or not target(path).exists(): failures.append('sitemap target: '+loc)
        if '/review/' in path or '/admin/' in path: failures.append('private sitemap route: '+loc)
    result = dict(pages=len(pages), local_references=refs, images_with_alt=images, sitemap_entries=len(locs), failures=failures)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return bool(failures)
if __name__ == '__main__': raise SystemExit(run())
