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

const ragLog = (msg, lftLen, rgtLen, answers) => {
  const maxl = MAX_PROMPT_LENGTH;
  const rspsl = answers.reduce((acc, cur) => {
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
        let answer = "";
        let docAnswersLst = [];

        while (true) {
          let partSize = getPartSize(doc, promptDoc("", query, ""), decr);
          if (partSize < 10) {
            break;
          }
          [lft, rgt] = getPartDoc(doc, partSize);
          ragLog(`${ndoc},${npart + 1}`, lft.length, rgt.length, this.answers);
          prompt = promptDoc(lft, query, docName);
          const payload = getPayloadDoc(prompt);
          try {
            answer = await HfRequest.post(payload, TIMEOUT);
            if (!answer) return "";
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
          } //end catch
          npart++;
          doc = rgt;
          answer = cleanResponse(answer);
          docAnswersLst.push(answer);
          const s = `DOCUMENTO : ${docName}_${npart}\n${answer}`;
          this.answers.push(s);
        } // end while

        //implemntare build context
        const docAnswersLen = docAnswersLst.length;
        let docAnswresTxt = docAnswersLst.join("\n\n"); //AAA
        let docContext = "";
        while (true) {
          prompt = promptBuildContext(docAnswresTxt, this.ragQuery);
          const payload = getPayloadBuildContext(prompt);
          try {
            docContext = await HfRequest.post(payload, TIMEOUT);
            if (!docContext) return "";
          } catch (err) {
            const ei = errorInfo(err);
            if (ei.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens build Context  ${lft.length}`);
              console.error(`Error tokens buildContext. ${prompt.length}`);
              docContext = truncInput(docContext, PROMPT_DECR);
              continue;
            } else {
              console.error(err);
              throw err;
            }
          }
          break;
        } //end while
        UaLog.log(`context  ${docAnswersLen} => ${docContext.length}`);
        docContext = cleanResponse(docContext);
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

const LLM = "Assistant:";
const USER = "User:";

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
      rows.push(`\n${USER}\n${u}\n${LLM}\n${a}\n`);
    }
    return rows.join("").trim();
  },
  isFirst() {
    return this.rows.length < 2;
  },
};
