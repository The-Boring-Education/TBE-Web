import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAxiosPost = vi.fn();
vi.mock("axios", () => ({
  default: {
    post: (...args: unknown[]) => mockAxiosPost(...args),
  },
}));

vi.mock("@tbe/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tbe/constants")>();
  return {
    ...actual,
    envConfig: {
      ...actual.envConfig,
      EMAIL_SERVICE_URL: "https://email.test.com",
      EMAIL_API_KEY: "test-api-key",
    },
  };
});

import { emailClient } from "@tbe/services/client";

describe("emailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const emailData = {
    to_email: "user@example.com",
    to_name: "User",
    from_email: "noreply@theboringeducation.com",
    from_name: "TBE",
    subject: "Hello",
    html_content: "<p>Hi</p>",
  };

  it("sends an email successfully via the configured API", async () => {
    mockAxiosPost.mockResolvedValue({ status: 200, data: { id: "email-1" } });

    const result = await emailClient.sendEmail(emailData, "req-1");

    expect(mockAxiosPost).toHaveBeenCalledWith(
      "https://email.test.com/send-email",
      emailData,
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Breevo-API-Key": "test-api-key",
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      message: "Email sent successfully",
      requestId: "req-1",
    });
  });

  it("returns a failure response when the API call rejects", async () => {
    mockAxiosPost.mockRejectedValue({
      message: "Request failed",
      response: { status: 500, data: { message: "Server error" } },
    });

    const result = await emailClient.sendEmail(emailData, "req-2");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Server error");
    expect(result.requestId).toBe("req-2");
  });

  it("generates a requestId when none is provided", async () => {
    mockAxiosPost.mockResolvedValue({ status: 200, data: {} });

    const result = await emailClient.sendEmail(emailData);

    expect(result.requestId).toBeTruthy();
  });

  it("sendBulkEmails sends every email and reports individual results", async () => {
    mockAxiosPost
      .mockResolvedValueOnce({ status: 200, data: {} })
      .mockRejectedValueOnce({ message: "boom" });

    const results = await emailClient.sendBulkEmails([emailData, emailData]);

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });
});
