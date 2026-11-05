// Aggiorna le librerie incluse nel plugin (GSAP, Lenis, Montserrat) dalle versioni in package.json.
// Uso: npm install && npm run vendor
import { copyFileSync } from 'node:fs';
const P = 'wordpress/moveon-blocks/assets/';
for (const f of ['gsap', 'ScrollTrigger', 'Flip', 'Draggable']) copyFileSync(`node_modules/gsap/dist/${f}.min.js`, `${P}js/vendor/${f}.min.js`);
copyFileSync('node_modules/lenis/dist/lenis.min.js', `${P}js/vendor/lenis.min.js`);
for (const w of [400, 500, 600, 700, 800]) for (const s of ['latin', 'latin-ext'])
  copyFileSync(`node_modules/@fontsource/montserrat/files/montserrat-${s}-${w}-normal.woff2`, `${P}fonts/montserrat-${s}-${w}-normal.woff2`);
console.log('Librerie aggiornate: ricordati di aggiornare i numeri di versione in includes/pagina.php');
