import { envConfig, routes } from "@/lib/constants";
import type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailTriggerData,
  InterviewPrepEnrollmentEmailData,
  ProjectEnrollmentEmailData,
} from "@/lib/interfaces";

const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Boring Education</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #0a0a0b;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #111111;
        }
        .container {
            max-width: 600px;
            width: 100%;
            margin: 32px auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 4px 40px rgba(0,0,0,0.4);
        }
        .tbe-header {
            background: #111111;
            padding: 24px 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #FF5757;
            flex-wrap: wrap;
            gap: 8px;
        }
        .tbe-logo {
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.02em;
        }
        .tbe-badge {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #FF5757;
            background: #1a0a0a;
            padding: 4px 12px;
            border-radius: 20px;
            border: 1px solid #3a1010;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }
        .content {
            padding: 36px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #111111;
            margin-bottom: 8px;
        }
        .main-text {
            font-size: 15px;
            line-height: 1.7;
            color: #444444;
            margin-bottom: 24px;
        }
        .main-text ul, .content ul {
            padding-left: 20px;
            margin: 16px 0;
        }
        .main-text li, .content li {
            margin-bottom: 6px;
        }
        .cta-button {
            display: inline-block;
            background: #FF5757;
            color: #ffffff;
            text-decoration: none;
            padding: 13px 32px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.02em;
        }
        .tbe-footer {
            background: #f9f8f6;
            border-top: 1px solid #e5e5e5;
            padding: 16px 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }
        .tbe-footer-copy {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #888888;
        }
        .tbe-footer-link {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #FF5757;
            text-decoration: none;
        }
        .signature {
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
        }
        .signature-name {
            font-weight: 700;
            color: #111111;
            font-size: 15px;
        }
        .signature-title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #888888;
            margin-top: 2px;
        }
        .mono-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
        }
        .social-links {
            margin: 0 0 16px 0;
        }
        .social-links a {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #FF5757;
            background: #fff0f0;
            border: 1px solid #ffe0e0;
            padding: 4px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            margin: 0 4px 4px 0;
        }

        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0 auto !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: 100% !important;
            }
            .tbe-header {
                padding: 18px 20px !important;
            }
            .content {
                padding: 24px 20px !important;
            }
            .greeting {
                font-size: 17px !important;
            }
            .main-text {
                font-size: 14px !important;
                line-height: 1.6 !important;
            }
            .cta-button {
                display: block !important;
                width: 100% !important;
                box-sizing: border-box !important;
                text-align: center !important;
                padding: 14px 20px !important;
                margin-bottom: 10px !important;
            }
            .tbe-footer {
                padding: 14px 20px !important;
                text-align: center !important;
                justify-content: center !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="tbe-header">
            <span class="tbe-logo">The Boring Education</span>
        </div>
        <div class="content">
            ${content}
            <div class="signature">
                <div class="signature-name">Sachin</div>
                <div class="signature-title">Co-founder, The Boring Education</div>
            </div>
        </div>
        <div class="tbe-footer">
            <span class="tbe-footer-copy">© 2026 The Boring Education</span>
            <a href="https://www.theboringeducation.com" class="tbe-footer-link">theboringeducation.com</a>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (data: EmailTriggerData): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 👋</div>
    
    <div class="main-text">
        You just unlocked free access to skills most people pay lakhs for. No cap. 🎉
        
        <br><br>
        
        I'm Sachin — welcome to a community that's actually building, not just watching tutorials on 2x speed and closing the tab.
        
        <ul>
            <li>🆓 <strong>Zero paywalls</strong> — ever</li>
            <li>🛠️ <strong>Build real stuff</strong>, not just theory</li>
            <li>🇮🇳 <strong>Made for Bharat</strong>, by people who get it</li>
        </ul>
        
        Your dashboard is basically begging to be opened right now.
    </div>
    
    <div style="text-align: center;">
        <a href="https://www.theboringeducation.com" class="cta-button">
            🚀 Take Me In
        </a>
    </div>
  `;

  return getBaseTemplate(content);
};

export const courseEnrollmentTemplate = (
  data: CourseEnrollmentEmailData,
): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 📚</div>
    
    <div class="main-text">
        You just enrolled in <strong>${data.courseName}</strong> — and future-you is already thanking you. 🎉
        
        ${
          data.courseDescription
            ? `<br><br><em>"${data.courseDescription}"</em>`
            : ""
        }
        
        <br><br>
        
        Quick reality check before you start:
        <ul>
            <li>⏱️ <strong>15 mins a day</strong> beats 5 hours once a month</li>
            <li>💻 <strong>Code along</strong> — don't just watch</li>
            <li>🎯 <strong>Build something</strong> before the streak breaks</li>
        </ul>
        
        The best time to start was yesterday. The second best time is right now.
    </div>
    
    <div style="text-align: center;">
        <a href=${
          envConfig.PLATFORM_URL + routes.user.dashboard
        } class="cta-button">
            📖 Jump Back In
        </a>
    </div>
  `;

  return getBaseTemplate(content);
};

export const projectEnrollmentTemplate = (
  data: ProjectEnrollmentEmailData,
): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 🛠️</div>
    
    <div class="main-text">
        You just enrolled in <strong>${
          data.projectName
        }</strong> — this is where "I know some coding" turns into "I built this." 🚀
        
        ${
          data.projectDescription
            ? `<br><br><em>"${data.projectDescription}"</em>`
            : ""
        }
        
        <br><br>
        
        Cheat codes for shipping this project:
        <ul>
            <li>🎯 <strong>Small tasks</strong> beat one giant scary one</li>
            <li>🐛 <strong>Bugs are lessons</strong>, not disasters</li>
            <li>🔄 <strong>Ship, then improve</strong> — not the other way</li>
        </ul>
        
        Every dev you admire once opened a blank file too.
    </div>
    
    <div style="text-align: center;">
        <a href="${data.projectUrl}" class="cta-button">
            🔨 Start Building
        </a>
    </div>
  `;

  return getBaseTemplate(content);
};

export const interviewPrepEnrollmentTemplate = (
  data: InterviewPrepEnrollmentEmailData,
): string =>
  getBaseTemplate(`
    <div class="greeting">Hey ${data.userName}! 🎯</div>
    
    <div class="main-text">
      <p>You just enrolled in <strong>${data.sheetName}</strong> — your interviewer won't know what hit them. 😎</p>
      
      ${data.sheetDescription ? `<p>${data.sheetDescription}</p>` : ""}
      
      <p>This sheet is built to make you dangerous at:</p>
      <ul>
        <li>Core concepts, minus the fluff</li>
        <li>Real questions asked in real interviews</li>
        <li>Confidence that doesn't crack under pressure</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href=${envConfig.PLATFORM_URL + routes.user.dashboard} class="cta-button">
        Start Prepping 🚀
      </a>
    </div>
    
    <div class="main-text">
      <p><strong>One rule:</strong> understand it, don't memorize it. That's the difference between passing and bombing.</p>
    </div>
    
    <div class="signature">
      <div class="signature-name">Sachin from The Boring Education</div>
      <div class="signature-title">Your Interview Success Partners</div>
    </div>
  `);

export const courseCompletionTemplate = (
  data: CourseCompletionEmailData,
): string =>
  getBaseTemplate(`
    <div class="greeting">You did it, ${data.userName}! 🎉</div>
    
    <div class="main-text">
      <p>You just finished <strong>${data.courseName}</strong> — and most people never even finish course #1. You're not most people.</p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 15px;">🎯 What you just proved:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>You can finish what you start</li>
          <li>You can build, not just watch</li>
          <li>You're ready for the next level</li>
        </ul>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href=${envConfig.PLATFORM_URL + routes.user.dashboard} class="cta-button">
        Review Course 📚
      </a>
      ${
        data.certificateUrl
          ? `
        <a href="${data.certificateUrl}" class="cta-button" style="margin-left: 10px; background: linear-gradient(135deg, #059669 0%, #047857 100%);">
          Grab Your Certificate 🏆
        </a>
      `
          : ""
      }
    </div>
    
    <div class="main-text">
      <p><strong>Don't stop now.</strong> The learners who go the furthest are the ones who take the next step right after this one — while the momentum's still hot.</p>
    </div>
    
    <div class="signature">
      <div class="signature-name">Sachin from The Boring Education</div>
      <div class="signature-title">Proud of You. Genuinely.</div>
    </div>
  `);

export const reactivationEmailTemplate = (data: {
  userName: string;
  solvedCount: number;
  currentStreak: number;
  redirectUrl: string;
  redirectText: string;
  cohort: "1D" | "7D" | "14D" | "30D";
  app?: "platform" | "dsayatra" | "prepyatra" | "oncampus";
}): string => {
  const appName = data.app || "platform";

  // Dynamic configurations per app
  let badge = "CHECK-IN";
  let hook = "KEEP LEARNING";
  let title = "Ready to Continue?";
  let titleAccent = "Learn Daily!";
  let subtitle = "Consistency is the key to building a coding habit.";
  let bodyText = "Return to your dashboard and pick up where you left off.";
  let quoteText = "Spend 15 minutes today practicing and keep moving forward.";
  const statsLabel = "Your Learning Snapshot";

  if (appName === "platform") {
    badge = `${data.cohort} CHECK-IN`;
    hook = "EXPLORE FREE HUBS";
    title = "Did You Forget Us";
    titleAccent = "Just like your ex forgot you?";
    subtitle = "Zero paywalls, 100% building — but you're missing out.";
    bodyText =
      "You unlocked free access to tech education most people pay lakhs for, but your account is sitting in the dark. We've got updated interview prep sheets and bite-sized courses waiting for you.";
    quoteText =
      "No subscription, no spam, no BS. Just return to theboringeducation.com and pick a sheet or course to start building.";
  } else if (appName === "dsayatra") {
    badge = `DSA YATRA – ${data.cohort}`;
    hook = "SOLVE DSA PROBLEMS";
    title = "Your DSA Streak is Dead";
    titleAccent = "Deader than your last relationship?";
    subtitle = "DFS, BFS, or just AFK? We miss you on DSA Yatra.";
    bodyText = `You solved ${data.solvedCount} DSA problems, and then... absolute silence. Did a pointer exception delete your ambition? Top product companies won't wait for your algorithm muscles to wake up from their deep sleep.`;
    quoteText =
      "Your future interviewer is currently reading your code. Just kidding, but they will be. Keep practicing patterns and take a daily quiz before you forget what a Node is!";
  } else if (appName === "oncampus") {
    badge = `ONCAMPUS – ${data.cohort}`;
    hook = "CRACK PLACEMENTS";
    title = "Unemployed Vibes?";
    titleAccent = "Or did your ex take that option too?";
    subtitle = "CS fundamentals and aptitude won't study themselves.";
    bodyText =
      "Campus placement season is a brutal battle royale. While you are sleeping, your batchmates are mastering Operating Systems, DBMS, computer networks, and solving aptitude. Don't be the one left holding an empty resume.";
    quoteText =
      "Make your resume dangerous. Review curated interview sheets, practice aptitude quizzes, and master CS core subjects today.";
  } else if (appName === "prepyatra") {
    badge = `PREPYATRA – ${data.cohort}`;
    hook = "LOG YOUR PROGRESS";
    title = "Your Streak is Crying";
    titleAccent = "Harder than you did post-breakup?";
    subtitle = "Your dashboard is begging you to come back.";
    bodyText = `You had a solid streak of ${data.currentStreak} days. Now it is on life support. Consistency is the only line between 'I want to be a dev' and actually being one. Log your mock interview practice or project building progress now.`;
    quoteText =
      "Restart the engine before it gets cold. Even a 5-minute log entry today keeps your momentum alive.";
  }

  let statsSection = "";
  if (appName === "platform") {
    statsSection = `
          <!-- PLATFORM EXPLORE INFO -->
          <tr>
            <td class="section-pad" align="center" style="padding:24px 28px 0 28px;border-bottom:1px solid #ebebeb;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 12px auto; width:100%; max-width:440px;">
                <tr>
                  <td align="center" style="font-family:Inter,sans-serif;font-size:13px;color:#6b6b6b;line-height:1.6;padding-bottom:16px;text-align:center;">
                    Explore our learning hubs:
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="margin-bottom:12px;text-align:center;">
                      <a href="https://www.theboringeducation.com/interview-prep/explore" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #e8392a;border-radius:20px;padding:8px 20px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#e8392a;text-decoration:none;white-space:nowrap;">
                        Explore Interview Sheets
                      </a>
                    </div>
                    <div style="margin-bottom:20px;text-align:center;">
                      <a href="https://www.theboringeducation.com/shiksha/explore" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #e8392a;border-radius:20px;padding:8px 20px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#e8392a;text-decoration:none;white-space:nowrap;">
                        Explore Free Courses
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${data.redirectUrl}"
                      style="display:block;background-color:#e8392a;border-radius:12px;padding:16px 20px;text-decoration:none;text-align:center;">
                      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;text-align:center;white-space:nowrap;">${data.redirectText} →</td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
  } else if (appName === "oncampus") {
    statsSection = `
          <!-- ONCAMPUS EXPLORE INFO -->
          <tr>
            <td class="section-pad" align="center" style="padding:24px 28px 0 28px;border-bottom:1px solid #ebebeb;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 12px auto; width:100%; max-width:440px;">
                <tr>
                  <td align="center" style="font-family:Inter,sans-serif;font-size:13px;color:#6b6b6b;line-height:1.6;padding-bottom:16px;text-align:center;">
                    Explore our prep sections:
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <div style="margin-bottom:12px;text-align:center;">
                      <a href="https://oncampus.theboringeducation.com/interview-sheets" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #e8392a;border-radius:20px;padding:8px 20px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#e8392a;text-decoration:none;white-space:nowrap;">
                        Interview Sheets
                      </a>
                    </div>
                    <div style="margin-bottom:12px;text-align:center;">
                      <a href="https://oncampus.theboringeducation.com/aptitude" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #e8392a;border-radius:20px;padding:8px 20px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#e8392a;text-decoration:none;white-space:nowrap;">
                        Aptitude Prep
                      </a>
                    </div>
                    <div style="margin-bottom:20px;text-align:center;">
                      <a href="https://oncampus.theboringeducation.com/coresubjects" target="_blank" style="display:inline-block;background-color:#ffffff;border:1px solid #e8392a;border-radius:20px;padding:8px 20px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#e8392a;text-decoration:none;white-space:nowrap;">
                        Core CS Subjects
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${data.redirectUrl}"
                      style="display:block;background-color:#e8392a;border-radius:12px;padding:16px 20px;text-decoration:none;text-align:center;">
                      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;text-align:center;white-space:nowrap;">${data.redirectText} →</td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
  } else if (appName === "dsayatra") {
    statsSection = `
          <!-- DSA YATRA STATS + CTA -->
          <tr>
            <td class="section-pad" align="center" style="padding:24px 28px 0 28px;border-bottom:1px solid #ebebeb;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 18px auto;">
                <tr>
                  <td style="font-size:17px;vertical-align:middle;padding-right:8px;text-align:center;">📊</td>
                  <td style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;
                    text-transform:uppercase;letter-spacing:0.13em;color:#6b6b6b;vertical-align:middle;text-align:center;">${statsLabel}</td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 18px auto; max-width:440px;">
                <tr>
                  <td class="stat-td" width="100%" align="center" style="vertical-align:top;">
                    <div style="background-color:#f8f9fa;border:1px solid #e5e5e5;border-radius:12px;padding:18px;height:80px;text-align:center;">
                      <div style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:800;color:#0a0a0a;line-height:1;margin:0 0 6px 0;text-align:center;">${data.solvedCount}</div>
                      <div style="font-family:Inter,sans-serif;font-size:11px;color:#6b6b6b;text-align:center;font-weight:500;">DSA Problems Solved</div>
                    </div>
                  </td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${data.redirectUrl}"
                      style="display:block;background-color:#e8392a;border-radius:12px;padding:16px 20px;text-decoration:none;text-align:center;">
                      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;text-align:center;white-space:nowrap;">${data.redirectText} →</td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
  } else {
    // prepyatra
    statsSection = `
          <!-- PREPYATRA STATS + CTA -->
          <tr>
            <td class="section-pad" align="center" style="padding:24px 28px 0 28px;border-bottom:1px solid #ebebeb;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 18px auto;">
                <tr>
                  <td style="font-size:17px;vertical-align:middle;padding-right:8px;text-align:center;">📊</td>
                  <td style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;
                    text-transform:uppercase;letter-spacing:0.13em;color:#6b6b6b;vertical-align:middle;text-align:center;">${statsLabel}</td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 18px auto; max-width:440px;">
                <tr>
                  <td class="stat-td" width="50%" align="center" style="padding-right:6px;vertical-align:top;">
                    <div style="background-color:#f8f9fa;border:1px solid #e5e5e5;border-radius:12px;padding:18px;height:80px;text-align:center;">
                      <div style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:800;color:#e8392a;line-height:1;margin:0 0 6px 0;text-align:center;">${data.currentStreak}</div>
                      <div style="font-family:Inter,sans-serif;font-size:11px;color:#6b6b6b;text-align:center;font-weight:500;">Day Streak 🔥</div>
                    </div>
                  </td>
                  <td class="stat-td" width="50%" align="center" style="padding-left:6px;vertical-align:top;">
                    <div style="background-color:#f8f9fa;border:1px solid #e5e5e5;border-radius:12px;padding:18px;height:80px;text-align:center;">
                      <div style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:800;color:#0a0a0a;line-height:1;margin:0 0 6px 0;text-align:center;">${data.solvedCount}</div>
                      <div style="font-family:Inter,sans-serif;font-size:11px;color:#6b6b6b;text-align:center;font-weight:500;">Total Logs 📊</div>
                    </div>
                  </td>
                </tr>
              </table>
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${data.redirectUrl}"
                      style="display:block;background-color:#e8392a;border-radius:12px;padding:16px 20px;text-decoration:none;text-align:center;">
                      <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                        <tr>
                          <td align="center" style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;text-align:center;white-space:nowrap;">${data.redirectText} →</td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} ${titleAccent} – The Boring Education</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    body, html { margin:0; padding:0; background-color:#f4f4f6; }
    * { box-sizing:border-box; }
    a { text-decoration:none; color:inherit; }
    img { display:block; border:0; max-width:100%; }
    @media only screen and (max-width:540px) {
      .outer-td { padding:0 !important; }
      .email-card { border-radius:0 !important; box-shadow:none !important; }
      .stat-td { display:block !important; width:100% !important; padding:0 0 10px 0 !important; }
      .ig-btn-text { font-size:11px !important; }
      .section-pad { padding-left:16px !important; padding-right:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f6;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#f4f4f6;">
    <tr>
      <td class="outer-td" align="center" style="padding:32px 16px;background-color:#f4f4f6;">

        <table class="email-card" width="560" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

          <!-- HEADER -->
          <tr>
            <td class="section-pad" align="center" style="background-color:#ffffff;padding:24px 28px 16px 28px;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td align="center" style="vertical-align:middle;text-align:center;font-family:'Space Grotesk',Inter,sans-serif;font-size:16px;font-weight:800;color:#0a0a0a;letter-spacing:-0.5px;text-transform:uppercase;white-space:nowrap;">
                    The Boring <span style="color:#e8392a;">Education</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td class="section-pad" align="center" style="background-color:#ffffff;padding:16px 28px 32px 28px;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 12px auto;">
                <tr>
                  <td align="center" style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;
                    color:#e8392a;background-color:#fdf0ef;border:1px solid #f9d5d2;border-radius:20px;
                    padding:6px 12px;text-transform:uppercase;letter-spacing:0.1em;display:inline-block;text-align:center;white-space:nowrap;">
                    ${badge}
                  </td>
                </tr>
              </table>
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px auto;">
                <tr>
                  <td align="center" style="font-family:Inter,sans-serif;font-size:10px;font-weight:600;
                    color:#6b6b6b;text-transform:uppercase;letter-spacing:0.14em;text-align:center;white-space:nowrap;">${hook}</td>
                </tr>
              </table>
              <h1 style="margin:0 0 14px 0;font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:800;
                color:#0a0a0a;line-height:1.15;letter-spacing:-0.5px;text-align:center;">
                ${title}<br/>
                <span style="color:#e8392a;">${titleAccent}</span>
              </h1>
              <p style="margin:0;font-family:Inter,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;text-align:center;">${subtitle}</p>
            </td>
          </tr>

          <!-- GREETING + BODY -->
          <tr>
            <td class="section-pad" align="center" style="padding:28px 28px 0 28px;border-bottom:1px solid #ebebeb;background-color:#ffffff;">
              <p style="margin:0 0 10px 0;font-family:Inter,sans-serif;font-size:16px;color:#0a0a0a;line-height:1.65;text-align:center;">
                Hey <strong style="font-family:'Space Grotesk',sans-serif;font-weight:700;white-space:nowrap;">${data.userName}!</strong>
              </p>
              <p style="margin:0 0 18px 0;font-family:Inter,sans-serif;font-size:14px;color:#555555;line-height:1.75;text-align:center;">${bodyText}</p>
              <div style="background-color:#fdf0ef;border-left:4px solid #e8392a;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;text-align:center;display:inline-block;width:100%;max-width:480px;">
                <p style="margin:0;font-family:Inter,sans-serif;font-size:14px;color:#0a0a0a;line-height:1.7;font-weight:500;text-align:center;">${quoteText}</p>
              </div>
            </td>
          </tr>

          ${statsSection}

          <!-- COMMUNITY -->
          <tr>
            <td class="section-pad" align="center" style="padding:28px 28px 0 28px;border-bottom:1px solid #ebebeb;background-color:#ffffff;">
              <table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto; max-width:440px;">
                <tr>
                  <td align="center" style="font-size:20px;padding-bottom:8px;text-align:center;">🤝</td>
                </tr>
                <tr>
                  <td align="center" style="text-align:center;">
                    <h3 style="margin:0 0 8px 0;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#0a0a0a;line-height:1.3;text-align:center;">Don't learn in isolation</h3>
                    <p style="margin:0 0 18px 0;font-family:Inter,sans-serif;font-size:13px;color:#6b6b6b;line-height:1.7;text-align:center;">
                      Join 5,000+ peers. Share code, ask questions, find accountability partners.
                    </p>
                    <a href="https://www.instagram.com/theboringeducation" target="_blank"
                      style="display:inline-block;border:2px solid #0a0a0a;border-radius:12px;padding:12px 18px;text-decoration:none;margin-bottom:28px;text-align:center;white-space:nowrap;">
                      <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center" style="margin:0 auto;">
                        <tr>
                          <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E1306C"
                              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                          </td>
                          <td class="ig-btn-text" style="font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:#0a0a0a;vertical-align:middle;white-space:nowrap;letter-spacing:0.02em;">
                            Join Instagram Community →
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding:24px 28px;text-align:center;background-color:#ffffff;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 10px auto;">
                <tr>
                  <td style="vertical-align:middle; font-family:'Space Grotesk',Inter,sans-serif; font-size:12px; font-weight:800; color:#0a0a0a; opacity:0.35; letter-spacing:-0.5px; text-transform:uppercase; white-space:nowrap;">
                    The Boring <span style="color:#e8392a;">Education</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px 0;font-family:Inter,sans-serif;font-size:11px;color:#999999;text-align:center;">© 2026 The Boring Education</p>
              <a href="https://www.theboringeducation.com"
                style="font-family:Inter,sans-serif;font-size:11px;color:#e8392a;text-decoration:none;text-align:center;">theboringeducation.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};
