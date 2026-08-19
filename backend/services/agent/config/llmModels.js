import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenRouter } from "@langchain/openrouter";

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,
});

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    apiKey: process.env.GOOGLE_API_KEY,
});

const openrouter = new ChatOpenRouter({
    model: "deepseek/deepseek-chat",
    apiKey: process.env.OPENROUTER_API_KEY,
    temperature: 0,
    maxTokens: 2500,
});

export const getModel = (agent) => {
    switch (agent) {
        case "chat":
        case "search":
        case "pdf":
        case "pdf-rag":
        case "ppt":
        case "image":
        case "vision":
            return groq;

        case "coding":
            return openrouter;

        case "imageAnalyzer":
            return gemini;

        default:
            return groq;
    }
};