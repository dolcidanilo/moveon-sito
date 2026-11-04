/** Inserisce una stringa SVG fissa del prototipo dentro un contenitore. */
export function Svg({ html, className = 'svgw', as = 'span' }: { html: string; className?: string; as?: 'span' | 'div' }) {
  const Tag = as;
  return <Tag className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Testo con a capo: ogni riga diventa un elemento separato. */
/* Nell'anteprima i testi finiscono con un codice invisibile (clic-per-modificare) che contiene U+FEFF:
   per JavaScript è uno "spazio", quindi qui si tolgono solo gli spazi veri. */
const trimVero = (l: string) => l.replace(/^[^\S\uFEFF]+|[^\S\uFEFF]+$/g, '');
export const lines = (text: string) =>
  text
    .split(/\n+/)
    .map(trimVero)
    .filter((l) => l.replace(/[\u200b-\u200d\ufeff]/g, '').trim());
