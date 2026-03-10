import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@tbe/components";

describe("Card Components", () => {
  describe("Card", () => {
    it("should render", () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render children", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should forward ref", () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("CardHeader", () => {
    it("should render", () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>,
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("should render", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should render as heading", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>,
      );
      expect(container.querySelector("h3")).toBeInTheDocument();
    });
  });

  describe("CardDescription", () => {
    it("should render", () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should render as paragraph", () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(container.querySelector("p")).toBeInTheDocument();
    });
  });

  describe("CardContent", () => {
    it("should render", () => {
      render(
        <Card>
          <CardContent>Content Area</CardContent>
        </Card>,
      );
      expect(screen.getByText("Content Area")).toBeInTheDocument();
    });
  });

  describe("Full Card Structure", () => {
    it("should render complete card with all sub-components", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
        </Card>,
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });
  });
});
