import { EmailCampaign, EmailLog, EmailTemplate, User } from '@/database';
import type {
  DatabaseQueryResponseType,
  EmailCampaign as EmailCampaignType,
  EmailTemplate as EmailTemplateType,
} from '@/interfaces';

const createEmailTemplateInDB = async (
  templateData: Omit<EmailTemplateType, '_id' | 'createdAt' | 'updatedAt'>
): Promise<DatabaseQueryResponseType> => {
  try {
    const template = new EmailTemplate(templateData);
    const savedTemplate = await template.save();
    return { data: savedTemplate };
  } catch (error: any) {
    return { error: error.message };
  }
};


const getEmailTemplatesFromDB = async (
  category?: string,
  isActive?: boolean
): Promise<DatabaseQueryResponseType> => {
  try {
    const query: any = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive;

    const templates = await EmailTemplate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return { data: templates };
  } catch (error: any) {
    return { error: error.message };
  }
};

const getEmailTemplateByIdFromDB = async (
  templateId: string
): Promise<DatabaseQueryResponseType> => {
  try {
    const template = await EmailTemplate.findById(templateId).lean();
    
    if (!template) {
      return { error: 'Template not found' };
    }
    
    return { data: template };
  } catch (error: any) {
    return { error: error.message };
  }
};


const updateEmailTemplateInDB = async (
  templateId: string,
  updateData: Partial<EmailTemplateType>
): Promise<DatabaseQueryResponseType> => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true }
    ).lean();
    
    if (!template) {
      return { error: 'Template not found' };
    }
    
    return { data: template };
  } catch (error: any) {
    return { error: error.message };
  }
};




const createEmailCampaignInDB = async (
  campaignData: Omit<EmailCampaignType, '_id' | 'createdAt' | 'updatedAt'>
): Promise<DatabaseQueryResponseType> => {
  try {
    const campaign = new EmailCampaign(campaignData);
    const savedCampaign = await campaign.save();
    return { data: savedCampaign };
  } catch (error: any) {
    return { error: error.message };
  }
};


const getEmailCampaignsFromDB = async (
  status?: string,
  limit = 20
): Promise<DatabaseQueryResponseType> => {
  try {
    const query: any = {};
    if (status) query.status = status;

    const campaigns = await EmailCampaign.find(query)
      .populate('templateId', 'name category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return { data: campaigns };
  } catch (error: any) {
    return { error: error.message };
  }
};




const getLearnerSegmentFromDB = async (
  segment: string,
  filters?: {
    lastActivityDays?: number;
    completionRate?: number;
    signupDays?: number;
    limit?: number;
  }
): Promise<DatabaseQueryResponseType> => {
  try {
    const { lastActivityDays, signupDays, limit = 1000 } = filters || {};
    
    const query: any = {};
    const currentDate = new Date();

    
    switch (segment) {
      case 'ALL_LEARNERS':
        
        break;
      
      case 'ACTIVE_LEARNERS':
        if (lastActivityDays) {
          const activityDate = new Date(currentDate.getTime() - lastActivityDays * 24 * 60 * 60 * 1000);
          query.$or = [
            { 'prepYatra.prepLog.lastLoggedDate': { $gte: activityDate } },
            { updatedAt: { $gte: activityDate } }
          ];
        }
        break;
      
      case 'INACTIVE_LEARNERS':
        if (lastActivityDays) {
          const activityDate = new Date(currentDate.getTime() - lastActivityDays * 24 * 60 * 60 * 1000);
          query.$and = [
            { 'prepYatra.prepLog.lastLoggedDate': { $lt: activityDate } },
            { updatedAt: { $lt: activityDate } }
          ];
        }
        break;
      
      case 'NEW_LEARNERS':
        if (signupDays) {
          const signupDate = new Date(currentDate.getTime() - signupDays * 24 * 60 * 60 * 1000);
          query.createdAt = { $gte: signupDate };
        }
        break;
    }

    const users = await User.find(query)
      .select('_id name email createdAt prepYatra updatedAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      data: {
        segment,
        count: users.length,
        users: users.map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          signupDate: user.createdAt,
          lastActivity: user.prepYatra?.prepLog?.lastLoggedDate || user.updatedAt
        }))
      }
    };
  } catch (error: any) {
    return { error: error.message };
  }
};


const createEmailLogInDB = async (
  logData: {
    campaignId?: string;
    userId: string;
    userEmail: string;
    userName: string;
    templateId: string;
    subject: string;
  }
): Promise<DatabaseQueryResponseType> => {
  try {
    const emailLog = new EmailLog(logData);
    const savedLog = await emailLog.save();
    return { data: savedLog };
  } catch (error: any) {
    return { error: error.message };
  }
};

  
const updateEmailLogStatusInDB = async (
  logId: string,
  status: string,
  metadata?: Record<string, any>
): Promise<DatabaseQueryResponseType> => {
  try {
    const updateData: any = { status };
    
    switch (status) {
      case 'SENT':
        updateData.sentAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        break;
      case 'OPENED':
        updateData.openedAt = new Date();
        break;
      case 'CLICKED':
        updateData.clickedAt = new Date();
        break;
      case 'FAILED':
        updateData.errorMessage = metadata?.errorMessage;
        break;
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    const log = await EmailLog.findByIdAndUpdate(logId, updateData, { new: true }).lean();
    
    if (!log) {
      return { error: 'Email log not found' };
    }
    
    return { data: log };
  } catch (error: any) {
    return { error: error.message };
  }
};

export {
  createEmailTemplateInDB,
  getEmailTemplatesFromDB,
  getEmailTemplateByIdFromDB,
  updateEmailTemplateInDB,
  
  createEmailCampaignInDB,
  getEmailCampaignsFromDB,
  
  getLearnerSegmentFromDB,
  
  createEmailLogInDB,
  updateEmailLogStatusInDB,
};
