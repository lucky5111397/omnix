import express from "express";
import request from "supertest";
import { describe, it, expect } from "vitest";
import router from "../Routes/chat.route.js";

describe("Chat Service API (Authorization & Input Validation Boundaries)", () => {
  const app = express();
  app.use(express.json());
  app.use("/", router);

  describe("GET /create-conversation", () => {
    it("should return 400 when x-user-id header is missing", async () => {
      const res = await request(app).get("/create-conversation");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing x-user-id header" });
    });
  });

  describe("GET /get-conversations", () => {
    it("should return 400 when x-user-id header is missing", async () => {
      const res = await request(app).get("/get-conversations");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing x-user-id header" });
    });
  });

  describe("POST /save-message", () => {
    it("should return 400 when role is invalid", async () => {
      const res = await request(app)
        .post("/save-message")
        .set("x-user-id", "user_123")
        .send({
          conversationId: "507f1f77bcf86cd799439011",
          role: "superuser",
          content: "Hello",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Valid role and content are required" });
    });

    it("should return 400 when content is empty or whitespace", async () => {
      const res = await request(app)
        .post("/save-message")
        .set("x-user-id", "user_123")
        .send({
          conversationId: "507f1f77bcf86cd799439011",
          role: "user",
          content: "   ",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Valid role and content are required" });
    });

    it("should return 400 when x-user-id header is missing", async () => {
      const res = await request(app)
        .post("/save-message")
        .send({
          conversationId: "507f1f77bcf86cd799439011",
          role: "user",
          content: "Hello",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing x-user-id header" });
    });

    it("should return 400 when conversationId is not a valid ObjectId", async () => {
      const res = await request(app)
        .post("/save-message")
        .set("x-user-id", "user_123")
        .send({
          conversationId: "invalid-id-format",
          role: "user",
          content: "Hello",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Invalid conversationId" });
    });
  });

  describe("GET /get-messages/:conversationId", () => {
    it("should return 400 when x-user-id header is missing", async () => {
      const res = await request(app).get("/get-messages/507f1f77bcf86cd799439011");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Missing x-user-id header" });
    });

    it("should return 400 when conversationId is invalid", async () => {
      const res = await request(app)
        .get("/get-messages/bad-id")
        .set("x-user-id", "user_123");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Invalid conversationId" });
    });
  });

  describe("POST /delete-message", () => {
    it("should return 400 when messageId is not a valid ObjectId", async () => {
      const res = await request(app)
        .post("/delete-message")
        .set("x-user-id", "user_123")
        .send({
          messageId: "not-an-objectid",
          conversationId: "507f1f77bcf86cd799439011",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "Invalid messageId" });
    });
  });
});
