"""Build a standalone HTML with optional cached photos. Font files are never embedded."""
from __future__ import annotations
import argparse,base64,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def encoded_json(data: object) -> str:
    return json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
def build(output: Path) -> None:
    html=(ROOT/'src/page.html').read_text(encoding='utf-8')
    assets={}
    manifest=ROOT/'assets/manifest.json'
    if manifest.exists():
        for key,relative in json.loads(manifest.read_text(encoding='utf-8')).items():
            image=(ROOT/'assets'/relative).resolve()
            if not image.is_relative_to((ROOT/'assets').resolve()): raise ValueError('Asset path escapes assets folder')
            if image.is_file() and image.suffix.lower() in {'.jpg','.jpeg','.png','.webp'}:
                mime={'.jpg':'jpeg','.jpeg':'jpeg','.png':'png','.webp':'webp'}[image.suffix.lower()]
                assets[key]=f'data:image/{mime};base64,'+base64.b64encode(image.read_bytes()).decode('ascii')
    feed=json.loads((ROOT/'data/feed.json').read_text(encoding='utf-8'))
    config=json.loads((ROOT/'data/landing-config.json').read_text(encoding='utf-8'))
    css=(ROOT/'src/styles.css').read_text(encoding='utf-8')
    js=(ROOT/'src/app.js').read_text(encoding='utf-8')
    html=html.replace('<!-- STYLE -->','<style>\n'+css+'\n</style>')
    html=html.replace('<!-- DATA -->','<script>window.JM_FEED='+encoded_json(feed)+';window.JM_CONFIG='+encoded_json(config)+';window.JM_ASSETS='+encoded_json(assets)+';</script>')
    html=html.replace('<!-- SCRIPT -->','<script>\n'+js+'\n</script>')
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(html,encoding='utf-8')
    print(f'Built {output.name}: {len(html.encode("utf-8")):,} bytes; {len(assets)} locally cached photos')
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=ROOT/'index.html')
    build(parser.parse_args().output)
