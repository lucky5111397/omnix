import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import router from "./Routes/chat.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

app.use(express.json());
app.use(cookieParser());
app.use("/", router)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat Service is running 🚀",
  });
});

await connectDB();

app.listen(PORT, () => {
  console.log(`✅ Chat Service running on port ${PORT}`);
});