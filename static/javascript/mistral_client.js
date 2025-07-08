/**
 * @format
 */

class MistralClient extends LLMClient {
  constructor(apiKey) {
    super(apiKey, "https://api.mistral.ai/v1/chat/completions");
  }

  /**
   * @override
   * @param {object} payload
   * @param {number} [timeout=60]
   * @returns {Promise<any>}
   */
  async sendRequest(payload, timeout = 60) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };

    const result = await this._fetch(this.baseUrl, payload, headers, timeout);

    if (result.ok) {
      try {
        const responseData = result.response.choices[0].message.content;
        return this._createResult(true, result.response, responseData);
      } catch (error) {
        return this._createResult(false, null, null, this._createError("Invalid response structure", "ParsingError", null, error));
      }
    } else {
      return result;
    }
  }
}
