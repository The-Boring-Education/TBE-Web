import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { 
  getEmailTemplatesFromDB, 
  getLearnerSegmentFromDB,
  createEmailLogInDB,
  updateEmailLogStatusInDB 
} from '@/database/query/emailCampaign';
import { sendEmailFromDB } from '@/database';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleAppScriptTrigger(req, res);
      default:
        return res.status(apiStatusCodes.BAD_REQUEST).json(
          sendAPIResponse({
            status: false,
            message: `Method ${req.method} Not Allowed`,
          })
        );
    }
  } catch (error) {
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Something went wrong',
        error,
      })
    );
  }
};


const handleAppScriptTrigger = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { 
      templateCategory = 'LEARNING_ENCOURAGEMENT',
      segment = 'ACTIVE_LEARNERS',
      apiKey 
    } = req.body;

    if (apiKey !== process.env.APP_SCRIPT_API_KEY) {
      return res.status(apiStatusCodes.UNAUTHORIZED).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid API key',
        })
      );
    }

    const { data: templates, error: templateError } = await getEmailTemplatesFromDB(templateCategory, true);
    if (templateError || !templates || templates.length === 0) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: `No active templates found for category: ${templateCategory}`,
        })
      );
    }

    const template = templates[Math.floor(Math.random() * templates.length)];

    const { data: segmentData, error: segmentError } = await getLearnerSegmentFromDB(segment, {
      lastActivityDays: 7,
      limit: 50
    });

    if (segmentError || !segmentData) {
      return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
        sendAPIResponse({
          status: false,
          message: 'Failed to get learner segment',
          error: segmentError,
        })
      );
    }

    const { users } = segmentData as any;
    if (!users || users.length === 0) {
      return res.status(apiStatusCodes.OKAY).json(
        sendAPIResponse({
          status: true,
          message: 'No users found in the specified segment',
          data: { sentCount: 0, totalUsers: 0 },
        })
      );
    }

    // Send emails to users
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const user of users) {
      try {
        // Create email log entry
        const logData = {
          userId: user._id,
          userEmail: user.email,
          userName: user.name,
          templateId: template._id,
          subject: template.subject,
        };

        const { data: emailLog, error: logError } = await createEmailLogInDB(logData);
        if (logError || !emailLog) {
          throw new Error(`Failed to create email log: ${logError}`);
        }

        // Prepare email content with variables
        let emailSubject = template.subject;
        let emailContent = template.htmlContent;

        // Replace template variables
        const userVariables = {
          userName: user.name,
          userEmail: user.email,
          currentDate: new Date().toLocaleDateString(),
        };

        Object.entries(userVariables).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          emailSubject = emailSubject.replace(regex, String(value));
          emailContent = emailContent.replace(regex, String(value));
        });

        // Send email
        const { data: emailResult, error: emailError } = await sendEmailFromDB({
          from_email: 'theboringeducation@gmail.com',
          from_name: 'TBE',
          to_email: user.email,
          to_name: user.name,
          subject: emailSubject,
          html_content: emailContent,
        });

        if (emailError) {
          // Update log with failure
          await updateEmailLogStatusInDB(emailLog._id, 'FAILED', {
            errorMessage: emailError,
          });
          throw new Error(`Email send failed: ${emailError}`);
        }

        // Update log with success
        await updateEmailLogStatusInDB(emailLog._id, 'SENT');
        results.sent++;

        // Add small delay between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        results.failed++;
        results.errors.push(`User ${user.email}: ${error.message}`);
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Automated email trigger completed',
        data: {
          templateUsed: template.name,
          segment,
          totalUsers: users.length,
          sent: results.sent,
          failed: results.failed,
          errors: results.errors.slice(0, 5), // Return first 5 errors
        },
      })
    );

  } catch (error) {
    console.error('App Script trigger error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to process automated email trigger',
        error,
      })
    );
  }
};

export default handler;
