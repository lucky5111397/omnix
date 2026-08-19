import api from "../../utils/axios";
import { setUser } from "../redux/userSlice";

const getCurrentUser = async (dispatch) => {
  try {
    const { data } = await api.get("/api/me");
    dispatch(setUser(data?.user ?? data));
  } catch (error) {
    console.error(error);
  }
};

export default getCurrentUser;