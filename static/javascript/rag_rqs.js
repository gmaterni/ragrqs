/** @format */

"use strict";
const VERS = "v 0.1.25";
var xlog = console.log;
var xerror = console.error;

let T0 = {};

var start_performance = function (k) {
  T0.k = performance.now();
};

var log_performance = function (k, msg = "") {
  const t1 = performance.now();
  const d = t1 - T0.k;
  console.log(msg, d);
  T0.k = t1;
  return d;
};

// var cmd_close = function () {
//   if (confirm("Chiudi Applicazione ?")) window.close();
// };

// const ualog = (...args) =>{
//   UaLog.log(...args);
// };

// const ualog_show = (...args) => {
//   UaLog.log_show(...args);
// };

// const ualog_close = (...args) => {
//   UaLog.close(...args);
// };

function openApp() {
  wnds.init();
  Menu.init();
  TextInput.init();
  TextOutput.init();
  document.querySelector(".menu-btn").checked = false;
  release();
}

function release() {
  const e = document.getElementById("id_log");
  const ne = document.createElement("label");
  ne.innerHTML = VERS;
  e.insertAdjacentElement("afterend", ne);
}

// help RAG
const op0 = async function (e) {
  const text = await requestGet("./help1.html");
  wnds.wdiv.show(text);
};

//query iniziale
function op1(e) {
  Rag.readFromDb();
  const txt = `\n${Rag.ragQuery}`;
  wnds.wpre.show(txt);
  // Menu.close();
}

//elenco risposte
function op2(e) {
  let rs = [...Rag.responses];
  if (rs.length == 0) {
    rs = UaDb.readArray("id_responses");
  }
  if (rs.length == 0) return;
  const text = rs
    .map((x, i) => {
      return `[${i + 1}]\n ${x.trim()}`;
    })
    .join("\n");
  wnds.wpre.show(text);
  // Menu.close();
}

//contesto
function op3(e) {
  Rag.readFromDb();
  const txt = `${Rag.ragContext}`;
  wnds.wpre.show(txt);
  // Menu.close();
}

//elemco dati
function op4(e) {
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

//elenco documenti
async function op5(e) {
  DataMgr.readDbDocNames();
  const arr = DataMgr.doc_names;
  const s = arr.join("\n");
  wnds.wpre.show(s);
}

//testi
function op6(e) {
  DataMgr.readDbDocs();
  const arr = DataMgr.docs;
  const s = arr.join("\n");
  wnds.wpre.show(s);
}

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

//cancellA DATI
function op7(e) {
  const ok = confirm("Confermi cancellazione dati?");
  if (ok) {
    DataMgr.deleteDati();
    Rag.ragContext = "";
    Rag.ragQuery = "";
    Rag.responses = [];
    wnds.wdiv.close();
    wnds.wpre.close();
    TextOutput.clear();
  }
}
//cancella localstrage
function op8(e) {
  const ok = confirm("Confermi cancellazione documenti & dati?");
  if (ok) {
    localStorage.clear();
    Rag.ragContext = "";
    Rag.ragQuery = "";
    Rag.responses = [];
    wnds.wdiv.close();
    wnds.wpre.close();
    TextOutput.clear();
    DataMgr.docs = [];
    DataMgr.doc_names = [];
  }
}

function op9(e) {
  if (Rag.prompts.length == 0) return;
  const text = Rag.prompts
    .map((x, i) => {
      return `[${i + 1}]${x}\n`;
    })
    .join("\n");
  wnds.wpre.show(text);
}

async function help1(e) {
  const text = await requestGet("./data/help_test.html");
  wnds.wdiv.show(text);
}

//lanciata dalla pagina diegli sempi
function esempio(name) {
  const link = `data/${name}`;
  DataMgr.loadDoc(link);
  wnds.wdiv.close();
}

async function help2(e) {
  const text = await requestGet("./help2.html");
  wnds.wdiv.show(text);
}
