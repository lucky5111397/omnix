import api from "../../utils/axios";
import { store } from "../redux/store";

export const createConversation = async () => {
    try {
        const user = store.getState().user.user;

        console.log("Redux User:", user);
        console.log("User ID:", user?.userId);

        const { data } = await api.get("/api/chat/create-conversation", {
            headers: {
                "x-user-id": user?.userId,
            },
        });

        console.log("Created Conversation:", data);

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};