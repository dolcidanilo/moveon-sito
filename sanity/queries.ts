/** Le schede uniche del pannello (impostazioni, ordine della pagina, gli 8 blocchi). */
export const SINGOLI = ['impostazioni', 'pagina', 'hero', 'nastro', 'chiSiamo', 'pausa', 'servizi', 'portfolio', 'garanzie', 'contatti'];

/** Tutto il sito in una sola richiesta: le schede uniche e i progetti in evidenza, nell'ordine dell'elenco. */
export const SITE_QUERY = /* groq */ `{
  "docs": *[_id in $singoli],
  "progetti": *[_type == "progetto" && inEvidenza != false] | order(orderRank asc)
}`;
