import crypto from "crypto";

import { envConfig } from "@/lib/constants";
import type { LeaderboardType } from "@/lib/interfaces";

import { emailClient } from "./client";
import { getBaseTemplate } from "./templates";

const UNSUBSCRIBE_PURPOSE = "leaderboard-emails";

const unsubscribeKey = () =>
  crypto
    .createHmac("sha256", envConfig.NEXTAUTH_SECRET || "")
    .update(UNSUBSCRIBE_PURPOSE)
    .digest();

const signature = (userId: string) =>
  crypto
    .createHmac("sha256", unsubscribeKey())
    .update(userId)
    .digest("base64url");

/** Non-expiring token that can only turn off leaderboard emails for one learner. */
export const signLeaderboardUnsubscribeToken = (userId: string) =>
  `${Buffer.from(userId).toString("base64url")}.${signature(userId)}`;

/** Returns the userId for a valid token, otherwise null. */
export const verifyLeaderboardUnsubscribeToken = (token: unknown) => {
  if (typeof token !== "string" || !envConfig.NEXTAUTH_SECRET) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const userId = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = Buffer.from(signature(userId));
  const given = Buffer.from(sig);
  if (expected.length !== given.length) return null;
  return crypto.timingSafeEqual(expected, given) ? userId : null;
};

const PERIOD_LABEL: Record<LeaderboardType, string> = {
  DAILY: "yesterday",
  WEEKLY: "last week",
  MONTHLY: "last month",
};

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export interface LeaderboardEmailRecipient {
  userId: string;
  email: string;
  name: string;
  rank: number;
  score: number;
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export const leaderboardTopFinishTemplate = (
  type: LeaderboardType,
  recipient: LeaderboardEmailRecipient,
  links: { leaderboard: string; unsubscribe: string },
) => {
  const medal = MEDALS[recipient.rank] ?? "🏆";
  const isChampion = recipient.rank <= 3;
  const cta =
    type === "DAILY" ? "Defend your spot today" : "Start the new streak";
  const content = `
    <div class="greeting">${medal} ${escapeHtml(recipient.name)}, you finished #${recipient.rank}!</div>
    <div class="main-text">
      You ranked <strong>#${recipient.rank}</strong> on the TBE ${type.toLowerCase()} leaderboard ${PERIOD_LABEL[type]}
      with <strong>${recipient.score} points</strong> of pure learning.
      ${isChampion && type !== "DAILY" ? "<br><br>That makes you a <strong>Champion</strong> — your badge is waiting on your dashboard." : ""}
      <br><br>
      The board just reset. Everyone starts from zero again — the best time to stay ahead.
    </div>
    <div style="text-align: center;">
      <a href="${links.leaderboard}" class="cta-button">🚀 ${cta}</a>
    </div>
    <div class="main-text" style="font-size: 12px; color: #6b7280; margin-top: 24px;">
      You're getting this because you finished in the top of a TBE leaderboard.
      <a href="${links.unsubscribe}">Unsubscribe from leaderboard emails</a>.
    </div>
  `;
  return getBaseTemplate(content);
};

const SUBJECTS: Record<LeaderboardType, (rank: number) => string> = {
  DAILY: (rank) => `${MEDALS[rank] ?? "🏆"} You were #${rank} on TBE yesterday`,
  WEEKLY: (rank) => `🏆 You finished #${rank} on TBE this week`,
  MONTHLY: (rank) => `🏆 You finished #${rank} on TBE this month`,
};

export const sendLeaderboardTopFinishEmail = async (
  type: LeaderboardType,
  recipient: LeaderboardEmailRecipient,
) => {
  // API_URL is configured both with and without the /api/v1 suffix across environments.
  const apiBase = envConfig.API_URL.replace(/\/$/, "").replace(/\/api\/v1$/, "");
  const platform = (
    envConfig.PLATFORM_URL || "https://www.theboringeducation.com"
  ).replace(/\/$/, "");
  const token = signLeaderboardUnsubscribeToken(recipient.userId);
  const html = leaderboardTopFinishTemplate(type, recipient, {
    leaderboard: `${platform}/leaderboard`,
    unsubscribe: `${apiBase}/api/v1/leaderboard/unsubscribe?token=${encodeURIComponent(token)}`,
  });
  const result = await emailClient.sendEmail({
    from_email: envConfig.FROM_EMAIL || "theboringeducation@gmail.com",
    from_name: "TBE",
    to_email: recipient.email,
    to_name: recipient.name,
    subject: SUBJECTS[type](recipient.rank),
    html_content: html,
  });
  return result.success;
};
