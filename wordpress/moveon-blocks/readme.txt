=== MoveOn Blocks ===
Requires at least: 6.2
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 1.1.6
License: GPLv2 or later

Le sezioni del sito MoveOn Studio come elementi WPBakery, con header, footer e animazioni del prototipo approvato.

== Descrizione ==

* 9 elementi WPBakery (categoria MoveOn): Hero, Nastro parole chiave, Chi siamo, Pausa emozionale, Servizi, Portfolio, Carosello progetti, Le nostre garanzie, Contatti.
* Pagine dei progetti (/progetti/nome-progetto/) e pagina Progetti con tutti i lavori (/progetti/).
* Modello di pagina "MoveOn · pagina intera" con header, footer, menu mobile e barra contatti del prototipo.
* MoveOn → Impostazioni: logo, contatti, pulsanti, footer.
* MoveOn → Modelli HTML: l'HTML di ogni parte del sito, modificabile e ripristinabile.
* Classi pronte per stile e animazioni delle sezioni fatte con WPBakery (mo-section, mo-reveal, mo-words…).
* Progetti portfolio e Richieste dal sito.
* Guida completa in MoveOn → Guida.

== Librerie incluse ==

* GSAP 3.15.0 con ScrollTrigger, Flip, Draggable — licenza standard "no charge" di GSAP (https://gsap.com/standard-license)
* Lenis 1.3.27 — licenza MIT
* Montserrat — SIL Open Font License 1.1

== Changelog ==

= 1.1.6 =
* Pagina Progetti: l'invito «Hai un progetto in mente?» ha uno strato nero al 20% che lo stacca dall'elenco dei lavori.

= 1.1.5 =
* Pagina del progetto: la fascia dietro «Progetto precedente / successivo» è nera al 20%.

= 1.1.4 =
* Pagina del progetto: fascia bianca al 30% dietro «Progetto precedente / successivo», che separa il contenuto dall'invito finale su qualsiasi sfondo; meno spazio prima di «Hai un progetto in mente?».

= 1.1.3 =
* Sfumatura della parte alta rifatta, uguale nelle due pagine: foto e colore proseguono sotto il contenuto e svaniscono con una curva morbida; il contenuto non si sposta più.
* Passaggio animato tra le pagine: nessun avviso nella console se il browser lo interrompe.

= 1.1.2 =
* Pagina Progetti: i filtri stanno sopra le card, non più sulla foto della parte alta.
* Sfondi: «Sfumatura in basso» per le parti alte, in pixel aggiunti in fondo, che sfumano nel colore del contenuto.
* Pagina del progetto: box «Progetto precedente / successivo» con bordo di 1px nel colore delle etichette; meno spazio vuoto quando mancano testo o immagini.

= 1.1.1 =
* Sfondi delle pagine dei progetti (MoveOn → Impostazioni): pagina Progetti (parte alta, elenco) e pagine dei progetti (parte alta, contenuto, per tutti i progetti) con colore, stile dei testi, immagine con opacità, dimensione e posizione.
* Con la parte alta chiara («testi scuri») l'header usa logo e testi scuri finché non scorri.
* Pagina del progetto: la copertina sta nel contenuto, così il suo sfondo le passa dietro; i progetti vicini sono in fondo al contenuto.

= 1.1.0 =
* Nuovo elemento «Carosello progetti»: progetti su un'elica 3D da trascinare (mouse, dito, frecce, tastiera, trackpad), con filtri; un clic apre la pagina del progetto.
* Ogni progetto ha la sua pagina (/progetti/nome-progetto/): copertina, testi, racconto facoltativo, immagini, progetto precedente e successivo, invito a contattarti.
* Nuova pagina Progetti (/progetti/) con tutti i lavori e i filtri; titolo e testo in MoveOn → Impostazioni.
* Progetti: «Immagine del carosello» (verticale) e «Immagini del progetto» con Aggiungi, Sostituisci, × e ordine a trascinamento.
* Dalle pagine dei progetti menu, logo e pulsanti riportano alle sezioni della home.
* Impostazioni: descrizioni dei link Privacy e Cookie senza riferimenti a iubenda.

= 1.0.11 =
* Header quando scorri: sfondo leggermente trasparente con sfocatura (backdrop-filter: blur 6.5px). Regolabili con le variabili --mo-header-blur e --mo-header-opacita.

= 1.0.10 =
* Portfolio controllato per intero, in tutte le combinazioni di modo e filtro, su computer e telefono:
* passando da «Sul tavolo» a «In ordine» con un filtro attivo le card non si allungano più;
* le card escluse dal filtro non lampeggiano più quando cambi modo;
* nella scheda progetto le frecce passano solo tra i lavori del filtro scelto.

= 1.0.9 =
* Portfolio «In ordine»: cambiando filtro, le card che escono non si allargano più a tutta la larghezza; restano della loro misura e sfumano.

= 1.0.8 =
* Hero: il bagliore della lampadina sfuma su tutti i lati, senza il taglio in alto.
* Portfolio: usando i filtri o cambiando modo, la sezione sotto non sale più per un attimo; l'altezza passa morbida dalla vecchia alla nuova.

= 1.0.7 =
* Colori dei testi scelti a mano: valgono solo per i testi sullo sfondo della sezione. Pulsanti selezionati («Sul tavolo», «Tutti»…), card e pannelli tengono i loro colori e restano leggibili.

= 1.0.6 =
* Scheda «Sfondo»: colore dei titoli, dei testi e delle etichette scelto a mano per ogni sezione.
* Con «testi scuri» o «testi chiari» anche la frase sotto il titolo e i testi secondari cambiano colore.
* Nessuno spazio tra le sezioni causato dagli elementi «Testo» vuoti che WPBakery crea tra una riga e l'altra (e nessun Testo vuoto nella home pronta).
* Portfolio: i pulsanti «Sul tavolo / In ordine» allineati a sinistra come i filtri.

= 1.0.5 =
* Scheda «Sfondo»: colore di sfondo della sezione (con trasparenza) e stile dei testi e delle card (chiari o scuri) per restare leggibili.
* Nessuno spazio attorno ai blocchi MoveOn anche quando il tema aggiunge contenitori con margini (es. fascia sotto il Portfolio).

= 1.0.4 =
* Nuova scheda «Sfondo» in tutti gli elementi: immagine di sfondo della sezione con opacità, dimensione e posizione regolabili.

= 1.0.3 =
* Icona personalizzata (immagine) per ogni motivo di «Chi siamo».
* Immagini SVG supportate in tutti i campi immagine (caricate con un plugin come Safe SVG).
* Riquadro della copertina sempre attivo nei Progetti portfolio, anche se il tema limita le immagini in evidenza.
* Guida: nuova sezione «Immagini: dove si cambiano».

= 1.0.2 =
* Tolta la linea sotto il nastro di parole chiave.
* Niente più spazi tra le sezioni causati da paragrafi vuoti o dal separatore delle righe a tutta larghezza di WPBakery.

= 1.0.1 =
* Le pagine MoveOn non risentono più degli stili di Porto: colori dei testi, campi del modulo tutti scuri, pulsanti leggibili al passaggio del mouse, nessuno spazio tra le sezioni dopo il salvataggio in WPBakery, card dei motivi di nuovo impilate.
* Esclusi anche gli stili dei componenti di Porto e quelli generati per pagina (uploads/porto_styles).
* Nuova impostazione «Tema scuro automatico».

= 1.0.0 =
* Prima versione: ricostruzione del prototipo approvato come plugin per WPBakery.
