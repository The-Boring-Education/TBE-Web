import {
  courseCompletionTemplate,
  courseEnrollmentTemplate,
  interviewPrepEnrollmentTemplate,
  projectEnrollmentTemplate,
  welcomeEmailTemplate,
} from "@tbe/services/templates";
import { describe, expect, it } from "vitest";

describe("email templates", () => {
  it("welcomeEmailTemplate includes the user's name and base layout", () => {
    const html = welcomeEmailTemplate({
      userEmail: "user@example.com",
      userName: "Alice",
    } as any);

    expect(html).toContain("Alice");
    expect(html).toContain("The Boring Education");
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("courseEnrollmentTemplate includes course name and optional description", () => {
    const html = courseEnrollmentTemplate({
      userEmail: "user@example.com",
      userName: "Bob",
      courseName: "DSA Mastery",
      courseDescription: "Learn DSA from scratch",
    } as any);

    expect(html).toContain("Bob");
    expect(html).toContain("DSA Mastery");
    expect(html).toContain("Learn DSA from scratch");
  });

  it("courseEnrollmentTemplate omits description block when not provided", () => {
    const html = courseEnrollmentTemplate({
      userEmail: "user@example.com",
      userName: "Bob",
      courseName: "DSA Mastery",
    } as any);

    expect(html).toContain("DSA Mastery");
    expect(html).not.toContain("<em>");
  });

  it("projectEnrollmentTemplate includes project name and link", () => {
    const html = projectEnrollmentTemplate({
      userEmail: "user@example.com",
      userName: "Carol",
      projectName: "Chat App",
      projectUrl: "https://example.com/project",
    } as any);

    expect(html).toContain("Chat App");
    expect(html).toContain("https://example.com/project");
  });

  it("interviewPrepEnrollmentTemplate includes sheet name and description", () => {
    const html = interviewPrepEnrollmentTemplate({
      userEmail: "user@example.com",
      userName: "Dave",
      sheetName: "Blind 75",
      sheetDescription: "Top 75 interview questions",
    } as any);

    expect(html).toContain("Blind 75");
    expect(html).toContain("Top 75 interview questions");
  });

  it("courseCompletionTemplate includes a certificate link when provided", () => {
    const html = courseCompletionTemplate({
      userEmail: "user@example.com",
      userName: "Eve",
      courseName: "System Design",
      certificateUrl: "https://example.com/cert.png",
    } as any);

    expect(html).toContain("System Design");
    expect(html).toContain("https://example.com/cert.png");
    expect(html).toContain("Download Certificate");
  });

  it("courseCompletionTemplate omits certificate button when url is absent", () => {
    const html = courseCompletionTemplate({
      userEmail: "user@example.com",
      userName: "Eve",
      courseName: "System Design",
    } as any);

    expect(html).not.toContain("Download Certificate");
  });
});
