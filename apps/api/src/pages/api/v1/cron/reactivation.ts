import type { NextApiRequest, NextApiResponse } from "next";

import { apiStatusCodes } from "@/lib/constants";
import { User } from "@/lib/database/models";
import { emailTriggerService } from "@/lib/services/triggers";
import { sendAPIResponse } from "@/lib/utils";
import { logger } from "@/lib/utils/logger";
import { withApiHandler } from "@/middleware/requestLogger";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({
        status: false,
        message: "Method not allowed",
      }),
    );
  }

  // 1. Authorization Check
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(apiStatusCodes.UNAUTHORIZED).json(
      sendAPIResponse({
        status: false,
        message: "Unauthorized access",
      }),
    );
  }

  try {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Define cohorts with start/end bounds
    const cohorts = [
      {
        key: "1D" as const,
        start: new Date(now.getTime() - 2 * oneDay),
        end: new Date(now.getTime() - oneDay),
        sentField: "lastSent1DAt" as const,
        subject: "Don't break your streak! 🚀",
      },
      {
        key: "7D" as const,
        start: new Date(now.getTime() - 8 * oneDay),
        end: new Date(now.getTime() - 7 * oneDay),
        sentField: "lastSent7DAt" as const,
        subject: "It's been a week! 🎯",
      },
      {
        key: "14D" as const,
        start: new Date(now.getTime() - 15 * oneDay),
        end: new Date(now.getTime() - 14 * oneDay),
        sentField: "lastSent14DAt" as const,
        subject: "Ready to jump back in? 🛠️",
      },
      {
        key: "30D" as const,
        start: new Date(now.getTime() - 31 * oneDay),
        end: new Date(now.getTime() - 30 * oneDay),
        sentField: "lastSent30DAt" as const,
        subject: "Let's restart your learning journey! 💪",
      },
    ];

    const results: Array<{
      email: string;
      status: string;
      cohort: string;
      error?: string;
    }> = [];

    for (const cohort of cohorts) {
      // Find users whose lastActiveAt is in the cohort range, and haven't unsubscribed
      const users = await User.find({
        lastActiveAt: { $gte: cohort.start, $lte: cohort.end },
        "preferences.marketingEmails": { $ne: false },
      });

      // Filter in memory to ensure we don't double-send if cron runs multiple times
      const eligibleUsers = users.filter((user) => {
        const lastSent = user.reactivationEmails?.[cohort.sentField];
        if (!lastSent) return true;
        // If lastActiveAt is newer than the last sent reactivation email, they became inactive again!
        const lastActive = user.lastActiveAt || new Date();
        return lastSent.getTime() < lastActive.getTime();
      });

      for (const user of eligibleUsers) {
        // Resolve target platform
        let targetApp: "dsayatra" | "prepyatra" | "oncampus" | "platform" =
          "platform";
        let maxDate = new Date(0);

        if (
          user.prepYatra?.lastActiveAt &&
          user.prepYatra.lastActiveAt > maxDate
        ) {
          targetApp = "prepyatra";
          maxDate = user.prepYatra.lastActiveAt;
        }
        if (
          user.dsaYatra?.lastActiveAt &&
          user.dsaYatra.lastActiveAt > maxDate
        ) {
          targetApp = "dsayatra";
          maxDate = user.dsaYatra.lastActiveAt;
        }
        if (
          user.oncampus?.lastActiveAt &&
          user.oncampus.lastActiveAt > maxDate
        ) {
          targetApp = "oncampus";
          maxDate = user.oncampus.lastActiveAt;
        }

        // Fallbacks if no timestamps exist yet
        if (maxDate.getTime() === 0) {
          if (user.dsaYatra?.dyOnboarded) {
            targetApp = "dsayatra";
          } else if (user.prepYatra?.pyOnboarded) {
            targetApp = "prepyatra";
          } else if (user.oncampus?.onboardingCompleted) {
            targetApp = "oncampus";
          }
        }

        let redirectUrl = "https://www.theboringeducation.com/";
        let redirectText = "Return to Platform";
        let subject = cohort.subject;

        if (targetApp === "dsayatra") {
          redirectUrl = "https://dsayatra.theboringeducation.com/";
          redirectText = "Take a DSA Quiz";
          if (cohort.key === "1D") subject = "Your streak is crying... 😭";
          else if (cohort.key === "7D") subject = "DFS, BFS, or just AFK? 👀";
          else subject = "Did a pointer exception delete your ambition? 💻";
        } else if (targetApp === "prepyatra") {
          redirectUrl = "https://prepyatra.theboringeducation.com/";
          redirectText = "Continue with PrepYatra Logs";
          subject = "Your streak sent a search warrant 🔍";
        } else if (targetApp === "oncampus") {
          redirectUrl = "https://oncampus.theboringeducation.com/";
          redirectText = "Go to OnCampus Portal";
          if (cohort.key === "1D")
            subject = "Unemployed vibes? Let's fix that. 💼";
          else if (cohort.key === "7D")
            subject = "Your batchmates are coding right now... 🎯";
          else subject = "Don't let placement season catch you sleeping 🎓";
        } else {
          subject = "Did you forget about us? (It's free) 🛠️";
        }

        // Prepare email stats
        const solvedCount =
          targetApp === "prepyatra"
            ? user.prepYatra?.prepLog?.totalLogs || 0
            : user.dsaYatra?.progress?.completedQuestionIds?.length || 0;
        const currentStreak = user.prepYatra?.prepLog?.currentStreak || 0;

        // Trigger the email
        const emailRequest = {
          emailType: "REACTIVATION" as const,
          userData: {
            email: user.email,
            name: user.name,
            id: user._id.toString(),
          },
          additionalData: {
            solvedCount,
            currentStreak,
            redirectUrl,
            redirectText,
            cohort: cohort.key,
            subject,
            app: targetApp,
          },
        };

        const result =
          await emailTriggerService.sendExternalEmail(emailRequest);

        if (result.success) {
          // Update the sent timestamp in the database
          const updateField = `reactivationEmails.${cohort.sentField}`;
          await User.findByIdAndUpdate(user._id, {
            $set: { [updateField]: new Date() },
          });
          results.push({
            email: user.email,
            status: "success",
            cohort: cohort.key,
          });
        } else {
          results.push({
            email: user.email,
            status: "failed",
            cohort: cohort.key,
            error: result.error,
          });
        }
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: "Reactivation email job completed successfully",
        data: results,
      }),
    );
  } catch (error) {
    logger.error("Reactivation email cron job failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: "Internal server error while running reactivation email job",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export default withApiHandler(handler);
