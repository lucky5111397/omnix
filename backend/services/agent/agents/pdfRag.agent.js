import fs from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorStore from "../config/vectorDb.js";
import { getModel } from "../config/llmModels.js";
import {
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const pdfRag = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        if (!state.file?.path) {
            throw new Error("PDF file not found");
        }

        await checkAgentLimit(
            state.userId,
            "pdf"
        );

        const buffer = fs.readFileSync(
            state.file.path
        );

        const parser = new PDFParse({
            data: buffer,
        });

        const result = await parser.getText();
        const text = result.text?.trim();

        if (!text) {
            throw new Error(
                "No text could be extracted from PDF"
            );
        }

        const splitter =
            new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });

        const docs =
            await splitter.createDocuments([text]);

        if (!docs.length) {
            throw new Error(
                "No PDF chunks were created"
            );
        }

        const collectionName = `pdf-${Date.now()}`;

        const store = await vectorStore(
            docs,
            collectionName
        );

        const userPrompt =
            state.prompt?.trim() ||
            "Analyze the uploaded PDF.";

        const normalizedPrompt =
            userPrompt.toLowerCase();

        const isGenericAnalysis =
            normalizedPrompt === "analyze" ||
            normalizedPrompt === "analyze it" ||
            normalizedPrompt === "analyze the pdf" ||
            normalizedPrompt === "summarize" ||
            normalizedPrompt === "summary" ||
            normalizedPrompt === "summarize the pdf";

        let relevantDocs;

        if (isGenericAnalysis) {
            relevantDocs = docs;
        } else {
            relevantDocs =
                await store.similaritySearch(
                    userPrompt,
                    5
                );

            if (!relevantDocs?.length) {
                relevantDocs = docs;
            }
        }

        const context = relevantDocs
            .map((doc) => doc?.pageContent || "")
            .filter((content) => content.trim())
            .join("\n\n");

        if (!context.trim()) {
            throw new Error(
                "PDF context is empty"
            );
        }

        const llm =
            await getModel("pdf-rag");

        const messages = [
            new SystemMessage(`
You are Omnix PDF assistant.

Rules:
- Use only the provided PDF content.
- Do not use outside knowledge.
- Do not invent information.
- For summary requests, summarize the provided PDF content.
- For analysis requests, explain the important points, problems, themes, facts, and details present in the PDF.
- For specific questions, answer directly from the PDF content.
- If the requested information is not present, say:
"I couldn't find this information in the uploaded PDF."
- Use clear markdown formatting.
- Keep the answer relevant to the user's request.
`),

            new HumanMessage(`
PDF Content:

${context}

User Request:

${userPrompt}
`),
        ];

        const response =
            await llm.invoke(messages);

        const creditResponse =
            await deductCredits(
                state.userId,
                "pdf",
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
            "PDF RAG ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    } finally {
        if (
            state.file?.path &&
            fs.existsSync(state.file.path)
        ) {
            try {
                fs.unlinkSync(
                    state.file.path
                );
            } catch (error) {
                console.error(
                    "PDF DELETE ERROR:",
                    error.message
                );
            }
        }
    }
};