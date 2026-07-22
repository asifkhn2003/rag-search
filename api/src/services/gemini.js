const { GoogleGenAI } = require("@google/genai");
const { EMBEDDING_MODEL } = require("../config/constants");
const { primaryModel } = require("../config/llm");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generate an embedding for a piece of text.
// 3072-dim embedding vector (pre-normalized by Gemini)
async function embedText(text, taskType) {
    if (!text || typeof text !== "string" || !text.trim()) {
        throw new Error("embedText: text must be a non-empty string");
    }
    if (!["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"].includes(taskType)) {
        throw new Error(`embedText: invalid taskType "${taskType}"`);
    }

    const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { taskType },
    });

    const embedding = result?.embeddings?.[0]?.values;
    if (!embedding) {
        throw new Error("embedText: no embedding returned from Gemini");
    }

    return embedding;
}

// Generate an answer to a question using retrieved context chunks.
async function generateAnswer(question, contextChunks, history = []) {
    console.log("History:", history);
    console.log("primaryMOdel:", primaryModel);
    if (!question || typeof question !== "string" || !question.trim()) {
        throw new Error("generateAnswer: question must be a non-empty string");
    }

    const context = (contextChunks || []).join("\n\n---\n\n");
    const historyText = history.length
        ? history.map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`).join("\n")
        : "(none)";

    const prompt = `You are a customer support assistant.

Use the conversation history to understand context, follow-ups, and previously stated facts. Use the context below for facts not already covered in the conversation history. If the answer is available in either the history or the context, answer using it. If not available in either, say you don't have enough information to answer.

Conversation history:
${historyText}

Context:
${context}

Question: ${question}

Answer:`;

    const result = await primaryModel.invoke(prompt);
    const text = result.content;

    if (!text) {
        throw new Error("generateAnswer: no response text returned from Gemini");
    }

    return text;
}

module.exports = { embedText, generateAnswer };