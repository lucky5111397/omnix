import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MessageBubble from "../components/MessageBubble.jsx";

describe("MessageBubble Component", () => {
  it("renders user messages with right alignment and correct text", () => {
    const { container } = render(
      <MessageBubble role="user" content="Hello from user" />
    );

    expect(screen.getByText("Hello from user")).toBeInTheDocument();
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("justify-end");
  });

  it("renders assistant messages with left alignment and correct text", () => {
    const { container } = render(
      <MessageBubble role="assistant" content="Hello from assistant" />
    );

    expect(screen.getByText("Hello from assistant")).toBeInTheDocument();
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("justify-start");
  });
});
