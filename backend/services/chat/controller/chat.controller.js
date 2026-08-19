import Conversation from "../models/conversation.model.js";
import Message from "../models/Message.model.js";
import mongoose from "mongoose";

const getUserId = (req) => req.headers["x-user-id"];

const findOwnedConversation = async (conversationId, userId) => {
    if (!userId) {
        return { status: 400, message: "Missing x-user-id header" };
    }

    if (!mongoose.isValidObjectId(conversationId)) {
        return { status: 400, message: "Invalid conversationId" };
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
    });

    if (!conversation) {
        return { status: 404, message: "Conversation not found" };
    }

    return { conversation };
};

// Create Conversation
export const createConversations = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];

        console.log("Headers:", req.headers);
        console.log("UserId:", userId);

        if (!userId) {
            return res.status(400).json({ message: "Missing x-user-id header" });
        }

        const conversation = await Conversation.create({
            userId,
        });

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Get Conversations
export const getConversations = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(400).json({ message: "Missing x-user-id header" });
        }

        const conversations = await Conversation.find({
            userId,
        }).sort({ updatedAt: -1 });

        return res.status(200).json(conversations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Update Conversation
export const updateConversations = async (req, res) => {
    try {
        const { id, title } = req.body;
        const userId = getUserId(req);

        const ownership = await findOwnedConversation(id, userId);
        if (ownership.status) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        const conversation = await Conversation.findOneAndUpdate(
            { _id: id, userId },
            { title },
            { new: true }
        );

        return res.status(200).json(conversation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Save Message
export const saveMessage = async (req, res) => {
    try {
        const { conversationId, role, content, images, artifacts } = req.body;
        const userId = getUserId(req);

        if (!['user', 'assistant'].includes(role) || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ message: "Valid role and content are required" });
        }

        const ownership = await findOwnedConversation(conversationId, userId);
        if (ownership.status) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        const message = await Message.create({
            conversationId,
            role,
            images,
            artifacts,
            content: content.trim(),
        });

        ownership.conversation.updatedAt = new Date();
        await ownership.conversation.save();

        return res.status(200).json(message);
    } catch (error) {
        console.error("SAVE MESSAGE ERROR:", error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Delete Message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId, conversationId } = req.body;
        const userId = getUserId(req);

        if (!mongoose.isValidObjectId(messageId)) {
            return res.status(400).json({ message: "Invalid messageId" });
        }

        const ownership = await findOwnedConversation(conversationId, userId);
        if (ownership.status) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        const message = await Message.findOneAndDelete({
            _id: messageId,
            conversationId,
        });

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("DELETE MESSAGE ERROR:", error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

// Get Messages
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = getUserId(req);

        const ownership = await findOwnedConversation(conversationId, userId);
        if (ownership.status) {
            return res.status(ownership.status).json({ message: ownership.message });
        }

        const messages = await Message.find({
            conversationId,
        }).sort({ createdAt: 1 });

        return res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};
