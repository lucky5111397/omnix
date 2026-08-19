import axios from "axios";

const deductCredits = async (userId, agent, sessionId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required for credit deduction");
        }

        if (!agent) {
            throw new Error("Agent is required for credit deduction");
        }

        const headers = {
            "x-user-id": userId,
        };

        if (sessionId) {
            headers["x-session-id"] = sessionId;
        }

        console.log("========== DEDUCT CREDITS ==========");
        console.log("User ID:", userId);
        console.log("Agent:", agent);
        console.log("Session ID:", sessionId);
        console.log("Headers:", headers);
        console.log("AUTH_SERVICE_URL:", process.env.AUTH_SERVICE_URL);

        const response = await axios.post(
            `${process.env.AUTH_SERVICE_URL}/auth/deduct-credits`,
            {
                userId,
                agent,
            },
            {
                headers,
            }
        );

        console.log("Deduct Credits Response:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Deduct Credits Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

export default deductCredits;