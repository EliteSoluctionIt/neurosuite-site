# NeuroSuite Investor Reintegration Audit

Data e ora: 2026-06-25 15:01:15 +02:00

## Obiettivo

Reintegrare nella pagina pubblica NeuroSuite i contenuti investor/economics rimossi nella fase di consolidamento, mantenendo lo stile visivo attuale e un linguaggio propositivo.

## Origini usate

- Pagina pubblica attuale: `index.html`
- Sezione market web precedente: commit `557f3a8`
- Rimozione principale individuata: commit `0262cc1`
- Pacchetto economics piu recente: `C:\Users\Mario\Downloads\NeuroSuite_Investor_2_5_VAT_PATCH_20260624_142249.zip`

## Contenuti reintegrati

- Europa Long-Term Care: 30,8M persone oggi e 38,1M proiezione 2050.
- Dimensione Italia: 291K RSA, 1,55M ADI, 4M persone anziane con autonomia ridotta, 8,5M caregiver familiari.
- Scenario Brescia: 26K+ lista d'attesa, 2.000 utenti potenzialmente coinvolgibili, 4 appartamenti pilota, 3 incontri svolti.
- Trial progressivo: preparazione, 2 stanze, 4 stanze, baseline e scalabilita.
- Connettore per elettroencefalografia portatile a secco e non invasiva: acquisizione immediata, baseline individuale e monitoraggio longitudinale.
- Prova di concetto: derive simulate come input controllato per verificare segnalazione e invio verso figure autorizzate.
- Fondamento scientifico: riferimenti EEG, MCI/Alzheimer, Parkinson, linguaggio e cammino.
- Scenario economico Brescia: 2,55 M€/anno su 2.000 persone a 3,50 €/giorno/persona, IVA esclusa.
- Scenario territoriale: 10.000 persone = 12,77 M€/anno.
- Scenario Italia: 2% = 8.160 persone / 10,42 M€/anno; 5% = 20.400 persone / 26,06 M€/anno.
- Scenario Europa: 2% = 48.000 persone / 61,32 M€/anno; 5% = 120.000 persone / 153,30 M€/anno.
- Data asset: stime interne prudenziali 50-200 €/persona/anno osservata.
- Battle card competitor: NeuroSuite, CarePredict, Inspiren, Sensi.AI, Essence SmartCare.
- Navigazione da presentazione: frecce su/giu/sinistra/destra e PageUp/PageDown tra le sezioni.

## Copy e tono

- Linguaggio orientato ad affermazioni.
- Testo visibile controllato: residuo di "non" = 0.
- Testo visibile controllato: residuo di "problema" = 0.
- Testo visibile controllato: residuo di "opportunita" = 0.
- Prudenza mantenuta con formule positive: supporto osservativo, professionisti autorizzati, decisioni nelle mani delle persone responsabili.

## File modificati

- `index.html`
- `styles.css`
- `app.js`
- `docs/NEUROSUITE_INVESTOR_REINTEGRATION_AUDIT.md`

## Verifiche attese

- `node --check app.js`
- controllo testuale visibile su `index.html`, `privato.html`, `app.js`
- `git diff --check`
- verifica browser desktop/mobile locale
