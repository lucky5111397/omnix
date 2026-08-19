import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./router/agent.route.js";
import { initializeRedis } from "./utils/redis.js";

dotenv.config();

initializeRedis();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());
app.use(cookieParser());

app.use(
    "/uploads",
    express.static(
        path.join(process.cwd(), "uploads")
    )
);

app.use(
    "/generated",
    express.static(
        path.join(process.cwd(), "generated")
    )
);

app.use("/", router);

app.use((err, req, res, next) => {
    console.error("Agent Service Error:", err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(err.data || {}),
    });
});

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Agent Service is running 🚀",
    });
});

await connectDB();

app.listen(PORT, () => {
    console.log(
        `✅ Agent Service running on port ${PORT}`
    );
});