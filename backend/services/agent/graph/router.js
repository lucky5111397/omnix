import { getModel } from "../config/llmModels.js";

export const router = async (state) => {
    try {
        if (state.agent && state.agent !== "auto") {
            console.log(
                "ROUTER: Manual agent selected:",
                state.agent
            );

            return {
                ...state,
                agent: state.agent,
            };
        }

        if (state.file) {
            console.log(
                "File in router:",
                state.file.mimetype
            );

            if (state.file.mimetype === "application/pdf") {
                return {
                    ...state,
                    agent: "pdfRag",
                };
            }

            if (state.file.mimetype.startsWith("image/")) {
                return {
                    ...state,
                    agent: "imageAnalyzer",
                };
            }
        }

        const llm = await getModel("router");

        const prompt = `
You are an intelligent agent router.

Available agents:

- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
- General conversation
- Explanations
- Learning
- Questions
- Greetings
- Normal AI conversation

search:
- Current events
- Latest information
- News
- Recent developments
- Internet lookup
- Information that requires web search

coding:
- Generate code
- Debug code
- Code review
- Build projects
- Architecture
- API design
- Programming questions

pdf:
- Generate a PDF
- Create documents
- Document generation
- PDF-related requests

ppt:
- Generate PowerPoint
- Create presentations
- Presentation content

vision:
- Image generation
- Image analysis
- Image-related requests

Return ONLY ONE WORD.

Allowed values:

chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}
`;

        const response = await llm.invoke(prompt);

        const selectedAgent = response.content
            .trim()
            .toLowerCase()
            .replace(/["'`]/g, "")
            .split(/\s+/)[0];

        const validAgents = new Set([
            "chat",
            "search",
            "coding",
            "pdf",
            "ppt",
            "vision",
        ]);

        if (!validAgents.has(selectedAgent)) {
            return {
                ...state,
                agent: "chat",
            };
        }

        return {
            ...state,
            agent: selectedAgent,
        };
    } catch (error) {
        console.error("AGENT ROUTER ERROR:", error);

        return {
            ...state,
            agent: "chat",
        };
    }
};