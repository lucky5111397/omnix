import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

// Mock razorpay config
vi.mock("../config/razorpay.js", () => ({
  default: {
    orders: {
      create: vi.fn(),
    },
  },
}));

import { createOrder, verifyPayment } from "../controllers/billing.controller.js";

describe("Billing Service API (Validation & Security Boundaries)", () => {
  const app = express();
  app.use(express.json());
  app.post("/billing/create", createOrder);
  app.post("/billing/verify", verifyPayment);

  describe("POST /billing/create", () => {
    it("should return 400 when x-user-id header is missing", async () => {
      const res = await request(app)
        .post("/billing/create")
        .send({ plan: "pro" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "User ID is required",
      });
    });

    it("should return 404 when plan does not exist", async () => {
      const res = await request(app)
        .post("/billing/create")
        .set("x-user-id", "user-123")
        .send({ plan: "unlimited_gold_tier" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "Plan not found",
      });
    });
  });

  describe("POST /billing/verify", () => {
    it("should return 400 when payment signature is invalid", async () => {
      process.env.RAZORPAY_KEY_SECRET = "test_secret_123";

      const res = await request(app)
        .post("/billing/verify")
        .send({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "invalid_tampered_signature_hex",
          plan: "pro",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid payment signature",
      });
    });
  });
});
