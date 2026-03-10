import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "@tbe/components";

describe("Text Component", () => {
  describe("Rendering", () => {
    it("should render text with children", () => {
      render(<Text level="p">Test Text</Text>);
      expect(screen.getByText("Test Text")).toBeInTheDocument();
    });

    it("should render as specified heading level", () => {
      render(<Text level="h1">Heading 1</Text>);
      const heading = screen.getByText("Heading 1");
      expect(heading.tagName).toBe("H1");
    });

    it("should render as paragraph when level is p", () => {
      render(<Text level="p">Paragraph</Text>);
      const paragraph = screen.getByText("Paragraph");
      expect(paragraph.tagName).toBe("P");
    });

    it("should render as span when level is span", () => {
      render(<Text level="span">Span Text</Text>);
      const span = screen.getByText("Span Text");
      expect(span.tagName).toBe("SPAN");
    });
  });

  describe("Variants", () => {
    it("should apply SUCCESS variant", () => {
      const { container } = render(
        <Text level="p" variant="SUCCESS">
          Success Text
        </Text>,
      );
      const text = container.querySelector(".text-success");
      expect(text).toBeInTheDocument();
    });

    it("should apply ERROR variant", () => {
      const { container } = render(
        <Text level="p" variant="ERROR">
          Error Text
        </Text>,
      );
      const text = container.querySelector(".text-primary");
      expect(text).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <Text level="p" className="custom-class">
          Text
        </Text>,
      );
      const text = container.querySelector(".custom-class");
      expect(text).toBeInTheDocument();
    });

    it("should center text when textCenter is true", () => {
      const { container } = render(
        <Text level="p" textCenter={true}>
          Centered
        </Text>,
      );
      const text = container.querySelector(".text-center");
      expect(text).toBeInTheDocument();
    });

    it("should not center text when textCenter is false", () => {
      const { container } = render(
        <Text level="p" textCenter={false}>
          Not Centered
        </Text>,
      );
      const text = container.querySelector(".text-center");
      expect(text).not.toBeInTheDocument();
    });
  });
});
