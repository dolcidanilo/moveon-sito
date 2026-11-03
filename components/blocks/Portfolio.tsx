import type { PortfolioBlock, Progetto } from '@/lib/content';
import { AREE, areaLabel, objectPosition } from '@/lib/content';
import { UI_ICONS } from '../site/art';
import { Svg } from '../site/Svg';

export function Portfolio({ b, progetti }: { b: PortfolioBlock; progetti: Progetto[] }) {
  const aree = AREE.filter((a) => progetti.some((p) => p.area === a.value));
  return (
    <section className="pf" id="portfolio" aria-labelledby="pf-title" data-block="portfolio" data-mode={b.modalita === 'ordine' ? 'grid' : 'chaos'}>
      <div className="wrap pf-head">
        <div>
          <h2 className="overline-h2" id="pf-title">{b.etichetta}</h2>
          <p className="statement">{b.titolo}</p>
          <p className="pf-sub">{b.istruzioni}</p>
        </div>
        <div className="pf-controls">
          <div className="seg pf-mode" role="group" aria-label="Disposizione dei lavori">
            <button type="button" data-mode="chaos" aria-pressed={b.modalita !== 'ordine'}>Sul tavolo</button>
            <button type="button" data-mode="grid" aria-pressed={b.modalita === 'ordine'}>In ordine</button>
          </div>
          <div className="seg pf-filter" role="group" aria-label="Filtra per area">
            <button type="button" data-filter="all" aria-pressed="true">Tutti</button>
            {aree.map((a) => (
              <button key={a.value} type="button" data-filter={a.value} aria-pressed="false">{a.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="pf-area">
        <div className={`pf-board ${b.modalita === 'ordine' ? 'is-grid' : 'is-chaos'}`}>
          {progetti.map((p, i) => (
            <button key={p._id} type="button" className="pf-card" data-cat={p.area} data-i={i} aria-label={`${p.nome}, ${p.tipo}. Apri il progetto`}>
              <span className="pf-cover" data-flip-id={`pf-${i}`}>
                <img src={p.copertina.url} alt="" width={p.copertina.width} height={p.copertina.height} style={{ objectPosition: objectPosition(p.copertina) }} loading="lazy" draggable={false} />
              </span>
              <span className="pf-cap">
                <span className="pf-name">{p.nome}</span>
                <span className="pf-cat">{areaLabel(p.area)}, {p.tipo}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Scheda progetto che si espande dalla copertina (riempita dallo script con i dati del progetto). */
export function PortfolioModal() {
  return (
    <div className="pf-modal" role="dialog" aria-modal="true" aria-labelledby="pfm-title" data-lenis-prevent="" hidden>
      <div className="pfm-bg" />
      <div className="pfm-bar">
        <button type="button" className="pfm-btn pfm-close"><Svg html={UI_ICONS.chiudi} />Chiudi</button>
        <div className="pfm-nav">
          <button type="button" className="pfm-btn pfm-prev" aria-label="Progetto precedente"><Svg html={UI_ICONS.prec} /></button>
          <button type="button" className="pfm-btn pfm-next" aria-label="Progetto successivo"><Svg html={UI_ICONS.succ} /></button>
        </div>
      </div>
      <div className="pfm-inner">
        <span className="pfm-cover" />
        <div className="pfm-head pfm-anim">
          <span className="pfm-badge" />
          <h2 className="pfm-title" id="pfm-title" />
          <p className="pfm-cat" />
        </div>
        <div className="pfm-blocks">
          <div className="pfm-block pfm-anim"><h3>La richiesta</h3><p className="pfm-brief" /></div>
          <div className="pfm-block pfm-anim"><h3>Il nostro lavoro</h3><p className="pfm-work" /></div>
          <div className="pfm-block pfm-anim"><h3>Il risultato</h3><p className="pfm-result" /></div>
        </div>
        <div className="pfm-gallery pfm-anim" hidden />
      </div>
    </div>
  );
}
