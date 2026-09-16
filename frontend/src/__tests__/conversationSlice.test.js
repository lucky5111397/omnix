import { describe, it, expect } from "vitest";
import reducer, {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConvTitle,
} from "../redux/conversationSlice.js";

describe("conversationSlice", () => {
  const initialState = {
    conversations: [],
    selectedConversation: null,
  };

  it("should return the initial state on empty action", () => {
    expect(reducer(undefined, { type: "UNKNOWN" })).toEqual(initialState);
  });

  it("should handle setConversations", () => {
    const payload = [
      { _id: "c1", title: "Chat 1" },
      { _id: "c2", title: "Chat 2" },
    ];
    const state = reducer(initialState, setConversations(payload));
    expect(state.conversations).toEqual(payload);
  });

  it("should handle addConversation by prepending to the list", () => {
    const existing = [{ _id: "c1", title: "Chat 1" }];
    const stateWithConv = { ...initialState, conversations: existing };

    const newConv = { _id: "c2", title: "Chat 2" };
    const nextState = reducer(stateWithConv, addConversation(newConv));

    expect(nextState.conversations).toHaveLength(2);
    expect(nextState.conversations[0]).toEqual(newConv);
  });

  it("should handle setSelectedConversation", () => {
    const selected = { _id: "c1", title: "Chat 1" };
    const nextState = reducer(initialState, setSelectedConversation(selected));
    expect(nextState.selectedConversation).toEqual(selected);
  });

  it("should update conversation title and synchronize selectedConversation if matching", () => {
    const current = {
      conversations: [
        { _id: "c1", title: "Old Title" },
        { _id: "c2", title: "Other Chat" },
      ],
      selectedConversation: { _id: "c1", title: "Old Title" },
    };

    const nextState = reducer(
      current,
      setConvTitle({ conversationId: "c1", title: "Renamed Title" })
    );

    expect(nextState.conversations[0].title).toBe("Renamed Title");
    expect(nextState.selectedConversation.title).toBe("Renamed Title");
    expect(nextState.conversations[1].title).toBe("Other Chat");
  });
});
