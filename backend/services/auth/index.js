import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import "./config/firebase.js";
import router from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", router);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth Service is running 🚀",
  });
});

// Database
await connectDB();

app.listen(PORT, () => {
  console.log(
    `✅ Auth Service running on port ${PORT}`
  );
});