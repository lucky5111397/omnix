import { getMessages } from "../utils/getMessages.js"

export const getMemory = async (conversationId, userId) => {
    return (await getMessages(conversationId, userId)) || [];
}
