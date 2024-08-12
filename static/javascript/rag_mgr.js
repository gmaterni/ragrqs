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
const MAX_PROMPT_LENGTH = 1024 * 80;
// decremento dopo errore per tokens eccessivi
const PROMPT_DECR = 1024 * 2;

const TIMEOUT = 60000;

const truncInput = (txt, decr) => {
  const tl = txt.length;
  const lim = tl - decr;
  const s = txt.substring(0, lim);
  return s;
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

const ragLog = (msg, lftLen, rgtLen, responses) => {
  const maxl = MAX_PROMPT_LENGTH;
  const rspsl = responses.reduce((acc, cur) => {
    return acc + cur.length;
  }, 0);
  let s = `${msg} mx:${maxl} lft:${lftLen} rgt:${rgtLen} arr:${rspsl}`;
  xlog(s);
  s = `${msg}   ${lftLen}   ${rgtLen}   ${rspsl}`;
  UaLog.log(s);
};

const Rag = {
  // costituito dalla risposte accumulate sistemate
  ragContext: "",
  //query usata per creare la lista delle rispste
  ragQuery: "",
  // risposta finale alla qury contetso
  ragResponse: "",
  responses: [],
  contextAnswers: [],
  prompts: [],
  doc: "",
  doc_part: "",
  init() {
    this.readRespsFromDb();
    this.readFromDb();
  },
  saveToDb() {
    const js = {
      context: this.ragContext,
      ragquery: this.ragQuery,
      ragresponse: this.ragResponse,
    };
    UaDb.saveJson(ID_RAG, js);
    UaDb.saveArray(ID_THREAD, ThreadMgr.rows);
  },
  readFromDb() {
    const js = UaDb.readJson(ID_RAG);
    this.ragContext = js.context || "";
    this.ragQuery = js.ragquery || "";
    this.ragResponse = js.ragresponse || "";
    ThreadMgr.rows = UaDb.readArray(ID_THREAD);
  },
  saveRespToDb() {
    UaDb.saveArray(ID_RESPONSES, this.responses);
  },
  readRespsFromDb() {
    this.responses = UaDb.readArray(ID_RESPONSES);
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
    let ndoc = 0;
    try {
      for (let i = 0; i < DataMgr.docs.length; i++) {
        let doc = DataMgr.docs[i];
        if (doc.trim() == "") continue;
        const docName = DataMgr.doc_names[i];
        const doc_entire_len = doc.length;
        xlog(`${docName} (${doc_entire_len}) `);
        UaLog.log(`${docName} (${doc_entire_len}) `);
        ++ndoc;
        let npart = 0;
        let decr = 0;
        let prompt = "";
        let lft = "";
        let rgt = "";
        let text = "";
        let docAnswers = [];

        while (true) {
          let partSize = getPartSize(doc, promptDoc("", query, ""), decr);
          if (partSize < 10) {
            break;
          }
          [lft, rgt] = getPartDoc(doc, partSize);
          ragLog(`${ndoc},${npart + 1}`, lft.length, rgt.length, this.responses);
          prompt = promptDoc(lft, query, docName);
          const payload = getPayloadDoc(prompt);
          try {
            text = await HfRequest.post(payload, TIMEOUT);
            if (!text) return "";
          } catch (err) {
            const ei = errorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Doc  ${lft.length}`);
              console.error(`Error tokens. Doc ${prompt.length}`);
              decr += PROMPT_DECR;
              continue;
            } else {
              console.error(err);
              throw err;
            }
          }
          npart++;
          doc = rgt;
          text = cleanResponse(text);
          docAnswers.push(text);
          const s = `DOCUMENTO : ${docName}\n${text}`;
          this.responses.push(s);
        } // end while

        //implemntare build context
        let donAnsLen = 0;
        if (docAnswers == 1) {
          //il docuento non è duvuso in parti
          text = docAnswers[0];
          donAnsLen = text.length;
        } else {
          //il documento è diviso in parto
          text = docAnswers.join("\n");
          donAnsLen = text.length;
          while (true) {
            prompt = promptBuildContext(text);
            const payload = getPayloadBuildContext(prompt);
            try {
              text = await HfRequest.post(payload, TIMEOUT);
              if (!text) return "";
            } catch (err) {
              const ei = errorInfo(err);
              if (ei.errorType === ERROR_TOKENS) {
                UaLog.log(`Error tokens build Context  ${lft.length}`);
                console.error(`Error tokens buildContext. ${prompt.length}`);
                text = truncInput(text, PROMPT_DECR);
                continue;
              } else {
                console.error(err);
                throw err;
              }
            }
            break;
          } //end while
        } //end else
        UaLog.log(`context  ${donAnsLen} => ${text.length}`);
        text = cleanResponse(text);
        text = `DOCUMENTO: ${docName}\n ${text}`;
        this.contextAnswers.push(text);
      } // end for document
    } catch (err) {
      console.error(err);
      throw err;
    }
    // costruzione context
    this.ragContext = this.contextAnswers.join("\n");
    this.saveToDb();

    // query finale utilizza context
    {
      let text = "";
      let context = this.ragContext;
      try {
        while (true) {
          let prompt = promptWithContext(context, query);
          const payload = getPayloadWithContext(prompt);
          try {
            text = await HfRequest.post(payload, TIMEOUT);
            if (!text) return "";
          } catch (err) {
            const ei = errorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens with COntext ${lft.length}`);
              console.error(`Error tokens context. Doc ${prompt.length}`);
              context = truncInput(context, PROMPT_DECR);
              continue;
            } else {
              console.error(err);
              throw err;
            }
          }
          break;
        }
        text = cleanResponse(text);
        this.ragResponse = text;
        this.saveRespToDb();
        ThreadMgr.init();
        this.saveToDb();
        const pl = prompt.length;
        UaLog.log(`Risposta  (${pl},${text.length})`);
      } catch (err) {
        console.error(err);
        text = `${err}`;
        throw err;
      } finally {
        return text;
      }
    } // end query
  },
  //////////////////////////
  // thread
  async requestContext(query) {
    let text = "";
    if (!this.ragContext) {
      const ok = await confirm("Contesto vuoto. Vuoi continuare?");
      if (!ok) return "";
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
            const ei = errorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Thread Init  ${prompt.length}`);
              console.error(`Error tokens Thread Init.  ${prompt.length}`);
              thread = truncInput(thread, PROMPT_DECR);
              continue;
            } else {
              console.error(err);
              throw err;
            }
          } //end catch
          break;
        }
        text = cleanResponse(text);
        ThreadMgr.add(query, text);
        text = ThreadMgr.getThread();
        UaLog.log(`Inizio Conversazione (${prompt.length},${text.length})`);
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
            const ei = errorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens Thread  ${prompt.length}`);
              console.error(`Error tokens Thread.  ${prompt.length}`);
              thread = truncInput(thread, PROMPT_DECR);
              continue;
            } else {
              console.error(err);
              throw err;
            }
          }
          break;
        }
        text = cleanResponse(text);
        ThreadMgr.add(query, text);
        text = ThreadMgr.getThread();
        UaLog.log(`Conversazione  (${prompt.length},${text.length})`);
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

const LLM = "Assistant:";
const USER = "User:";

const ThreadMgr = {
  rows: [],
  init() {
    this.rows = [];
    if (!!Rag.ragResponse) {
      this.add(Rag.ragQuery, Rag.ragResponse);
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
      rows.push(`\n${USER}\n${u}\n${LLM}\n${a}\n`);
    }
    return rows.join("").trim();
  },
  isFirst() {
    return this.rows.length < 2;
  },
};
