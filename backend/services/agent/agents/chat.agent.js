import {
    AIMessage,
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";

import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const chatAgent = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "chat"
        );

        const creditResponse = await deductCredits(
            state.userId,
            "chat",
            state.sessionId
        );

        const llm = await getModel("chat");

        const history = await getMemory(
            state.conversationId,
            state.userId
        );

        const searchContext = state.searchResults?.length
            ? `
Web Search Results:

${JSON.stringify(state.searchResults)}

Answer the user using only the above search results.
`
            : "";

        const systemPrompt = `
You are Omnix, an intelligent AI assistant.

${searchContext}

${state.searchResults?.length
                ? `
If search results are available:
- Use them to answer the user.
- Do not mention internal tools.
`
                : ""
            }

Rules:
- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.
- Use # for titles.
- Use ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
`;

        
        const messages = [
            new SystemMessage(systemPrompt),

            ...history
                .filter(
                    (msg) =>
                        msg.role === "user" ||
                        msg.role === "assistant"
                )
                .map((msg) =>
                    msg.role === "user"
                        ? new HumanMessage(msg.content)
                        : new AIMessage(msg.content)
                ),

            new HumanMessage(state.prompt),
        ];

       
        const response = await llm.invoke(
            messages
        );

        return {
            ...state,

            aiResponse: response.content,

            credits:
                creditResponse?.remainingCredits ??
                creditResponse?.credits ??
                state.credits,
        };
    } catch (error) {
        console.error(
            "CHAT AGENT ERROR:",
            error?.data || error?.message
        );

        throw error;
    }
};