import type { CSSProperties } from 'react';
import type { Block, ChiSiamoBlock } from '@/lib/content';
import { hrefFor, objectPosition } from '@/lib/content';
import { CUBE_ART, REASON_ICONS } from '../site/art';
import { Svg } from '../site/Svg';

const TONES = ['r-tint', 'r-blue', 'r-navy', 'r-light'];

export function ChiSiamo({ b, blocks }: { b: ChiSiamoBlock; blocks: Block[] }) {
  const fill = {
    '--img-fill': `url("${b.fotoNumero.url}")`,
    '--img-pos': objectPosition(b.fotoNumero, '30% 45%'),
  } as CSSProperties;
  const linkHref = b.link ? hrefFor(blocks, b.link.blocco) : null;

  return (
    <section className="about" id="chi-siamo" aria-labelledby="about-title" data-block="chiSiamo">
      <div className="wrap">
        <h2 className="overline-h2" id="about-title">{b.etichetta}</h2>
        <div className="about-top" style={fill}>
          <div className="big25" aria-hidden="true">
            <span className="o">{b.numero}</span>
            <span className="fl">{b.numero}</span>
          </div>
          <p className="about-headline">
            <span className="sr-only">MoveOn Studio, {b.numero} </span>
            {b.fraseNumero}
          </p>
        </div>

        <p className="manifesto js-words">{b.manifesto}</p>

        <div className="idea">
          <div className="idea-text">
            <h3 className="about-h3">{b.ideaTitolo}</h3>
            <p className="about-p">{b.ideaTesto}</p>
            <div className="idea-steps" aria-hidden="true">
              <span>{b.ideaPassi.da}</span>
              <span className="idea-line"><i /></span>
              <span>{b.ideaPassi.a}</span>
            </div>
          </div>
          {b.ideaImmagine ? (
            <div className="idea-art">
              <img
                className="idea-img"
                src={b.ideaImmagine.url}
                alt={b.ideaImmagine.alt}
                width={b.ideaImmagine.width}
                height={b.ideaImmagine.height}
                loading="lazy"
              />
            </div>
          ) : (
            <Svg as="div" className="idea-art" html={CUBE_ART} />
          )}
        </div>

        <h3 className="reasons-title">{b.motiviTitolo}</h3>
        <ul className="reasons">
          {b.motivi.map((m, i) => (
            <li key={m._key} className={`reason ${TONES[i % TONES.length]}`} style={{ '--i': i } as CSSProperties}>
              <Svg className="reason-ico" html={REASON_ICONS[m.icona] ?? REASON_ICONS.stella} />
              <div>
                <h4>{m.titolo}</h4>
                <p>{m.testo}</p>
                {m.etichette?.length ? (
                  <ul className="chips">
                    {m.etichette.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <p className="about-close js-words">{b.chiusura}</p>
        {b.link && linkHref ? (
          <p className="about-cta">
            <a href={linkHref}>{b.link.testo}</a> {b.link.resto}
          </p>
        ) : null}
      </div>
    </section>
  );
}
