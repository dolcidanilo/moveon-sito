import type { Block, ColoreScheda, ServiziBlock } from '@/lib/content';
import { hrefFor } from '@/lib/content';
import { SERVICE_ART, UI_ICONS } from '../site/art';
import { Svg } from '../site/Svg';

const TONE: Record<ColoreScheda, string> = { bianco: 't-light', grigio: 't-alt', blu: 't-blue', navy: 't-navy' };

export function Servizi({ b, blocks }: { b: ServiziBlock; blocks: Block[] }) {
  const ctaHref = b.finale.pulsante ? hrefFor(blocks, b.finale.pulsante.blocco) : null;
  const first = b.servizi[0]?.nome ?? '';
  return (
    <section className="svc" id="servizi" aria-labelledby="svc-title" data-block="servizi">
      <div className="svc-track">
        <div className="svc-panel svc-intro">
          <h2 className="overline-h2" id="svc-title">{b.etichetta}</h2>
          <p className="statement">{b.apertura}</p>
          <p className="svc-hint">
            <span className="hint-desk">Scorri per scoprirle</span>
            <span className="hint-mob">Scorri di lato</span>
            <Svg html={UI_ICONS.freccia} />
          </p>
        </div>

        {b.servizi.map((s) => (
          <article key={s._key} className={`svc-panel ${TONE[s.colore]}`} data-name={s.nome} data-cursor="Scorri">
            <div className="svc-text">
              <h3 className="svc-title">{s.nome}</h3>
              <p className="svc-lead">{s.beneficio}</p>
              <ul className="chips">
                {s.voci.map((v) => <li key={v}>{v}</li>)}
              </ul>
            </div>
            {s.immagine ? (
              <div className="svc-art">
                <img className="svc-img" src={s.immagine.url} alt={s.immagine.alt} width={s.immagine.width} height={s.immagine.height} loading="lazy" />
              </div>
            ) : (
              // Nessuna foto: resta l'illustrazione animata del prototipo come riserva.
              <div className="svc-art" aria-hidden="true" data-art={s.illustrazione} dangerouslySetInnerHTML={{ __html: SERVICE_ART[s.illustrazione] ?? SERVICE_ART.identita }} />
            )}
            <span className="svc-ghost" aria-hidden="true">{s.parolaSfondo}</span>
          </article>
        ))}

        <div className="svc-panel t-alt svc-end">
          <p className="statement">{b.finale.frase}</p>
          {b.finale.pulsante && ctaHref ? (
            <a className="btn btn-accent magnetic" href={ctaHref}>{b.finale.pulsante.testo}</a>
          ) : null}
        </div>
      </div>
      <div className="svc-hud" aria-hidden="true">
        <span className="hud-count">1 / {b.servizi.length}</span>
        <span className="hud-name">{first}</span>
        <span className="hud-bar"><i /></span>
      </div>
      <div className="svc-dots" aria-hidden="true" />
    </section>
  );
}
