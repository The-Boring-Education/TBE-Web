import type { EmailTemplate } from "@/types";

export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: "team-offer-letter",
    name: "Team Offer Letter",
    subject: "Welcome to {{companyName}} - Offer Letter for {{position}}",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Letter - {{companyName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .responsibilities { background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
        .benefits { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{companyName}}</h1>
            <p>Official Offer Letter</p>
        </div>
        
        <div class="content">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>To:</strong> {{candidateName}}<br>
            <strong>Email:</strong> {{candidateEmail}}</p>
            
            <h2>Dear {{candidateName}},</h2>
            
            <p>We are delighted to extend you an offer of employment with {{companyName}} for the position of <strong>{{position}}</strong> in the <strong>{{department}}</strong> department.</p>
            
            <div class="highlight">
                <h3>Position Details:</h3>
                <ul>
                    <li><strong>Position:</strong> {{position}}</li>
                    <li><strong>Department:</strong> {{department}}</li>
                    <li><strong>Start Date:</strong> {{startDate}}</li>
                    {{duration}}
                    <li><strong>Location:</strong> {{location}}</li>
                    {{reportingTo}}
                    {{salary}}
                </ul>
            </div>
            
            <div class="responsibilities">
                <h3>Key Responsibilities:</h3>
                <ul>
                    {{responsibilities}}
                </ul>
            </div>
            
            <div class="benefits">
                <h3>Benefits & Perks:</h3>
                <ul>
                    {{benefits}}
                </ul>
            </div>
            
            <p>We are excited to have you join our team and contribute to our mission of making education accessible and engaging for everyone.</p>
            
            <p>Please review the terms and conditions outlined in this offer letter. If you have any questions, please don't hesitate to reach out to us.</p>
            
            {{additionalTerms}}
            
            <div class="signature">
                <p><strong>Best regards,</strong><br>
                The {{companyName}} Team</p>
            </div>
        </div>
        
        <div class="footer">
            <p>{{companyName}} | Building the future of education</p>
        </div>
    </div>
</body>
</html>`,
    variables: [
      "{{candidateName}}",
      "{{candidateEmail}}",
      "{{position}}",
      "{{department}}",
      "{{startDate}}",
      "{{duration}}",
      "{{salary}}",
      "{{location}}",
      "{{reportingTo}}",
      "{{companyName}}",
      "{{additionalTerms}}",
      "{{responsibilities}}",
      "{{benefits}}",
    ],
    category: "offer-letter",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "devrel-offer-letter",
    name: "DevRel Team Offer Letter",
    subject:
      "Welcome to {{companyName}} DevRel Team - Offer Letter for {{position}}",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevRel Offer Letter - {{companyName}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .responsibilities { background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0; }
        .benefits { background: #e8f5e8; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0; }
        .signature { margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{companyName}}</h1>
            <p>Developer Relations Team - Offer Letter</p>
        </div>
        
        <div class="content">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>To:</strong> {{candidateName}}<br>
            <strong>Email:</strong> {{candidateEmail}}</p>
            
            <h2>Dear {{candidateName}},</h2>
            
            <p>We are thrilled to extend you an offer to join our Developer Relations team at {{companyName}} for the position of <strong>{{position}}</strong>.</p>
            
            <div class="highlight">
                <h3>Position Details:</h3>
                <ul>
                    <li><strong>Position:</strong> {{position}}</li>
                    <li><strong>Start Date:</strong> {{startDate}}</li>
                    {{duration}}
                    <li><strong>Location:</strong> {{location}}</li>
                    {{reportingTo}}
                    {{salary}}
                </ul>
            </div>
            
            <div class="responsibilities">
                <h3>Key Responsibilities:</h3>
                <ul>
                    {{responsibilities}}
                </ul>
            </div>
            
            <div class="benefits">
                <h3>Benefits & Perks:</h3>
                <ul>
                    {{benefits}}
                </ul>
            </div>
            
            <p>As part of our DevRel team, you'll be at the forefront of building relationships with developers, creating engaging content, and representing {{companyName}} in the developer community.</p>
            
            <p>We're excited to have you join our mission to make education accessible and engaging for developers worldwide!</p>
            
            <div class="signature">
                <p><strong>Best regards,</strong><br>
                The {{companyName}} DevRel Team</p>
            </div>
        </div>
        
        <div class="footer">
            <p>{{companyName}} | Empowering developers through education</p>
        </div>
    </div>
</body>
</html>`,
    variables: [
      "{{candidateName}}",
      "{{candidateEmail}}",
      "{{position}}",
      "{{startDate}}",
      "{{duration}}",
      "{{salary}}",
      "{{location}}",
      "{{reportingTo}}",
      "{{responsibilities}}",
      "{{benefits}}",
    ],
    category: "offer-letter",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getTemplateById = (id: string): EmailTemplate | undefined => {
  return defaultEmailTemplates.find((template) => template.id === id);
};

export const getTemplatesByCategory = (
  category: "offer-letter" | "general",
): EmailTemplate[] => {
  return defaultEmailTemplates.filter(
    (template) => template.category === category,
  );
};
