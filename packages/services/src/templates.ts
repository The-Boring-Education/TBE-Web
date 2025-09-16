import { envConfig, routes } from '@tbe/constants';
import type {
  CourseCompletionEmailData,
  CourseEnrollmentEmailData,
  EmailTriggerData,
  InterviewPrepEnrollmentEmailData,
  ProjectEnrollmentEmailData,
} from '@tbe/interface';

const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Boring Education</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
        }
        .main-text {
            font-size: 16px;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .social-links {
            margin: 30px 0;
            text-align: center;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
        }
        .signature {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        .signature-name {
            font-weight: 600;
            color: #2d3748;
        }
        .signature-title {
            color: #718096;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 The Boring Education</h1>
            <p>Building Open Source Tech Education for Bharat 🇮🇳</p>
        </div>
        <div class="content">
            ${content}
            
            <div class="signature">
                <div class="signature-name">Sachin</div>
                <div class="signature-title">Co-founder, The Boring Education</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="https://github.com/The-Boring-Education">GitHub</a>
                <a href="https://www.instagram.com/theboringeducation">Instagram</a>
                <a href="https://www.youtube.com/@TheBoringEducation">YouTube</a>
                <a href="https://prepyatra.theboringeducation.com/">Prep Yatra</a>
            </div>
            <p>
                © 2025 The Boring Education. Building the future of tech education in India.<br>
                <a href="https://www.theboringeducation.com" style="color: #667eea;">www.theboringeducation.com</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (data: EmailTriggerData): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 👋</div>
    
    <div class="main-text">
        Welcome to The Boring Education family! 🎉
        
        <br><br>
        
        I'm Sachin, and I'm thrilled to have you join our mission of making quality tech education accessible to everyone in Bharat. 
        
        <br><br>
        
        We're not just another ed-tech platform - we're a community of learners, builders, and dreamers who believe that education should be:
        <ul>
            <li>🆓 <strong>Free</strong> - Quality education shouldn't be behind paywalls</li>
            <li>🌟 <strong>Practical</strong> - Learn by building real projects</li>
            <li>🇮🇳 <strong>For Bharat</strong> - Designed specifically for Indian students</li>
        </ul>
        
        <br>
        
        Ready to start your journey? Explore our courses and begin building something amazing today!
    </div>
    
    <div style="text-align: center;">
        <a href="https://www.theboringeducation.com" class="cta-button">
            🚀 Start Learning Now
        </a>
    </div>
  `;

  return getBaseTemplate(content);
};

export const courseEnrollmentTemplate = (
  data: CourseEnrollmentEmailData
): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 📚</div>
    
    <div class="main-text">
        Congratulations on enrolling in <strong>${data.courseName}</strong>! 🎉
        
        <br><br>
        
        You've just taken a huge step towards mastering new skills. I'm genuinely excited to see you on this learning journey!
        
        <br><br>
        
        ${
          data.courseDescription
            ? `<em>"${data.courseDescription}"</em><br><br>`
            : ''
        }
        
        Here's what I recommend to make the most of this course:
        <ul>
            <li>📅 <strong>Set a schedule</strong> - Dedicate 30-60 minutes daily</li>
            <li>💪 <strong>Practice actively</strong> - Code along with every example</li>
            <li>🤝 <strong>Join the community</strong> - Connect with fellow learners</li>
            <li>🎯 <strong>Build projects</strong> - Apply what you learn immediately</li>
        </ul>
        
        Remember, the best way to learn is by doing. Don't just watch - build, experiment, and break things!
    </div>
    
    <div style="text-align: center;">
        <a href=${
          envConfig.NEXT_PUBLIC_BASE_URL + routes.user.dashboard
        } class="cta-button">
            📖 Continue Learning
        </a>
    </div>
  `;

  return getBaseTemplate(content);
};

export const projectEnrollmentTemplate = (
  data: ProjectEnrollmentEmailData
): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 🛠️</div>
    
    <div class="main-text">
        Awesome! You've enrolled in the <strong>${
          data.projectName
        }</strong> project! 🚀
        
        <br><br>
        
        This is where the real magic happens - you're not just learning, you're building something that matters. 
        
        <br><br>
        
        ${
          data.projectDescription
            ? `<em>"${data.projectDescription}"</em><br><br>`
            : ''
        }
        
        Here's how to ace this project:
        <ul>
            <li>🎯 <strong>Start small</strong> - Break the project into tiny, manageable tasks</li>
            <li>📝 <strong>Document everything</strong> - Your future self will thank you</li>
            <li>🐛 <strong>Embrace bugs</strong> - They're your best teachers</li>
            <li>🔄 <strong>Iterate fast</strong> - Build, test, improve, repeat</li>
            <li>🌟 <strong>Share your progress</strong> - The community loves to see your journey</li>
        </ul>
        
        Remember, every senior developer started with their first project. You're on the right path!
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
  data: InterviewPrepEnrollmentEmailData
): string =>
  getBaseTemplate(`
    <div class="greeting">Hello ${data.userName}! 👋</div>
    
    <div class="main-text">
      <p>Welcome to your Interview Prep journey! 🎯</p>
      
      <p>You've successfully enrolled in <strong>${data.sheetName}</strong>.</p>
      
      ${data.sheetDescription ? `<p>${data.sheetDescription}</p>` : ''}
      
      <p>This comprehensive interview preparation sheet will help you:</p>
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Master key concepts and algorithms</li>
        <li>Practice with real interview questions</li>
        <li>Build confidence for technical interviews</li>
        <li>Track your progress systematically</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href=${
        envConfig.NEXT_PUBLIC_BASE_URL + routes.user.dashboard
      } class="cta-button">
        Start Your Interview Prep 🚀
      </a>
    </div>
    
    <div class="main-text">
      <p><strong>Pro Tips:</strong></p>
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Set aside dedicated time daily for practice</li>
        <li>Focus on understanding concepts, not just memorizing</li>
        <li>Practice coding problems regularly</li>
        <li>Review and revise completed topics</li>
      </ul>
    </div>
    
    <div class="signature">
      <div class="signature-name">Sachin from The Boring Education</div>
      <div class="signature-title">Your Interview Success Partners</div>
    </div>
  `);

export const courseCompletionTemplate = (
  data: CourseCompletionEmailData
): string =>
  getBaseTemplate(`
    <div class="greeting">Congratulations ${data.userName}! 🎉</div>
    
    <div class="main-text">
      <p>You've successfully completed <strong>${data.courseName}</strong>!</p>
      
      <p>This is a significant milestone in your learning journey. You've demonstrated dedication, persistence, and a commitment to growth.</p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #0369a1;">🎯 What You've Achieved:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Mastered course concepts and practical applications</li>
          <li>Completed all assignments and assessments</li>
          <li>Built real-world projects and skills</li>
          <li>Joined an elite group of course completers</li>
        </ul>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href=${
        envConfig.NEXT_PUBLIC_BASE_URL + routes.user.dashboard
      } class="cta-button">
        Review Your Course 📚
      </a>
      ${
        data.certificateUrl
          ? `
        <a href="${data.certificateUrl}" class="cta-button" style="margin-left: 10px; background: linear-gradient(135deg, #059669 0%, #047857 100%);">
          Download Certificate 🏆
        </a>
      `
          : ''
      }
    </div>
    
    <div class="main-text">
      <p><strong>What's Next?</strong></p>
      <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Apply your new skills to real projects</li>
        <li>Share your knowledge with the community</li>
        <li>Explore advanced courses in related topics</li>
        <li>Consider mentoring other learners</li>
      </ul>
      
      <p>Remember, learning is a continuous journey. Keep building, keep growing, and keep pushing your boundaries!</p>
    </div>
    
    <div class="signature">
      <div class="signature-name">Sachin from The Boring Education</div>
      <div class="signature-title">Proud of Your Achievement!</div>
    </div>
  `);
