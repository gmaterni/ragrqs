/** @format */

"use strict";

function promptDoc(documento, domanda, docName) {
  return `
SYSTEM: Sei un assistente AI specializzato nell'analisi di documenti. Rispondi ESCLUSIVAMENTE in italiano. Non usare altre lingue in nessuna parte della risposta.

TASK: Analizza il documento ${docName} ed estrai le informazioni rilevanti per rispondere alla domanda fornita.

INSTRUCTIONS:
1. Identifica la tipologia e lo scopo del documento (es. articolo scientifico, racconto, saggio, documento tecnico) e adatta l'analisi di conseguenza.
2. Analizza attentamente il documento fornito e identifica le informazioni pertinenti alla domanda.
3. Estrai i concetti chiave e fai inferenze ragionevoli.
3. Focalizzati sull'estrazione di concetti chiave e inferenze rilevanti per la domanda.
4. Seleziona citazioni specifiche direttamente collegate alla domanda.
5. Prepara una risposta chiara e dettagliata.
6. Inizia con una breve introduzione, sviluppa l'analisi, esponi le inferenze e concludi con una sintesi.
7. Cita le fonti quando è utile per chiarire informazioni o inferenze.
8. Se trovi contenuti in altre lingue nel documento, traducili in italiano prima di includerli nella risposta.
9. Mantieni un tono oggettivo e uno stile fluido e coerente.

DOCUMENTO:
<<<INIZIO_DOCUMENTO>>>
${documento}
<<<FINE_DOCUMENTO>>>

DOMANDA:
${domanda}

OUTPUT_FORMAT:
La risposta dovrà essere strutturata nel seguente modo:
- Introduzione:
- Concetti chiav:e
- Citazioni:
- Inferenze:
- Dettagli rilevanti:
- Conclusione:

RESPONSE:
`;
}

function promptBuildContext(informazioni, domanda) {
  return `
SYSTEM: Sei un assitente AI specializzato nella riorganizzazione di informazioni come contesto nelle interrogazioni ad un LLM. Rispondi ESCLUSIVAMENTE in italiano. Non usare altre lingue in nessuna parte della risposta.

TASK: Analizza e riorganizza le informazioi rilevanti per rispondere alla domada  fornite seguendo le istruzioni.

INSTRUCTIONS:
1. Analizza attentamente le informazioi e identifica i temi  e i concetti pertinenti  alla domanda.
2. Estrai i concetti chiave e fai inferenze ragionevoli.
3. Organizza le informazioni in una struttura logica e coerente.
4. Prepara una risposta che riorganizzi i contenuti, dando priorità alle informazioni più importanti o rilevanti.
5. Includi una breve introduzione che presenti i temi principali.
6. Sviluppa l'analisi raggruppando le informazioni per argomenti correlati.
7. Presenta le inferenze e le connessioni tra i diversi concetti.
8. Includi, se rilevanti, dettagli specifici come nomi propri, termini tecnici, date o luoghi che contribuiscono alla precisione del contesto.
9. Concludi con una sintesi che riassuma i punti chiave e la struttura logica.
10. Evidenzia le connessioni tra contenuti estratti da fonti diverse.
11. Effettua un controllo finale per assicurarti che tutte le informazioni chiave siano state incluse.
12. Mantieni un tono oggettivo e uno stile fluido e coerente.

INFORAZIONI:
<<<INIZIO_INFORMAZIONI>>>
${informazioni}
<<<FINE_INFORMAZIONI>>>

DOMANDA:
${domanda}

OUTPUT_FORMAT:
La risposta dovrà essere strutturata nel seguente modo:
- Introduzione:
- Concetti chiav:e
- Citazioni:
- Inferenze:
- Connessioni fra contenuti:
- Dettagli rilevanti:
- Conclusione:

RESPONSE:
`;
}

function promptWithContext(contesto, domanda) {
  return `
SYSTEM: Sei un sistema AI specializzato nell'analisi semantica di informazioni estratte da documenti. Rispondi sempre ed esclusivamente in italiano.

TASK: Elabora la risposta alla domanda sulla base del contesto fornito.

INSTRUCTIONS:
1. Analizza attentamente il contesto e identifica le informazioni pertinenti alla domanda.
2. Estrai i concetti chiave e fai inferenze ragionevoli.
3. Prepara una risposta chiara e dettagliata utilizzandoo al meglio il contesto.
4. Inizia con una breve introduzione, sviluppa l'analisi, elabora le inferenze e concludi con una sintesi.
5. Se la domanda richiede di citare le fonti, fai riferimento al documento fornito distinguendolo chiaramente da eventuali altre fonti citate all'interno del contesto stesso.
6. Mantieni un tono oggettivo e uno stile fluido e coerente.

CONTESTO:
<<<INIZIO_CONTESTO>>>
${contesto}
<<<FINE_CONTESTO>>>

DOMANDA:
${domanda}

OUTPUT_FORMAT:
Rispondi con un testo piano suddiviso in paragrafi.Evita di usare etichette, elenchi o marcatori speciali.

RESPONSE:
`;
}

function promptThread(contesto, conversazione, richiesta) {
  return `
SYSTEM: Sei un assistente AI versatile progettato per gestire conversazioni dinamiche e adattarti a varie richieste. Rispondi sempre in italiano.

TASK: Elabora la risposta alla richiesta sulla base del contesto fornito e della conversazione.

INSTRUCTIONS:
1. Analizza attentamente il contesto, la conversazione precedente e la richiesta attuale.
2. Interpreta l'intento dell'utente senza limitarti a categorie predefinite.
3. Adatta la tua risposta in base all'intento percepito, sia esso una domanda, una richiesta di azione, un'istruzione specifica o altro.
4. Mantieni una stretta coerenza con il contesto della conversazione.
5. Basa la tua risposta principalmente sulle informazioni fornite nel contesto e nella conversazione.
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

RICHIESTA:
${richiesta}

OUTPUT_FORMAT:
Rispondi con un testo piano suddiviso in paragrafi.Evita di usare etichette, elenchi o marcatori speciali.

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
      max_new_tokens: 1024,
      num_return_sequences: 1,
      temperature: 0.2,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 4,
      num_beams: 4,
      repetition_penalty: 1.4,
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
      max_new_tokens: 6000,
      num_return_sequences: 1,
      temperature: 0.2,
      top_p: 0.85,
      top_k: 30,
      do_sample: false,
      no_repeat_ngram_size: 4,
      num_beams: 4,
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
      max_new_tokens: 2048,
      num_return_sequences: 1,
      temperature: 0.3,
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
      max_new_tokens: 2048,
      num_return_sequences: 1,
      temperature: 0.3,
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
