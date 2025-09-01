import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { sendEmailFromDB } from '@/database';
import { 
  createEmailLogInDB, 
  getEmailTemplateByIdFromDB, 
  getLearnerSegmentFromDB,
  updateEmailLogStatusInDB 
} from '@/database/query/emailCampaign';
import type { BulkEmailRequest } from '@/interfaces';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleBulkEmailSend(req, res);
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

const handleBulkEmailSend = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      campaignId,
      templateId,
      segment,
      filters,
      customSubject,
      customContent,
      variables = {}
    } = req.body as BulkEmailRequest;

    // Validate required fields
    if (!templateId || !segment) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Missing required fields: templateId, segment',
        })
      );
    }

    // Get email template
    const { data: template, error: templateError } = await getEmailTemplateByIdFromDB(templateId);
    if (templateError || !template) {
      return res.status(apiStatusCodes.BAD_REQUEST).json(
        sendAPIResponse({
          status: false,
          message: 'Invalid template ID',
          error: templateError,
        })
      );
    }

    // Get learner segment
    const { data: segmentData, error: segmentError } = await getLearnerSegmentFromDB(segment, filters);
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

    // Process emails in batches
    const batchSize = 10; // Send 10 emails at a time to avoid rate limits
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user: any) => {
        try {
          // Create email log entry
          const logData = {
            campaignId,
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            templateId,
            subject: customSubject || template.subject,
          };

          const { data: emailLog, error: logError } = await createEmailLogInDB(logData);
          if (logError || !emailLog) {
            throw new Error(`Failed to create email log: ${logError}`);
          }

          // Prepare email content with variables
          let emailSubject = customSubject || template.subject;
          let emailContent = customContent || template.htmlContent;

          // Replace template variables
          const userVariables = {
            userName: user.name,
            userEmail: user.email,
            ...variables,
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

        } catch (error: any) {
          results.failed++;
          results.errors.push(`User ${user.email}: ${error.message}`);
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Add small delay between batches to avoid rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Bulk email operation completed',
        data: {
          totalUsers: users.length,
          sent: results.sent,
          failed: results.failed,
          errors: results.errors.slice(0, 10), // Return first 10 errors
        },
      })
    );

  } catch (error) {
    console.error('Bulk email sending error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to send bulk emails',
        error,
      })
    );
  }
};

export default handler;
