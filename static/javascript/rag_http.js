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
## Contesto:
Il tuo compito è esaminare il documento fornito e la domanda posta per estrarre tutte le informazioni contenute nel documento e pertinenti alla domanda.

## Istruzioni:
1. Leggi attentamente il documento e la domanda posta.
2. Identifica nel documento tutte le informazioni pertinenti alla domanda.
3. Se non ci sono informazioni pertinenti alla domanda, rispondi "Non ci sono informazioni rilevanti".
4. Redigi la risposta utilizzando le informazioni raccolte.
5. Formula la risposta in paragrafi chiari e lineari.
6. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

## Documento:
<<< ${documento} >>>

## Domanda:
${domanda}

## Nota Finale:
Distingui la richiesta dalla domanda. La domanda deve essere utilizzata come guida per estrarre le informazioni pertinenti dal documento.

  `;
}

function promptToContext(risposte, domanda) {
  return `
## Contesto:
Il tuo compito è quello di analizzare le risposte precedenti e organizzarle senza perdere alcuna informazione.

## Istruzioni:
1. Leggi attentamente tutte le risposte precedenti fornite.
2. Raggruppa le risposte ridondanti.
3. Riformula le risposte in modo coerente, includendo tutte le informazioni.
4. Riesamina attentamente l'elenco di risposte riorganizzato per assicurarti che tutte le informazioni siano state incluse.
5. Redigi la risposta in paragrafi chiari e lineari.
6. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

## Risposte Precedenti:
<<< ${risposte} >>>

## Domanda:
${domanda}

## Nota Finale:
Distingui la richiesta dalla domanda. La domanda deve essere utilizzata come criterio di selezione per le informazioni contenute nelle risposte precedenti.
La risposta è costituita dalle informazioni raccolte e organizzate.
  `;
}

function promptWithContext(risposte, domanda) {
  return `
## Contesto:
Utilizza le seguenti informazioni estratte dai documenti forniti per rispondere alla domanda specifica.

## Istruzioni:
1. Leggi attentamente le informazioni fornite, che sono state estratte dai documenti pertinenti.
2. Identifica le informazioni rilevanti per rispondere alla domanda posta.
3. Costruisci la risposta utilizzando esclusivamente le informazioni fornite.
4. Organizza la risposta in paragrafi coerenti e ben strutturati.
5. Rispondi esclusivamente in italiano, utilizzando un linguaggio chiaro e corretto.

## Informazioni Estresse dai Documenti:
<<< ${risposte} >>>

## Domanda Specificata:
${domanda}

`;
}

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
