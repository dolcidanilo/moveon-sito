import type { Block, HeroBlock } from '@/lib/content';
import { hrefFor } from '@/lib/content';
import { HIGHLIGHT_SVG } from '../site/art';
import { Bulb } from '../site/Pixels';
import { lines } from '../site/Svg';

function Word({ w }: { w: string }) {
  return (
    <span className="hw">
      <span className="hw-in">{w}</span>
    </span>
  );
}

export function Hero({ b, blocks }: { b: HeroBlock; blocks: Block[] }) {
  const rows = lines(b.titolo);
  const mark = b.parolaEvidenziata?.trim();
  let marked = false;
  const href = b.pulsante ? hrefFor(blocks, b.pulsante.blocco) : null;

  return (
    <section className="hero" id="top" data-dark="" data-block="hero">
      <div className="hero-deco" aria-hidden="true">
        <div className="dots" />
        <div className="ring" />
        <div className="sq2" />
        <div className="sq" />
      </div>
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title" aria-label={rows.join(' ')}>
            {rows.map((row, r) => {
              const words = row.split(/\s+/);
              return (
                <span className="hl-line" aria-hidden="true" key={r}>
                  {words.map((w, k) => {
                    const sep = k < words.length - 1 ? ' ' : '';
                    if (!marked && mark && w === mark) {
                      marked = true;
                      return (
                        <span key={k}>
                          <span className="hw-mark">
                            <Word w={w} />
                            <span dangerouslySetInnerHTML={{ __html: HIGHLIGHT_SVG }} className="svgw" />
                          </span>
                          {sep}
                        </span>
                      );
                    }
                    return (
                      <span key={k}>
                        <Word w={w} />
                        {sep}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </h1>
          <p className="hero-sub">{b.testo}</p>
          {b.pulsante && href ? (
            <div className="hero-actions">
              <a href={href} className="btn btn-outline-light magnetic">{b.pulsante.testo}</a>
            </div>
          ) : null}
        </div>
        <div className="hero-art">
          <button className="bulb-wrap" type="button" data-cursor="Ricomponi" aria-label="Dai forma all’idea">
            <span className="bulb-glow" />
            <Bulb />
          </button>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span>Scorri</span><i /></div>
    </section>
  );
}
