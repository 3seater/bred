"""Generate small UI images; retain originals for previews and downloads. Requires Pillow."""
import json
from pathlib import Path
from PIL import Image, ImageOps

public = Path(__file__).resolve().parents[1] / 'public'
thumbs = public / 'memes' / 'thumbs'
thumbs.mkdir(exist_ok=True)
names = json.loads((public / 'memes' / 'manifest.json').read_text())
for name in names:
    with Image.open(public / 'memes' / name) as source:
        image = ImageOps.exif_transpose(source).convert('RGB')
        image.thumbnail((128, 128), Image.Resampling.LANCZOS)
        image.save(thumbs / f'{name}.webp', 'WEBP', quality=80)
with Image.open(public / 'favicon.png') as source:
    for filename, size in [('favicon-64.png', 64), ('login-avatar.webp', 128)]:
        image = source.copy()
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        image.save(public / filename)
print(f'Gallery originals: {sum((public / "memes" / n).stat().st_size for n in names):,} bytes')
print(f'Gallery thumbnails: {sum((thumbs / (n + ".webp")).stat().st_size for n in names):,} bytes')
