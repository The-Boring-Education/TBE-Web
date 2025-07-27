import type { 
  EmailTriggerData, 
  CourseEnrollmentEmailData, 
  ProjectEnrollmentEmailData, 
  InterviewPrepEnrollmentEmailData 
} from '@/interfaces/email';

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

export const courseEnrollmentTemplate = (data: CourseEnrollmentEmailData): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 📚</div>
    
    <div class="main-text">
        Congratulations on enrolling in <strong>${data.courseName}</strong>! 🎉
        
        <br><br>
        
        You've just taken a huge step towards mastering new skills. I'm genuinely excited to see you on this learning journey!
        
        <br><br>
        
        ${data.courseDescription ? `<em>"${data.courseDescription}"</em><br><br>` : ''}
        
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
        <a href="${data.courseUrl}" class="cta-button">
            📖 Continue Learning
        </a>
    </div>
  `;
  
  return getBaseTemplate(content);
};

export const projectEnrollmentTemplate = (data: ProjectEnrollmentEmailData): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 🛠️</div>
    
    <div class="main-text">
        Awesome! You've enrolled in the <strong>${data.projectName}</strong> project! 🚀
        
        <br><br>
        
        This is where the real magic happens - you're not just learning, you're building something that matters. 
        
        <br><br>
        
        ${data.projectDescription ? `<em>"${data.projectDescription}"</em><br><br>` : ''}
        
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

export const interviewPrepEnrollmentTemplate = (data: InterviewPrepEnrollmentEmailData): string => {
  const content = `
    <div class="greeting">Hey ${data.userName}! 💼</div>
    
    <div class="main-text">
        Great choice! You've enrolled in <strong>${data.sheetName}</strong> for interview preparation! 🎯
        
        <br><br>
        
        Landing your dream tech job is completely achievable, and you're taking the right steps to get there.
        
        <br><br>
        
        ${data.sheetDescription ? `<em>"${data.sheetDescription}"</em><br><br>` : ''}
        
        Here's my proven strategy for interview success:
        <ul>
            <li>📊 <strong>Consistency over intensity</strong> - Solve 2-3 problems daily rather than 20 once a week</li>
            <li>🧠 <strong>Understand patterns</strong> - Don't just memorize solutions</li>
            <li>⏰ <strong>Time yourself</strong> - Practice under real interview conditions</li>
            <li>🗣️ <strong>Think out loud</strong> - Explain your approach as you code</li>
            <li>📚 <strong>Review regularly</strong> - Revisit problems you found challenging</li>
        </ul>
        
        Remember, every "no" gets you closer to that "yes". Stay consistent, stay confident!
    </div>
    
    <div style="text-align: center;">
        <a href="${data.sheetUrl}" class="cta-button">
            🧩 Start Practicing
        </a>
    </div>
  `;
  
  return getBaseTemplate(content);
};