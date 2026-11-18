"""
Rilegge il PDF «Colori MoveOn» rimandato dal cliente: per ogni quadrato trova il numero accanto e il suo colore,
e dice quali colori sono cambiati rispetto a quelli di serie (includes/colori.php).

Uso:  python3 -I tools/colori-da-pdf.py <pdf rimandato>
Stampa anche il codice PHP da dare a mo_colori_salva() nel WordPress di prova, per vedere subito il risultato.
"""
import json
import os
import subprocess
import sys

import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def in_hex(colore):
    """Colore di pdfplumber (grigio, RGB o CMYK, valori 0-1) → #rrggbb."""
    if colore is None:
        return None
    if isinstance(colore, (int, float)):
        colore = (colore,)
    v = [float(x) for x in colore if isinstance(x, (int, float))]
    if len(v) == 1:
        r = g = b = v[0]
    elif len(v) == 3:
        r, g, b = v
    elif len(v) == 4:
        c, m, y, k = v
        r, g, b = (1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k)
    else:
        return None
    return '#' + ''.join('%02x' % max(0, min(255, round(x * 255))) for x in (r, g, b))


def main(percorso):
    base = json.loads(subprocess.check_output(
        ['php', '-r', "require 'wordpress/moveon-blocks/includes/colori.php'; echo json_encode(mo_colori_base());"], cwd=ROOT))
    trovati = {}
    with pdfplumber.open(percorso) as pdf:
        for pagina in pdf.pages:
            parole = pagina.extract_words()
            numeri = [w for w in parole if w['text'].isdigit() and w['text'] in base]
            # I quadrati: rettangoli pieni (non i contorni), quasi quadrati, di almeno ~1,5 cm di lato
            quadrati = [r for r in pagina.rects if r.get('fill') and r['width'] > 40 and abs(r['width'] - r['height']) < 6 and r.get('non_stroking_color') is not None]
            for q in quadrati:
                mezzo = (q['top'] + q['bottom']) / 2
                vicini = [w for w in numeri if w['x1'] <= q['x0'] + 2 and w['top'] <= mezzo <= w['bottom'] + 12]
                if not vicini:
                    continue
                n = max(vicini, key=lambda w: w['x1'])['text']
                trovati[n] = in_hex(q['non_stroking_color'])
    cambiati = {n: c for n, c in trovati.items() if c and c != base[n]['colore']}
    for n in sorted(base, key=int):
        stato = trovati.get(n)
        segno = 'CAMBIATO' if n in cambiati else ('uguale' if stato else 'non trovato')
        print(f"{n:>2}. {base[n]['nome']:<20} di serie {base[n]['colore']}  nel PDF {stato or '-':<8} {segno}")
    if cambiati:
        print('\nmo_colori_salva( array( ' + ', '.join(f'{n} => "{c}"' for n, c in sorted(cambiati.items(), key=lambda x: int(x[0]))) + ' ) );')


if __name__ == '__main__':
    main(sys.argv[1])
