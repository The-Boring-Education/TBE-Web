import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';
import { cors } from '@/utils/cors';
import { emailClient } from '@/services/email/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  if (req.method !== 'POST') {
    return res.status(apiStatusCodes.METHOD_NOT_ALLOWED).json(
      sendAPIResponse({ status: false, message: `Method ${req.method} not allowed` })
    );
  }

  try {
    const { userId, userEmail, userName } = req.body as { userId: string; userEmail: string; userName: string };

    if (!userId || !userEmail || !userName) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({ status: false, message: 'Missing required fields: userId, userEmail, userName' })
      );
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Selected for Mentorship</title>
        <style>
          body { margin:0; padding:0; background:#f6f7fb; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji', sans-serif; color:#111827; }
          .container { width:100%; max-width:640px; margin:0 auto; padding:24px 12px; }
          .card { background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 20px rgba(17,24,39,0.06); }
          .header { background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #0ea5e9 100%); padding:28px 24px; color:#fff; }
          .brand { font-weight:800; letter-spacing:0.3px; font-size:12px; opacity:0.95; text-transform:uppercase; }
          .title { margin:6px 0 0; font-size:24px; font-weight:800; line-height:1.2; }
          .content { padding:24px; }
          .pill { display:inline-block; background:#eef2ff; color:#4f46e5; border:1px solid #e0e7ff; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:600; }
          .section { margin-top:16px; line-height:1.65; color:#374151; }
          .list { margin:12px 0 0; padding:0; list-style:none; }
          .list li { margin:0; padding-left:22px; position:relative; font-size:14px; color:#374151; line-height:1.6; }
          .list li:before { content:'✔'; position:absolute; left:0; top:0; color:#10b981; font-weight:700; }
          .cta { display:inline-block; margin-top:20px; background:#4f46e5; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:700; font-size:14px; letter-spacing:0.2px; box-shadow:0 6px 16px rgba(79,70,229,0.35); }
          .note { margin-top:18px; font-size:12px; color:#6b7280; }
          .footer { text-align:center; color:#6b7280; font-size:12px; padding:20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="brand">The Boring Education</div>
              <div class="title">Congrats, ${userName} — You're in! 🎉</div>
            </div>
            <div class="content">
              <span class="pill">Prep Yatra — Async Mentorship</span>
              <div class="section" style="margin-top:14px;">We’ve selected you for mentorship based on your consistency and growth in Prep Yatra. You’ll now receive timely nudges, guidance and resources tailored to your goals.</div>

              <div class="section">
                <strong>What to expect next:</strong>
                <ul class="list">
                  <li>Periodic check-ins and action prompts</li>
                  <li>Curated resources based on your current focus</li>
                  <li>Accountability to help you sustain your streak</li>
                </ul>
              </div>

              <a class="cta" href="#" target="_blank" rel="noopener">Keep up the momentum</a>
              <div class="note">You don’t need to reply to this email. We’ll reach out when an action is needed from your side.</div>
              <div class="section" style="margin-top:18px;">- Sachin from The Boring Education</div>
            </div>
          </div>
          <div class="footer">You received this because you are enrolled in Prep Yatra. © The Boring Education</div>
        </div>
      </body>
      </html>
    `;

    const result = await emailClient.sendEmail({
      from_email: 'theboringeducation@gmail.com',
      from_name: 'TBE',
      to_email: userEmail,
      to_name: userName,
      subject: 'You are selected for Prep Yatra Async Mentorship 🎉',
      html_content: html,
    });

    if (!result.success) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({ status: false, message: 'Failed to send email', error: result.error })
      );
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({ status: true, message: 'Notification email sent', data: result })
    );
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({ status: false, message: 'Unexpected error', error })
    );
  }
};

export default handler;

