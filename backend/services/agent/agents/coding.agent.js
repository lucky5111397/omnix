import { getModel } from "../config/llmModels.js";
import deductCredits from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentlimit.js";

export const codingAgent = async (state) => {
    try {
        if (!state.userId) {
            throw new Error("User ID is missing");
        }

        await checkAgentLimit(
            state.userId,
            "coding"
        );

        const intentLlm = await getModel("intent");
        const llm = await getModel("coding");

        const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these values:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSATION
DOCUMENTATION

User Request:
${state.prompt}
`);

        const intent = intentRes.content.trim();

        const creditResponse = await deductCredits(
            state.userId,
            "coding",
            state.sessionId
        );

        if (intent === "CODE_GENERATION") {
            const prompt = `
You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:
- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

IMAGES
=========================

Always use real Unsplash images.

Never use placeholders.

Return ONLY valid JSON.

Schema:

{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}

Rules:
- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
`;

            const response = await llm.invoke(prompt);
            const data = JSON.parse(response.content);

            return {
                ...state,
                aiResponse: "Code Generated Successfully.",
                credits:
                    creditResponse?.remainingCredits ??
                    creditResponse?.credits ??
                    state.credits,
                artifacts: [
                    {
                        id: Date.now(),
                        type: "Project",
                        files: data.files || [],
                        title: state.prompt,
                    },
                ],
            };
        }

        const response = await llm.invoke(`
The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}
`);

        return {
            ...state,
            aiResponse: response.content,
            credits:
                creditResponse?.remainingCredits ??
                creditResponse?.credits ??
                state.credits,
            artifacts: [],
        };
    } catch (error) {
        console.error(
            "CODING AGENT ERROR:",
            error?.data ||
            error?.response?.data ||
            error?.message
        );

        throw error;
    }
};