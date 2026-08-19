import { useDispatch, useSelector } from "react-redux";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { setUser } from "../redux/userSlice";

import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleGoogleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", {
        token,
      });

      console.log("Google login response:", data);
      dispatch(setUser(data?.user ?? data));
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const token = await result.user.getIdToken();

      await handleGoogleLogin(token);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen bg-[#0d0f14] text-white overflow-hidden">
      {!user ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
          <div className="w-[340px] rounded-2xl border border-white/10 bg-[#13151c] p-7">
            <h2 className="text-lg font-semibold">
              Welcome to Omnix
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Please login to continue
            </p>

            <button
              onClick={googleLogin}
              className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white py-3 font-semibold text-gray-900 transition hover:scale-[1.02]"
            >
              <FcGoogle className="text-xl" />

              Continue with Google
            </button>
          </div>
        </div>
      ) : (
        <div className="flex h-full">
          <SideBar />

          <ChatArea />

          <Artifact />
        </div>
      )}
    </div>
  );
}

export default Home;