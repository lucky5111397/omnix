import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/billing.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(express.json());
app.use("/",router)

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Billing Service is running 🚀",
    });
});

// Database
await connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(
        `✅ Billing Service running on port ${PORT}`
    );
});