# Modello per la skill di un cliente

Struttura da usare quando il titolare chiede «prepara la skill per il cliente X». Non è una skill da caricare: Claude la copia in `skill/<nome-cliente>/`, la compila con quello che sa e chiede il resto, poi crea lo zip `dist/skill-<nome-cliente>.zip` (cartella al primo livello).

Regole:
- `name`: minuscole, numeri e trattini, uguale al nome della cartella (es. `forno-aurora`).
- `description`: nomina il cliente e le parole con cui il titolare lo chiama, così la skill si attiva solo per lui. Massimo 1024 caratteri.
- Il modo di lavorare del titolare non si ripete: sta in «il-mio-metodo».
- Dati da confermare tra [quadre]. Niente dati riservati che il cliente non vuole condividere.

```markdown
---
name: <nome-cliente>
description: Il cliente <Nome attività> (<cosa fa>, <città>), seguito da MoveOn Studio. Usala quando si lavora per <Nome attività> o si nomina <nomi alternativi>, cioè <lavori seguiti: social, sito, grafica, stampa…>. Contiene chi è, pubblico, tono di voce, marchio (colori, carattere, logo), servizi o prodotti, social e cose da evitare.
---

# <Nome attività> · skill del cliente

## Chi è
Attività, città e zona, da quanto esiste, cosa la rende diversa. Referente e come preferisce essere contattato.

## Pubblico
A chi si rivolge, cosa cercano i suoi clienti, cosa li convince.

## Obiettivi
Cosa vuole ottenere (es. più prenotazioni, lancio di un prodotto), con numeri se ci sono.

## Tono di voce
Tu o lei, persona (io/noi), parole da usare e da evitare, esempi di frasi approvate.

## Marchio
Colori (codici), caratteri, logo (versioni e usi), stile delle foto, cose da non fare con il marchio.

## Prodotti o servizi
Elenco, con quelli da spingere di più e le stagionalità.

## Social e canali
Profili, frequenza, rubriche, cosa funziona, calendario e ricorrenze.

## Da evitare
Argomenti, parole, concorrenti da non citare, vincoli legali.

## Storico
Lavori già fatti con MoveOn Studio e decisioni prese (con data).
```

File utili da mettere accanto, in `riferimenti/` o `file/`: logo in PNG trasparente, palette, foto approvate, esempi di post riusciti.
