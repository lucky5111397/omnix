import api from "../../utils/axios";
import { store } from "../redux/store";

export const getConversations = async () => {
  try {
    const user = store.getState().user.user;

    console.log("Redux User:", user);

    const { data } = await api.get(
      "/api/chat/get-conversations",
      {
        headers: {
          "x-user-id": user?._id,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(
      "Get conversations error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};