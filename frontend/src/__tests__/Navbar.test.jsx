import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Navbar from "../components/Navbar.jsx";
import conversationReducer from "../redux/conversationSlice.js";
import messageReducer from "../redux/messageSlice.js";

const createMockStore = (preloadedState) => {
  return configureStore({
    reducer: {
      conversation: conversationReducer,
      message: messageReducer,
    },
    preloadedState,
  });
};

describe("Navbar Component (Smoke & Component)", () => {
  it("should not render when no conversation is selected", () => {
    const store = createMockStore({
      conversation: { selectedConversation: null },
      message: { messages: [] },
    });

    const { container } = render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render conversation title and message count when selected", () => {
    const store = createMockStore({
      conversation: {
        selectedConversation: { _id: "conv-1", title: "Project Overview" },
      },
      message: {
        messages: [{ _id: "msg-1" }, { _id: "msg-2" }],
      },
    });

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    );

    expect(screen.getByText("Project Overview")).toBeInTheDocument();
    expect(screen.getByText("2 Messages")).toBeInTheDocument();
  });
});
