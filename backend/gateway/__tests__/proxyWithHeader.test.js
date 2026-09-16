import { describe, it, expect, vi } from "vitest";

// Mock express-http-proxy to capture proxyReqOptDecorator
vi.mock("express-http-proxy", () => {
  return {
    default: (serviceUrl, options) => {
      return {
        serviceUrl,
        decorator: options?.proxyReqOptDecorator,
      };
    },
  };
});

import { proxyWithHeader } from "../utils/proxyWithHeader.js";

describe("Gateway proxyWithHeader Utility (Unit & Integration)", () => {
  it("should forward x-user-id and x-session-id when present on request", () => {
    const proxyHandler = proxyWithHeader("http://localhost:8001");
    expect(proxyHandler.serviceUrl).toBe("http://localhost:8001");

    const proxyReqOpts = { headers: {} };
    const srcReq = {
      user: { userId: "user-abc-123" },
      cookies: { session: "session-xyz-789" },
      headers: {},
    };

    const decorated = proxyHandler.decorator(proxyReqOpts, srcReq);

    expect(decorated.headers["x-user-id"]).toBe("user-abc-123");
    expect(decorated.headers["x-session-id"]).toBe("session-xyz-789");
  });

  it("should leave headers untouched when user and session are absent", () => {
    const proxyHandler = proxyWithHeader("http://localhost:8002");
    const proxyReqOpts = { headers: {} };
    const srcReq = {
      user: null,
      cookies: {},
      headers: {},
    };

    const decorated = proxyHandler.decorator(proxyReqOpts, srcReq);

    expect(decorated.headers["x-user-id"]).toBeUndefined();
    expect(decorated.headers["x-session-id"]).toBeUndefined();
  });
});
