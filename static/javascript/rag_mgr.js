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
const MAX_PROMPT_LENGTH = 1024 * 75;
// decremento dopo errore per tokens eccessivi
const PROMPT_DECR = 1024 * 2;

const TIMEOUT = 60000;

function wait(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function example() {
  console.log("Inizio attesa...");
  await wait(5); // Attende 5 secondi
  console.log("Fine attesa!");
}

example();

const truncInput = (txt, decr) => {
  const tl = txt.length;
  const lim = tl - decr;
  const s = txt.substring(0, lim);
  return s;
};

//setta il prompt al limite massimo
const setMaxLen = (s) => {
  const lim = MAX_PROMPT_LENGTH - 1000;
  return s.substring(0, lim);
};

const getPartSize = (doc, prompt, decr) => {
  const limitWIthPoint = (s, free_len) => {
    const idx = s.indexOf(".", free_len);
    let lim = (idx != -1 ? idx : free_len) + 1;
    if (lim > free_len + 100) {
      lim = free_len;
    }
    return lim;
  };
  const dpl = doc.length + prompt.length;
  const free_len = MAX_PROMPT_LENGTH - decr;
  let size = 0;
  if (dpl < free_len) {
    size = doc.length;
  } else {
    size = limitWIthPoint(doc, free_len);
  }
  return size;
};

const getPartDoc = (pRgt, partSize) => {
  const pLft = pRgt.substring(0, partSize);
  pRgt = pRgt.substring(partSize).trim();
  return [pLft, pRgt];
};

const ragLog = (msg, lftL, rgtL, answers) => {
  const maxl = MAX_PROMPT_LENGTH;
  const rspsL = answers.reduce((acc, cur) => {
    return acc + cur.length;
  }, 0);
  let s = `${msg} mx:${maxl} lft:${lftL} rgt:${rgtL} arr:${rspsL}`;
  xlog(s);
  const row = formatRow([msg, lftL, rgtL, rspsL], [8, -7, -7, -7]);
  UaLog.log(row);
};

const Rag = {
  // costituito dalla risposte accumulate sistemate
  ragContext: "",
  //query usata per creare la lista delle rispste
  ragQuery: "",
  // risposta finale alla qury contetso
  ragAnswer: "",
  answers: [],
  docContextLst: [],
  prompts: [],
  doc: "",
  doc_part: "",
  init() {
    this.readRespsFromDb();
    this.readFromDb();
  },
  returnOk() {
    const ok = this.ragContext.length > 10;
    return ok;
  },
  saveToDb() {
    const js = {
      context: this.ragContext,
      ragquery: this.ragQuery,
      raganswer: this.ragAnswer,
    };
    UaDb.saveJson(ID_RAG, js);
    UaDb.saveArray(ID_THREAD, ThreadMgr.rows);
  },
  readFromDb() {
    const js = UaDb.readJson(ID_RAG);
    this.ragContext = js.context || "";
    this.ragQuery = js.ragquery || "";
    this.ragAnswer = js.raganswer || "";
    ThreadMgr.rows = UaDb.readArray(ID_THREAD);
  },
  saveRespToDb() {
    UaDb.saveArray(ID_RESPONSES, this.answers);
  },
  readRespsFromDb() {
    this.answers = UaDb.readArray(ID_RESPONSES);
  },
  // addPrompt(p) {
  //   this.prompts.push(p);
  // },
  // documenti => risposte RAG => context
  async requestDocsRAG(query) {
    DataMgr.deleteJsonDati();
    DataMgr.readDbDocNames();
    DataMgr.readDbDocs();
    this.ragQuery = query;
    this.saveToDb();
    let ndoc = 0;
    try {
      let j = 1;
      for (let i = 0; i < DataMgr.docs.length; i++) {
        let doc = DataMgr.docs[i];
        if (doc.trim() == "") continue;
        const docName = DataMgr.doc_names[i];
        const doc_entire_len = doc.length;
        xlog(`${docName} (${doc_entire_len}) `);
        UaLog.log(`${docName} (${doc_entire_len}) `);
        ++ndoc;
        let npart = 1;
        let decr = 0;
        let prompt = "";
        let lft = "";
        let rgt = "";
        let answer = "";
        let docAnswersLst = [];

        while (true) {
          let partSize = getPartSize(doc, promptDoc("", query, ""), decr);
          if (partSize < 10) {
            break;
          }
          [lft, rgt] = getPartDoc(doc, partSize);
          ragLog(`${j}) ${ndoc},${npart}`, lft.length, rgt.length, this.answers);
          prompt = promptDoc(lft, query, docName);
          const payload = getPayloadDoc(prompt);
          // const t0 = performance.now();
          try {
            answer = await HfRequest.post(payload, TIMEOUT);
            if (!answer) return "";
          } catch (err) {
            console.error(`RR1)\n`, err);
            const ei = getErrorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Doc  ${prompt.length}`);
              decr += PROMPT_DECR;
              continue;
            } else if (ei.errorType === TIMEOUT_ERROR) {
              UaLog.log(`Error timeout Doc`);
              continue;
            } else {
              UaLog.log(`Error ${err}`);
              answer=`ERROR \n${err}\n`
              // throw err;
            }
          } //end catch
          // const t1 = performance.now();
          // const dt = Math.round((t1 - t0) / 1000);
          // UaLog.log(`t:  ${dt}`);
          npart++;
          j++;
          doc = rgt;
          answer = cleanResponse(answer);
          docAnswersLst.push(answer);
          const s = `DOCUMENTO : ${docName}_${npart}\n${answer}`;
          this.answers.push(s);
        } // end while
        //TODO implemntare build context
        const docAnswersLen = docAnswersLst.length;
        let docAnswresTxt = docAnswersLst.join("\n\n"); 
        let docContext = "";

        while (true) {
          prompt = promptBuildContext(docAnswresTxt, this.ragQuery);
          const payload = getPayloadBuildContext(prompt);
          try {
            docContext = await HfRequest.post(payload, TIMEOUT);
            if (!docContext) return "";
          } catch (err) {
            console.error(`RR2)`, err);
            const ei = getErrorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens build Context ${prompt.length}`);
              docAnswresTxt = truncInput(docAnswresTxt, PROMPT_DECR);
              docAnswresTxt = setMaxLen(docAnswresTxt);
              continue;
            } else if (ei.errorType === TIMEOUT_ERROR) {
              UaLog.log(`Error timeout build Context`);
              // wait(5);
              continue;
            } else {
              throw err;
            }
          }
          break;
        } //end while
        UaLog.log(`context  ${docAnswersLen} => ${docContext.length}`);
        docContext = `\n### DOCUMENTO: ${docName}\n ${docContext}`;
        this.docContextLst.push(docContext);
      } // end for document
    } catch (err) {
      console.error(err);
      throw err;
    }
    this.ragContext = this.docContextLst.join("\n\n");
    this.saveToDb();

    // query finale utilizza context
    {
      let answer = "";
      let context = this.ragContext;
      try {
        while (true) {
          let prompt = promptWithContext(context, query);
          const payload = getPayloadWithContext(prompt);
          try {
            answer = await HfRequest.post(payload, TIMEOUT);
            if (!answer) return "";
          } catch (err) {
            console.error(`RR3)`, err);
            const ei = getErrorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens with Context ${prompt.length}`);
              context = truncInput(context, PROMPT_DECR);
              context = setMaxLen(context);
              continue;
            } else if (ei.errorType === TIMEOUT_ERROR) {
              UaLog.log(`Error timeout with  Context`);
              // wait(5);
              continue;
            } else {
              throw err;
            }
          }
          break;
        }
        answer = cleanResponse(answer);
        this.ragAnswer = answer;
        this.saveRespToDb();
        ThreadMgr.init();
        this.saveToDb();
        UaLog.log(`Risposta  (${this.ragAnswer.length})`);
      } catch (err) {
        console.error(err);
        answer = `${err}`;
        throw err;
      } finally {
        return answer;
      }
    } // end query
  },

  // thread
  async requestContext(query) {
    let text = "";
    if (!this.ragContext) {
      const ok = await confirm("Contesto vuoto. Vuoi continuare?");
      if (!ok) return "";
      // HACK gestisce il pulsante verde che ha accettao il contetso vuoto
      this.ragContext="Sei un assitente AI dispoibile a soddisfare tutte le mi richieste";
    }
    if (ThreadMgr.isFirst()) {
      ThreadMgr.init();
      try {
        let context = this.ragContext;
        let thread = ThreadMgr.getThread();

        while (true) {
          prompt = promptThread(context, thread, query);
          const payload = getPayloadThread(prompt);
          try {
            text = await HfRequest.post(payload, TIMEOUT);
            if (!text) return "";
          } catch (err) {
            console.error(`RR4)`, err);
            const ei = getErrorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Thread Init ${prompt.length}`);
              thread = truncInput(thread, PROMPT_DECR);
              context = setMaxLen(context);
              continue;
            } else if (ei.errorType === TIMEOUT_ERROR) {
              UaLog.log(`Error timeout Thread Init`);
              continue;
            } else {
              throw err;
            }
          } //end catch
          break;
        }
        text = cleanResponse(text);
        ThreadMgr.add(query, text);
        text = ThreadMgr.getThread();
        UaLog.log(`Inizio Conversazione (${prompt.length})`);
      } catch (err) {
        console.error(err);
        text = `${err}`;
        throw err;
      } finally {
        return text;
      }
    } else {
      try {
        let context = this.ragContext;
        let thread = ThreadMgr.getThread();
        let prompt = "";
        while (true) {
          prompt = promptThread(context, thread, query);
          const payload = getPayloadThread(prompt);
          try {
            text = await HfRequest.post(payload, TIMEOUT);
            if (!text) return "";
          } catch (err) {
            console.error(`RR5)`, err);
            const ei = getErrorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Thread  ${prompt.length}`);
              thread = truncInput(thread, PROMPT_DECR);
              continue;
            } else if (ei.errorType === TIMEOUT_ERROR) {
              UaLog.log(`Error timeout Thread`);
              continue;
            } else {
              throw err;
            }
          }
          break;
        }
        text = cleanResponse(text);
        ThreadMgr.add(query, text);
        text = ThreadMgr.getThread();
        UaLog.log(`Conversazione  (${prompt.length})`);
      } catch (err) {
        console.error(err);
        text = `${err}`;
        throw err;
      } finally {
        return text;
      }
    }
  },
};

const LLM = "## Assistant:";
const USER = "## User:";

const ThreadMgr = {
  rows: [],
  init() {
    this.rows = [];
    if (!!Rag.ragAnswer) {
      this.add(Rag.ragQuery, Rag.ragAnswer);
    } else {
      this.add("", "");
    }
  },
  add(query, resp) {
    const row = [query, resp];
    this.rows.push(row);
    UaDb.saveArray(ID_THREAD, ThreadMgr.rows);
  },
  getThread() {
    const rows = [];
    for (const ua of this.rows) {
      const u = ua[0];
      const a = ua[1];
      rows.push(`${USER}\n${u}\n${LLM}\n${a}\n`);
    }
    return rows.join("\n\n");
  },
  isFirst() {
    return this.rows.length < 2;
  },
};
