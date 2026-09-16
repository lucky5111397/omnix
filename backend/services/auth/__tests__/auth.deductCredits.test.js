import express from "express";
import request from "supertest";
import { describe, it, expect, vi } from "vitest";

// Mock redis and firebase to prevent background connection attempts during isolated unit tests
vi.mock("../../../shared/redis/redis.js", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock("ioredis", () => ({
  default: class MockRedis {
    constructor() {}
    on() {}
    get() {}
    set() {}
  },
}));

vi.mock("../config/firebase.js", () => ({
  default: {},
}));

import { deductCredits } from "../controllers/auth.controller.js";

describe("Auth Service deductCredits API (Validation & Error Path)", () => {
  const app = express();
  app.use(express.json());
  app.post("/auth/deduct-credits", deductCredits);

  it("should return 400 when userId is missing", async () => {
    const res = await request(app)
      .post("/auth/deduct-credits")
      .send({ agent: "chat" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "User ID is required",
    });
  });

  it("should return 400 when agent is missing", async () => {
    const res = await request(app)
      .post("/auth/deduct-credits")
      .send({ userId: "user-123" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Agent is required",
    });
  });

  it("should return 400 when an invalid agent is specified", async () => {
    const res = await request(app)
      .post("/auth/deduct-credits")
      .send({ userId: "user-123", agent: "non_existent_agent" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid agent",
    });
  });
});
