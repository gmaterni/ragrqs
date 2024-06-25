/** @format */
"use strict";

const model_name = "mistralai/Mistral-7B-Instruct-v0.3";
// const model_name = "mistralai/Mixtral-8x7B-Instruct-v0.1";
// const model_name = "mistralai/Mixtral-8x22B-Instruct-v0.1"

function decodeTokenBase64(encodedToken) {
  return atob(encodedToken);
}

const encodedToken = "aGZfT0VBQVpoUmJtdEFLRENOVGZTcFZwVHdhbGpielBvQnlhbA"; // Questo è "your_token_here" codificato
const HF_TOKEN = decodeTokenBase64(encodedToken);

function promptDoc(documento, domanda) {
  return `
## Contesto
Il tuo compito è analizzare il documento fornito, estrarre informazioni pertinenti alla domanda posta e strutturare una risposta dettagliata.

## Documento
<<< ${documento} >>>

## Domanda
<<< ${domanda} >>>

## Istruzioni
1. Analisi del documento:
   - Leggi attentamente il documento e la domanda.
   - Identifica tutte le informazioni rilevanti per la domanda, incluse quelle indirettamente correlate.

2. Estrazione e organizzazione delle informazioni:
   - Crea un elenco delle informazioni rilevanti estratte.
   - Per ogni informazione, fornisci:
     a. Un titolo conciso che ne riassuma il contenuto.
     b. Un'analisi dettagliata, includendo il contesto e l'importanza rispetto alla domanda.
   - Se non ci sono informazioni rilevanti, specifica "Nessuna informazione pertinente trovata nel documento".

3. Formulazione della risposta:
   - Struttura la risposta in paragrafi chiari e coerenti.
   - Inizia con un'introduzione che riassuma i punti principali.
   - Sviluppa ogni punto nell'elenco in un paragrafo separato.
   - Concludi con una sintesi che risponda direttamente alla domanda.

4. Citazioni e riferimenti:
   - Quando possibile, includi brevi citazioni dirette dal documento, indicando chiaramente l'origine.
   - Per informazioni parafrasate, fai riferimento alla sezione o al contesto del documento originale.

5. Linguaggio e stile:
   - Usa esclusivamente l'italiano.
   - Mantieni un linguaggio chiaro, preciso e formalmente corretto.
   - Adatta il livello di complessità al contesto della domanda.

## Formato della risposta
1. Introduzione
2. Elenco delle informazioni estratte:
   - Titolo 1
     Analisi dettagliata
   - Titolo 2
     Analisi dettagliata
   (e così via)
3. Risposta strutturata alla domanda
4. Conclusione

## Nota finale
Ricorda che la domanda serve come guida per l'estrazione delle informazioni dal documento. La tua risposta deve essere completa, pertinente e basata esclusivamente sulle informazioni contenute nel documento fornito.
`;
}
// function promptDoc_0(documento, domanda) {
//   return `
// ## Contesto:
// Il tuo compito è esaminare il documento fornito e la domanda posta per estrarre tutte le informazioni contenute nel documento e pertinenti alla domanda.

// ## Istruzioni:
// 1. Leggi attentamente il documento e la domanda posta.
// 2. Identifica nel documento tutte le informazioni pertinenti alla domanda.
// 3. Se non ci sono informazioni pertinenti alla domanda, rispondi "Non ci sono informazioni rilevanti".
// 4. Redigi la risposta utilizzando le informazioni raccolte.
// 5. Formula la risposta in paragrafi chiari e lineari.
// 6. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

// ## Documento:
// <<< ${documento} >>>

// ## Domanda:
// ${domanda}

// ## Nota Finale:
// Distingui la richiesta dalla domanda. La domanda deve essere utilizzata come guida per estrarre le informazioni pertinenti dal documento.

//   `;
// }
function promptToContext(risposte, domanda) {
  return `
## Contesto
Il tuo compito è analizzare un insieme di risposte precedentemente generate, riorganizzarle ed ottimizzarle in relazione a una domanda specifica, eliminando ridondanze e mantenendo tutte le informazioni rilevanti.

## Input
Domanda: <<< ${domanda} >>>
Risposte precedenti: <<< ${risposte} >>>

## Istruzioni
1. Analisi delle risposte:
   - Leggi attentamente la domanda e tutte le risposte precedenti.
   - Identifica i temi principali e le informazioni chiave in relazione alla domanda.

2. Valutazione e organizzazione delle informazioni:
   - Raggruppa le informazioni per tema o argomento.
   - Elimina le ridondanze, mantenendo la versione più completa o accurata di ogni informazione.
   - Identifica e segnala eventuali contraddizioni tra le risposte.
   - Prioritizza le informazioni in base alla loro rilevanza per la domanda.

3. Strutturazione della risposta ottimizzata:
   - Crea un elenco numerato di punti principali, ciascuno con un titolo conciso.
   - Sotto ogni punto principale, fornisci un sottoelenco con dettagli e informazioni di supporto.
   - Assicurati che ogni informazione unica e rilevante dalle risposte originali sia inclusa.

4. Sintesi e contestualizzazione:
   - Scrivi un breve paragrafo introduttivo che riassuma i punti chiave.
   - Dopo l'elenco dettagliato, fornisci un paragrafo conclusivo che colleghi le informazioni direttamente alla domanda originale.

5. Revisione e raffinamento:
   - Rivedi l'elenco ottimizzato per garantire coerenza, chiarezza e completezza.
   - Assicurati che il linguaggio sia chiaro, preciso e formalmente corretto in italiano.
   - Verifica che la struttura sia adatta per un utilizzo successivo come contesto per la domanda originale.

## Formato della risposta
1. Paragrafo introduttivo (sintesi dei punti chiave)
2. Elenco numerato di punti principali:
   1. [Titolo del primo punto principale]
      - Dettaglio 1
      - Dettaglio 2
      ...
   2. [Titolo del secondo punto principale]
      - Dettaglio 1
      - Dettaglio 2
      ...
   (e così via)
3. Paragrafo conclusivo (collegamento alla domanda originale)

## Nota finale
La domanda fornita serve come criterio guida per selezionare e organizzare le informazioni dalle risposte precedenti. L'obiettivo è creare un contesto ottimizzato e coerente per rispondere alla domanda, eliminando ridondanze ma mantenendo tutte le informazioni uniche e rilevanti.
  `;
}

// function promptToContext_0(risposte, domanda) {
//   return `
// ## Contesto:
// Il tuo compito è quello di analizzare le risposte precedenti e organizzarle senza perdere alcuna informazione.

// ## Istruzioni:
// 1. Leggi attentamente tutte le risposte precedenti fornite.
// 2. Raggruppa le risposte ridondanti.
// 3. Riformula le risposte in modo coerente, includendo tutte le informazioni.
// 4. Riesamina attentamente l'elenco di risposte riorganizzato per assicurarti che tutte le informazioni siano state incluse.
// 5. Redigi la risposta in paragrafi chiari e lineari.
// 6. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

// ## Risposte Precedenti:
// <<< ${risposte} >>>

// ## Domanda:
// ${domanda}

// ## Nota Finale:
// Distingui la richiesta dalla domanda. La domanda deve essere utilizzata come criterio di selezione per le informazioni contenute nelle risposte precedenti.
// La risposta è costituita dalle informazioni raccolte e organizzate.
//   `;
// }
function promptWithContext(risposte, domanda) {
  return `
  ## Contesto
Il tuo compito è rispondere a una domanda specifica utilizzando esclusivamente le informazioni fornite, che sono state precedentemente estratte e organizzate da vari documenti.

## Input
Domanda: <<< ${domanda} >>>
Contesto: <<< ${contesto} >>>

## Istruzioni
1. Analisi della domanda e del contesto:
   - Leggi attentamente la domanda e tutte le informazioni fornite nel contesto.
   - Identifica le parti del contesto più rilevanti per rispondere alla domanda.

2. Valutazione delle informazioni:
   - Verifica la coerenza delle informazioni nel contesto.
   - Identifica eventuali contraddizioni o incongruenze.
   - Determina se ci sono lacune significative nelle informazioni fornite rispetto alla domanda posta.

3. Formulazione della risposta:
   - Costruisci una risposta utilizzando esclusivamente le informazioni fornite nel contesto.
   - Organizza la risposta in modo logico e coerente.
   - Se pertinente, indica quali parti della risposta sono supportate da quali sezioni del contesto.
   - Segnala esplicitamente eventuali lacune o incertezze nella risposta.

4. Revisione e raffinamento:
   - Assicurati che la risposta sia direttamente pertinente alla domanda posta.
   - Verifica che il linguaggio sia chiaro, preciso e formalmente corretto in italiano.
   - Valuta il livello di confidenza della risposta basata sulle informazioni disponibili.

## Formato della risposta
1. Risposta diretta alla domanda (1-2 frasi)
2. Spiegazione dettagliata (2-3 paragrafi):
   - Elaborazione dei punti principali
   - Connessioni tra le informazioni fornite
   - Eventuali considerazioni aggiuntive
3. Limitazioni e incertezze (se presenti):
   - Lacune nelle informazioni
   - Possibili contraddizioni o ambiguità
4. Livello di confidenza della risposta (alto, medio, basso) con breve giustificazione

## Nota finale
La risposta deve basarsi esclusivamente sulle informazioni fornite nel contesto. Non introdurre conoscenze esterne o speculazioni. Se la domanda non può essere completamente risposta con le informazioni disponibili, indicalo chiaramente nella risposta.
`;
}
// function promptWithContext_0(risposte, domanda) {
//   return `
// ## Contesto:
// Utilizza le seguenti informazioni estratte dai documenti forniti per rispondere alla domanda specifica.

// ## Istruzioni:
// 1. Leggi attentamente le informazioni fornite, che sono state estratte dai documenti pertinenti.
// 2. Identifica le informazioni rilevanti per rispondere alla domanda posta.
// 3. Costruisci la risposta utilizzando esclusivamente le informazioni fornite.
// 4. Organizza la risposta in paragrafi coerenti e ben strutturati.
// 5. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

// ## Informazioni Estresse dai Documenti:
// <<< ${risposte} >>>

// ## Domanda Specificata:
// ${domanda}

// `;
// }

function promptThread(history, domanda) {
  return `
  ${history}
  ${domanda}
`;
}

const getPayloadDoc = (prompt) => {
  let payload = {
    inputs: prompt,
    parameters: {
      task: "text-generation",
      max_new_tokens: 512,
      num_return_sequences: 1,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.85,
      do_sample: true,
      no_repeat_ngram_size: 3,
      num_beams: 5,
      repetition_penalty: 1.2,
      return_full_text: false,
      details: false,
      max_time: 60.0,
      seed: 42,
    },
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  };
  return payload;
};

const getPlayloadContext = (prompt) => {
  let payload = {
    inputs: prompt,
    parameters: {
      task: "text-generation",
      max_new_tokens: 1024,
      num_return_sequences: 2,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.85,
      do_sample: true,
      no_repeat_ngram_size: 3,
      num_beams: 5,
      repetition_penalty: 1.2,
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
};

const getPayloadQuery = (prompt) => {
  const seed = Math.floor(Math.random() * Math.pow(2, 32));
  let payload = {
    inputs: prompt,
    parameters: {
      task: "text-generation",
      max_new_tokens: 512,
      num_return_sequences: 1,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.9,
      do_sample: true,
      no_repeat_ngram_size: 3,
      num_beams: 5,
      repetition_penalty: 1.2,
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
};

async function requestPost(payload) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model_name}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (response.status !== 200) {
      throw new Error(`HTTP error status: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.length || !data[0].generated_text) {
      throw new Error("La risposta dal server non è valida");
    }
    const text = data[0].generated_text;
    return text.trim();
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Request canceled:", error.message);
    } else if (error.response) {
      console.error("HTTP error status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error in setting up the request:", error.message);
    }
    const s = JSON.stringify(payload);
    const msg = `${s}`;
    console.error(msg);
    alert("requestPost\n" + error);
    throw error;
  }
}

async function requestGet(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(arrayBuffer);
    return text;
  } catch (error) {
    console.error(error);
    let message;
    if (error.name === "AbortError") {
      message = "Request was aborted";
    } else if (error.message.includes("HTTP error! status")) {
      message = error.message;
    } else {
      message = "An error occurred";
    }
    alert(`requestGet()\nurl: ${url}\n${message}`);
    throw error;
  }
}
