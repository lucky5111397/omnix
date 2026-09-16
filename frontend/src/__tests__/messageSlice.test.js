import { describe, it, expect } from "vitest";
import reducer, {
  setMessages,
  addMessage,
  setArtifacts,
  setIsLoading,
} from "../redux/messageSlice.js";

describe("messageSlice", () => {
  const initialState = {
    messages: [],
    artifacts: [],
    isLoading: false,
  };

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: "UNKNOWN" })).toEqual(initialState);
  });

  it("should set messages", () => {
    const messages = [
      { _id: "m1", role: "user", content: "Hello" },
      { _id: "m2", role: "assistant", content: "Hi there!" },
    ];
    const state = reducer(initialState, setMessages(messages));
    expect(state.messages).toEqual(messages);
  });

  it("should append a message with addMessage", () => {
    const existing = [{ _id: "m1", role: "user", content: "Hello" }];
    const state = reducer(
      { ...initialState, messages: existing },
      addMessage({ _id: "m2", role: "assistant", content: "World" })
    );

    expect(state.messages).toHaveLength(2);
    expect(state.messages[1].content).toBe("World");
  });

  it("should set artifacts", () => {
    const artifacts = [{ type: "code", language: "javascript", content: "console.log(1);" }];
    const state = reducer(initialState, setArtifacts(artifacts));
    expect(state.artifacts).toEqual(artifacts);
  });

  it("should set isLoading boolean flag", () => {
    const stateLoading = reducer(initialState, setIsLoading(true));
    expect(stateLoading.isLoading).toBe(true);

    const stateDone = reducer(stateLoading, setIsLoading(false));
    expect(stateDone.isLoading).toBe(false);
  });
});
