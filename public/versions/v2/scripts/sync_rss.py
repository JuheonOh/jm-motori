#!/usr/bin/env python3
"""Normalize JM MOTORI RSS into the demo feed. Python 3.10+, no dependencies.

Default: parse data/source-snapshot.xml, offline.
--fetch: retrieve the fixed public Naver RSS URL, then normalize it.
--input: parse a local XML file. Existing feed stays untouched on parse failure.
Run build.py afterward to include changes in index.html.
"""
from __future__ import annotations
import argparse
from collections import Counter
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
RSS_URL = 'https://rss.blog.naver.com/ablymotors.xml'
MAX_BYTES = 4 * 1024 * 1024
KST = timezone(timedelta(hours=9))
FILTERS = [
 ('warning','경고등',r'경고등|구동장치이상|체크등|미립자필터이상'),
 ('vibration','진동 · 소음',r'진동|소음|공명음|울컥|찌그덕'),
 ('leak','누유 · 냉각',r'누유|누수|냉각수|부동액|과열|하우징|워터펌프'),
 ('oil','오일 · 미션',r'오일교환|오일 교환|변속기오일서비스|변속기오일 서비스|메인터넌스'),
 ('diesel','DPF · EGR',r'DPF|EGR|터보|흡기매니폴드'),
 ('brake','브레이크',r'브레이크|디스크|패드'),
]

class PreviewParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.text: list[str] = []
        self.image = ''
        self.skip = 0
    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in ('script','style'): self.skip += 1
        if tag == 'img' and not self.image:
            url = dict(attrs).get('src') or ''
            host = urlparse(url).hostname or ''
            if url.startswith('https://') and (host.endswith('.pstatic.net') or host.endswith('.phinf.naver.net')):
                self.image = url
    def handle_endtag(self, tag: str) -> None:
        if tag in ('script','style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, data: str) -> None:
        if not self.skip: self.text.append(data)

def identify_brand(title: str) -> str:
    for pattern, name in [(r'미니|MINI','MINI'),(r'BMW','BMW'),(r'벤츠|AMG','Mercedes-Benz'),(r'포르쉐|박스터','Porsche'),(r'아우디','Audi'),(r'카니발','Kia'),(r'랭글러','Jeep')]:
        if re.search(pattern, title, re.I): return name
    return 'Other'

def identify_model(title: str, brand: str) -> str:
    # Unknown models stay unknown. Do not infer chassis codes from unrelated tags.
    match = re.search(r'(?<![A-Za-z0-9])(?:[FRWG]\d{2,3}(?:S)?|X[1-7]|\d{3}[dDiI]|6GT|718|Q[3-8]|S400|S350|A220|GLE63)(?!\d)',title,re.I)
    parts = [brand.upper() if brand != 'Other' else 'WORKSHOP RECORD']
    if match: parts.append(match.group().upper())
    if '컨트리맨' in title: parts.append('COUNTRYMAN')
    if '클럽맨' in title: parts.append('CLUBMAN')
    if '박스터' in title: parts.append('BOXSTER')
    return ' '.join(parts)

def parse_feed(raw: bytes, overrides: dict, fetched: bool) -> dict:
    if len(raw) > MAX_BYTES: raise ValueError('RSS exceeds the 4 MB limit')
    if re.search(br'<!\s*(?:DOCTYPE|ENTITY)', raw, re.I): raise ValueError('DTD/entity declarations are not accepted')
    doc = ET.fromstring(raw)
    if doc.tag != 'rss': raise ValueError('Not an RSS document')
    channel = doc.find('channel')
    if channel is None: raise ValueError('Missing RSS channel')
    posts: dict[str,dict] = {}
    skipped = 0
    for item in channel.findall('item'):
        title = (item.findtext('title') or '').strip()
        url = (item.findtext('guid') or item.findtext('link') or '').strip()
        parsed = urlparse(url)
        match = re.fullmatch(r'/ablymotors/(\d+)',parsed.path)
        if not title or parsed.hostname != 'blog.naver.com' or not match:
            skipped += 1; continue
        ident = match.group(1)
        try:
            when = parsedate_to_datetime(item.findtext('pubDate') or '')
            if when.tzinfo is None: when = when.replace(tzinfo=KST)
        except (TypeError, ValueError, OverflowError):
            skipped += 1; continue
        preview = PreviewParser()
        preview.feed(item.findtext('description') or '')
        brand = identify_brand(title)
        editorial = overrides.get(ident,{})
        posts[ident] = {
          'id':ident,'model':editorial.get('model') or identify_model(title,brand),
          'brand':brand,'title':editorial.get('title') or title,
          'originalTitle':title,'work':editorial.get('work') or '새 정비 기록 · 네이버 원문에서 확인',
          'excerpt':re.sub(r'\s+',' ',''.join(preview.text)).replace('**','').strip(),
          'url':f'https://blog.naver.com/ablymotors/{ident}', 'image':preview.image,
          'date':when.astimezone(KST).date().isoformat(),
          'tags':[t.strip() for t in (item.findtext('tag') or '').split(',') if t.strip()],
          'symptoms':[key for key,_,pattern in FILTERS if re.search(pattern,title,re.I)],
        }
    if not posts: raise ValueError('No valid ablymotors records; the previous feed was not overwritten')
    ordered = sorted(posts.values(),key=lambda p:(p['date'],int(p['id'])),reverse=True)
    for i, post in enumerate(ordered): post['number'] = len(ordered)-i
    # Number is a position within this feed snapshot, not a shop's lifetime job number.
    snapshot = datetime.now(KST)
    if not fetched:
        try: snapshot = parsedate_to_datetime(channel.findtext('pubDate') or '').astimezone(KST)
        except (ValueError, TypeError): pass
    if skipped: print(f'Warning: skipped {skipped} invalid RSS item(s)',file=sys.stderr)
    return {
      'meta':{'source':RSS_URL,'blog':'https://blog.naver.com/ablymotors',
        'snapshotAt':snapshot.isoformat(),'sourceType':'fetched RSS' if fetched else 'local RSS snapshot',
        'latestPost':ordered[0]['date'],'oldestPost':ordered[-1]['date'],'total':len(ordered)},
      'filters':[{'id':key,'label':label,'count':sum(key in p['symptoms'] for p in ordered)} for key,label,_ in FILTERS],
      'brands':dict(Counter(p['brand'] for p in ordered)), 'posts':ordered,
    }

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--fetch',action='store_true',help='Fetch fixed public Naver RSS URL')
    group.add_argument('--input',type=Path,help='Read a local XML source')
    args = parser.parse_args()
    try:
        if args.fetch:
            request = Request(RSS_URL,headers={'User-Agent':'JM-Motori-RSS/1.0','Accept':'application/rss+xml, application/xml, text/xml'})
            with urlopen(request,timeout=15) as response:
                if urlparse(response.url).hostname != 'rss.blog.naver.com': raise ValueError('Unexpected RSS redirect')
                raw = response.read(MAX_BYTES+1)
        else:
            source = args.input or ROOT/'data/source-snapshot.xml'
            if source.stat().st_size > MAX_BYTES: raise ValueError('RSS exceeds 4 MB')
            raw = source.read_bytes()
        overrides = json.loads((ROOT/'data/editorial-overrides.json').read_text(encoding='utf-8'))
        data = parse_feed(raw,overrides,args.fetch)
        target = ROOT/'data/feed.json'
        temporary = target.with_suffix('.tmp')
        temporary.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        temporary.replace(target)
        print(f'Updated {target} with {len(data["posts"])} records. Run python scripts/build.py next.')
        return 0
    except Exception as error:
        print(f'RSS sync failed; existing feed retained. {error}',file=sys.stderr)
        return 1
if __name__ == '__main__': raise SystemExit(main())
