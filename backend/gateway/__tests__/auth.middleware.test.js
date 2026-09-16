import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

// Mock redis client to avoid background connection attempts during unit/integration tests
vi.mock("../../shared/redis/redis.js", () => ({
  default: {
    get: vi.fn(),
  },
}));

import protect from "../middleware/auth.middleware.js";

describe("Gateway Auth Middleware (Smoke & Unit)", () => {
  it("should reject requests without a session cookie with 401 Unauthorized", async () => {
    const app = express();
    app.use(cookieParser());
    app.use(express.json());

    app.get("/api/test-protected", protect, (req, res) => {
      res.json({ success: true, user: req.user });
    });

    const response = await request(app).get("/api/test-protected");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
    });
  });
});
