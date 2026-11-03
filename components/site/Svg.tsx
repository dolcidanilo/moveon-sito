/** Inserisce una stringa SVG fissa del prototipo dentro un contenitore. */
export function Svg({ html, className = 'svgw', as = 'span' }: { html: string; className?: string; as?: 'span' | 'div' }) {
  const Tag = as;
  return <Tag className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Testo con a capo: ogni riga diventa un elemento separato. */
export const lines = (text: string) =>
  text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
