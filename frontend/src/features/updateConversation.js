import api from "../../utils/axios";
import { store } from "../redux/store";

export const updateConversation = async ({ id, title }) => {
  try {
    const user = store.getState().user.user;

    console.log("Redux User:", user);
    console.log("User ID:", user?.userId);

    const { data } = await api.post(
      "/api/chat/update-conversation",
      {
        id,
        title,
      },
      {
        headers: {
          "x-user-id": user?.userId,
        },
      }
    );

    console.log("Updated Conversation:", data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};