import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            unique: true,
        },

        name: {
            type: String,
        },

        email: {
            type: String,
        },

        avatar: {
            type: String,
        },

        plan: {
            type: String,
            default: "free",
        },

        credits: {
            type: Number,
            default: 100,
        },

        totalCredits: {
            type: Number,
            default: 100,
        },

        planExpiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;