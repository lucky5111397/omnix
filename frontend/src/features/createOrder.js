import api from "../../utils/axios";
import { store } from "../redux/store";

export const createOrder = async (payload) => {
  try {
    const user = store.getState().user.user;

    console.log("Redux User:", user);

    const { data } = await api.post(
      "/api/billing/create",
      payload,
      {
        headers: {
          "x-user-id": user?._id,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(
      "Create order error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};