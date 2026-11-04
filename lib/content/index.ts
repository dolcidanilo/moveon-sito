import { cache } from 'react';
import { client, readToken } from '@/sanity/client';
import { SINGOLI, SITE_QUERY } from '@/sanity/queries';
import { contentFromSanity } from './fromSanity';
import { seed } from './seed';
import type { Block, BlockType, Img, SiteContent } from './types';

export * from './types';

/** Ogni quanti secondi, al massimo, il sito pubblico rilegge i contenuti pubblicati. */
export const REVALIDATE = 60;

/**
 * Restituisce tutti i contenuti del sito, letti dal pannello Sanity.
 * - Sito pubblico: solo contenuti pubblicati, rilette al massimo ogni minuto.
 * - Anteprima (draft mode, dal pannello): anche le bozze, sempre aggiornate, con il clic-per-modificare.
 * Se Sanity non è raggiungibile: su Vercel la costruzione si ferma (resta online la versione precedente),
 * in locale si usano i contenuti iniziali, così il sito si può provare anche senza rete.
 */
export const getSiteContent = cache(async (preview = false): Promise<SiteContent> => {
  try {
    const data =
      preview && readToken
        ? await client.fetch(SITE_QUERY, { singoli: SINGOLI }, { perspective: 'drafts', useCdn: false, stega: true, token: readToken, cache: 'no-store' })
        : await client.fetch(SITE_QUERY, { singoli: SINGOLI }, { next: { revalidate: REVALIDATE, tags: ['sanity'] } });
    return contentFromSanity(data);
  } catch (err) {
    if (process.env.VERCEL) throw err;
    console.warn('[contenuti] Sanity non raggiungibile, uso i contenuti iniziali:', err instanceof Error ? err.message : err);
    return seed;
  }
});

/** Ancora (id HTML) di ogni blocco: è anche l'indirizzo dei link del menu, es. #servizi. */
export const ANCHOR: Record<BlockType, string> = {
  hero: 'top',
  nastro: 'parole',
  chiSiamo: 'chi-siamo',
  pausa: 'pausa',
  servizi: 'servizi',
  portfolio: 'portfolio',
  garanzie: 'garanzie',
  contatti: 'contatti',
};

/** Link a un blocco, oppure null se il blocco è nascosto o assente (così il link non compare). */
export function hrefFor(blocks: Block[], target: BlockType): string | null {
  return blocks.some((b) => b._type === target && b.visibile) ? `#${ANCHOR[target]}` : null;
}

/** "+39 347 461 6434" → "+393474616434" (prefisso italiano aggiunto se manca). */
export function phoneE164(raw: string): string {
  let n = raw.replace(/[^\d+]/g, '');
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  if (!n.startsWith('+')) n = `+39${n}`;
  return n;
}

export const telHref = (raw: string) => `tel:${phoneE164(raw)}`;
export const waHref = (raw: string) => `https://wa.me/${phoneE164(raw).slice(1)}`;

/** Posizione CSS dell'immagine a partire dal punto focale. */
export function objectPosition(image?: Img, fallback = '50% 50%'): string {
  if (!image?.hotspot) return fallback;
  return `${Math.round(image.hotspot.x * 100)}% ${Math.round(image.hotspot.y * 100)}%`;
}

export const AREE = [
  { value: 'branding', label: 'Branding' },
  { value: 'web', label: 'Web' },
  { value: 'social', label: 'Social' },
  { value: 'stampa', label: 'Stampa' },
] as const;

export const areaLabel = (a: string) => AREE.find((x) => x.value === a)?.label ?? a;
