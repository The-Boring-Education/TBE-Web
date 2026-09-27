import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../api/src/lib/constants", () => ({
  envConfig: {
    NEXTAUTH_SECRET: "test-secret-at-least-32-chars-long-123",
    API_URL: "https://api.example.com/api/v1",
    PLATFORM_URL: "https://www.example.com",
    FROM_EMAIL: "hi@example.com",
  },
  emailLogger: { generateRequestId: () => "r", logError: vi.fn() },
}));

const mockSendEmail = vi.fn();
vi.mock("../../../../api/src/lib/services/client", () => ({
  emailClient: { sendEmail: (...a: unknown[]) => mockSendEmail(...a) },
}));

import {
  leaderboardTopFinishTemplate,
  sendLeaderboardTopFinishEmail,
  signLeaderboardUnsubscribeToken,
  verifyLeaderboardUnsubscribeToken,
} from "../../../../api/src/lib/services/leaderboardEmail";

const recipient = {
  userId: "64b7f0c2a1b2c3d4e5f60718",
  email: "priya@example.com",
  name: "Priya <script>",
  rank: 2,
  score: 340,
};

describe("leaderboard unsubscribe token", () => {
  it("round-trips a learner id", () => {
    const token = signLeaderboardUnsubscribeToken(recipient.userId);
    expect(verifyLeaderboardUnsubscribeToken(token)).toBe(recipient.userId);
  });

  it("rejects tampered and malformed tokens", () => {
    const token = signLeaderboardUnsubscribeToken(recipient.userId);
    const other = Buffer.from("64b7f0c2a1b2c3d4e5f60719").toString("base64url");
    expect(
      verifyLeaderboardUnsubscribeToken(`${other}.${token.split(".")[1]}`),
    ).toBeNull();
    expect(verifyLeaderboardUnsubscribeToken("garbage")).toBeNull();
    expect(verifyLeaderboardUnsubscribeToken(undefined)).toBeNull();
  });
});

describe("leaderboard top-finish email", () => {
  it("escapes the learner name and includes the unsubscribe link", () => {
    const html = leaderboardTopFinishTemplate("WEEKLY", recipient, {
      leaderboard: "https://x/leaderboard",
      unsubscribe: "https://x/unsub",
    });
    expect(html).toContain("Priya &lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("https://x/unsub");
    expect(html).toContain("Champion");
  });

  it("sends with a rank-specific subject and a working unsubscribe URL", async () => {
    mockSendEmail.mockResolvedValue({ success: true });
    expect(await sendLeaderboardTopFinishEmail("DAILY", recipient)).toBe(true);

    const sent = mockSendEmail.mock.calls[0]![0];
    expect(sent).toMatchObject({
      to_email: "priya@example.com",
      subject: "🥈 You were #2 on TBE yesterday",
    });
    expect(sent.html_content).toContain(
      "https://api.example.com/api/v1/leaderboard/unsubscribe?token=",
    );
    expect(sent.html_content).toContain("https://www.example.com/leaderboard");
  });
});
