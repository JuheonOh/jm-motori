"""Cache only JM MOTORI's source photos; failed requests never create replacement pictures."""
from __future__ import annotations
import argparse
import json
import os
import tempfile
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
MAX_BYTES = 12 * 1024 * 1024

def allowed(url: str) -> bool:
    try:
        parsed = urlsplit(url)
        host = parsed.hostname or ''
        return (parsed.scheme == 'https' and not parsed.username and not parsed.password
                and parsed.port in (None, 443) and
                (host == 'jm-motori.co.kr' or host.endswith('.pstatic.net') or host.endswith('.phinf.naver.net')))
    except (TypeError, ValueError):
        return False

class SourceRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not allowed(newurl):
            raise ValueError('Redirect left the allowed source hosts')
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def image_extension(data: bytes) -> str:
    if data.startswith(b'\xff\xd8\xff'):
        return '.jpg'
    if data.startswith(b'\x89PNG\r\n\x1a\n'):
        return '.png'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return '.webp'
    raise ValueError('Response is not a JPEG, PNG or WebP image')

def atomic_write(path: Path, data: bytes) -> None:
    handle, temporary = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(handle, 'wb') as output:
            output.write(data)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--all', action='store_true', help='Cache all RSS record photos, not only the selected three')
    parser.add_argument('--timeout', type=float, default=12, help='Per-request timeout in seconds')
    parser.add_argument('--force', action='store_true', help='Re-fetch images already present in the manifest')
    args = parser.parse_args()
    if args.timeout <= 0:
        parser.error('--timeout must be positive')
    ASSETS.mkdir(exist_ok=True)
    manifest_path = ASSETS / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    if not isinstance(manifest, dict):
        raise ValueError('assets/manifest.json must be an object')
    feed = json.loads((ROOT / 'data/feed.json').read_text(encoding='utf-8'))
    config = json.loads((ROOT / 'data/landing-config.json').read_text(encoding='utf-8'))
    selected = {item['id'] for item in config.get('featured', [])}
    targets = {
        'workshop': 'https://jm-motori.co.kr/assets/images/2.jpg',
        'exterior': 'https://jm-motori.co.kr/assets/images/1.jpg',
    }
    for post in feed['posts']:
        if args.all or post['id'] in selected:
            if post.get('image'):
                targets['post:' + post['id']] = post['image']
    opener = urllib.request.build_opener(SourceRedirectHandler())
    failures = []
    for key, url in targets.items():
        old = (ASSETS / manifest.get(key, '')).resolve()
        if not args.force and old.is_relative_to(ASSETS.resolve()) and old.is_file():
            print(f'Keep {key}: {old.name}')
            continue
        try:
            if not allowed(url):
                raise ValueError('URL is not an approved JM MOTORI image source')
            request = urllib.request.Request(url, headers={
                'User-Agent': 'JM-MOTORI-Asset-Cache/2.0',
                'Accept': 'image/jpeg,image/png,image/webp',
            })
            with opener.open(request, timeout=args.timeout) as response:
                if not allowed(response.url):
                    raise ValueError('Response left the allowed source hosts')
                data = response.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                raise ValueError('Image exceeds the 12 MB limit')
            extension = image_extension(data)
            filename = key.replace(':', '-') + extension
            if Path(filename).name != filename:
                raise ValueError('Invalid asset key')
            atomic_write(ASSETS / filename, data)
            manifest[key] = filename
            print(f'Cached {key}: {len(data):,} bytes')
        except (urllib.error.URLError, OSError, ValueError) as exc:
            failures.append(key)
            print(f'Unavailable {key}: {exc}. Existing file/remote URL retained.')
    atomic_write(manifest_path, (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))
    if failures:
        print(f'{len(failures)} source images unavailable. No synthetic or third-party pictures were substituted.')
        return 1
    print('Run python scripts/build.py to embed the cached images into index.html.')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
