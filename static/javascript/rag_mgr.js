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

const Rag = {
  // costituito dalla risposte accumulate sistemate
  ragContext: "",
  //query usata per creare la lista delle rispste
  ragQuery: "",
  // risposta finale alla qury contetso
  ragResponse: "",
  responses: [],
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
  addPrompt(p) {
    this.prompts.push(p);
  },
  responsesLength() {
    const rspsl = this.responses.reduce((acc, cur) => {
      return acc + cur.length;
    }, 0);
    return rspsl;
  },
  ragLog(msg, lftLen, rgtLen) {
    const maxl = MAX_PROMPT_LENGTH;
    const rspsl = this.responsesLength();
    const d = "&nbsp;&nbsp;&nbsp;&nbsp;";
    let s = `${msg} mx:${maxl} lft:${lftLen} rgt:${rgtLen} arr:${rspsl}`;
    xlog(s);
    s = `${msg}${d}${lftLen}${d}${rgtLen}${d}${rspsl}`;
    //nsg plft.length prgt.length responses.length
    UaLog.log(s);
  },
  truncInput(txt, decr) {
    const tl = txt.length;
    const lim = tl - decr;
    const s = txt.substring(0, lim);
    return s;
  },
  getPartSize(doc, prompt, decr) {
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
  },
  getPartDoc(pRgt, partSize) {
    const pLft = pRgt.substring(0, partSize);
    pRgt = pRgt.substring(partSize).trim();
    return [pLft, pRgt];
  },
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
        const doc_name = DataMgr.doc_names[i];
        const doc_entire_len = doc.length;
        xlog(`${doc_name} (${doc_entire_len}) `);
        UaLog.log(`${doc_name} (${doc_entire_len}) `);

        ++ndoc;
        let npart = 0;
        let decr = 0;
        let prompt = "";
        let lft = "";
        let rgt = "";

        while (true) {
          let partSize = this.getPartSize(doc, promptDoc("", query), decr);
          if (partSize < 10) {
            break;
          }
          [lft, rgt] = this.getPartDoc(doc, partSize);
          this.ragLog(`${ndoc},${npart + 1}`, lft.length, rgt.length);
          prompt = promptDoc(lft, query);
          const payload = getPayloadDoc(prompt);
          let text;
          try {
            text = await HfRequest.post(payload);
            if (!text) return "";
          } catch (err) {
            const e = errorInfo(err);
            if (e.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens.1  ${lft.length}`);
              xerror(`Error tokens.  ${prompt.length}`);
              decr += PROMPT_DECR;
              continue;
            } else {
              xerror(err);
              const s = errorToText(err);
              throw s;
            }
          }

          npart++;
          doc = rgt;
          text = cleanResponse(text); //TODO
          const docText = `<<<${doc_name}>>>\n${text}`; //TODO
          this.responses.push(docText);
          // this.ragLog(`${doc_name}  ${ndoc},${npart}`, lft.length, rgt.length);
        } // end while
      } // end for
    } catch (error) {
      alert("requestDocsRAG(1)\n" + error);
      xerror(error);
    }

    const resps = list2text(this.responses);
    this.ragContext = resps;
    this.saveToDb();

    // query finale utilizza context
    {
      let text = "";
      try {
        let prompt = promptWithContext(this.ragContext, query);
        const payload = getPayloadWithContext(prompt);

        try {
          text = await HfRequest.post(payload);
          if (!text) return "";
        } catch (err) {
          const e = errorInfo(err);
          const s = errorToText(err);
          if (e.errorType === ERROR_TOKENS) {
            xerror(err);
            throw s;
          } else {
            xerror(err);
            throw s;
          }
        }
        this.ragResponse = text;
        this.saveRespToDb();
        ThreadMgr.init();
        this.saveToDb();
        const pl = prompt.length;
        UaLog.log(`Risposta  (${pl},${text.length})`);
      } catch (error) {
        text = error;
        xerror(error);
        alert("requestDocsRAG(3)\n" + error);
        throw error;
      } finally {
        text = cleanOutput(text);
        return text;
      }
    }
  },

  // thread
  async requestContext(query) {
    // this.readFromDb(); XXX

    if (!this.ragContext) {
      const ok = await confirm("Contesto vuoto. Vuoi continuare?");
      if (!ok) return "";
    }

    if (ThreadMgr.isFirst()) {
      let outText = "";
      ThreadMgr.init(); //AAA
      try {
        let context = this.ragContext;
        const thread = ThreadMgr.getThread();
        prompt = promptThread(context, thread, query);
        const payload = getPayloadThread(prompt);

        let text;
        try {
          text = await HfRequest.post(payload);
          if (!text) return "";
        } catch (err) {
          const e = errorInfo(err);
          if (e.errorType === ERROR_TOKENS) {
            UaLog.log(`Error tokens.4  ${prompt.length}`);
            xerror(err);
            throw err;
          } else {
            alert(err);
            xerror(err);
            throw err;
          }
        }
        ThreadMgr.add(query, text);
        outText = ThreadMgr.getOutText();
        UaLog.log(`Inizio Conversazione (${prompt.length},${text.length})`);
      } catch (error) {
        xerror(error);
        outText = error;
        throw error;
      } finally {
        outText = cleanOutput(outText);
        return outText;
      }
    } else {
      let outText = "";
      try {
        let context = this.ragContext;
        let thread = ThreadMgr.getThread();
        let prompt = "";
        let text = "";
        let decr = 0;

        while (true) {
          thread = this.truncInput(thread, decr);
          prompt = promptThread(context, thread, query);
          const payload = getPayloadThread(prompt);

          try {
            text = await HfRequest.post(payload);
            if (!text) return "";
          } catch (err) {
            const e = errorInfo(err);
            if (e.errorType === ERROR_TOKENS) {
              UaLog.log(`Error tokens.5  ${prompt.length}`);
              xerror(`Error tokens.  ${prompt.length}`);
              decr += PROMPT_DECR;
              continue;
            } else {
              xerror(err);
              throw e.errorType;
            }
          }
          break;
        }
        ThreadMgr.add(query, text);
        outText = ThreadMgr.getOutText();
        UaLog.log(`Conversazione  (${prompt.length},${text.length})`);
      } catch (error) {
        alert("requestContext(2) \n" + error);
        xerror(error);
        outText = error;
        throw error;
      } finally {
        outText = cleanOutput(outText);
        return outText;
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
  getOutText() {
    const rows = [];
    for (const ua of this.rows) {
      const u = ua[0].trim();
      const a = ua[1].trim();
      rows.push(`\n${USER}\n${u}\n${LLM}\n${a}\n\n`);
    }
    let text = rows.join("").trim();
    return text;
  },
  getThread() {
    const rows = [];
    for (const ua of this.rows) {
      const u = ua[0].trim();
      const a = ua[1].trim();
      rows.push(`${USER}\n${u}\n${LLM}\n${a}\n\n`);
    }
    const text = rows.join("").trim();
    return text;
  },
  isFirst() {
    return this.rows.length < 2;
  },
};
