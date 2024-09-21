/** @format */

"use strict";

/*
function promptDoc(testo, domanda, docName) {
  return `
SYSTEM: Sei un assistente AI specializzato nell'analisi documentale e nell'estrazione mirata di informazioni. Rispondi esclusivamente in italiano.

TASK: Analizza l'estratto del documento "${docName}" e identifica le informazioni rilevanti per rispondere alla domanda: "${domanda}".

INSTRUCTIONS:
1. Esamina il testo e identifica le informazioni utili per costruire un contesto relativo alla domanda.
2. Per ogni informazione rilevante, fornisci una breve descrizione.
3. Elenca i punti chiave pertinenti per ogni informazione.
4. Riporta elementi specifici (dati, citazioni, eventi) se utili per il contesto.
5. Struttura la risposta secondo il formato di output specificato.

DOMANDA: ${domanda}

TESTO DA ANALIZZARE:
<<<INIZIO_TESTO>>>
${testo}
<<<FINE_TESTO>>>

OUTPUT_FORMAT:
- Informazione 1:
    Descrizione:
    Punti chiave:
    Elementi specifici:

- Informazione 2:
    Descrizione:
    Punti chiave:
    Elementi specifici:

 (Ripeti il formato per ogni informazione identificata)

RESPONSE:
`;
}

function promptBuildContext(informazioni, domanda = "") {
  return `
SYSTEM: Sei un assistente AI esperto nella sintesi e nell'organizzazione mirata di informazioni. Rispondi sempre ed esclusivamente in italiano.

TASK: Organizza e sintetizza le informazioni estratte da frammenti di testo di un documento, creando un contesto utile per rispondere alla domanda: "${domanda}".

INSTRUCTIONS:
1. Esamina tutte le informazioni fornite.
2. Seleziona e raggruppa le informazioni simili.
3. Per ogni gruppo di informazioni rilevanti, genera una descrizione concisa.
4. Elenca i punti chiave essenziali per comprendere il contesto.
5. Riporta elementi specifici (dati, citazioni, eventi) se utili.
6. Elimina le informazioni ridondanti, mantenendo solo la versione più completa.
7. Elabora inferenze logiche basate sulle informazioni, se rilevanti per il contesto.
8. Genera una sintesi finale del contesto.

INFORMAZIONI:
<<<INIZIO_INFORMAZIONI>>>
${informazioni}
<<<FINE_INFORMAZIONI>>>

OUTPUT_FORMAT:
- Informazione 1:
    Descrizione:
    Punti chiave:
    Elementi rilevanti:

- Informazione 2:
    Descrizione:
    Punti chiave:
    Elementi rilevanti:

 (Ripeti il formato per ogni gruppo di informazioni 

- Inferenze Logiche:

- Sintesi Finale:

RESPONSE:
`;
}
*/
//////////////////////

function promptDoc(testo, domanda, docName) {
  return `
SYSTEM: Sei un assistente AI specializzato nell'analisi documentale e nell'estrazione mirata di informazioni. Rispondi esclusivamente in italiano.

TASK: Analizza il testo estratto dal documento "${docName}" e identifica gli elementi rilevanti per rispondere alla domanda: "${domanda}".

INSTRUCTIONS:
1. Analizza attentamente il testo fornito.
2. Identifica gli elementi utili per rispondere alla domanda ("${domanda}").
3. Per ogni elemento individuato, fornisci un titolo ed una descrizione sintetica ma completa.
4. Riporta dettagli specifici (dati, citazioni, eventi, personaggi, luoghi, ..) se corelati alla domanda.
5. Se non ci sono informazioni rilevanti, rispondi con "NESSUNA INFORMAZIONE RILEVANTE".
6. Assicurati di generare la risposta esattamente secondo il formato di output specificato.

DOMANDA: ${domanda}

TESTO DA ANALIZZARE:
<<<INIZIO_TESTO>>>
${testo}
<<<FINE_TESTO>>>

OUTPUT_FORMAT: Genera una risposta strutturata come un elenco nel quale ogni elemento è costituito da un breve titolo e da una descrizione concisa ma completa.

RESPONSE:
`;
}


function promptBuildContext(informazioni, domanda = "") {
  return `
SYSTEM: Sei un assistente AI esperto nella sintesi e nell'organizzazione mirata di informazioni. Rispondi sempre ed esclusivamente in italiano.

TASK: Organizza e sintetizza le informazioni estratte da frammenti di testo di un documento, creando un contesto utile per rispondere alla domanda: "${domanda}".

INSTRUCTIONS:
1. Analizza tutte le informazioni fornite.
2. Seleziona e raggruppa le informazioni simili.
3. Per ogni informazioni, genera una descrizione concisa.
4. Elenca i punti chiave essenziali per comprendere il contesto.
5. Riporta elementi specifici (dati, citazioni, eventi, luoghi, personaggi, ..) se utili.
6. Elabora inferenze logiche basate sulle informazioni, se rilevanti per il contesto.
7. Genera una sintesi finale.
8. Assicurati di strutturare la tua risposta esattamente secondo il formato di output specificato.

INFORMAZIONI:
<<<INIZIO_INFORMAZIONI>>>
${informazioni}
<<<FINE_INFORMAZIONI>>>

OUTPUT_FORMAT: Genera una risposta strutturata come un elenco nel quale ogni elemento è costituito da un breve titolo e da una descrizione concisa ma completa, alla fine dell'elenco aggiungi una sintesi globale ed eventuali inferenze logiche e collegamenti fra le varie informazioni.

RESPONSE:
`;
}

////////////////////////////////////////////////////
/*
function promptDoc(testo, domanda, docName) {
  return `
RUOLO: Sei un assistente AI specializzato nell'analisi documentale e nell'estrazione mirata di informazioni. Rispondi esclusivamente in italiano.

COMPITO: Analizza il testo estratto dal documento "${docName}" ed estrai tutti gli elementi (concetti, avvenimenti, temi, personaggi, date, luoghi, ecc.) utili per rispondere alla domanda: "${domanda}". Concentrati esclusivamente sulla selezione di elementi utili per rispondere alla domanda evitando commenti o divagazioni superflue. Evita di utilizzare markup, formattazione o altri artifizi grafici. Usa un linguaggio lineare e diretto, evitando ambiguità. Se non ci sono informazioni rilevanti, rispondi con "NESSUNA INFORMAZIONE RILEVANTE". Genera una risposta strutturata come un elenco nel quale ogni elemento è composto da un breve titolo e da una concisa ma completa descrizione. Ricorda di rispondere in italiano indipendentemente dal testo analizzato.

DOMANDA:"${domanda}"

TESTO DA ANALIZZARE:
<<<INIZIO>>>
${testo}
<<<FINE>>>

RISPOSTA:
`;
}

function promptBuildContext(informazioni, domanda = "") {
  return `
RUOLO: Sei un assistente AI esperto nella sintesi e nell'organizzazione mirata di informazioni. Rispondi sempre ed esclusivamente in italiano.

COMPITO: Analizza le informazioni fornite e riordinale logicamente raggruppando quelle simili. Concentrati sull'organizzazione della risposta in modo tale che sia utilizzabile come contesto per rispondere alla domanda: "${domanda}" e ad eventuali domande simili. Assicurati che non vada persa alcua informazione significativa. Evita di utilizzare markup, formattazione o caratteri grafici. Evita commenti e divagazioni superflue per il contesto. Usa un linguaggio lineare e diretto, evitando ambiguità. Genera una risposta strutturata come un elenco nel quale ogni elemento è cosituito da un breve titolo e da una descrizione concisa ma completa, alla fine dell'elenco aggiungi una sintesi globale ed eventuali inferenze logiche e collegamenti fra le varie informazioni.

INFORMAZIONI:
<<<INIZIO>>>
${informazioni}
<<<FINE>>>

RISPOSTA:
`;
}
*/
//////////////////////////













function promptWithContext(contesto, domanda) {
  return `
SYSTEM: Sei un sistema AI specializzato nell'analisi di informazioni estratte da documenti.

TASK: Elabora la risposta alla domanda "${domanda}" sulla base del contesto fornito.

INSTRUCTIONS:
1. Analizza attentamente il contesto fornito, identificando le informazioni pertinenti alla domanda: "${domanda}".
2. Estrai i concetti chiave e formula inferenze ragionevoli basate sulle informazioni disponibili.
3. Inizia la risposta con una breve introduzione che presenta l'argomento e il contesto.
4. Procedi con un'analisi dettagliata delle informazioni rilevanti trovate nel contesto.
5. Concludi con una sintesi che riassume i punti chiave e fornisce una conclusione generale.
6. Se richiesto, cita le fonti facendo riferimento al "documento fornito" per il contesto dato, distinguendolo chiaramente da eventuali altre fonti citate all'interno del contesto stesso.
7. Mantieni uno stile di scrittura fluido durante tutta la risposta.
8. Assicurati che la risposta sia completa e risponda direttamente alla domanda posta.

CONTESTO:
<<<INIZIO_CONTESTO>>>
${contesto}
<<<FINE_CONTESTO>>>

DOMANDA: ${domanda}

OUTPUT_FORMAT: Fornisci la risposta in testo semplice e lineare suddiviso in paragrafi.

RESPONSE:
`;
}

function promptThread(contesto, conversazione, richiesta) {
  return `
SYSTEM: Sei un assistente AI versatile progettato per gestire conversazioni dinamiche e adattarti a varie richieste. Rispondi sempre in italiano.

TASK: Elabora la risposta alla richiesta "${richiesta}" sulla base del contesto fornito e della conversazione.

INSTRUCTIONS:
1. Analizza attentamente il contesto, la conversazione precedente e la richiesta: "${richiesta}".
2. Interpreta l'intento dell'utente senza limitarti a categorie predefinite.
3. Adatta la tua risposta in base all'intento percepito, sia esso una domanda, una richiesta di azione, un'istruzione specifica o altro.
4. Mantieni una stretta coerenza con il contesto della conversazione.
5. Basa la tua risposta sulle informazioni fornite nel contesto e nella conversazione.
6. Evita divagazioni o argomentazioni non direttamente pertinenti alla richiesta o al contesto.
7. Fai riferimento a informazioni precedenti quando sono pertinenti, citando specificamente la fonte.
8. Se l'intento non è chiaro, chiedi gentilmente chiarimenti invece di fare supposizioni.
9. Sii flessibile: se la richiesta implica un'azione specifica, adattati di conseguenza.
10. Se è necessario integrare con conoscenze generali, specifica chiaramente quando lo stai facendo.

CONTESTO:
<<<BEGIN_CONTESTO>>>
${contesto}
<<<END_CONTESTO>>>

<<<INIZIO_CONVERSAZIONE>>>
${conversazione}
<<<FINE_CONVERSAZIONE>>>

RICHIESTA: ${richiesta}

OUTPUT_FORMAT: Fornisci la risposta in testo semplice e lineare suddiviso in paragrafi.

RESPONSE:
`;
}

/*
1. max_new_tokens: 512
   Questo è un valore ragionevole per risposte di lunghezza media. 
   Potrebbe essere aumentato a 1024 o più se si desiderano risposte più lunghe e dettagliate.

2. temperature: 0.7
   Questo valore offre un buon equilibrio tra creatività e coerenza. 
   Va bene per la maggior parte degli usi.

3. top_k: 50
   Un valore standard che limita la selezione alle 50 parole più probabili.
   È appropriato per la maggior parte delle applicazioni.

4. top_p: 0.85
   Questo valore di nucleus sampling è buono per mantenere un buon equilibrio
    tra diversità e coerenza.

5. do_sample: true
   Corretto per generare testo più vario.

6. no_repeat_ngram_size: 3
   Aiuta a evitare ripetizioni a breve termine. 
   Potrebbe essere aumentato a 4 o 5 per evitare ripetizioni più lunghe.

7. num_beams: 5
   Un buon valore per la beam search.
    Aumentarlo potrebbe migliorare la qualità ma aumenterebbe anche il 
    tempo di elaborazione.

8. repetition_penalty: 1.2
   Un valore moderato per penalizzare le ripetizioni.
    Potrebbe essere aumentato leggermente (es. 1.3 o 1.4) se si notano 
    ancora troppe ripetizioni.

9. return_full_text: false
   Corretto se si vuole solo il nuovo testo generato.

10. max_time: 60.0
    Un minuto è un tempo ragionevole. Potrebbe essere aumentato 
    se si stanno generando risposte molto lunghe o complesse.

11. seed: 42
    Un valore fisso per la riproducibilità. 
    Va bene se si desidera coerenza tra le esecuzioni.

Suggerimenti per l'ottimizzazione:
1. Considera di aumentare max_new_tokens a 1024 o più se hai bisogno di risposte più lunghe.
2. Potresti aumentare leggermente no_repeat_ngram_size a 4 per ridurre ulteriormente le ripetizioni.
3. Se desideri risposte più precise e meno creative, potresti ridurre temperature a 0.6 e top_p a 0.8.
4. Per risposte più diverse, potresti aumentare temperature a 0.8 e top_p a 0.9.
5. Se noti ancora troppe ripetizioni, considera di aumentare repetition_penalty a 1.3 o 1.4.
*/

function getPayloadDoc(prompt) {
  const payload = {
    inputs: prompt,
    parameters: {
      task: "text2text-generation",
      max_new_tokens: 2000,
      num_return_sequences: 1,
      temperature: 0.4,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 3,
      num_beams: 4,
      repetition_penalty: 1.2,
      return_full_text: false,
      details: false,
      max_time: 90.0,
      seed: 42,
    },
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  };
  return payload;
}

function getPayloadBuildContext(prompt) {
  const payload = {
    inputs: prompt,
    parameters: {
      task: "text2text-generation",
      max_new_tokens: 5000,
      num_return_sequences: 1,
      temperature: 0.7,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 4,
      num_beams: 6,
      repetition_penalty: 1.2,
      return_full_text: false,
      details: false,
      max_time: 180.0,
      seed: 42,
    },
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  };
  return payload;
}

function getPayloadWithContext(prompt) {
  const payload = {
    inputs: prompt,
    parameters: {
      task: "text2text-generation",
      max_new_tokens: 4000,
      num_return_sequences: 1,
      temperature: 0.7,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 4,
      num_beams: 5,
      repetition_penalty: 1.4,
      return_full_text: false,
      details: false,
      max_time: 120.0,
      seed: 42,
    },
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  };
  return payload;
}

function getPayloadThread(prompt) {
  const payload = {
    inputs: prompt,
    parameters: {
      task: "text2text-generation",
      max_new_tokens: 4048,
      num_return_sequences: 1,
      temperature: 0.7,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 4,
      num_beams: 5,
      repetition_penalty: 1.4,
      return_full_text: false,
      details: false,
      max_time: 120.0,
      seed: 42,
    },
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  };
  return payload;
}
