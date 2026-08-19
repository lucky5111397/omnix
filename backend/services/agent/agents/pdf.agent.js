import { getModel } from "../config/llmModels.js";
import generatePdf from "../utils/generatePdf.js";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";
import fs from "fs/promises";
import path from "path";

export const pdfAgent = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "pdf"
        );

        const llm = await getModel("pdf");

        const prompt = `
You are an expert document writer.

Return ONLY valid JSON.

Do NOT return markdown.
Do NOT return explanations.

Structure:

{
    "title": "",
    "subtitle": "",
    "sections": [
        {
            "heading": "",
            "points": []
        }
    ]
}

Generate 4-8 sections.

Each section should have 3-6 concise bullet points.

Topic:

${state.prompt}
`;

        const res = await llm.invoke(prompt);
        const data = JSON.parse(res.content);

        const pdfBuffer = await generatePdf(data);

        const filename = `pdf-${Date.now()}.pdf`;
        const uploadDir = path.join(
            process.cwd(),
            "uploads"
        );

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        const filePath = path.join(
            uploadDir,
            filename
        );

        await fs.writeFile(
            filePath,
            pdfBuffer
        );

        const downloadUrl =
            `http://localhost:8003/uploads/${filename}`;

        const creditResponse =
            await deductCredits(
                state.userId,
                "pdf",
                state.sessionId
            );

        return {
            ...state,
            aiResponse: `# PDF Generated

**${data.title}**

📥 [Download PDF](${downloadUrl})

PDF generated successfully.
`,
            credits:
                creditResponse?.remainingCredits ??
                creditResponse?.credits ??
                state.credits,
        };
    } catch (error) {
        console.error(
            "PDF AGENT ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    }
};