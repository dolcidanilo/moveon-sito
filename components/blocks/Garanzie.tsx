import type { GaranzieBlock } from '@/lib/content';
import { STAMP_ART } from '../site/art';
import { Shield } from '../site/Pixels';
import { Svg } from '../site/Svg';

/** "Garanzia MoveOn Studio, scelta sicura" → "GARANZIA MOVEON STUDIO • SCELTA SICURA • " ripetuto 2 volte. */
export function ringText(t: string) {
  const parts = t.split(/[,•·]/).map((s) => s.trim()).filter(Boolean);
  const once = parts.map((p) => `${p.toUpperCase()} • `).join('');
  return once + once;
}

export function Garanzie({ b }: { b: GaranzieBlock }) {
  return (
    <section className="gar" id="garanzie" aria-labelledby="gar-title" data-block="garanzie">
      <div className="wrap">
        <div className="gar-head">
          <div className="gar-copy">
            <h2 className="overline-h2" id="gar-title">{b.etichetta}</h2>
            <p className="statement">{b.titolo}</p>
            <p className="gar-sub">{b.sottotitolo}</p>
          </div>
          <div className="gar-art" aria-hidden="true">
            <svg className="gar-ring" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" />
              <defs>
                <path id="gar-circle" d="M100,100 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
              </defs>
              <text fontFamily="Montserrat,Arial,sans-serif" fontWeight="700" fontSize="10" letterSpacing="1.5">
                <textPath href="#gar-circle" textLength="572" lengthAdjust="spacing">{ringText(b.sigillo)}</textPath>
              </text>
            </svg>
            <Shield />
          </div>
        </div>
        <ul className="gar-grid">
          {b.garanzie.map((g) => (
            <li className="gar-card" key={g._key}>
              <Svg className="gar-stamp" html={STAMP_ART} />
              <h3>{g.titolo}</h3>
              <p>{g.testo}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
