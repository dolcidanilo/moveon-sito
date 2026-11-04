import { draftMode } from 'next/headers';
import { ChiSiamo } from '@/components/blocks/ChiSiamo';
import { Contatti } from '@/components/blocks/Contatti';
import { Garanzie } from '@/components/blocks/Garanzie';
import { Hero } from '@/components/blocks/Hero';
import { Nastro } from '@/components/blocks/Nastro';
import { Pausa } from '@/components/blocks/Pausa';
import { Portfolio, PortfolioModal } from '@/components/blocks/Portfolio';
import { Servizi } from '@/components/blocks/Servizi';
import { Footer, Header, LoaderAndCursor, MobileBar, MobileMenu } from '@/components/site/Chrome';
import SiteScripts, { type SiteData } from '@/components/site/SiteScripts';
import type { Block } from '@/lib/content';
import { areaLabel, getSiteContent, objectPosition } from '@/lib/content';

/** Il sito pubblico rilegge i contenuti pubblicati al massimo ogni 60 secondi (deve restare un numero scritto qui). */
export const revalidate = 60;

export default async function Home() {
  const { settings, blocks, progetti } = await getSiteContent((await draftMode()).isEnabled);
  const visible = blocks.filter((b) => b.visibile);

  const render = (b: Block) => {
    switch (b._type) {
      case 'hero': return <Hero key={b._key} b={b} blocks={blocks} />;
      case 'nastro': return <Nastro key={b._key} b={b} />;
      case 'chiSiamo': return <ChiSiamo key={b._key} b={b} blocks={blocks} />;
      case 'pausa': return <Pausa key={b._key} b={b} />;
      case 'servizi': return <Servizi key={b._key} b={b} blocks={blocks} />;
      case 'portfolio': return <Portfolio key={b._key} b={b} progetti={progetti} />;
      case 'garanzie': return <Garanzie key={b._key} b={b} />;
      case 'contatti': return <Contatti key={b._key} b={b} s={settings} />;
      default: return null;
    }
  };

  const data: SiteData = {
    progetti: progetti.map((p) => ({
      nome: p.nome,
      areaLabel: areaLabel(p.area),
      tipo: p.tipo,
      copertina: { url: p.copertina.url, alt: p.copertina.alt, pos: objectPosition(p.copertina) },
      galleria: (p.galleria ?? []).map((g) => ({ url: g.url, alt: g.alt, width: g.width, height: g.height })),
      richiesta: p.richiesta,
      lavoro: p.lavoro,
      risultato: p.risultato,
    })),
  };

  return (
    <>
      <a className="skip" href="#main">Vai al contenuto</a>
      <LoaderAndCursor />
      <Header s={settings} blocks={blocks} />
      <MobileMenu s={settings} blocks={blocks} />
      <main id="main">{visible.map(render)}</main>
      <Footer s={settings} />
      <MobileBar s={settings} blocks={blocks} />
      <PortfolioModal />
      <SiteScripts data={data} />
    </>
  );
}
