#!/usr/bin/env python3
"""Offline validation for repository-native M5-E inputs. No network or third-party packages."""
from pathlib import Path
from urllib.parse import urlparse
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'docs/review/m5e/PUBLICATION_DISPLAY_INPUT.json'
INDEX = ROOT / 'docs/review/m5e/PACKAGE_INDEX.json'


def check(condition, message):
    if not condition:
        raise ValueError(message)


def main():
    raw = DATA.read_bytes()
    data = json.loads(raw)
    index = json.loads(INDEX.read_text(encoding='utf-8'))
    git_blob = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    check(git_blob == index['input_git_blob_sha'], 'Input changed: reconcile approved copy and index before proceeding')
    books = data['publications']
    check(len(books) == 7, 'Expected seven publications')
    for field in ('work_id', 'slug'):
        check(len({b[field] for b in books}) == 7, 'Duplicate ' + field)
        check(all(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', b[field]) for b in books), 'Invalid ' + field)
    check(sorted(b['display_order'] for b in books) == list(range(1, 8)), 'Invalid display order')
    links = [l for b in books for l in b['links']]
    check(len(links) == 18, 'Expected 18 platform link records')
    for book in books:
        check(bool(book['summary']) and bool(book['description']), 'Missing copy')
        check(book['publication_status'] in ('published', 'online'), 'Unexpected publication status')
        check(not book.get('full_text') and not book.get('excerpt'), 'Full text/excerpt not authorized')
        for link in book['links']:
            u = urlparse(link['url'])
            check(u.scheme in ('http', 'https') and bool(u.netloc), 'Invalid external URL')
            check(link['group'] in ('print', 'ebook', 'read'), 'Invalid link group')
        for quote in book['endorsements']:
            check(quote.get('quoted_verbatim') is True and quote.get('by') and quote.get('quote') and quote.get('source_url'), 'Incomplete quotation record')
    covers = [b['cover'] for b in books if b['cover']['mode'] == 'remote']
    check(len(covers) == 6, 'Expected six remote cover sources')
    check(all(c['source_url'].startswith('https://') and c['alt'] for c in covers), 'Invalid remote cover')
    check(books[-1]['cover']['mode'] == 'typographic', 'Data Storm must not have invented cover')
    photo = data['author']['photo']
    path = ROOT / photo['repository_path']
    check(path.is_file(), 'Author photo missing from repository')
    content = path.read_bytes()
    check(hashlib.sha256(content).hexdigest() == photo['sha256'] == index['author_photo']['sha256'], 'Author photo checksum mismatch')
    check(b'ftypavif' in content[:40], 'Invalid AVIF photo header')
    check(index['requires_chat_attachment'] is False, 'Attachment dependency must be absent')
    check(len(data['external_exceptions']) == 4, 'Keep unresolved external-source exceptions visible')
    print('PASS: 7 unique works, 18 URL records, 6 remote cover sources, author AVIF hash, and complete display copy.')
    print('NOT CHECKED: live external URLs, remote cover rendering, website implementation or UI acceptance.')


if __name__ == '__main__':
    main()
