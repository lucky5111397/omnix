import { getModel } from "../config/llmModels.js";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const visionAgent = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "vision"
        );

        const llm = await getModel("vision");

        const response = await llm.invoke(
            state.prompt
        );

        const creditResponse =
            await deductCredits(
                state.userId,
                "vision",
                state.sessionId
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
            "VISION AGENT ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    }
};