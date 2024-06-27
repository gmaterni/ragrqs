/** @format */

function cleanDoc(txt) {
  function removeControlCharacters(str) {
    return str.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
    // return str.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }

  txt = txt.split("\n").map(removeControlCharacters).join("\n");
  // Converte tabulazioni in spazi
  txt = txt.replace(/\t/g, " ");
  // Rimuove spazi multipli
  txt = txt.replace(/ +/g, " ");
  // Rimuove spazi all'inizio e alla fine di ogni riga
  txt = txt
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  // Riduce linee vuote multiple a una sola
  txt = txt.replace(/\n\s*\n/g, "\n");
  // Uniforma i caratteri di quotazione
  txt = txt.replace(/["”“]/g, '"').replace(/[‘’]/g, "'");
  // Uniforma i trattini
  txt = txt.replace(/[–—]/g, "-");
  // Rimuove caratteri di escape visibili
  txt = txt.replace(/\\[nrt]/g, "");
  // Rimuove riferimenti bibliografici in linea (esempio generico)
  // txt = txt.replace(/\[\d+\]/g, "");
  // Rimuove caratteri speciali non comuni (esempio generico, da personalizzare)
  txt = txt.replace(/[^\w\s\.,;:!?'"()\-]/g, "");
  // Rimuove spazi prima della punteggiatura
  txt = txt.replace(/ +([.,;:!?])/g, "$1");
  // Trim finale
  return txt.trim();
}

function cleanText(txt) {
  return txt
    .replace(/\t/g, " ") // Converte tabulazioni in spazi
    .replace(/ +/g, " ") // Rimuove spazi multipli
    .replace(/\n\s*\n/g, "\n") // Riduce linee vuote multiple a una sola
    .trim();
}

// testo con un elenco di paragrafi preceduti da -
function list2text(lst) {
  const frasi = lst.map((sentence) => `${sentence.trim()}`);
  text = frasi.join("\n");
  return text;
}

// elimina le parole tipo "## example :""
function cleanResponse(text) {
  // const ptr = /#+\s*(\w+)\s*(:\s*)?/g; // globalw
  const ptr = /#+\s*(\w+)\s*(:\s*)?/; //solo la prima
  const s = text.replace(ptr, "");
  return s;
}

function numTokens(text) {
  const arr = text.match(/\b\w+\b/g);
  return arr.length;
}
