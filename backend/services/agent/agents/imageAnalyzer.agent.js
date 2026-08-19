import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { promises as fs } from "fs";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const imageAnalyzer = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "vision"
        );

        const llm = await getModel("imageAnalyzer");

        const imageBuffer = await fs.readFile(
            state.file.path
        );

        const base64image =
            imageBuffer.toString("base64");

        const messages = [
            new SystemMessage(`
You are Omnix image analyzer agent.

Rules:
- Analyze only the uploaded image.
- Answer the user's question accurately.
- If text exists in the image, extract it.
- If charts or tables exist, explain them.
- If something is unclear, say so.
- Use markdown when helpful.
- Do not hallucinate.
`),

            new HumanMessage({
                content: [
                    {
                        type: "text",
                        text:
                            state.prompt ||
                            "Analyze the image",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${state.file.mimetype};base64,${base64image}`,
                        },
                    },
                ],
            }),
        ];

        const response =
            await llm.invoke(messages);

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
            "IMAGE ANALYZER ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    } finally {
        if (state.file?.path) {
            try {
                await fs.unlink(
                    state.file.path
                );
            } catch (error) {
                console.error(
                    "Failed to delete uploaded file:",
                    error.message
                );
            }
        }
    }
};