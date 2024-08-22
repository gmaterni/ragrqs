/** @format */
function removeTag(txt) {
  txt = txt.replace(/<<</g, "").replace(/>>>/g, "");
  txt = txt.replace(/<</g, "").replace(/>>/g, "");
  return txt;
}
function uniteBrokenWords(txt) {
  const regex = /-\n/g;
  const unitedText = txt.replace(regex, "");
  return unitedText;
}

function cleanDoc(txt) {
  try {
    txt = removeTag(txt);
    //unisce le parole spezzate a di fine riga
    txt = txt.replace(/-\n/g, "");
    // Rimuove caratteri non stampabili specifici
    const charsRm = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;
    txt = txt.replace(charsRm, "");
    // Sostituisce spazi non standard e altri caratteri con uno spazio
    const charsSrp = /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\r\f\v]/g;
    txt = txt.replace(charsSrp, " ");
    // Mantieni le sequenze di escape comuni
    txt = txt.replace(/\\([nrtfb])/g, "$1");
    // Mantieni le sequenze Unicode
    txt = txt.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2})/g, "$1");
    // Mantieni i backslash nei path di file
    txt = txt.replace(/\\([a-zA-Z]:\\|\\\\[a-zA-Z0-9_]+\\)/g, "\\\\$1");
    // Rimuovi tutti gli altri backslash
    txt = txt.replace(/\\/g, "");
    // Uniforma i caratteri di quotazione
    txt = txt.replace(/“/g, '"').replace(/”/g, '"');
    // Rimuove spazi prima della punteggiatura
    txt = txt.replace(/ +([.,;:!?])/g, "$1");
    // Rimuove linee vuote multiple
    txt = txt.replace(/\n\s*\n/g, "\n\n");
    txt = txt.replace(/\n{3,}/g, "\n\n");
    // Rimuove spazi multipli
    txt = txt.replace(/ +/g, " ");
    return txt.trim();
  } catch (e) {
    console.error(e);
    return "Errore di codifica del documento";
  }
}

function cleanResponse(txt) {
  try {
    // Rimuove caratteri non stampabili specifici
    const charsRm = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;
    txt = txt.replace(charsRm, "");
    // Sostituisce spazi non standard e altri caratteri con uno spazio
    const charsSrp = /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\r\f\v]/g;
    txt = txt.replace(charsSrp, " ");
    // Mantieni le sequenze di escape comuni
    txt = txt.replace(/\\([nrtfb])/g, "$1");
    // Mantieni le sequenze Unicode
    txt = txt.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2})/g, "$1");
    // Mantieni i backslash nei path di file
    txt = txt.replace(/\\([a-zA-Z]:\\|\\\\[a-zA-Z0-9_]+\\)/g, "\\\\$1");
    // Rimuovi tutti gli altri backslash
    txt = txt.replace(/\\/g, "");
    // Sostituisce le sequenze di più di due newline con due newline
    txt = txt.replace(/\n{3,}/g, "\n\n");
    // unifica spazi multipli
    txt = txt.replace(/ +/g, " ");
    return txt.trim();
  } catch (e) {
    console.error(e);
    return `Errore di codifica nella risposta\n${e}`;
  }
}

function cleanOut(txt) {
  // Formatta gli elenchi puntati per una migliore leggibilità
  // txt = txt.replace(/^(\s*[-*•])(\s*)/gm, "\n$1 ");
  // Formatta gli elenchi numerati per una migliore leggibilità
  // txt = txt.replace(/^(\s*\d+\.)(\s*)/gm, "\n$1 ");
  // Aggiunge una riga vuota prima e dopo i blocchi di codice
  // txt = txt.replace(/(```[\s\S]*?```)/g, "\n\n$1\n\n");
  // Aggiunge un'andata a capo dopo ogni punto, eccetto quando seguito da newline o fine stringa
  // txt = txt.replace(/\.(?!\n|$)/g, ".\n");
  // Sostituisce le sequenze di più di due newline con due newline
  txt = txt.replace(/\n{3,}/g, "\n\n");
  // Rimuove gli spazi bianchi extra alla fine di ogni riga
  // txt = txt.replace(/ +/g, " ");
  // txt = txt.replace(/\s+$/gm, "");
  return txt;
}

// <<<doc_name>>> => Documento: doc_name
// function subResponseDOcTag(txt) {
//   const regex = /<<<(.*?)>>>/;
//   const result = txt.replace(regex, (match, p1) => `Documento: ${p1}`);
//   return result;
// }
