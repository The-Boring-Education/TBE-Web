import type { NextApiRequest, NextApiResponse } from 'next';

import { apiStatusCodes } from '@/constant';
import { createEmailTemplateInDB } from '@/database/query/emailCampaign';
import { connectDB } from '@/middlewares';
import { sendAPIResponse } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();

    switch (req.method) {
      case 'POST':
        return handleSeedTemplates(req, res);
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

const handleSeedTemplates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sampleTemplates = [
      {
        name: 'Daily Progress Motivation',
        subject: 'Keep up the great work, {{userName}}! 🚀',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">TBE Daily Motivation</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello {{userName}}! 👋</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Every day is a new opportunity to grow and learn. Your dedication to improving your skills is inspiring!
              </p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ef4444; margin-top: 0;">Today's Learning Tip:</h3>
                <p style="color: #666; margin-bottom: 0;">
                  Consistency beats perfection. Even 30 minutes of focused learning each day can lead to remarkable progress over time.
                </p>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Ready to continue your learning journey? Log in to TBE and explore new courses, challenges, and opportunities!
              </p>
              <div style="text-align: center;">
                <a href="https://theboringeducation.com" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Continue Learning
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Keep pushing forward! 💪<br>
                The TBE Team
              </p>
            </div>
          </div>
        `,
        variables: ['userName'],
        category: 'LEARNING_ENCOURAGEMENT',
        isActive: true,
      },
      {
        name: 'Progress Appraisal',
        subject: 'Your Learning Progress Report - {{userName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Your Progress Report</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Great job, {{userName}}! 🎉</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We've been tracking your learning journey and wanted to share some insights about your progress.
              </p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ef4444; margin-top: 0;">Your Achievements:</h3>
                <ul style="color: #666; margin-bottom: 0;">
                  <li>Consistent learning streak</li>
                  <li>Completed multiple courses</li>
                  <li>Active participation in challenges</li>
                  <li>Growing skill set</li>
                </ul>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Your dedication is paying off! Keep up the excellent work and continue building your future.
              </p>
              <div style="text-align: center;">
                <a href="https://theboringeducation.com/dashboard" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  View Your Dashboard
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Date: {{currentDate}}<br>
                The TBE Team
              </p>
            </div>
          </div>
        `,
        variables: ['userName', 'currentDate'],
        category: 'PROGRESS_APPRAISAL',
        isActive: true,
      },
      {
        name: 'Community Invitation',
        subject: 'Join our amazing community, {{userName}}! 🌟',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Join Our Community</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hey {{userName}}! 👋</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Learning is better together! Join our vibrant community of learners, mentors, and tech enthusiasts.
              </p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ef4444; margin-top: 0;">What you'll get:</h3>
                <ul style="color: #666; margin-bottom: 0;">
                  <li>Connect with fellow learners</li>
                  <li>Get help from mentors</li>
                  <li>Share your projects</li>
                  <li>Participate in discussions</li>
                  <li>Access exclusive resources</li>
                </ul>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Don't miss out on the opportunity to grow with like-minded individuals!
              </p>
              <div style="text-align: center;">
                <a href="https://theboringeducation.com/community" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Join Community
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                See you in the community! 🌟<br>
                The TBE Team
              </p>
            </div>
          </div>
        `,
        variables: ['userName'],
        category: 'COMMUNITY_INVITATION',
        isActive: true,
      },
      {
        name: 'Platform Updates',
        subject: 'New features and updates - {{userName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Platform Updates</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello {{userName}}! 🚀</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We've been working hard to improve your learning experience. Here are the latest updates:
              </p>
              <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ef4444; margin-top: 0;">What's New:</h3>
                <ul style="color: #666; margin-bottom: 0;">
                  <li>Enhanced course interface</li>
                  <li>New interactive challenges</li>
                  <li>Improved progress tracking</li>
                  <li>Better mobile experience</li>
                  <li>New learning paths</li>
                </ul>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Check out these new features and let us know what you think!
              </p>
              <div style="text-align: center;">
                <a href="https://theboringeducation.com/explore" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Explore New Features
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                Date: {{currentDate}}<br>
                The TBE Team
              </p>
            </div>
          </div>
        `,
        variables: ['userName', 'currentDate'],
        category: 'CHANGELOG',
        isActive: true,
      },
    ];

    const createdTemplates = [];
    const errors = [];

    // Create templates one by one
    for (const template of sampleTemplates) {
      try {
        const { data, error } = await createEmailTemplateInDB(template);
        if (error) {
          errors.push(`${template.name}: ${error}`);
        } else {
          createdTemplates.push(data);
        }
      } catch (error: any) {
        errors.push(`${template.name}: ${error.message}`);
      }
    }

    return res.status(apiStatusCodes.OKAY).json(
      sendAPIResponse({
        status: true,
        message: 'Template seeding completed',
        data: {
          created: createdTemplates.length,
          errors: errors.length > 0 ? errors : undefined,
          templates: createdTemplates,
        },
      })
    );

  } catch (error) {
    console.error('Template seeding error:', error);
    return res.status(apiStatusCodes.INTERNAL_SERVER_ERROR).json(
      sendAPIResponse({
        status: false,
        message: 'Failed to seed templates',
        error,
      })
    );
  }
};

export default handler;
