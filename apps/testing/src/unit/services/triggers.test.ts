import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tbe/services/client", () => ({
  emailClient: {
    sendEmail: vi.fn(),
  },
}));

vi.mock("@tbe/services/templates", () => ({
  welcomeEmailTemplate: vi.fn(() => "<html>welcome</html>"),
  courseEnrollmentTemplate: vi.fn(() => "<html>course-enrollment</html>"),
  projectEnrollmentTemplate: vi.fn(() => "<html>project-enrollment</html>"),
  interviewPrepEnrollmentTemplate: vi.fn(
    () => "<html>interview-prep-enrollment</html>",
  ),
  courseCompletionTemplate: vi.fn(() => "<html>course-completion</html>"),
}));

import { emailClient } from "@tbe/services/client";
import { emailTriggerService } from "@tbe/services/triggers";

const mockSendEmail = vi.mocked(emailClient.sendEmail);

describe("emailTriggerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendTriggerEmail", () => {
    it("sends a WELCOME email using the welcome template", async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        message: "sent",
        requestId: "req-1",
      });

      const result = await emailTriggerService.sendTriggerEmail("WELCOME", {
        userEmail: "user@example.com",
        userName: "Alice",
      } as any);

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to_email: "user@example.com",
          to_name: "Alice",
          html_content: "<html>welcome</html>",
        }),
        expect.any(String),
      );
      expect(result.success).toBe(true);
      expect(result.requestId).toBe("req-1");
    });

    it("sends a COURSE_ENROLLMENT email with the course name in the subject", async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        message: "sent",
        requestId: "req-2",
      });

      const result = await emailTriggerService.sendTriggerEmail(
        "COURSE_ENROLLMENT",
        {
          userEmail: "user@example.com",
          userName: "Bob",
          courseName: "DSA Mastery",
        } as any,
      );

      const [emailDataArg] = mockSendEmail.mock.calls[0];
      expect((emailDataArg as any).subject).toContain("DSA Mastery");
      expect(result.success).toBe(true);
    });

    it("returns a failure result when emailClient.sendEmail fails", async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: "SMTP down",
        requestId: "req-3",
      });

      const result = await emailTriggerService.sendTriggerEmail("WELCOME", {
        userEmail: "user@example.com",
        userName: "Alice",
      } as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to send email");
      expect(result.error).toBe("SMTP down");
    });

    it("returns an error for an unsupported trigger type", async () => {
      const result = await emailTriggerService.sendTriggerEmail(
        "UNKNOWN" as any,
        {} as any,
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unsupported email trigger");
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("sendExternalEmail", () => {
    it("rejects when required user data is missing", async () => {
      const result = await emailTriggerService.sendExternalEmail({
        emailType: "WELCOME",
        userData: { email: "", name: "Alice", id: "1" },
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_USER_DATA");
    });

    it("rejects COURSE_ENROLLMENT when courseName is missing", async () => {
      const result = await emailTriggerService.sendExternalEmail({
        emailType: "COURSE_ENROLLMENT",
        userData: { email: "user@example.com", name: "Alice", id: "1" },
        additionalData: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_COURSE_DATA");
    });

    it("sends a valid COURSE_ENROLLMENT external email", async () => {
      mockSendEmail.mockResolvedValue({
        success: true,
        message: "sent",
        requestId: "req-4",
      });

      const result = await emailTriggerService.sendExternalEmail({
        emailType: "COURSE_ENROLLMENT",
        userData: { email: "user@example.com", name: "Alice", id: "1" },
        additionalData: { courseName: "DSA Mastery" },
      } as any);

      expect(result.success).toBe(true);
      expect(result.requestId).toBe("req-4");
    });

    it("returns an error for an unsupported external email type", async () => {
      const result = await emailTriggerService.sendExternalEmail({
        emailType: "UNKNOWN",
        userData: { email: "user@example.com", name: "Alice", id: "1" },
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_EMAIL_TYPE");
    });

    it("returns a failure result when the underlying email send throws", async () => {
      mockSendEmail.mockImplementation(() => {
        throw new Error("boom");
      });

      const result = await emailTriggerService.sendExternalEmail({
        emailType: "WELCOME",
        userData: { email: "user@example.com", name: "Alice", id: "1" },
      } as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to send email");
    });
  });
});
