import type { ContattiBlock, Settings } from '@/lib/content';
import { objectPosition, telHref, waHref } from '@/lib/content';
import { UI_ICONS } from '../site/art';
import { Svg, lines } from '../site/Svg';
import { ringText } from './Garanzie';

export function Contatti({ b, s }: { b: ContattiBlock; s: Settings }) {
  return (
    <section className="contact" id="contatti" data-dark="" aria-labelledby="ct-title" data-block="contatti">
      <div className="wrap">
        <div className="ct-top">
          <figure className="ct-figure">
            <div className="ct-img-wrap">
              <img className="ct-img" src={b.foto.url} alt={b.foto.alt} width={b.foto.width} height={b.foto.height} style={{ objectPosition: objectPosition(b.foto) }} loading="lazy" />
            </div>
            <span className="ct-badge" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="98" fill="#2563eb" />
                <defs>
                  <path id="badge-circle" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
                </defs>
                <g className="ring-text">
                  <text fill="#fff" fontFamily="Montserrat,Arial,sans-serif" fontWeight="700" fontSize="15" letterSpacing="2">
                    <textPath href="#badge-circle" textLength="458" lengthAdjust="spacing">{ringText(b.bollino)}</textPath>
                  </text>
                </g>
                <circle cx="100" cy="100" r="34" fill="#f59e0b" />
                <path d="M88 112l24-24M94 88h18v18" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </figure>
          <div className="ct-head">
            <h2 className="overline-h2" id="ct-title">{b.etichetta}</h2>
            <p className="ct-big">
              {lines(b.titolo).map((l, i) => (
                <span className="ct-line" key={i}><span className="ct-line-in">{l}</span></span>
              ))}
            </p>
            <p className="ct-text">{b.testo}</p>
          </div>
        </div>
        <div className="ct-layout">
          <div className="ct-main">
            <form className="ct-form" noValidate>
              <div className="fld-row">
                <div className="fld"><label htmlFor="f-nome">Nome e cognome</label><input id="f-nome" name="nome" autoComplete="name" required /></div>
                <div className="fld"><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" autoComplete="email" required /></div>
              </div>
              <div className="fld-row">
                <div className="fld"><label htmlFor="f-tel">Telefono <span className="opt">(facoltativo)</span></label><input id="f-tel" name="telefono" type="tel" autoComplete="tel" /></div>
                <div className="fld">
                  <label htmlFor="f-area">Di cosa hai bisogno?</label>
                  <select id="f-area" name="area">
                    {b.opzioni.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="fld"><label htmlFor="f-msg">Raccontaci la tua idea</label><textarea id="f-msg" name="messaggio" rows={5} required /></div>
              {/* Campo trappola antispam: invisibile alle persone, i robot lo compilano. */}
              <div className="hp" aria-hidden="true"><label htmlFor="f-sito">Sito web</label><input id="f-sito" name="sito" tabIndex={-1} autoComplete="off" /></div>
              <label className="chk">
                <input type="checkbox" name="privacy" required />
                <span>Ho letto la <a href={s.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a> e acconsento al trattamento dei miei dati.</span>
              </label>
              <div className="form-actions">
                <button className="btn btn-accent magnetic" type="submit">Invia Richiesta</button>
                <p className="form-msg" role="status" aria-live="polite" />
              </div>
            </form>
            <div className="form-done" tabIndex={-1} hidden>
              <span className="ok-badge">Richiesta inviata</span>
              <h3 className="form-done-title">Grazie!</h3>
              <p>{b.conferma}</p>
            </div>
          </div>
          <div className="ct-side">
            <p className="ct-side-title">{b.titoloPulsanti}</p>
            <div className="ct-list">
              {s.telefono ? (
                <a className="ct-item" href={telHref(s.telefono)} aria-label="Chiamaci al telefono">
                  <Svg className="ct-ico" html={UI_ICONS.telefono} /><span className="ct-label">Chiamaci</span>
                </a>
              ) : null}
              {s.whatsapp ? (
                <a className="ct-item" href={waHref(s.whatsapp)} target="_blank" rel="noopener" aria-label="Chatta con noi su WhatsApp">
                  <Svg className="ct-ico" html={UI_ICONS.whatsapp} /><span className="ct-label">Chatta</span>
                </a>
              ) : null}
              {s.email ? (
                <a className="ct-item" href={`mailto:${s.email}`} aria-label="Scrivici un’email">
                  <Svg className="ct-ico" html={UI_ICONS.email} /><span className="ct-label">Scrivici</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
