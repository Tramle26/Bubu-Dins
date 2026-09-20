"""Build a local page-aware reference index. Requires Python 3 and pypdf."""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
chunks, documents = [], []
files = sorted((root / 'materials').glob('*.pdf'))
if not files:
    raise SystemExit('No PDFs found in materials/')
for path in files:
    reader = PdfReader(path)
    empty = []
    count = 0
    for number, page in enumerate(reader.pages, 1):
        text = re.sub(r'\s+', ' ', (page.extract_text() or '').replace('\x00', ' ')).strip()
        if len(text) < 80:
            empty.append(number)
            continue
        words = text.split()
        for start in range(0, len(words), 260):
            excerpt = ' '.join(words[start:start + 320])
            if len(excerpt) < 80:
                continue
            chunks.append(dict(file=path.name, page=number, text=excerpt))
            count += 1
    documents.append(dict(file=path.name, sha256=hashlib.sha256(path.read_bytes()).hexdigest(), pages=len(reader.pages), chunks=count, skippedPages=empty))
    print(f'{path.name}: {count} excerpts, {len(empty)} short/empty pages', flush=True)
if any(doc['chunks'] == 0 for doc in documents):
    raise SystemExit('A PDF has no readable text. OCR it before rebuilding; previous index preserved.')
output = root / 'materials' / 'search-index.json'
temporary = output.with_suffix('.tmp')
temporary.write_text(json.dumps(dict(version=1, documents=documents, chunks=chunks), ensure_ascii=False), encoding='utf-8')
temporary.replace(output)
print(f'Indexed {len(documents)} PDFs, {len(chunks)} excerpts. Restart the app after rebuilding.')
