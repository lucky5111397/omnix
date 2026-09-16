import { describe, it, expect } from "vitest";
import userReducer, { setUser, logoutUser } from "../redux/userSlice.js";

describe("userSlice Reducer (Unit)", () => {
  it("should return the initial state", () => {
    const state = userReducer(undefined, { type: "unknown" });
    expect(state).toEqual({ user: null });
  });

  it("should handle setUser", () => {
    const mockUser = {
      _id: "user-123",
      email: "test@example.com",
      displayName: "Test User",
    };
    const state = userReducer({ user: null }, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it("should handle logoutUser", () => {
    const existingState = {
      user: { _id: "user-123", email: "test@example.com" },
    };
    const state = userReducer(existingState, logoutUser());
    expect(state.user).toBeNull();
  });
});
