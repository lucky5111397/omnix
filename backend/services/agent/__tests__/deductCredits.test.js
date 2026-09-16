import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import deductCredits from "../utils/deductCredits.js";

vi.mock("axios");

describe("Agent Service - deductCredits Utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, AUTH_SERVICE_URL: "http://localhost:8001" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw an error when userId is missing", async () => {
    await expect(deductCredits(null, "coding")).rejects.toThrow(
      "User ID is required for credit deduction"
    );
  });

  it("should throw an error when agent is missing", async () => {
    await expect(deductCredits("user_123", "")).rejects.toThrow(
      "Agent is required for credit deduction"
    );
  });

  it("should invoke auth service deduct-credits endpoint with correct payload and headers", async () => {
    const mockResponse = { data: { success: true, remainingCredits: 40 } };
    axios.post.mockResolvedValueOnce(mockResponse);

    const result = await deductCredits("user_123", "coding", "session_abc");

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8001/auth/deduct-credits",
      {
        userId: "user_123",
        agent: "coding",
      },
      {
        headers: {
          "x-user-id": "user_123",
          "x-session-id": "session_abc",
        },
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("should omit x-session-id header when sessionId is not provided", async () => {
    const mockResponse = { data: { success: true, remainingCredits: 45 } };
    axios.post.mockResolvedValueOnce(mockResponse);

    await deductCredits("user_123", "chat");

    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:8001/auth/deduct-credits",
      {
        userId: "user_123",
        agent: "chat",
      },
      {
        headers: {
          "x-user-id": "user_123",
        },
      }
    );
  });

  it("should propagate downstream network / API errors", async () => {
    const apiError = new Error("Insufficient credits");
    apiError.response = { data: { message: "Insufficient credits", success: false } };
    axios.post.mockRejectedValueOnce(apiError);

    await expect(deductCredits("user_123", "coding")).rejects.toThrow(
      "Insufficient credits"
    );
  });
});
