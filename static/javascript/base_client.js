/**
 * @format
 * @abstract
 */

class LLMClient {
  /**
   * @param {string} apiKey
   * @param {string} [baseUrl]
   */
  constructor(apiKey, baseUrl = "") {
    if (this.constructor === LLMClient) {
      throw new Error("LLMClient is an abstract class and cannot be instantiated directly.");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.abortController = null;
    this.isCancelled = false;
  }

  /**
   * @abstract
   * @param {object} payload
   * @param {number} [timeout=60]
   * @returns {Promise<any>}
   */
  async sendRequest(payload, timeout = 60) {
    throw new Error("Method 'sendRequest()' must be implemented.");
  }

  cancelRequest() {
    this.isCancelled = true;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      return true;
    }
    return false;
  }

  _createResult(ok, response = null, data = null, error = null) {
    return {
      ok,
      response,
      data,
      error,
    };
  }

  _createError(message, type, code, details) {
    return {
      message: message || null,
      type: type || null,
      code: code || null,
      details: {
        message: details?.message || null,
        type: details?.type || null,
        param: details?.param || null,
        code: details?.code || null,
      },
    };
  }

  async _handleHttpError(response) {
    const errorMessages = {
      400: "Richiesta non valida",
      401: "Non autorizzato - Controlla la API key",
      403: "Accesso negato",
      404: "Endpoint non trovato",
      429: "Troppe richieste - Rate limit superato",
      500: "Errore interno del server",
      503: "Servizio non disponibile",
    };

    let detailsContent;
    let errorType = "HTTPError";
    let message = errorMessages[response.status] || `Errore HTTP ${response.status}`;

    try {
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        detailsContent = await response.json();
        if (response.status === 400 && detailsContent) {
          const errorMsg = typeof detailsContent.error === "string" ? detailsContent.error : detailsContent.message || detailsContent.error?.message;
          if (
            errorMsg &&
            (errorMsg.includes("token limit") || errorMsg.includes("token exceeded") || errorMsg.includes("input too long") || errorMsg.includes("context length") || errorMsg.includes("max tokens"))
          ) {
            message = "Input troppo lungo - Superato il limite di token";
            errorType = "TokenLimitError";
          }
        }
      } else {
        detailsContent = await response.text();
        if (response.status === 400 && (detailsContent.includes("token limit") || detailsContent.includes("input too long") || detailsContent.includes("context length"))) {
          message = "Input troppo lungo - Superato il limite di token";
          errorType = "TokenLimitError";
        }
      }
    } catch (e) {
      detailsContent = { message: "Impossibile estrarre i dettagli dell'errore" };
    }
    return this._createError(message, errorType, response.status, typeof detailsContent === "string" ? { message: detailsContent } : detailsContent);
  }

  _handleNetworkError(error) {
    if (error.name === "AbortError") {
      if (this.isCancelled) {
        return this._createError("Richiesta annullata dall'utente", "CancellationError", 499, { message: "La richiesta è stata interrotta volontariamente dall'utente" });
      } else {
        return this._createError("Richiesta interrotta per timeout", "TimeoutError", 408, { message: "La richiesta è stata interrotta a causa di un timeout", isTimeout: true });
      }
    }
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      return this._createError("Errore di rete", "NetworkError", 0, { message: "Impossibile raggiungere il server. Controlla la connessione." });
    }
    return this._createError("Errore imprevisto", error.name || "UnknownError", 500, { message: error.message || "Si è verificato un errore sconosciuto" });
  }

  /**
   * @protected
   * @param {string} url
   * @param {object} payload
   * @param {object} headers
   * @param {number} [timeout=60]
   * @returns {Promise<any>}
   */
  async _fetch(url, payload, headers, timeout = 60) {
    this.isCancelled = false;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const timeoutId = setTimeout(() => {
      if (this.abortController) {
        this.abortController.abort();
      }
    }, timeout * 1000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        signal: signal,
      });

      clearTimeout(timeoutId);

      if (this.isCancelled) {
        const cancelledError = this._createError("Richiesta annullata", "CancellationError", 499, { message: "La richiesta è stata interrotta volontariamente dall'utente" });
        return this._createResult(false, null, null, cancelledError);
      }

      if (!response.ok) {
        const err = await this._handleHttpError(response);
        return this._createResult(false, null, null, err);
      }

      const respJson = await response.json();
      return this._createResult(true, respJson);
    } catch (error) {
      clearTimeout(timeoutId);
      const err = this._handleNetworkError(error);
      return this._createResult(false, null, null, err);
    } finally {
      this.abortController = null;
    }
  }
}

function getLlmClient(model) {
  console.log("** MODEL:\n", model);
  if (model.toLowerCase().includes("gemini")) {
    const apiKey = "AIzaSyAMbjL5tbVKPtNWwQEr8ozQvM_jvSkNCJc";
    const client = new GeminiClient(apiKey);
    return client;
  }
  const apiKey = "FAUsMsVFSw5gW5OEkvUZEZ1jcIWFlPj4";
  const client = new MistralClient(apiKey);
  return client;
}
