import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client, readToken } from '@/sanity/client';

/* Attiva l'anteprima delle bozze. La chiama il pannello (voce "Anteprima") con un codice segreto temporaneo. */
const handler = readToken ? defineEnableDraftMode({ client: client.withConfig({ token: readToken }) }) : null;

export async function GET(request: Request) {
  if (!handler) {
    return new Response(
      'Anteprima non configurata: manca la variabile SANITY_API_READ_TOKEN su Vercel (chiave Sanity di sola lettura, ruolo Viewer).',
      { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }
  return handler.GET(request);
}
