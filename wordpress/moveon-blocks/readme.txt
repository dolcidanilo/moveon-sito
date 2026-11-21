=== MoveOn Blocks ===
Requires at least: 6.2
Tested up to: 6.8
Requires PHP: 8.1
Stable tag: 1.11.0
License: GPLv2 or later

Le sezioni del sito MoveOn Studio come elementi WPBakery, con header, footer e animazioni del prototipo approvato.

== Descrizione ==

* 19 elementi WPBakery (categoria MoveOn): quelli della home (Hero, Nastro, Chi sono breve, Pausa emozionale, Servizi, Portfolio, Garanzie, Contatti, il Chi siamo lungo) e quelli per le pagine (Intestazione, Numeri, Punti di forza, Come lavoro, Cosa realizzo, Non sai da dove partire?, Domande frequenti, Recensioni, Progetti scelti, Invito finale).
* Pagine dei progetti (/progetti/nome-progetto/) e pagina Progetti con tutti i lavori (/progetti/).
* Modello di pagina "MoveOn · pagina intera" con header, footer, menu mobile e barra contatti del prototipo.
* MoveOn → Impostazioni: logo, contatti, pulsanti, footer.
* MoveOn → Modelli HTML: l'HTML di ogni parte del sito, modificabile e ripristinabile.
* Classi pronte per stile e animazioni delle sezioni fatte con WPBakery (mo-section, mo-reveal, mo-words…).
* Progetti portfolio e Richieste dal sito.
* Guida completa in MoveOn → Guida.

== Librerie incluse ==

* GSAP 3.15.0 con ScrollTrigger — licenza standard "no charge" di GSAP (https://gsap.com/standard-license)
* Lenis 1.3.27 — licenza MIT
* Montserrat — SIL Open Font License 1.1

== Changelog ==

= 1.11.0 =
* Google Analytics 4 (MoveOn → Impostazioni → Statistiche): il codice di Google si carica solo dopo il consenso alle statistiche dato dal banner dei cookie (Google Consent Mode v2: iubenda oggi, LegalBlink domani). Prima del consenso nessuna richiesta a Google. Le visite di chi è collegato al pannello non si contano.

= 1.10.1 =
* Telefono: con le frecce avanti/indietro del browser una pagina lasciata con il menu aperto tornava con il menu aperto, e la foto del progetto compariva per un attimo sopra il menu. Ora il menu si chiude subito e la foto non passa più sopra il menu.

= 1.10.0 =
* Servizi nel nuovo ordine: Social, Siti web, Grafica, Stampa. La Formazione resta nella pagina Servizi e nel menu (in fondo), non più nella home. Nuovo strumento «Metti in ordine i servizi» per le pagine già create (i colori restano al loro posto).
* Impostazioni: «Zona in cui lavori» (comuni entro 30 km da Pescara). Zona e servizi vanno nei dati per Google: dentro la scheda dell'attività di Rank Math, o in una scheda propria senza Rank Math.
* Testi di serie: Formazione come lezioni individuali online, anche la sera e nel weekend; «Dove lavori?» con i comuni vicini e il lavoro online in tutta Italia; scelte del modulo nel nuovo ordine.

= 1.9.1 =
* Se nella pagina c’è ancora l’elemento Pausa emozionale, ora entra da solo nel «Chi sono»: il Chi sono usa la sua foto, il punto focale e la frase e la Pausa (con la sua riga) non si vede più. Così c’è un solo sfondo animato per tutta la sezione, senza confine a metà, e la foto si apre a sipario e non più dal cerchio.
* Sipario: parte da una fessura di 1 px al centro, alta quanto la foto, e si allarga verso destra e sinistra mentre scorri.

= 1.9.0 =
* «Chi sono» con la Pausa emozionale dentro: sotto i testi la foto si apre come un sipario, dal centro verso i lati, e i pixel e le linee animati fanno da sfondo a tutta la sezione.
* Scheda Sfondo del Chi sono: «Sfondo animato» sì/no (con «No» restano colore o immagine con opacità). Nuova scheda «Foto che si apre»: sì/no, foto, punto focale, frase.
* «Alleggerisci la home» porta la Pausa dentro il Chi sono (foto, punto focale, frase) e toglie l’elemento Pausa; finché la Pausa c’è ancora, il Chi sono non ripete la foto.

= 1.8.2 =
* Hero «Cubi 3D»: sotto le colonne c’è già la foto nuova, quindi negli spiragli tra i cubi non si vede più la foto vecchia; la faccia vecchia svanisce nella seconda metà del giro invece di diventare scura. Alla fine non resta nessuna striscia e non c’è più lo scatto.

= 1.8.1 =
* Hero «Cubi 3D» più fluida: le foto sono pronte prima di partire, le facce dei cubi vengono preparate in anticipo (prima le ultime colonne si preparavano a animazione in corso e si fermavano per un attimo) e l’onda è più compatta, così nessuna colonna resta ferma mentre le altre girano.

= 1.8.0 =
* Nuova sezione MoveOn → Colori: i 10 colori principali del sito, numerati, da cambiare con il selettore; cambiano in tutto il sito, con le loro sfumature. «Ripristina i colori di serie» torna a quelli di partenza.
* PDF «Colori MoveOn» con gli stessi numeri: si cambia il colore dei quadrati e si rimanda.
* Con i colori di serie il sito resta identico.

= 1.7.0 =
* Hero: si sceglie tra immagini che si alternano (slide) e un’immagine fissa, con il suo campo foto e punto focale; le slide restano salvate.
* Hero: due passaggi nuovi tra le immagini, «Cubi 3D» (di serie: colonne che ruotano come cubi e mostrano la nuova foto) e «Portale» (la nuova foto si apre dal centro con una cornice gialla); valgono anche per l’entrata.
* Card di «Non sai da dove partire?» e «Garanzie» tutte uguali: #f4f5f7 con il tema chiaro, #ffffff con il tema scuro, con i testi sempre leggibili.
* Servizi con il tema scuro: bordo delle schede chiare e pallini in basso bianchi.

= 1.6.4 =
* «Richiedi Preventivo» (in alto e nel menu del telefono) con gli stessi colori di «Invia Richiesta»: giallo con il testo blu.
* Barra di avanzamento sotto l'header gialla.
* «Non sai da dove partire?» ridisegnata: card a scacchiera chiare e blu notte, virgolette gialle, titoli più scuri, consigli blu e «Chiedimi un consiglio» come pulsante giallo, per una gerarchia chiara.

= 1.6.3 =
* «Non sai da dove partire?»: le etichette dei consigli (Logo, Insegna…) hanno lo stesso colore del titolo della card, con le scritte bianche: prima si vedevano appena.

= 1.6.2 =
* Menu del telefono: la fascia del logo è blu scuro (#182343) e la barra di avanzamento sotto il logo non si vede più mentre il menu è aperto.

= 1.6.1 =
* Tema scuro: «Chi sono» breve, «Non sai da dove partire?» e «Garanzie» restano bianche per tutti, così le sezioni bianche e blu si alternano e il cambio di sfondo scorrendo si vede.
* Garanzie: card senza bordo.
* Contatti: linea verticale e bordi delle tre icone chiari, visibili sul blu.
* Footer: la linea sopra è più leggera e larga quanto i contenuti.

= 1.6.0 =
* Colori in tutto il sito: il blu notte #0f172a diventa #223ab8 e il bianco #ffffff diventa #f4f5f7.
* Menu del telefono su sfondo #223ab8, con una freccia davanti alle voci del sottomenu dei Servizi e il pulsante chiaro.
* Chi sono (breve): su telefono il «25» è largo quanto la frase sotto; nuova foto facoltativa con angoli arrotondati (tra la frase e il titolo su telefono, nella colonna di sinistra su computer).
* Sfondo che cambia scorrendo (MoveOn → Impostazioni): la pagina prende con una dissolvenza il colore e i testi della sezione a metà schermo, come nel prototipo. Anteprima con ?mo_scorre=1.

= 1.5.0 =
* Video di sfondo in tutte le sezioni (scheda Sfondo) e negli sfondi delle pagine dei progetti: opacità, scelta per il telefono, l'immagine fa da copertina. Il video parte solo quando la sezione è sullo schermo e si ferma quando esce; fermo con «riduci movimento».
* Sfumatura di video e immagine verso il colore di sfondo: in basso, in alto, in alto e in basso, tutto intorno; corta, media o lunga.
* Chi sono (breve): etichetta in alto a sinistra come nelle altre sezioni; numero e frase alti quanto i testi a destra; il numero ha un'animazione continua (colori che scorrono e bagliore, a scelta).
* Garanzie: un'icona diversa per ogni garanzia (12 a scelta, automatiche in ordine).
* Non sai da dove partire?: sesta situazione («Voglio imparare a fare da solo»), due file da 3.
* Titoli delle sezioni più larghi e con righe bilanciate (es. «Un'immagine che lavora per te.» su una riga).

= 1.4.1 =
* Intestazione di pagina con «sfumatura»: la foto ora svanisce sotto la sezione successiva, dietro i suoi testi (prima copriva etichetta e titolo, es. «Perché scegliermi»).
* Invito finale: «Stile dei testi: scuri» e i colori personalizzati della scheda Sfondo ora funzionano (prima titolo e testo restavano chiari).

= 1.4.0 =
* La home riassume, le pagine approfondiscono: nuove pagine Chi sono, Servizi (con una pagina per ogni servizio) e Contatti, create con un clic da MoveOn → Strumenti, con testi in parole semplici e in prima persona da correggere.
* 11 nuovi elementi per comporre le pagine: Intestazione di pagina, Numeri, Punti di forza, Come lavoro, Cosa realizzo, Non sai da dove partire?, Domande frequenti, Recensioni (segnaposto), Progetti scelti, Invito finale, Chi sono breve per la home.
* «Non sai da dove partire?»: situazioni con i lavori consigliati; «Chiedimi un consiglio» scrive già il messaggio nel modulo contatti.
* Menu con i servizi a tendina (anche nel menu del telefono) e voce della pagina corrente evidenziata.
* Alleggerisci la home (MoveOn → Strumenti): Chi sono breve al posto del Chi siamo lungo e «Non sai da dove partire?» dopo i Servizi; la versione precedente resta nelle Revisioni.
* Servizi: «Scopri di più» verso la pagina di ogni servizio; App WebView tolta; nomi e voci in parole semplici.
* Testi di serie in prima persona (Contattami, Raccontami la tua idea, Le mie garanzie…).
* Indirizzi come /chi-sono/ nei pulsanti: portano alle pagine del sito anche in /nuovo.

= 1.3.0 =
* Hero con immagini a tutto schermo, una per settore: passano da una all'altra «pixel dopo pixel» (la nuova foto si compone a tessere, ogni volta con un disegno diverso). Settori in basso con barra di avanzamento, clic per sceglierli e pulsante pausa. Tempo, tipo di passaggio e velo scuro si scelgono nella scheda Immagini. La lampadina resta disponibile come opzione.
* Pausa emozionale: la foto inizia ad aprirsi appena compare dal basso e finisce quando è al centro dello schermo, senza bloccare lo scorrimento. Su telefono la frase sta sopra la barra dei contatti.
* Servizi: stacco tra il titolo e la prima scheda (titolo su fondo appena più scuro, schede con ombra sul lato sinistro).
* Colore #1e293b sostituito ovunque con #182343.

= 1.2.0 =
* Il Portfolio è ora il carosello 3D: l'elemento si chiama «MoveOn · Portfolio» e la sua ancora di serie è #portfolio (la voce «Portfolio» del menu porta lì).
* Tolto il vecchio Portfolio («Sul tavolo», «In ordine», scheda a comparsa). Le pagine che lo contengono ancora non mostrano niente al suo posto: basta eliminarne la riga in WPBakery. La griglia con i filtri resta nella pagina Progetti.
* Pagine più leggere: non si caricano più le librerie Flip e Draggable.
* Filtri del Portfolio e della pagina Progetti su una riga sul telefono (scorrono di lato).
* Portfolio: il «colore delle etichette» della scheda Sfondo vale anche per la scritta in alto.
* Menu: cliccando una voce la sezione si ferma subito sotto l'header (prima scendeva 72 px di troppo); Servizi e Pausa partono a filo dello schermo.

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
