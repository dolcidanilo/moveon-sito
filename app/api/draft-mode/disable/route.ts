import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

/* Esce dall'anteprima delle bozze e torna al sito pubblico. */
export async function GET(request: Request) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL('/', request.url));
}
