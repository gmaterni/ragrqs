/** @format */

// const removeChars = (txt) => {
//   const charsRm = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;
//   txt = txt.replace(charsRm, "");
//   return txt;
// };

// const replaceChars = (txt) => {
//   const charsSrp = /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\r\f\v]/g;
//   txt = txt.replace(charsSrp, " ");
//   txt = txt.replace(/ +/g, " ");
//   return txt.trim();
// };

// const removeTag = (txt) => {
//   txt = txt.replace(/<<<|>>>|<<|>>/g, "");
//   return txt;
// };

// function cleanDoc(txt) {
//   try {
//     txt = removeTag(txt);
//     txt = removeChars(txt);
//     txt = replaceChars(txt);
//     txt = txt.replace(/\n/g, " ");
//     txt = txt.replace(/\t/g, " ");
//     txt = txt.replace(/ +/g, " ");
//     txt = txt.replace(/\n\s*\n/g, "\n");
//     txt = txt.replace(/[“”]/g, '"');
//     txt = txt.replace(/[‘’]/g, "'");
//     txt = txt.replace(/[«»„“]/g, '"');
//     txt = txt.replace(/[–—]/g, "-");
//     txt = txt.replace(/\\[nrt]/g, "");
//     txt = txt.replace(/[^\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?'"()-]/g, "");
//     return txt.trim();
//   } catch (e) {
//     xerror(e);
//     return "Errore di codifica nel documento";
//   }
// }

// function cleanResponse(txt) {
//   try {
//     txt = removeChars(txt);
//     txt = replaceChars(txt);
//     txt = txt.replace(/\t/g, " ");
//     txt = txt.replace(/ +/g, " ");
//     txt = txt.replace(/\n\s*\n/g, "\n");
//     txt = txt.replace(/[“”]/g, '"');
//     txt = txt.replace(/[‘’]/g, "'");
//     txt = txt.replace(/[«»„“]/g, '"');
//     txt = txt.replace(/[–—]/g, "-");
//     txt = txt.replace(/\\[nrt]/g, "");
//     txt = txt.replace(/[^\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?'"()-]/g, "");
//     return txt.trim();
//   } catch (e) {
//     xerror(e);
//     return "Errore di codifica nela risposta";
//   }
// ////////////////////////////////
const removeChars = (txt) => {
  const chars_rm = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;
  txt = txt.replace(chars_rm, '');
  return txt;
}

const replaceChars = (txt) => {
    const chars_srp = /[\u00A0\u2000-\u200A\u202F\u205F\u3000\t\r\f\v]/g;
  txt = txt.replace(chars_srp, ' ');
  return txt;
}

  const removeTag = (txt) => {
    txt = txt.replace(/<<</g, '').replace(/>>>/g, '');
  txt = txt.replace(/<</g, '').replace(/>>/g, '');
  return txt;
}

function cleanDoc(txt) {
  try {
      txt = removeTag(txt);
      txt = removeChars(txt);
      txt = replaceChars(txt);
      // Removes multiple empty lines
      txt = txt.replace(/\n\s*\n/g, '\n');
      // Removes visible escape characters like \n, \r, \t
      txt = txt.replace(/\t/g, ' ');
      txt = txt.replace(/\r/g, ' ');
      txt = txt.replace(/\n/g, ' ');

      // Uniforms quotation characters
      txt = txt.replace(/“/g, '"');
      txt = txt.replace(/”/g, '"');

      // Replaces long dashes with normal dashes
      // txt = txt.replace(/–/g, '-');
      // txt = txt.replace(/—/g, '-');

      // Removes uncommon special characters while keeping accented characters and punctuation
      txt = txt.replace(/[^\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?'"()-]/g, '');
      // Removes spaces before punctuation
      txt = txt.replace(/ +([.,;:!?])/g, '$1');
      // Removes multiple spaces
      txt = txt.replace(/ +/g, ' ');
      return txt.trim();
  } catch (e) {
      xerror(e);
      return "Errore di codifica nella risposta";
  }
}

function cleanResponse(txt) {
  try {
      txt = removeChars(txt);
      txt = replaceChars(txt);
      // Removes multiple empty lines
      txt = txt.replace(/\n\s*\n/g, '\n');

      // Removes visible escape characters like \n, \r, \t
      txt = txt.replace(/\t/g, ' ');
      txt = txt.replace(/\r/g, ' ');
      txt = txt.replace(/\n/g, ' '); //TODO

      // Replaces long dashes with normal dashes
      // txt = txt.replace(/–/g, '-');
      // txt = txt.replace(/—/g, '-');

      // Removes uncommon special characters while keeping accented characters and punctuation
      txt = txt.replace(/[^\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?'"()-]/g, '');

      // Removes spaces before punctuation
      txt = txt.replace(/ +([.,;:!?])/g, '$1');
      // Removes multiple spaces
      txt = txt.replace(/ +/g, ' ');
      return txt.trim();
  } catch (e) {
      console.error(e);
      return "Errore di codifica nella risposta";
  }
}

//////////////////////////////////
function cleanOutput(txt) {
  try {
    txt = removeChars(txt);
    txt = replaceChars(txt);
    txt = txt.replace(/\t/g, " ");
    txt = txt.replace(/\n\s*\n/g, "\n");
    // txt = txt.replace(/[“”]/g, '"');
    // txt = txt.replace(/[‘’]/g, "'");
    // txt = txt.replace(/[«»„“]/g, '"');
    // txt = txt.replace(/[–—]/g, "-");
    txt = txt.replace(/\r/g, " ");
    // txt = txt.replace(/\n/g, " ");//TODO
    txt = txt.replace(/[^\w\sàèéìòùÀÈÉÌÒÙáéíóúÁÉÍÓÚäëïöüÄËÏÖÜâêîôûÂÊÎÔÛçÇñÑ.,;:!?'"()-]/g, "");
    txt = txt.replace(/ +/g, " ");
    return txt.trim();
  } catch (e) {
    xerror(e);
    return "Errore di codifica nell'output";
  }
}

function list2text(docList) {
  const docDict = {};

  function getLabel(txt) {
    const match = txt.match(/<<<(.*?)>>>/);
    return match ? match[1] : null;
  }

  for (let doc of docList) {
    const docName = getLabel(doc);
    // const content = doc.replace(/<<<.*?>>>/g, ''); //TODO
    const content = doc.replace(/<<<.*?>>>/, "");
    if (docName in docDict) {
      docDict[docName] += `\n ${content}`;
    } else {
      docDict[docName] = content;
    }
  }
  const lst = [];
  for (let [docName, content] of Object.entries(docDict)) {
    lst.push(`Documento: ${docName}.\n${content}`);
  }
  return lst.join("\n\n");
}

// <<<doc_name>>> => Documento: doc_name
function subResponseDOcTag(txt) {
  const regex = /<<<(.*?)>>>/;
  const result = txt.replace(regex, (match, p1) => `Documento: ${p1}`);
  return result;
}
