"""Rebuild the lesson's original SVG charts using only the Python standard library."""
from pathlib import Path

assets = Path(__file__).resolve().parents[1] / 'paths' / 'assets'


def svg(title, body, height):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 {height}" role="img" aria-label="{title}">
<rect width="640" height="{height}" rx="20" fill="#fffdf4"/>
<g font-family="system-ui,sans-serif" fill="#183f35">{body}</g></svg>\n'''


fee_rows = ''
for i, (fee, color) in enumerate([(0.001, '#245c45'), (0.01, '#9b701e')]):
    value = 1000 * (1 + 0.07 - fee) ** 40
    y = 100 + i * 95
    fee_rows += f'''<text x="28" y="{y}" font-size="20">{fee:.2%} annual fee</text>
<rect x="28" y="{y+13}" width="{value/15000*420:.2f}" height="32" rx="5" fill="{color}"/>
<text x="{38+value/15000*420:.2f}" y="{y+36}" font-size="20" font-weight="700">${value:,.0f}</text>'''
(assets / 'foundation-fees.svg').write_text(svg('Same investment, different expenses', f'''
<text x="28" y="38" font-size="25" font-weight="700">Small fees, long timeline</text>
<text x="28" y="66" font-size="17">$1,000 invested once · 40 years · 7% gross return</text>
{fee_rows}
<text x="28" y="280" font-size="17">Ending balances · simplified constant-return model</text>
<text x="28" y="307" font-size="17">No taxes or inflation adjustment · not a forecast</text>''', 330))

body = '''<text x="28" y="38" font-size="25" font-weight="700">Time makes the difference</text>
<text x="28" y="67" font-size="17">$5,000 at each year end · hypothetical growth</text>'''
for value, label in [(0, '$0'), (1000000, '$1m'), (2000000, '$2m')]:
    y = 375 - value / 2500000 * 240
    body += f'<path d="M75 {y}H605" stroke="#dbe2cf"/><text x="16" y="{y+6}" font-size="17">{label}</text>'
for year in [0, 10, 20, 30, 40]:
    x = 75 + year / 40 * 530
    body += f'<text x="{x}" y="405" text-anchor="middle" font-size="17">{year}</text>'
for r, color, dash in [(0.10, '#245c45', ''), (0.07, '#9b701e', '10 5'), (0.06, '#526f92', '3 5')]:
    points = ' '.join(f'{75+n/40*530:.2f},{375-(5000*((1+r)**n-1)/r)/2500000*240:.2f}' for n in range(41))
    body += f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="4" stroke-dasharray="{dash}"/>'
for i, (label, color) in enumerate([('10% · $2,212,963', '#245c45'), ('7% · $998,176', '#9b701e'), ('6% · $773,810', '#526f92')]):
    body += f'<text x="{28+i*207}" y="105" font-size="18" fill="{color}" font-weight="700">{label}</text>'
body += '''<text x="340" y="435" text-anchor="middle" font-size="18">Years of saving</text>
<text x="28" y="470" font-size="17">You contribute $200,000 in total over 40 years.</text>
<text x="28" y="497" font-size="17">Before taxes, fees, and inflation · not a forecast</text>'''
(assets / 'foundation-growth.svg').write_text(svg('Hypothetical growth over 40 years', body, 520))
