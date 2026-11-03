import type { CSSProperties } from 'react';

/* Lampadina e scudo in pixel: animazioni fisse del codice, come nel prototipo.
   Ogni pixel è <span class="px"><i></i></span>; le animazioni cercano solo i pixel
   del proprio contenitore (.bulb o .shield), così non si disturbano a vicenda. */

const BULB = ['....XXXXX....', '..XXXXXXXXX..', '.XXXXXXXXXXX.', '.XXXAXXXAXXX.', 'XXXXAXXXAXXXX', 'XXXXAAXAAXXXX', 'XXXXXAAAXXXXX', '.XXXXXAXXXXX.', '.XXXXXAXXXXX.', '..XXXXAXXXX..', '...XXXAXXX...', '....XXAXX....', '....SSSSS....', '....sssss....', '....SSSSS....', '.....sss.....'];

const SHIELD = ['..XXXXXXXXX..', '.XXXXXXXXXXX.', 'XXXXXXXXXXXXX', 'XXXXXXXXXXCXX', 'XXXXXXXXXCXXX', 'XXXXXXXXCXXXX', 'XXXCXXXCXXXXX', 'XXXXCXCXXXXXX', 'XXXXXCXXXXXXX', '.XXXXXXXXXXX.', '.XXXXXXXXXXX.', '..XXXXXXXXX..', '...XXXXXXX...', '....XXXXX....', '.....XXX.....', '......X......'];

type Cell = { key: string; cls: string; color?: string };

function bulbCells(): Cell[] {
  const out: Cell[] = [];
  BULB.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') { out.push({ key: `${r}-${c}`, cls: 'px' }); continue; }
      let color: string;
      let cls = 'px px-on';
      if (ch === 'X') color = r + c < 8 ? '#60a5fa' : r + c > 17 ? '#1d4ed8' : '#2563eb';
      else if (ch === 'A') { color = '#f59e0b'; cls = 'px px-a px-on'; }
      else if (ch === 'S') color = '#94a3b8';
      else color = '#64748b';
      out.push({ key: `${r}-${c}`, cls, color });
    }
  });
  return out;
}

function shieldCells(): Cell[] {
  const out: Cell[] = [];
  SHIELD.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') { out.push({ key: `${r}-${c}`, cls: 'px' }); continue; }
      const color = ch === 'C' ? '#f59e0b' : r + c < 7 ? '#60a5fa' : r + c > 17 ? '#1d4ed8' : '#2563eb';
      out.push({ key: `${r}-${c}`, cls: ch === 'C' ? 'px px-ck px-on' : 'px px-on', color });
    }
  });
  return out;
}

function render(cells: Cell[]) {
  return cells.map((c) => (
    <span key={c.key} className={c.cls}>
      {c.color ? <i style={{ '--c': c.color } as CSSProperties} /> : null}
    </span>
  ));
}

export function Bulb() {
  return <span className="bulb" aria-hidden="true">{render(bulbCells())}</span>;
}

export function Shield() {
  return <span className="shield">{render(shieldCells())}</span>;
}
