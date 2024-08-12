/** @format */

const removeChars = (txt) => {
  const charsRm = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;
  return txt.replace(charsRm, "");
};

const replaceChars = (txt) => {
  const charsSrp = /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\r\f\v]/g;
  return txt.replace(charsSrp, " ");
};

const removeTag = (txt) => {
  return txt.replace(/<<</g, "").replace(/>>>/g, "").replace(/<<|>>/g, "");
};

const ALLOWED_CHARS = /\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?\'"()-/;

const cleanDoc = (txt) => {
  try {
    txt = removeTag(txt);
    txt = removeChars(txt);
    txt = replaceChars(txt);
    // Rimuove linee vuote multiple
    txt = txt.replace(/\n\s*\n/g, "\n");
    // Rimuove caratteri di escape visibili come \n, \r, \t
    txt = txt.replace(/[\t\r]/g, " ");
    // Uniforma i caratteri di quotazione
    txt = txt.replace(/“/g, '"').replace(/”/g, '"');
    // Rimuove caratteri speciali non comuni mantenendo i caratteri accentati e punteggiatura
    txt = txt.replace(new RegExp(`[^${ALLOWED_CHARS.source}]`, "g"), " ");
    // Rimuove spazi prima della punteggiatura
    txt = txt.replace(/ +([.,;:!?])/g, "$1");
    // Rimuove spazi multipli
    txt = txt.replace(/ +/g, " ");
    return txt.trim();
  } catch (e) {
    console.error(e);
    return "Errore di codifica nella risposta";
  }
};

const cleanResponse = (txt) => {
  try {
    txt = removeChars(txt);
    txt = replaceChars(txt);
    // Rimuove linee vuote multiple
    txt = txt.replace(/\n\s*\n/g, "\n");
    // Rimuove caratteri di escape visibili come \n, \r, \t
    txt = txt.replace(/[\t\r\n]/g, " ");
    // Rimuove caratteri speciali non comuni mantenendo i caratteri accentati e punteggiatura
    txt = txt.replace(new RegExp(`[^${ALLOWED_CHARS.source}]`, "g"), " ");
    // Rimuove spazi prima della punteggiatura
    txt = txt.replace(/ +([.,;:!?])/g, "$1");
    // Rimuove spazi multipli
    txt = txt.replace(/ +/g, " ");
    return txt.trim();
  } catch (e) {
    console.error(e);
    return "Errore di codifica nella risposta";
  }
};

const cleanOutput = (text) => {
  txt = removeTag(txt);
  // Rimuove gli spazi bianchi iniziali e finali
  text = text.trim();
  // Sostituisce le sequenze di più di due newline con due newline
  text = text.replace(/\n{3,}/g, "\n\n");
  // Rimuove gli spazi bianchi extra all'inizio di ogni riga
  text = text.replace(/^\s+/gm, "");
  // Formatta gli elenchi puntati per una migliore leggibilità
  text = text.replace(/^(\s*[-*•])(\s*)/gm, "\n$1 ");
  // Formatta gli elenchi numerati per una migliore leggibilità
  text = text.replace(/^(\s*\d+\.)(\s*)/gm, "\n$1 ");
  // Aggiunge una riga vuota prima e dopo i blocchi di codice
  text = text.replace(/(```[\s\S]*?```)/g, "\n\n$1\n\n");
  // Aggiunge un'andata a capo dopo ogni punto, eccetto quando seguito da newline o fine stringa
  text = text.replace(/\.(?!\n|$)/g, ".\n");
  // Rimuove gli spazi bianchi extra alla fine di ogni riga
  text = text.replace(/\s+$/gm, "");
  return text;
};

// function list2text(docList) {
//   const docDict = {};

//   function getLabel(txt) {
//     const match = txt.match(/<<<(.*?)>>>/);
//     return match ? match[1] : null;
//   }

//   for (let doc of docList) {
//     const docName = getLabel(doc);
//     // const content = doc.replace(/<<<.*?>>>/g, ''); //TODO
//     const content = doc.replace(/<<<.*?>>>/, "");
//     if (docName in docDict) {
//       docDict[docName] += `\n ${content}`;
//     } else {
//       docDict[docName] = content;
//     }
//   }
//   const lst = [];
//   for (let [docName, content] of Object.entries(docDict)) {
//     lst.push(`Documento: ${docName}.\n${content}`);
//   }
//   return lst.join("\n\n");
// }

// <<<doc_name>>> => Documento: doc_name
function subResponseDOcTag(txt) {
  const regex = /<<<(.*?)>>>/;
  const result = txt.replace(regex, (match, p1) => `Documento: ${p1}`);
  return result;
}
