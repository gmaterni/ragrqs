/** @format */

"use strict";
const MAX_PROMPT_LENGTH = 1024 * 88;

const Rag = {
  // costituito dalla risposte accumulate sistemate
  ragContext: "",
  //query usata per creare la lista delle rispste
  ragQuery: "",
  //query usata per creare il contesto
  // contextQuery: "",
  // risposta finale alla qury contetso
  responses: [],
  prompts: [],
  doc: "",
  doc_part: "",
  responseText: "",
  num_rsp: 0,
  saveToDb() {
    const js = {
      context: this.ragContext,
      ragquery: this.ragQuery,
      // contextquery: this.contextQuery,
    };
    UaDb.saveJson("id_rag", js);
  },
  readFromDb() {
    const js = UaDb.readJson("id_rag");
    this.ragContext = js.context || "";
    this.ragQuery = js.ragquery || "";
    // this.contextQuery = js.contextquery || "";
  },
  saveRespToDb() {
    UaDb.saveArray("id_responses", this.responses);
  },
  readRespsFromDb() {
    this.responses = UaDb.readArray("id_responses");
  },
  responsesLength() {
    const rspsl = this.responses.reduce((acc, cur) => {
      return acc + cur.length;
    }, 0);
    return rspsl;
  },
  log(msg) {
    const maxl = MAX_PROMPT_LENGTH;
    const drl = this.doc.length;
    const dpl = this.doc_part.length;
    const rspsl = this.responsesLength();
    const d = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    let s = `${msg} mx:${maxl} d.rest:${drl} d.part:${dpl} rsps:${rspsl}`;
    xlog(s);
    s = `${msg}${d}${drl}${d}${dpl}${d}${rspsl}`;
    UaLog.log(s);
  },
  checkInput(prompt) {
    // const n = numTokens(prompt);
    // const lim = n * 5;
    const pl = prompt.length;
    const diff = MAX_PROMPT_LENGTH - pl;
    return diff;
  },
  limitWIthPoint(s, pl) {
    const free_len = MAX_PROMPT_LENGTH - pl - 200;
    const idx = s.indexOf(".", free_len);
    let lim = (idx != -1 ? idx : free_len) + 1;
    if (lim > free_len + 100) {
      lim = free_len;
    }
    return lim;
  },
  //prende la parte di documento accettabile dalla fiestra del modello
  setDocPart(prmptLen) {
    const dpl = this.doc.length + prmptLen;
    const free_len = MAX_PROMPT_LENGTH;
    if (dpl < free_len) {
      this.doc_part = this.doc;
      this.doc = "";
    } else {
      const lim = this.limitWIthPoint(this.doc, prmptLen);
      this.doc_part = this.doc.substring(0, lim);
      this.doc = this.doc.substring(lim).trim();
    }
  },
  addPrompt(p) {
    this.prompts.push(p);
  },
  // documenti => risposte RAG => context
  // legge  dicumenti   locali
  async requestDocsRAG(query) {
    this.num_rsp = 0;
    ThreadMgr.init();
    DataMgr.deleteDati();
    DataMgr.readDbDocNames();
    DataMgr.readDbDocs();
    this.ragQuery = query;
    this.ragContext = "";
    this.responseText = "";
    this.responses = [];
    this.prompts = [];
    let ndoc = 0;

    try {
      const promptDocLen = promptDoc(",").length;
      for (let i = 0; i < DataMgr.docs.length; i++) {
        const d = DataMgr.docs[i];
        if (d.trim() == "") continue;
        const name = DataMgr.doc_names[i];
        ++ndoc;
        this.doc = d;
        const doc_entire_len = this.doc.length;
        UaLog.log(`${name} (${doc_entire_len}) `);
        xlog(`${name} (${doc_entire_len}) `);

        let npart = 0;
        while (true) {
          npart++;

          // divide il documenti in parti accettabili dalla finestra del model
          this.setDocPart(promptDocLen);
          if (this.doc_part.length < 10) break;

          let prompt = promptDoc(this.doc_part, query);
          const diff = this.checkInput(prompt);
          if (diff < 0) {
            UaLog.log(`RAG error size: ${diff}`);
            const dpl = this.doc_part.length;
            const lim = dpl + diff;
            const s = this.doc_part.substring(0, lim);
            prompt = promptDoc(s, query);
          }

          this.num_rsp++;
          this.log(`${ndoc},${npart}`);

          const payload = getPayloadDoc(prompt);
          let text = await requestPost(payload);
          // text = cleanResponse(text);
          // text = cleanText(text);
          text = `# titolo:${name} parte:${npart}. \n${text}`;
          this.responses.push(text);
        }
      }
    } catch (error) {
      alert("requestDocsRAG(1)\n" + error);
      xerror(error);
    }

    // elenco risposte accumulate => contesto
    try {
      const accumulates = list2text(this.responses);
      let prompt = promptToContext(accumulates, query);

      const diff = this.checkInput(prompt);
      if (diff < 0) {
        UaLog.log(`Responses error size: ${diff}`);
        const lim = accumaltes.length + diff;
        const s = accumaltes.substring(0, lim);
        prompt = promptToContext(s, query);
      }
      this.addPrompt(prompt);

      this.num_rsp++;
      const pl = prompt.length;
      UaLog.log(`Contesto  (${pl})`);

      const payload = getPlayloadContext(prompt);
      let text = await requestPost(payload);
      // this.responses.push(text);
      // text = cleanResponse(text);
      // text = cleanText(text);
      this.ragContext = text; 

      //salva variabili del processo RAG
      this.saveToDb();
    } catch (error) {
      xerror(error);
      alert("requestDocsRAG(2)\n" + error);
      throw error;
    }

    // query finale utilizza context
    try {
      let prompt = promptWithContext(this.ragContext, query);
      const diff = this.checkInput(prompt);
      if (diff < 0) {
        UaLog.log(`ToContext error size: ${diff}`);
        const lim = this.ragContext.length + diff;
        const s = this.ragContext.substring(0, lim);
        prompt = promptToContext(s, query);
      }
      this.addPrompt(prompt);

      this.num_rsp++;
      const pl = prompt.length;
      UaLog.log(`Risposta  (${pl})`);

      const payload = getPayloadQuery(prompt);
      this.responseText = await requestPost(payload);
      this.responseText = cleanResponse(this.responseText);
      // this.responseText = cleanText(this.responseText);
      this.responses.push(this.responseText);

      // salva localmente le risposte elaborate
      this.saveRespToDb();
      //salva variabili del processo RAG
      this.saveToDb();
    } catch (error) {
      this.responseText = error;
      xerror(error);
      alert("requestDocsRAG(3)\n" + error);
      throw error;
    } finally {
      return this.responseText;
    }
  },

  // TRHREAD
  // query usa context esistente
  async requestContext(query) {
    this.readFromDb();

    if (!this.ragContext) {
      const ok = confirm("Contesto vuoto, continuare?");
      if (!ok) return "";
    }

    if (ThreadMgr.isFirst()) {
      try {
        let context = this.ragContext;
        let prompt = promptWithContext(context, query);

        const diff = this.checkInput(prompt);
        if (diff < 0) {
          UaLog.log(`Conv. error size: ${diff}`);
          context = this.ragContext.substring(-diff);
          prompt = promptWithContext(context, query);
        }
        ThreadMgr.add("", context); // inizio thread
        UaLog.log(`Inizio Conv.  (${prompt.length})`);
        const payload = getPayloadQuery(prompt);
        this.responseText = await requestPost(payload);
        // this.responseText = cleanResponse(this.responseText);
        // this.responseText=cleanText(this.responseText);

        ThreadMgr.add(query, this.responseText);
        this.responseText = ThreadMgr.getText();
      } catch (error) {
        this.responseText = error;
        xerror(error);
        alert("requestContext(1) \n" + error);
        throw error;
      } finally {
        return this.responseText;
      }
    } else {
      try {
        let thread = ThreadMgr.getText();
        let prompt = promptThread(thread, query);

        const diff = this.checkInput(prompt);
        if (diff < 0) {
          UaLog.log(`Conv. error size: ${diff}`);
          thread = thread.substring(-diff);
          prompt = promptThread(thread, query);
        }

        UaLog.log(` Conv.  (${prompt.length})`);
        const payload = getPayloadQuery(prompt);
        this.responseText = await requestPost(payload);
        // this.responseText = cleanResponse(this.responseText);
        // this.responseText=cleanText(this.responseText);

        ThreadMgr.add(query, this.responseText);
        this.responseText = ThreadMgr.getText();
      } catch (error) {
        this.responseText = erroor;
        xerror(error);
        alert("requestContext(2) \n" + error);
        throw error;
      } finally {
        return this.responseText;
      }
    }
  },
};

const ThreadMgr = {
  rows: [],
  init() {
    this.rows = [];
  },
  clean(doc) {
    const regex = /<[^>]+>\s*:?/g;
    return doc.replace(regex, "");
  },
  add(query, response) {
    const rsp = this.clean(response);
    const row = [query, rsp];
    this.rows.push(row);
  },
  getRows() {
    return this.rows;
  },
  getText() {
    const lst = [];
    for (const ua of this.rows) {
      const u = ua[0].trim();
      const a = ua[1].trim();
      if (u == "") {
        lst.push(`<Contesto>:\n${a}\n\n`);
      } else {
        lst.push(`<User>:\n${u}\n<LLM>:\n${a}\n\n`);
      }
    }
    return lst.join("").trim();
  },
  isFirst() {
    return this.rows.length == 0;
  },
};
