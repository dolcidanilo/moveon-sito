import type { Block, Settings } from '@/lib/content';
import { ANCHOR, hrefFor, telHref, waHref } from '@/lib/content';
import { UI_ICONS } from './art';
import { Svg } from './Svg';

/* Parti sempre visibili: header, menu mobile, footer, barra mobile, loader e cursore. */

function Logo({ s, href, label }: { s: Settings; href?: string; label: string }) {
  const inner = (
    <>
      <img className="logo-d" src={s.logoScuro.url} alt="" width={s.logoScuro.width} height={s.logoScuro.height} />
      <img className="logo-l" src={s.logoChiaro.url} alt="" width={s.logoChiaro.width} height={s.logoChiaro.height} />
    </>
  );
  return href ? (
    <a href={href} className="logo" aria-label={label}>{inner}</a>
  ) : (
    <span className="logo" role="img" aria-label={label}>{inner}</span>
  );
}

function menuLinks(s: Settings, blocks: Block[]) {
  return s.menu
    .map((m) => ({ ...m, href: hrefFor(blocks, m.blocco) }))
    .filter((m): m is typeof m & { href: string } => !!m.href);
}

export function Header({ s, blocks }: { s: Settings; blocks: Block[] }) {
  const cta = hrefFor(blocks, 'contatti');
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo s={s} href="#top" label="MoveOn Studio, torna all’inizio" />
        <nav className="nav" aria-label="Principale">
          {menuLinks(s, blocks).map((m) => (
            <a key={m.blocco} href={m.href} data-nav={ANCHOR[m.blocco]}>{m.testo}</a>
          ))}
        </nav>
        {cta ? <a href={cta} className="btn btn-primary magnetic header-cta">{s.headerCta}</a> : null}
        <button className="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Apri il menu">
          <span />
          <span />
        </button>
      </div>
      <div className="progress" />
    </header>
  );
}

export function MobileMenu({ s, blocks }: { s: Settings; blocks: Block[] }) {
  const cta = hrefFor(blocks, 'contatti');
  return (
    <div className="mobile-menu" id="mobile-menu" data-dark="" data-lenis-prevent="" hidden>
      {menuLinks(s, blocks).map((m) => (
        <a key={m.blocco} className="mm-item mm-link" href={m.href}>{m.testo}</a>
      ))}
      {cta ? <a className="mm-item btn btn-primary" href={cta}>{s.headerCta}</a> : null}
    </div>
  );
}

export function Footer({ s }: { s: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="foot" data-dark="">
      <div className="wrap foot-in">
        <Logo s={s} label="MoveOn Studio" />
        <p className="foot-claim">{s.footerClaim}</p>
        <p>
          © {year} {s.datiLegali}
          {s.privacyUrl ? (
            <>
              {' · '}
              <a className="foot-link" href={s.privacyUrl} target="_blank" rel="noopener">Privacy Policy</a>
            </>
          ) : null}
          {s.cookieUrl ? (
            <>
              {' · '}
              <a className="foot-link" href={s.cookieUrl} target="_blank" rel="noopener">Cookie Policy</a>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}

export function MobileBar({ s, blocks }: { s: Settings; blocks: Block[] }) {
  const cta = hrefFor(blocks, 'contatti');
  return (
    <nav className="mbar" aria-label="Contatto rapido">
      {cta ? <a className="btn btn-accent" href={cta}>{s.mobileCta}</a> : null}
      {s.telefono ? (
        <a className="icon-btn" href={telHref(s.telefono)} aria-label="Chiama">
          <Svg html={UI_ICONS.telefono} />
        </a>
      ) : null}
      {s.whatsapp ? (
        <a className="icon-btn" href={waHref(s.whatsapp)} target="_blank" rel="noopener" aria-label="Scrivi su WhatsApp">
          <Svg html={UI_ICONS.whatsapp} />
        </a>
      ) : null}
    </nav>
  );
}

export function LoaderAndCursor() {
  return (
    <>
      <div className="loader" aria-hidden="true">
        <div className="loader-grid"><i /><i /><i /><i /></div>
      </div>
      <div className="cursor" aria-hidden="true"><span className="cursor-label" /></div>
    </>
  );
}
