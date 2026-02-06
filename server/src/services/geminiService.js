const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

async function generateText(prompt) {
  const client = getGeminiClient();
  if (!client) {
    const err = new Error("Gemini API key not configured");
    err.code = "NO_GEMINI_KEY";
    throw err;
  }

  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateText };
