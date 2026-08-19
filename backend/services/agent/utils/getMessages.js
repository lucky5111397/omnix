import axios from "axios";
import { deleteRedisKey, getRedisClient } from "./redis.js";

const MESSAGE_CACHE_TTL_SECONDS = 5 * 60;

export const getMessages = async (conversationId, userId) => {
    const cacheKey = `conversation:${conversationId}:messages`;
    const redisClient = getRedisClient();

    if (redisClient) {
        try {
            const cachedMessages = await redisClient.get(cacheKey);

            if (cachedMessages) {
                return JSON.parse(cachedMessages);
            }
        } catch (error) {
            console.warn(`Unable to read messages from Redis: ${error.message}`);
        }
    }

    try {
        const config = userId ? { headers: { "x-user-id": userId } } : undefined;
        const { data } = await axios.get(`${process.env.CHAT_SERVICE_URL}/get-messages/${conversationId}`, config);

        const connectedRedisClient = getRedisClient();
        if (connectedRedisClient) {
            try {
                await connectedRedisClient.set(
                    cacheKey,
                    JSON.stringify(data),
                    "EX",
                    MESSAGE_CACHE_TTL_SECONDS
                );
            } catch (error) {
                console.warn(`Unable to cache messages in Redis: ${error.message}`);
            }
        }

        return data;
    } catch (error) {
        console.log(error)
        return null
    }
}

export const invalidateMessagesCache = async (conversationId) => {
    await deleteRedisKey(`conversation:${conversationId}:messages`);
};
