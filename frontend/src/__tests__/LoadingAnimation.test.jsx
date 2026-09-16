import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingAnimation from "../components/LoadingAnimation.jsx";

describe("LoadingAnimation Component", () => {
  it("renders without crashing and displays initial thinking animation markup", () => {
    const { container } = render(<LoadingAnimation />);
    expect(container).toBeInTheDocument();
    expect(container.textContent).toContain("Thinking");
  });
});
