import type { Metadata, Viewport } from 'next';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import './globals.css';
import { draftMode } from 'next/headers';
import PreviewBridge from '@/components/site/PreviewBridge';
import { getSiteContent } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getSiteContent((await draftMode()).isEnabled);
  return {
    title: s.seoTitolo,
    description: s.seoDescrizione,
    openGraph: {
      title: s.seoTitolo,
      description: s.seoDescrizione,
      locale: 'it_IT',
      type: 'website',
      images: s.immagineCondivisione ? [{ url: s.immagineCondivisione.url, width: 1200, height: 630 }] : undefined,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/* Prima che la pagina compaia: classe "js" e caricamento iniziale (solo se il movimento non è ridotto
   e non siamo nell'anteprima del pannello, che si ricarica spesso).
   Il caricamento si chiude da solo entro 2,4 s anche se lo script delle animazioni tarda. */
const BOOT = `(function(){var d=document.documentElement;d.classList.add('js');if(!d.hasAttribute('data-preview')&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('is-loading');setTimeout(function(){d.classList.remove('is-loading')},2400)}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const preview = (await draftMode()).isEnabled;
  return (
    <html lang="it" suppressHydrationWarning data-preview={preview ? '' : undefined}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        {children}
        {preview ? <PreviewBridge /> : null}
      </body>
    </html>
  );
}
