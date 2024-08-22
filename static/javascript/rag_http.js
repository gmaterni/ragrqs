/** @format */
"use strict";

const model_name = "mistralai/Mistral-7B-Instruct-v0.3";
// const model_name = "mistralai/Mixtral-8x7B-Instruct-v0.1";
// const model_name = "mistralai/Mixtral-8x22B-Instruct-v0.1"

async function requestGet(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(arrayBuffer);
    return text;
  } catch (error) {
    console.error(error);
    let message;
    if (error.name === "AbortError") {
      message = "Request was aborted";
    } else if (error.message.includes("HTTP error! status")) {
      message = error.message;
    } else {
      message = "An error occurred";
    }
    alert(`requestGet()\nurl: ${url}\n${message}`);
    throw error;
  }
}
const ERROR_TOKENS = "ERROR_TOKENS";
const TIMEOUT_ERROR = "TIMEOUT_ERROR";

const HfRequest = {
  controller: null,
  isCancelled: false,
  baseUrl: "https://api-inference.huggingface.co/models",

  async post(payload, timeout = 50000) {
    this.isCancelled = false;
    this.controller = new AbortController();

    try {
      const timeoutId = setTimeout(() => {
        this.controller.abort();
      }, timeout);
      const response = await fetch(`${this.baseUrl}/${model_name}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tm}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: this.controller.signal,
      });
      clearTimeout(timeoutId);
      if (this.isCancelled) return null;
      const data = await response.json();
      if (!response.ok) {
        const errorType = this.checkError(response.status, data);
        const errorInfo = this.createErrorInfo(response.status, response.statusText, data.error, errorType);
        throw new Error(errorInfo);
      }
      const errorType = this.isInvalidResponse(data);
      if (typeof errorType === "string") {
        const errorInfo = this.createErrorInfo(response.status, response.statusText, data.error, errorType);
        throw new Error(errorInfo);
      }
      return data[0].generated_text.trim();
    } catch (error) {
      if (this.isCancelled) return null;
      if (error.name === "AbortError") {
        const errorInfo = this.createErrorInfo(0, "Timeout", "La richiesta è scaduta", TIMEOUT_ERROR);
        throw new Error(errorInfo);
      }
      throw error;
    }
  },
  cancelRequest() {
    if (this.controller) {
      this.isCancelled = true;
      this.controller.abort();
    }
  },
  checkError(status, data) {
    let errorType;
    if (status >= 500) {
      errorType = "SERVER_ERROR";
    } else if (status >= 400 && status < 500) {
      if (typeof data === "object" && data.error_type === "validation") {
        if (data.error.includes("tokens")) {
          errorType = ERROR_TOKENS;
        } else {
          errorType = "ERROR_VALIDATION";
        }
      } else {
        errorType = "CLIENT_ERROR";
      }
    } else {
      errorType = "UNKNOWN_ERROR";
    }
    return errorType;
  },
  isInvalidResponse(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return "INVALID_DATA";
    }
    if (!data[0].generated_text) {
      return "MISSING_GENERATED_TEXT";
    }
    return null;
  },
  createErrorInfo(status, statusText, msg, errorType) {
    const err = {
      status: status,
      statusText: statusText,
      errorType: errorType,
      message: msg || "Errore sconosciuto",
    };
    return JSON.stringify(err);
  },
};

function errorInfo(err) {
  let js = {};
  try {
    js = JSON.parse(err.message);
    return js;
  } catch (err) {
    console.error(err);
    js = {};
    throw err;
  } finally {
    return js;
  }
}

// function errorToText(err) {
//   const j = JSON.parse(err.message);
//   return `Error:
//     Status: ${j.status}
//     Status Text: ${j.statusText}
//     Error Type: ${j.errorType}
//     Message: ${j.message}`;
// }
