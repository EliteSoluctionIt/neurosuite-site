# Guida alla dimostrazione clinica NeuroSuite Orion

Per chi presenta la demo a medici, infermieri e ricercatori (es. Fondazione Brescia Solidale).

## Cosa dire subito
- **I pazienti mostrati sono simulati.** L'etichetta rossa "DATI SIMULATI — NON CLINICI" è sempre visibile. I valori di partenza vengono da registrazioni reali e pubbliche (PhysioNet Fantasia, Non-EEG, Sleep-EDF, UCI), ma le serie di 90 giorni sono generate al computer.
- Orion **non fa diagnosi**: segnala quando una persona si discosta dal *proprio* abituale e chiede a un professionista di guardare.
- È una **verifica tecnica**, non una validazione clinica (vedi `docs/VALIDATION_PROTOCOL_PRELIMINARY.md`).

## Come aprirla
Scaricare l'artefatto `clinical-demo` dall'esecuzione CI (GitHub Actions, workflow `demo`), estrarre lo zip e aprire `index.html` con un browser. Funziona offline, senza tracciamenti. `rapporto_clinico.pdf` è il rapporto già esportato; `report.html` si può stampare in PDF.
Rigenerare: `python demo/build.py && python demo/check.py`.

## Il percorso in 7 passi (circa 10 minuti)
1. **Acquisizione** – la tabella in alto: valori reali, con provenienza e controllo di integrità.
2. **Baseline** – nei grafici la banda verde è l'intervallo abituale della persona.
3. **Monitoraggio** – la striscia colorata sopra i grafici mostra il livello di ogni giorno.
4. **Deriva** – la linea tratteggiata è l'inizio del cambiamento simulato; le bande arancio mostrano i giorni segnalati.
5. **Interpretazione Orion** – riquadro blu = cosa è stato *misurato*; riquadro viola = cosa Orion *deduce*, con livello e confidenza.
6. **Evidenze** – ogni segnale ha articoli con DOI/PMID cliccabili, separando misure consolidate da ipotesi sperimentali.
7. **Rapporto clinico** – link "rapporto clinico esportabile".

## I quattro scenari
- **A. Variazione improvvisa**: più segnali cambiano insieme → REVIEW il giorno dopo l'esordio.
- **B. Deriva lenta**: cambiamento graduale → riconosciuto dopo alcune settimane (è il punto più debole, dirlo apertamente).
- **C. Ondata di calore**: sale solo la temperatura ambiente → nessun REVIEW. Mostra che Orion tiene conto dei fattori confondenti.
- **D. Sonno**: meno ore e sonno meno efficiente → REVIEW.

## Livelli
INFO = solo registrato · WATCH = da osservare · REVIEW = revisione del personale · URGENT = valutazione tempestiva. Sempre decide una persona.

## Domande frequenti
- *Funziona sui nostri pazienti?* Non lo sappiamo ancora: serve lo studio prospettico descritto nel protocollo.
- *La confidenza è una probabilità?* No, è un indicatore euristico della demo (accordo tra regole, controllo incrociato, evidenze, confondenti).
