/**
 * @format
 */

class GeminiClient extends LLMClient {
  constructor(apiKey) {
    super(apiKey, "https://generativelanguage.googleapis.com/v1beta/models/");
  }

  /**
   * @override
   * @param {object} payload
   * @param {number} [timeout=60]
   * @returns {Promise<any>}
   */
  async sendRequest(payload, timeout = 60) {
    const model = payload.model || "gemini-1.5-flash";
    const url = `${this.baseUrl}${model}:generateContent?key=${this.apiKey}`;

    const geminiPayload = this._convertPayloadToGemini(payload);

    const headers = {
      "Content-Type": "application/json",
    };

    const result = await this._fetch(url, geminiPayload, headers, timeout);

    if (result.ok) {
      try {
        const responseData = result.response.candidates[0].content.parts[0].text;
        const a = this._createResult(true, result.response, responseData);
        return a;
      } catch (error) {
        return this._createResult(false, null, null, this._createError("Invalid response structure", "ParsingError", null, error));
      }
    } else {
      return result;
    }
  }

  /**
   * @private
   * @param {object} payload
   * @returns {object}
   */
  _convertPayloadToGemini(payload) {
    const contents = payload.messages.map((message) => {
      return {
        role: message.role === "system" ? "user" : message.role, // Gemini doesn't have a 'system' role
        parts: [{ text: message.content }],
      };
    });

    return {
      contents: contents,
      generationConfig: {
        temperature: payload.temperature,
        maxOutputTokens: payload.max_tokens,
      },
    };
  }
}
