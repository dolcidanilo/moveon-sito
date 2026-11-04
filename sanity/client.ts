import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from './env';

/** Client per leggere i contenuti pubblicati (dalla rete veloce di Sanity). */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  // Nell'anteprima i testi portano un codice invisibile che permette di cliccarli per aprire il campo nel pannello
  stega: { studioUrl: '/studio' },
});

/** Chiave di sola lettura per l'anteprima delle bozze (variabile d'ambiente su Vercel, mai nel codice). */
export const readToken = process.env.SANITY_API_READ_TOKEN || '';
