import axios from "axios";
import mongoose from "mongoose";
import { graph } from "../graph/graph.js";
import {
    getMessages,
    invalidateMessagesCache,
} from "../utils/getMessages.js";

export const agent = async (req, res, next) => {
    try {
        const {
            prompt,
            conversationId,
            agent: requestedAgent = "auto",
        } = req.body;

        const file = req.file;
        const userId = req.headers["x-user-id"];
        const sessionId = req.headers["x-session-id"];

        if (
            typeof prompt !== "string" ||
            !prompt.trim() ||
            !conversationId
        ) {
            return res.status(400).json({
                success: false,
                message: "prompt and conversationId are required",
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Missing x-user-id header",
            });
        }

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversationId",
            });
        }

        if (!process.env.CHAT_SERVICE_URL) {
            throw new Error(
                "CHAT_SERVICE_URL is not configured"
            );
        }

        const content = prompt.trim();

        const selectedAgent =
            requestedAgent === "image"
                ? "vision"
                : requestedAgent;

        const validAgents = new Set([
            "auto",
            "chat",
            "coding",
            "pdf",
            "ppt",
            "search",
            "vision",
        ]);

        if (!validAgents.has(selectedAgent)) {
            return res.status(400).json({
                success: false,
                message: "Invalid agent selection",
            });
        }

        const chatRequestConfig = {
            headers: {
                "x-user-id": userId,
                ...(sessionId && {
                    "x-session-id": sessionId,
                }),
            },
        };

        try {
            await axios.get(
                `${process.env.CHAT_SERVICE_URL}/get-messages/${conversationId}`,
                chatRequestConfig
            );
        } catch (error) {
            console.error(
                "Conversation validation error:",
                error.response?.data || error.message
            );

            return res.status(
                error.response?.status || 500
            ).json({
                success: false,
                message:
                    error.response?.data?.message ||
                    "Conversation validation failed",
            });
        }

        const initialState = {
            prompt: content,
            conversationId,
            userId,
            sessionId,
            agent: selectedAgent,
            file,
            searchResults: [],
            images: [],
            artifacts: [],
            aiResponse: "",
            credits: undefined,
        };

        const result = await graph.invoke(initialState);

        const response = result?.aiResponse;

        const images = Array.isArray(result?.images)
            ? result.images
            : [];

        const artifacts = Array.isArray(result?.artifacts)
            ? result.artifacts
            : [];

        const credits = result?.credits;

        if (
            typeof response !== "string" ||
            !response.trim()
        ) {
            throw new Error(
                "The AI graph returned an empty response"
            );
        }

        const userMessageResponse = await axios.post(
            `${process.env.CHAT_SERVICE_URL}/save-message`,
            {
                conversationId,
                role: "user",
                content,
            },
            chatRequestConfig
        );

        try {
            await axios.post(
                `${process.env.CHAT_SERVICE_URL}/save-message`,
                {
                    conversationId,
                    role: "assistant",
                    content: response,
                    images,
                    artifacts,
                },
                chatRequestConfig
            );
        } catch (assistantSaveError) {
            console.error(
                "Assistant message save failed:",
                assistantSaveError.response?.data ||
                assistantSaveError.message
            );

            const messageId =
                userMessageResponse.data?._id;

            if (messageId) {
                try {
                    await axios.post(
                        `${process.env.CHAT_SERVICE_URL}/delete-message`,
                        {
                            conversationId,
                            messageId,
                        },
                        chatRequestConfig
                    );
                } catch (rollbackError) {
                    console.error(
                        "Rollback failed:",
                        rollbackError.response?.data ||
                        rollbackError.message
                    );
                }
            }

            throw assistantSaveError;
        }

        try {
            await invalidateMessagesCache(conversationId);

            await getMessages(
                conversationId,
                userId
            );
        } catch (cacheError) {
            console.error(
                "Message cache refresh failed:",
                cacheError.message
            );
        }

        return res.status(200).json({
            success: true,
            answer: response,
            images,
            artifacts,
            credits,
        });
    } catch (error) {
        console.error(
            "AGENT CONTROLLER ERROR:",
            error.response?.data || error.message
        );

        return next(error);
    }
};