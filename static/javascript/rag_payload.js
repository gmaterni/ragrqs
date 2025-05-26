/** @format */

function getPayloadDoc(prompt) {
  return {
    model: "",
    temperature: 0.3,
    max_tokens: 1024,
    stream: false,
    random_seed: 42,
    messages: [{ role: "user", content: prompt }],
    safe_prompt: false,
  };
}

function getPayloadBuildContext(prompt) {
  return {
    model: "",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
    stream: false,
    safe_prompt: false,
    random_seed: 42,
  };
}

function getPayloadWithContext(prompt) {
  return {
    model: "",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
    stream: false,
    safe_prompt: false,
    random_seed: 42,
  };
}

function getPayloadThread(prompt) {
  return {
    model: "",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
    stream: false,
    safe_prompt: false,
    random_seed: 42,
  };
}
