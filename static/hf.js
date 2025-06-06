/** @format */
const ID_RAG = "id_rag";

const ID_THREAD = "id_thread";
const ID_RESPONSES = "id_responses";
const ID_DOC_NAMES = "id_doc_names";
const ID_DOCS = "id_docs";

const PROMPT_DECR = 1024 * 10;

const maxLenRequest = (nk = 32) => {
  const nc = 1024 * nk * 2;
  const sp = nc * 0.1;
  const mlr = Math.trunc(nc + sp);
  return mlr;
};

function umgm() {
  const arr = ["bWtkVndLdnw=", "aV59e3hGfEo=", "aHNJd2lIW2g=", "TEteWk9bVVU=", "SktKSmY="];
  return arr
    .map((part) => {
      const ch = atob(part);
      return ch
        .split("")
        .map((char) => String.fromCharCode((char.charCodeAt(0) - 5 + 256) % 256))
        .join("");
    })
    .join("");
}

const MAX_PROMPT_LENGTH = maxLenRequest(100);
//HF
// const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";
// const MODEL = "mistralai/Mistral-Small-24B-Instruct-2501";
const MODEL = "mistralai/Mistral-Small-3.1-24B-Instruct-2503";
// /////////////
const API = umgm();
console.log("\n**** MODELl:\n", MODEL);
// console.log(API);

const client = ClientLLM(API);

const getResponse = async (payload, timeout = 60) => {
  payload["model"] = MODEL;
  const url = `https://router.huggingface.co/hf-inference/models/${MODEL}/v1/chat/completions`;
  const rr = await client.sendRequest(url, payload, timeout);
  if (rr.error) {
    if (rr.error.code === 499) {
      alert("Request Interrotta");
      return null;
    } else {
      return rr;
    }
  }
  if (!rr.response.choices || !rr.response.choices[0] || !rr.response.choices[0].message || rr.response.choices[0].message.content === undefined) {
    rr.error = client.createError("Risposta non valida", "ParseError", 500, { message: "La risposta non contiene il contenuto atteso" });
    rr.ok = false;
    return rr;
    // return RequestResult(false, null, err);
  }
  rr.data = rr.response.choices[0].message.content;
  return rr;
};
