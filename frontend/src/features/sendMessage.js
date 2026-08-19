import api from "../../utils/axios";
import { store } from "../redux/store";
import { setUser } from "../redux/userSlice";

async function sendMessage(payload) {
  try {
    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const { data } = await api.post(
      "/api/agent/chat",
      payload
    );

    console.log(
      "Agent Response:",
      data
    );


    // ==========================================
    // UPDATE CREDITS IMMEDIATELY
    // ==========================================

    if (
      data?.credits !== undefined &&
      data?.credits !== null
    ) {

      const currentUser =
        store.getState().user.user;

      console.log(
        "Credits From Agent:",
        data.credits
      );


      // Keep existing user data
      // and only update credits

      store.dispatch(
        setUser({
          ...currentUser,
          credits: data.credits,
        })
      );


      console.log(
        "Redux Credits After Update:",
        store.getState().user.user?.credits
      );

    } else {

      console.warn(
        "Agent response does not contain credits:",
        data
      );

    }


    // ==========================================
    // RETURN RESPONSE
    // ==========================================

    return data;


  } catch (error) {

    console.error(
      "Send Message Error:",
      error?.response?.data ||
      error.message
    );


    const message =
      error?.response?.data?.message ||
      error.message ||
      "Failed to send message";


    throw new Error(message);
  }
}

export default sendMessage;