import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/services/triggers", () => ({
  emailTriggerService: {
    sendExternalEmail: vi.fn(),
  },
}));

import {
  sendCourseCompletionEmail,
  sendCourseEnrollmentEmail,
  sendEmail,
  sendInterviewPrepEnrollmentEmail,
  sendProjectEnrollmentEmail,
  sendWelcomeEmail,
} from "@tbe/services/email";
import { emailTriggerService } from "@tbe/services/triggers";

const mockSendExternalEmail = vi.mocked(emailTriggerService.sendExternalEmail);

describe("email service convenience wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendExternalEmail.mockResolvedValue({
      success: true,
      message: "Email processed",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sendWelcomeEmail builds a WELCOME request", async () => {
    await sendWelcomeEmail({
      email: "user@example.com",
      name: "Alice",
      id: "1",
    });

    expect(mockSendExternalEmail).toHaveBeenCalledWith({
      emailType: "WELCOME",
      userData: { email: "user@example.com", name: "Alice", id: "1" },
    });
  });

  it("sendCourseEnrollmentEmail builds a COURSE_ENROLLMENT request", async () => {
    await sendCourseEnrollmentEmail({
      email: "user@example.com",
      name: "Bob",
      id: "2",
      courseName: "DSA Mastery",
      courseDescription: "desc",
    });

    expect(mockSendExternalEmail).toHaveBeenCalledWith({
      emailType: "COURSE_ENROLLMENT",
      userData: { email: "user@example.com", name: "Bob", id: "2" },
      additionalData: {
        courseName: "DSA Mastery",
        courseDescription: "desc",
      },
    });
  });

  it("sendProjectEnrollmentEmail builds a PROJECT_ENROLLMENT request", async () => {
    await sendProjectEnrollmentEmail({
      email: "user@example.com",
      name: "Carol",
      id: "3",
      projectName: "Chat App",
    });

    expect(mockSendExternalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: "PROJECT_ENROLLMENT",
        additionalData: expect.objectContaining({ projectName: "Chat App" }),
      }),
    );
  });

  it("sendInterviewPrepEnrollmentEmail builds an INTERVIEW_PREP_ENROLLMENT request", async () => {
    await sendInterviewPrepEnrollmentEmail({
      email: "user@example.com",
      name: "Dave",
      id: "4",
      sheetName: "Blind 75",
    });

    expect(mockSendExternalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: "INTERVIEW_PREP_ENROLLMENT",
        additionalData: expect.objectContaining({ sheetName: "Blind 75" }),
      }),
    );
  });

  it("sendCourseCompletionEmail builds a COURSE_COMPLETION request", async () => {
    await sendCourseCompletionEmail({
      email: "user@example.com",
      name: "Eve",
      id: "5",
      courseName: "System Design",
      courseUrl: "https://example.com/course",
      completionDate: "2026-01-01",
      certificateUrl: "https://example.com/cert.png",
    });

    expect(mockSendExternalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: "COURSE_COMPLETION",
        additionalData: expect.objectContaining({
          courseName: "System Design",
          certificateUrl: "https://example.com/cert.png",
        }),
      }),
    );
  });

  it("sendEmail forwards any request directly to sendExternalEmail", async () => {
    const request = {
      emailType: "WELCOME",
      userData: { email: "user@example.com", name: "Alice", id: "1" },
    } as any;

    const result = await sendEmail(request);

    expect(mockSendExternalEmail).toHaveBeenCalledWith(request);
    expect(result.success).toBe(true);
  });
});
