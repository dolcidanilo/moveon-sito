import type { CSSProperties } from 'react';
import type { NastroBlock, StileParola } from '@/lib/content';
import { objectPosition } from '@/lib/content';

const CLS: Record<StileParola, string> = { navy: '', blu: 'blu', bluChiaro: 'bluchiaro', foto: 'photo' };

export function Nastro({ b }: { b: NastroBlock }) {
  const style = {
    '--img-fill': `url("${b.foto.url}")`,
    '--img-pos': objectPosition(b.foto, '30% 40%'),
  } as CSSProperties;
  const row = (words: NastroBlock['riga1']) =>
    // Le parole sono ripetute 3 volte per lo scorrimento continuo, come nel prototipo.
    [0, 1, 2].flatMap((rep) =>
      words.map((w, i) => (
        <span key={`${rep}-${i}`} className={['mq-item', CLS[w.stile], i === 2 ? 'amber' : ''].filter(Boolean).join(' ')}>
          {w.testo}
        </span>
      )),
    );
  return (
    <section className="marquee" id="parole" aria-hidden="true" style={style} data-block="nastro">
      <div className="mq-row"><div className="mq-track">{row(b.riga1)}</div></div>
      <div className="mq-row"><div className="mq-track">{row(b.riga2)}</div></div>
    </section>
  );
}
