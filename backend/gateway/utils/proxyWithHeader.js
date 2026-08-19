import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl) => {
  return proxy(serviceUrl, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {

      // ==========================================
      // USER ID
      // ==========================================

      const userId =
        srcReq.user?.userId ||
        srcReq.user?._id ||
        srcReq.headers["x-user-id"];


      // ==========================================
      // SESSION ID
      // ==========================================

      const sessionId =
        srcReq.cookies?.session ||
        srcReq.cookies?.sessionId ||
        srcReq.cookies?.["session-id"] ||
        srcReq.headers["x-session-id"];


      // ==========================================
      // FORWARD USER ID
      // ==========================================

      if (userId) {
        proxyReqOpts.headers["x-user-id"] =
          userId;
      }


      // ==========================================
      // FORWARD SESSION ID
      // ==========================================

      if (sessionId) {
        proxyReqOpts.headers["x-session-id"] =
          sessionId;
      }


      // ==========================================
      // DEBUG
      // ==========================================

      console.log(
        "========== GATEWAY PROXY =========="
      );

      console.log(
        "Cookies:",
        srcReq.cookies
      );

      console.log(
        "User ID:",
        userId
      );

      console.log(
        "Session ID:",
        sessionId
      );

      console.log(
        "Forwarded Headers:",
        {
          "x-user-id":
            proxyReqOpts.headers["x-user-id"],

          "x-session-id":
            proxyReqOpts.headers["x-session-id"],
        }
      );


      return proxyReqOpts;
    },
  });
};