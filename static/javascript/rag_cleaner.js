/** @format */

function cleanDoc(txt) {
  // Funzione di supporto per rimuovere caratteri di controllo non stampabili e caratteri speciali non comuni
  function removeControlCharacters(str) {
    return str.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
    // Funzione di supporto per rimuovere caratteri di controllo non stampabili
    // return str.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }

  return (
    txt
      // Rimuove caratteri di controllo non stampabili
      .split("\n")
      .map(removeControlCharacters)
      .join("\n")
      // Converte tabulazioni in spazi
      .replace(/\t/g, " ")
      // Rimuove spazi multipli
      .replace(/ +/g, " ")
      // Rimuove spazi all'inizio e alla fine di ogni riga
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Riduce linee vuote multiple a una sola
      .replace(/\n\s*\n/g, "\n\n")
      // Uniforma i caratteri di quotazione
      .replace(/["”“]/g, '"')
      .replace(/[‘’]/g, "'")
      // Uniforma i trattini
      .replace(/[–—]/g, "-")
      // Rimuove caratteri di escape visibili
      .replace(/\\[nrt]/g, "")
      // Rimuove riferimenti bibliografici in linea (esempio generico)
      .replace(/\[\d+\]/g, "")
      // Rimuove caratteri speciali non comuni (esempio generico, da personalizzare)
      .replace(/[^\w\s\.,;:!?'"()\-]/g, "")
      // Rimuove spazi prima della punteggiatura
      .replace(/ +([.,;:!?])/g, "$1")
      // Trim finale
      .trim()
  );
}

function cleanText(text) {
  // Rimuove spazi bianchi all'inizio e alla fine del testo
  let str = text.trim();
  // str = str.toLowerCase();

  // Rimuove caratteri speciali indesiderati (eccetto per punteggiatura comune)
  // str = str.replace(/[^\w\s.,!?;:()'"\-àèéìòù]/g, "");

  // Sostituisce spazi bianchi multipli con uno singolo
  str = str.replace(/\s+/g, " ");
  return str;
}

// testo con un elenco di paragrafi preceduti da -
function list2text(lst) {
  const frasi = lst.map((sentence) => `${sentence.trim()}`);
  text = frasi.join("\n");
  return text;
}

// elimina le parole tipo "## examplei :""
function cleanResponse(text) {
  // const ptr = /#+\s*(\w+)\s*(:\s*)?/g; // globalw
  const ptr = /#+\s*(\w+)\s*(:\s*)?/;  //solo la prima

  const s = text.replace(ptr, "");
  return s;
}

function numTokens(text) {
  const arr = text.match(/\b\w+\b/g);
  return arr.length;
}
