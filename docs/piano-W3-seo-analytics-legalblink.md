# Piano W3 · SEO locale, Google Analytics, LegalBlink

Da riproporre quando si passa alla fase W3 (dopo le modifiche grafiche).
Obiettivo: farsi trovare da nuovi clienti a **Pescara e provincia**.

## Scelte già fatte

| Tema | Scelta |
| --- | --- |
| Sede | **Nessuna sede aperta al pubblico**: su Google si mostra solo la zona servita, non l'indirizzo |
| Google Business Profile | **Da creare** (conviene iniziare subito: la verifica può richiedere giorni o settimane) |
| Struttura del sito | **Home + pagine servizi + progetti come pagine vere** |
| Plugin SEO | **Rank Math** (gratuito) |
| Cookie e policy | **LegalBlink di Aruba** al posto di iubenda |
| Statistiche | **Google Analytics 4**, attivo solo dopo il consenso |

## Controllo tecnico del sito (prima della W3)

Cosa c'è già: un solo H1, sezioni ordinate, testi alternativi, pagina leggera (~480 KB), immagini caricate solo quando servono.

Cosa manca:
- titolo per Google generico («MoveOn Studio») e nessuna descrizione;
- nessuna anteprima per i social (Open Graph);
- nessun dato strutturato (scheda attività);
- la parola «Pescara» compare 0 volte nei testi;
- una sola pagina: poche possibilità di posizionarsi per «siti web Pescara», «grafico Pescara»…;
- i progetti del portfolio si aprono solo nella scheda a comparsa: Google non li vede;
- alcune immagini senza misure (piccoli spostamenti durante il caricamento).

## 1. Google Business Profile (lo fa Danilo, con la guida)

1. business.google.com con l'account Google dell'attività (lo stesso per Analytics e Search Console).
2. Nome: solo «MoveOn Studio», senza aggiungere «Pescara» o parole chiave (Google lo penalizza).
3. Categoria principale: la più vicina a ciò che si vende di più (es. «Agenzia di marketing», «Graphic designer», «Web designer»); le altre come secondarie.
4. «Hai una sede dove ricevi i clienti?» → **No**. Zona servita: Pescara e i comuni della provincia coperti.
5. Google chiede comunque un indirizzo per la verifica ma **non lo mostra**.
6. Telefono, sito (per ora quello attuale, si cambia dopo lo spostamento), orari, descrizione, foto, servizi.
7. Avviare la verifica e dire quale metodo propone Google.
8. Poi: chiedere **recensioni** ai clienti (la leva più veloce per le ricerche locali).

## 2. Lavoro sul plugin (lo fa Claude)

- **Scheda attività per Google** (JSON-LD, tipo attività con zona servita, senza indirizzo) dai dati di MoveOn → Impostazioni: nome, zona servita, telefono, email, profili social, link alla scheda Google.
- ~~Progetti del portfolio come pagine vere~~ **fatto nella 1.1.0**: /progetti/nome-progetto/ e la pagina /progetti/ (da aggiungere alla sitemap con Rank Math e al menu).
- **Modello «pagina servizio»** con grafica e animazioni del sito, da riempire in WPBakery: titolo, testo, vantaggi, progetti collegati, domande frequenti, contatto.
- **Google Analytics 4**: campo in Impostazioni per il codice G-XXXXXXX; parte solo dopo il consenso (Consent Mode v2 con il banner LegalBlink).
- Misure delle immagini e titoli di sezione più parlanti.
- Impostazioni: descrizioni dei campi Privacy/Cookie senza più «iubenda».

## 3. Rank Math e Search Console

- Rank Math su /nuovo: titoli, descrizioni, anteprime social, sitemap.
- /nuovo resta **nascosto ai motori di ricerca** fino allo spostamento (W4).
- **Search Console** si collega al momento dello spostamento.

## 4. Contenuti (insieme)

- Una pagina per ogni servizio principale, pensata per Pescara.
- Piccola sezione «dove lavoriamo» con i comuni coperti.
- Casi studio di clienti della zona.

## 5. LegalBlink (al posto di iubenda)

- Plugin ufficiale **«LegalBlink for Aruba»** (wordpress.org/plugins/legalblink-for-aruba). Token da pannello Aruba → servizio LegalBlink → Impostazioni → Genera token.
- Banner cookie attivo su tutto il sito: il modello MoveOn chiama `wp_head`/`wp_footer`, quindi il banner compare anche lì (verificato).
- Pagine «Privacy Policy» e «Cookie Policy» in WordPress con i testi LegalBlink (dal plugin o dal codice fornito dal servizio; alternativa: plugin «LegalBlink Policy» con `[WPLB_PRIVACY_POLICY]` e `[WPLB_COOKIE_POLICY]`).
- MoveOn → Impostazioni: sostituire i link iubenda con le nuove pagine (footer e consenso del modulo).
- Verificare che il piano LegalBlink includa il **Cookie Banner v2** (Consent Mode v2), necessario per Analytics.
- Da dichiarare a LegalBlink: modulo contatti (nome, email, telefono, messaggio, copia salvata in «Richieste dal sito»); Google Analytics; carattere Montserrat locale (nessuna richiesta a Google Fonts).
- **Non disdire iubenda** finché il sito nuovo non sostituisce quello attuale (W4).

## Cosa serve da Danilo

1. I servizi per cui fare una pagina, in ordine di importanza (es. siti web, branding/logo, social, grafica per la stampa, campagne).
2. I comuni coperti davvero (Pescara, Montesilvano, Spoltore, Città Sant'Angelo, Cepagatti…? anche Chieti e Francavilla, che sono in provincia di Chieti?).
3. Progetti reali di clienti della zona, con il permesso di mostrarli.

## Aspettative

La SEO dà risultati in qualche mese; la scheda Google con le recensioni è la parte che dà frutti prima.

## Dopo la messa online: social

Facebook e Instagram (qualità alta), LinkedIn (profilo personale curato + pagina aziendale, 1–2 post a settimana).

Idee già discusse per Instagram:
- Le Storie parlano a chi già segue; il feed è la **vetrina** per chi arriva dal sito o da Google.
- **In evidenza** per non perdere le Storie: Progetti, Servizi, Recensioni, Dietro le quinte, Chi siamo, Contatti, con copertine coerenti con il marchio.
- **Dalle Storie al feed, ogni settimana**: il contenuto migliore diventa un carosello, un Reel breve (bozza → finito, porta persone nuove) o una foto curata. 1–2 post a settimana bastano.
- **3 post fissati in alto**: progetto migliore, «chi siamo e cosa facciamo a Pescara», recensione o caso studio.
- Griglia pensata nell'insieme; nelle Storie adesivi link, sondaggi, domande.
- Meta Business Suite: pubblicazione anche su Facebook e programmazione.
- Da preparare: struttura degli In evidenza e calendario mensile.
