import express from "express";
import {
  createConversations,
  deleteMessage,
  getConversations,
  getMessages,
  saveMessage,
  updateConversations,
} from "../controller/chat.controller.js";

const router = express.Router();

router.get("/create-conversation", createConversations);
router.get("/get-conversations", getConversations);
router.post("/update-conversation", updateConversations);
router.post("/save-message", saveMessage);
router.post("/delete-message", deleteMessage);
router.get("/get-messages/:conversationId", getMessages);

export default router;
