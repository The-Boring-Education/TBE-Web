/** @vitest-environment jsdom */
import { InterviewSheetCover, resolveTechBranding } from "@tbe/components";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("InterviewSheetCover & resolveTechBranding", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("resolveTechBranding technology resolution", () => {
    it("resolves Java branding correctly", () => {
      const branding = resolveTechBranding(
        "java-interview-questions",
        "Java Interview Questions",
      );
      expect(branding.title).toBe("Java");
      expect(branding.subtitle).toBe("Interview Questions");
      expect(branding.watermark).toBe("JAVA");
      expect(branding.logoUrl).toContain("java");
    });

    it("resolves C++ branding correctly for cpp and c++", () => {
      const branding = resolveTechBranding("cpp-interview-questions", "C++");
      expect(branding.title).toBe("C++");
      expect(branding.watermark).toBe("C++");
      expect(branding.logoUrl).toContain("cplusplus");
    });

    it("resolves JavaScript branding correctly without confusing with Java", () => {
      const branding = resolveTechBranding(
        "javascript-interview-questions",
        "JavaScript Interview Questions",
      );
      expect(branding.title).toBe("JavaScript");
      expect(branding.watermark).toBe("JS");
      expect(branding.logoUrl).toContain("javascript");
    });

    it("resolves Python branding correctly", () => {
      const branding = resolveTechBranding(
        "python-interview-questions",
        "Python Interview Questions",
      );
      expect(branding.title).toBe("Python");
      expect(branding.watermark).toBe("PYTHON");
      expect(branding.logoUrl).toContain("python");
    });

    it("resolves Database/SQL branding correctly", () => {
      const branding = resolveTechBranding(
        "database-interview-questions",
        "Database Interview Questions",
      );
      expect(branding.title).toBe("Database & SQL");
      expect(branding.watermark).toBe("SQL");
    });

    it("resolves React.js branding correctly without matching js substring", () => {
      const branding = resolveTechBranding(
        "react-interview-questions",
        "React.js Interview Questions",
      );
      expect(branding.title).toBe("React.js");
      expect(branding.watermark).toBe("REACT");
    });

    it("resolves Node.js & Express branding correctly", () => {
      const branding = resolveTechBranding(
        "node-js-express-interview-questions",
        "Node.js & Express Interview Questions",
      );
      expect(branding.title).toBe("Node.js & Express");
      expect(branding.watermark).toBe("NODE");
    });

    it("falls back gracefully for unknown topics", () => {
      const branding = resolveTechBranding(
        "docker-kubernetes-questions",
        "Docker & Kubernetes Interview Questions",
      );
      expect(branding.title).toContain("Docker & Kubernetes");
      expect(branding.subtitle).toBe("Interview Questions");
    });
  });

  describe("InterviewSheetCover component rendering", () => {
    it("renders Java sheet cover with clean title, subtitle and roadmap badge", () => {
      render(
        <InterviewSheetCover
          sheet={{
            name: "Java Interview Questions",
            slug: "java-interview-questions",
            roadmap: "Backend",
            coverImageURL:
              "https://ik.imagekit.io/fha9tew55/Cover_pages/java_card_minimal.png",
          }}
        />,
      );

      const heading = screen.getByRole("heading", { name: "Java" });
      expect(heading).toBeTruthy();
      expect(screen.getByText("Interview Questions")).toBeTruthy();
      expect(screen.getByText("Backend")).toBeTruthy();
      expect(screen.getByText(/public class Solution/i)).toBeTruthy();
    });

    it("renders status badge when passed (In Progress / Enrolled / Premium)", () => {
      render(
        <InterviewSheetCover
          sheet={{
            name: "C++ Interview Questions",
            slug: "cpp-interview-questions",
            roadmap: "Backend",
          }}
          statusBadge={
            <span data-testid="status-in-progress">IN PROGRESS</span>
          }
        />,
      );

      const heading = screen.getByRole("heading", { name: "C++" });
      expect(heading).toBeTruthy();
      expect(screen.getByTestId("status-in-progress")).toBeTruthy();
    });

    it("replaces legacy minimal raster cards with the crisp vector cover", () => {
      render(
        <InterviewSheetCover
          sheet={{
            name: "Database Interview Questions",
            slug: "database-interview-questions",
            coverImageURL:
              "https://ik.imagekit.io/fha9tew55/Cover_pages/database_card_minimal.png",
            roadmap: "Database",
          }}
        />,
      );

      const heading = screen.getByRole("heading", { name: "Database & SQL" });
      expect(heading).toBeTruthy();
      expect(screen.getByText("SELECT * FROM schema.table;")).toBeTruthy();
    });

    it("renders non-legacy custom image when provided", () => {
      render(
        <InterviewSheetCover
          sheet={{
            name: "Custom Tech Sheet",
            slug: "custom-tech-sheet",
            coverImageURL: "https://images.unsplash.com/photo-1517694712202",
            roadmap: "Custom",
          }}
        />,
      );

      const img = screen.getByRole("img");
      expect(img.getAttribute("src")).toBe(
        "https://images.unsplash.com/photo-1517694712202",
      );
    });
  });
});
