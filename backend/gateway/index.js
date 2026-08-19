import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import proxy from "express-http-proxy";
import morgan from "morgan";
import protect from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controllers/user.controller.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const frontendOrigin = process.env.FRONTEND_URL?.replace(/"/g, "");

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(morgan("dev"))
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

/* ---------- Auth Proxy ---------- */
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver(req) {
      return req.originalUrl.replace("/api/auth", "/auth");
    },
  })
);

app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE_URL));
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE_URL));
app.use("/api/billing", protect, proxyWithHeader(process.env.BILLING_SERVICE_URL));

/* ---------- Protected Route ---------- */
app.get("/api/me", protect, getCurrentUser);

/* ---------- Health ---------- */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gateway Service Running 🚀",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on ${PORT}`);
  console.log(`Frontend: ${frontendOrigin}`);
  console.log(`Auth: ${process.env.AUTH_SERVICE_URL}`);
});
