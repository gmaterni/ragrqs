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
const WndPre = (id) => {
  return {
    w: UaWindowAdm.create(id),
    out: null,
    show(s) {
      const fh = (txt) => {
        return `
<div class="window-text">
<div class="btn-wrapper">
<button class="btn-copy" title="Copia">
<svg class="copy-icon" viewBox="0 0 20 24">
  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
</svg>
</button>
<button class="btn-close" title="chiudi" onclick="UaWindowAdm.closeThis(this)">X</button>
</div>
<pre class="pre-text">${txt}</pre>
</div>
    `;
      };
      wnds.closeAll();
      const h = fh(s);
      this.w.drag();
      this.w.setZ(12);
      this.w.vw_vh().setXY(16.5, 10, -1);
      this.w.setHtml(h);
      this.w.show();
      const e = this.w.getElement();
      const copyBtn = e.querySelector(".btn-copy");
      copyBtn.addEventListener("click", () => this.copy());
    },
    close() {
      this.w.close();
    },
    async copy() {
      const e = this.w.getElement();
      const pre = e.querySelector(".pre-text");
      const t = pre.textContent;
      try {
        await navigator.clipboard.writeText(t);
      } catch (err) {
        console.error("Errore  ", err);
      }
    },
  };
};

const WndDiv = (id) => {
  return {
    w: UaWindowAdm.create(id),
    out: null,
    show(s) {
      const fh = (txt) => {
        return `
<div class="window-text">
<div class="btn-wrapper">
<button class="btn-copy" title="Copia">
<svg class="copy-icon" viewBox="0 0 20 24">
<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
</svg>
</button>
<button class="btn-close" title="chiudi" onclick="UaWindowAdm.closeThis(this)">X</button>
</div>
<div class="div-text">${txt}</div>
</div>
    `;
      };
      wnds.closeAll();
      const h = fh(s);
      this.w.drag();
      this.w.setZ(12);
      this.w.vw_vh().setXY(16.5, 10, -1);
      this.w.setHtml(h);
      this.w.show();
      const e = this.w.getElement();
      const copyBtn = e.querySelector(".btn-copy");
      copyBtn.addEventListener("click", () => this.copy());
    },
    close() {
      this.w.close();
    },
    async copy() {
      const e = this.w.getElement();
      const pre = e.querySelector(".div-text");
      const t = pre.textContent;
      try {
        await navigator.clipboard.writeText(t);
      } catch (err) {
        console.error("Errore  ", err);
      }
    },
  };
};

const wnds = {
  wdiv: null,
  wpre: null,
  wout: null,
  init() {
    this.wdiv = WndDiv("id_w0");
    this.wpre = WndPre("id_w1");
    this.wout = WndPre("id_out");
  },
  closeAll() {
    UaWindowAdm.close("id_w0");
    UaWindowAdm.close("id_w1");
    UaWindowAdm.close("id_out");
  },
};

const Menu = {
  init() {
    const btn = document.querySelector("#id-menu-btn");
    btn.addEventListener("change", () => {
      document.querySelector("body").classList.toggle("menu-open", btn.checked);
    });
    // getsioe log
    const log = document.getElementById("id_log");

    const show = () => {
      if (log.classList.contains("active")) return;
      log.classList.add("active");
    };

    const hide = () => {
      if (!log.classList.contains("active")) return;
      log.classList.remove("active");
    };
    UaLog.callHide = hide;
    UaLog.callShow = show;

    UaLog.setXY(54, 13).setZ(111).new();
    UaLog.log_show("");
  },
  close() {
    const btn = document.querySelector("#menu-toggle");
    document.querySelector("body").classList.remove("menu-open", btn.checked);
    document.querySelector(".menu-btn").checked = false;
  },
  async help() {
    const text = await requestGet("./help0.html");
    wnds.wdiv.show(text);
  },
  upload() {
    RagUpload.open();
  },
  uploadDir() {
    RagUpload.openDir();
  },
  async load() {
    alert("load");
  },
  log() {
    UaLog.toggle();
  },
};

const TextInput = {
  wnd: null,
  init() {
    this.inp = document.querySelector(".text-input");
    document.addEventListener("keydown", (e) => {
      if (document.activeElement !== this.inp) {
        const allowedKeys = [
          "F1",
          "F2",
          "F3",
          "F4",
          "F5",
          "F6",
          "F7",
          "F8",
          "F9",
          "F10",
          "F11",
          "F12",
          "Control",
          "Alt",
          "Shift",
          "Meta",
          "CapsLock",
          "Escape",
          "PrintScreen",
          "ScrollLock",
          "Pause",
          "Insert",
          "Delete",
          "Home",
          "End",
          "PageUp",
          "PageDown",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ];
        if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
        }
      }
    });

    const clsBtn = document.querySelector(".clear-button");
    clsBtn.addEventListener("click", () => {
      this.inp.value = "";
      this.inp.focus();
    });
    this.inp.addEventListener("keydown", (e) => this.handleEnter(e));
    document.querySelector(".send-input").addEventListener("click", () => this.send());
    document.querySelector(".send2-input").addEventListener("click", () => this.send2());
    document.querySelector(".clear-input").addEventListener("click", () => this.clear());
  },
  handleEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.send2();
    }
  },

  // legge i documenti dal DBlocale
  // sala le risposte RAG
  // crea il contesto
  async send() {
    const q = this.inp.value;
    if (!q) {
      alert("Ricorda di scrivere la Query  ");
      return;
    }
    if (!!Rag.ragContext) {
      const ok = confirm("Vuoi iniziare una nuova elabrazione ?");
      if (!ok) return "";
    }
    showSpinner();
    setOutText("");
    const msg = this.inp.value.trim();
    try {
      let text = await Rag.requestDocsRAG(msg);
      text = cleanOut(text);
      setOutText(text);
      this.inp.value = "";
      UaLog.close();
    } catch (err) {
      const msg = `send\n${err}`;
      console.error(msg);
      alert(msg);
      setOutText(msg);
    }
    hideSpinner();
  },

  // utiliza il contesto esistente
  async send2() {
    const q = this.inp.value;
    if (!q) {
      alert("Ricorda di scrivere la Query  ");
      return;
    }
    showSpinner();
    if (ThreadMgr.isFirst()) setOutText("");
    const query = this.inp.value.trim();
    try {
      let text = await Rag.requestContext(query);
      if (text == "") {
        hideSpinner();
        return;
      }
      text = cleanOut(text);
      setOutText(text);
      this.inp.value = "";
    } catch (err) {
      const msg = `send2\n${err}`;
      console.error(msg);
      alert(msg);
      setOutText(msg);
    }
    hideSpinner();
  },
  clear() {
    // let s = "messaggio di prova per vedere la massima larghezza";
    // for (let i = 0; i < 40; i++) {
    //   UaLog.log(s);
    // }
    const ok = confirm("Confermi cancellazione conversazione? ");
    if (!ok) return;
    this.inp.value = "";
    setOutText("");
    ThreadMgr.init();
  },
};
  
const setOutText = (txt) => {
  let out = document.getElementById("id-text-out");
  const h = `<pre class="pre-text"></pre>`;
  out.innerHTML = h;
  const pre = out.querySelector(".pre-text");
  pre.textContent = txt;
  pre.scrollTop = pre.scrollHeight;
};

TextOutput = {
  init() {
    this.copyBtn = document.querySelector(".copy-output");
    this.copyBtn.addEventListener("click", () => this.copy());
    const clearBtn = document.querySelector(".clear-output");
    clearBtn.addEventListener("click", () => this.clear());
    const wndBtn = document.querySelector(".wnd-output");
    wndBtn.addEventListener("click", () => this.openWnd());
  },
  openWnd() {
    const p = document.getElementById("id-text-out");
    const s = p.textContent;
    wnds.wout.show(s);
  },
  async copy() {
    const e = document.getElementById("id-text-out");
    const pre = e.querySelector("pre");
    if (!pre) return;
    const t = pre.textContent;
    pre.classList.add("copied");
    this.copyBtn.classList.add("copied");
    try {
      await navigator.clipboard.writeText(t);
    } catch (err) {
      console.error("Errore  ", err);
    }
    setTimeout(() => {
      this.copyBtn.classList.remove("copied");
      pre.classList.remove("copied");
    }, 5000);
  },
  clear() {
    const out = document.getElementById("id-text-out");
    out.textContent = "";
  },
};
