import type { PausaBlock } from '@/lib/content';
import { objectPosition } from '@/lib/content';
import { lines } from '../site/Svg';

export function Pausa({ b }: { b: PausaBlock }) {
  const rows = lines(b.frase);
  const fx = Math.round((b.foto.hotspot?.x ?? 0.5) * 100);
  const fy = Math.round((b.foto.hotspot?.y ?? 0.3) * 100);
  return (
    <section className="emo" id="pausa" aria-label={rows.join(' ')} data-block="pausa" data-fx={fx} data-fy={fy}>
      <canvas className="emo-canvas" aria-hidden="true" />
      <div className="emo-frame">
        <img
          className="emo-img"
          src={b.foto.url}
          alt={b.foto.alt}
          width={b.foto.width}
          height={b.foto.height}
          style={{ objectPosition: objectPosition(b.foto, '50% 40%') }}
          loading="lazy"
        />
      </div>
      <div className="emo-veil" aria-hidden="true" />
      <p className="emo-text" aria-hidden="true">
        {rows.map((r, i) => (
          <span className="emo-line" key={i}><span>{r}</span></span>
        ))}
      </p>
    </section>
  );
}
