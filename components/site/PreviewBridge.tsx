'use client';

import { VisualEditing } from 'next-sanity/visual-editing/client-component';
import { useEffect, useState } from 'react';

/**
 * Anteprima delle bozze (solo quando si apre il sito dal pannello).
 * - Clic su un testo: apre il campo corrispondente nel pannello.
 * - Ogni modifica: la pagina si ricarica poco dopo che hai smesso di scrivere, tornando allo stesso punto.
 *   Ricaricare tutta la pagina (invece di aggiornarla a pezzi) tiene le animazioni sempre corrette.
 */
let timer: ReturnType<typeof setTimeout> | undefined;
function ricarica() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      sessionStorage.setItem('mo-preview-scroll', String(window.scrollY));
    } catch {}
    window.location.reload();
  }, 900);
  return new Promise<void>(() => {});
}

export default function PreviewBridge() {
  const [fuoriPannello, setFuoriPannello] = useState(false);
  useEffect(() => {
    setFuoriPannello(window.self === window.top);
  }, []);
  return (
    <>
      <VisualEditing refresh={() => ricarica()} zIndex={1000} />
      {fuoriPannello ? (
        <a className="preview-badge" href="/api/draft-mode/disable">
          Stai vedendo le bozze · <u>Esci dall’anteprima</u>
        </a>
      ) : null}
    </>
  );
}
