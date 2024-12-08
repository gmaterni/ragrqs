/** @format */
/**
 * @license
 * rag_rqs
 * Copyright (C) 2024 [Il tuo nome]
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";
const VERS = "0.1.60 (62-12-2024)";

var xlog = console.log;
var xerror = console.error;
// let T0 = {};

// var start_performance = function (k) {
//   T0.k = performance.now();
// };

// var log_performance = function (k, msg = "") {
//   const t1 = performance.now();
//   const d = t1 - T0.k;
//   console.log(msg, d);
//   T0.k = t1;
//   return d;
// };

// function showMessage(message, duraction = 5000) {
//   const popup = document.createElement("div");
//   popup.className = "msg";
//   popup.innerText = message;
//   document.body.appendChild(popup);
//   setTimeout(function () {
//     document.body.removeChild(popup);
//   }, duraction);
// }

const cancelRequest = () => {
  const ok = confirm("Confermi Cancellazione Richeista ?");
  if (!ok) return;
  HfRequest.cancelRequest();
  hideSpinner();
};

const showSpinner = () => {
  const spinner = document.getElementById("spinner");
  spinner.classList.add("show-spinner");
  spinner.addEventListener("click", cancelRequest);
};

const hideSpinner = () => {
  const spinner = document.getElementById("spinner");
  spinner.classList.remove("show-spinner");
  spinner.removeEventListener("click", cancelRequest);
};

var tm;

function openApp() {
  setTimeout(() => {
    tm = umgm();
    wnds.init();
    Menu.init();
    TextInput.init();
    TextOutput.init();
    Rag.init();
    document.querySelector(".menu-btn").checked = false;
    release();
    showHistory();
    getTheme();
  }, 10);
}

// function openApp() {
//   tm = umgm();
//   wnds.init();
//   Menu.init();
//   TextInput.init();
//   TextOutput.init();
//   Rag.init();
//   document.querySelector(".menu-btn").checked = false;
//   release();
//   showHistory();
// }

// Visualizza la storia della conversazione
function showHistory() {
  const txt = ThreadMgr.getThread();
  setOutText(txt);
  // const p = document.querySelector("#id-text-out .pre-text");
  // p.textContent = txt;
  // setTimeout(() => {
  //   p.scrollTop = p.scrollHeight;
  // }, 0);
}

function release() {
  document.querySelector(".release").innerHTML = VERS;
}

// README
const op0 = async function (e) {
  const text = await requestGet("./help1.html");
  wnds.wdiv.show(text);
};

//query iniziale
function showQuery(e) {
  const txt = `\n${Rag.ragQuery}`;
  wnds.wpre.show(txt);
  // Menu.close();
}

//Risposta Rsg
function showRagResponse(e) {
  const txt = `\n${Rag.ragAnswer}`;
  wnds.wpre.show(txt);
}

//conversazione
function showThread(e) {
  const txt = ThreadMgr.getThread();
  wnds.wpre.show(txt);
}

//elenco risposte
function elencoRisposte(e) {
  let rs = [...Rag.answers];
  if (rs.length == 0) {
    rs = UaDb.readArray(ID_RESPONSES);
  }
  if (rs.length == 0) return;
  const text = rs
    .map((x, i) => {
      // x = subResponseDOcTag(x);
      return `\n[${i + 1}]\n ${x.trim()}`;
    })
    .join("\n");
  wnds.wpre.show(text);
}

//contesto
function showContesto(e) {
  const txt = `${Rag.ragContext}`;
  wnds.wpre.show(txt);
}

//elemco dati
function elencoDati(e) {
  const ids = UaDb.getAllIds();
  const arr = [];
  for (const id of ids) {
    const s = UaDb.read(id);
    const l = s.length;
    arr.push(`${id} (${l})`);
  }
  let msg = arr.join("\n ");
  wnds.wpre.show(msg);
}

//visualizza docuemnto
const showT = (n) => {
  const arr = DataMgr.docs;
  const s = arr[n];
  wnds.wpre.show(s);
};

// elenco e visualizzazione documenti
function elencoDocs() {
  DataMgr.readDbDocs();
  DataMgr.readDbDocNames();
  const arr = DataMgr.doc_names;
  const fh = (x, i) => `
      <li><a href="#" onCLick="showT(${i});">${i + 1}.${x}</a></li>
  `;
  const jfh = UaJtfh();
  let i = 0;
  jfh.append("<ul>");
  for (const x of arr) jfh.append(fh(x, i++));
  jfh.append("</ul>");
  const t = jfh.html();
  wnds.wdiv.show(`<br><br>${t}`);
}

//calcolo query
function calcQuery() {
  const calc = () => {
    const arr = [];
    let nptot = 0;
    let i = 0;
    arr.push(`Documento   Num.Parti`);
    arr.push("==================");
    for (const doc of DataMgr.docs) {
      const name = DataMgr.doc_names[i];
      i += 1;
      const dl = doc.length;
      const np = Math.ceil(dl / MAX_PROMPT_LENGTH);
      nptot += np;
      arr.push(`${name}&nbsp;&nbsp;&nbsp;[${np}]`);
    }
    arr.push("==================");
    arr.push(`Totale num. Parti: ${nptot}`);
    const s = arr.join("\n");
    return s;
  };
  DataMgr.readDbDocs();
  DataMgr.readDbDocNames();
  const s = calc();
  wnds.wpre.show(s);
}

//cancella dati
function deleteDati(e) {
  const ok = confirm("Confermi cancellazione dati?");
  if (ok) {
    DataMgr.deleteJsonDati();
    wnds.wdiv.close();
    wnds.wpre.close();
    TextOutput.clear();
  }
}

//cancella localstrage
function deleteSttorage(e) {
  const ok = confirm("Confermi cancellazione documenti & dati?");
  if (ok) {
    DataMgr.deleteJsonDati();
    localStorage.clear();
    wnds.wdiv.close();
    wnds.wpre.close();
    TextOutput.clear();
    DataMgr.docs = [];
    DataMgr.doc_names = [];
  }
}

//documenti di esempio nella dir ./data
async function help1(e) {
  const text = await requestGet("./data/help_test.html");
  wnds.wdiv.show(text);
}

//lettura files di esempio invocata dalla pagina ./data/help_test.html
function loadTestoEsempio(name) {
  const link = `data/${name}`;
  DataMgr.loadDoc(link);
  wnds.wdiv.close();
}

//domande di esempio
async function help2(e) {
  const text = await requestGet("./help2.html");
  wnds.wdiv.show(text);
}

const themeKey = "theme";

function getTheme() {
  const t = localStorage.getItem(themeKey);
  if (!!t && t == "light") {
    document.body.classList.add("theme-light");
    document.documentElement.classList.toggle("invert");
  } else {
    document.body.classList.add("theme-dark");
  }
}

function setLight() {
  document.documentElement.classList.toggle("invert");
  document.body.classList.remove("theme-dark");
  document.body.classList.add("theme-light");
  localStorage.setItem(themeKey, "light");
}

function setDark() {
  document.documentElement.classList.toggle("invert");
  document.body.classList.remove("theme-light");
  document.body.classList.add("theme-dark");
  localStorage.setItem(themeKey, "dark");
}

////////////////////////////////
// Solo Sviluppo

//prompts
function showPrompts(e) {
  if (Rag.prompts.length == 0) return;
  const text = Rag.prompts
    .map((x, i) => {
      return `[${i + 1}]${x}\n`;
    })
    .join("\n");
  wnds.wpre.show(text);
}
