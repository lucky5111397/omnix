import { searchTool } from "../config/tavily.js";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const searchAgent = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "search"
        );

        const results = await searchTool.invoke({
            query: state.prompt,
        });

        const creditResponse =
            await deductCredits(
                state.userId,
                "search",
                state.sessionId
            );

        return {
            ...state,
            searchResults:
                results?.results || [],
            images:
                results?.images || [],
            credits:
                creditResponse?.remainingCredits ??
                creditResponse?.credits ??
                state.credits,
        };
    } catch (error) {
        console.error(
            "SEARCH AGENT ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    }
};