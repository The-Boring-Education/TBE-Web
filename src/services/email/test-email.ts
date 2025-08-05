/**
 * Enhanced test file for email functionality with comprehensive logging
 * This file is for development/testing purposes only
 *
 * Usage:
 * 1. Set up your environment variables (EMAIL_API_KEY, EMAIL_SERVICE_URL)
 * 2. Update TEST_EMAIL constant with your email
 * 3. Run: npx ts-node src/services/email/test-email.ts
 */

import { emailTriggerService } from './triggers';
import type {
  EmailTriggerData,
  CourseEnrollmentEmailData,
  ProjectEnrollmentEmailData,
  InterviewPrepEnrollmentEmailData,
} from '@/interfaces/email';
import { emailLogger } from '@/utils/emailLogger';
import { envConfig } from '@/constant';

// Replace with your test email
const TEST_EMAIL = 'test@example.com';

async function validateEnvironment(): Promise<boolean> {
  console.log('🔍 Validating environment configuration...\n');

  const requiredEnvVars = {
    EMAIL_SERVICE_URL: envConfig.EMAIL_SERVICE_URL,
    EMAIL_API_KEY: envConfig.EMAIL_API_KEY,
    FROM_EMAIL: envConfig.FROM_EMAIL,
  };

  let isValid = true;

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.error(`❌ Missing required environment variable: ${key}`);
      isValid = false;
    } else {
      console.log(
        `✅ ${key}: ${key === 'EMAIL_API_KEY' ? '***HIDDEN***' : value}`
      );
    }
  }

  console.log('');
  return isValid;
}

async function testWelcomeEmail() {
  console.log('📧 Testing welcome email...\n');

  const testData: EmailTriggerData = {
    userEmail: TEST_EMAIL,
    userName: 'Test User',
    userId: 'test123',
  };

  try {
    const result = await emailTriggerService.sendWelcomeEmail(testData);
    console.log('Welcome email result:', {
      success: result.success,
      requestId: result.requestId,
      message: result.message,
      error: result.error,
    });
    return result;
  } catch (error) {
    console.error('Welcome email error:', error);
    return null;
  }
}

async function testCourseEnrollmentEmail() {
  console.log('📚 Testing course enrollment email...\n');

  const testData: CourseEnrollmentEmailData = {
    userEmail: TEST_EMAIL,
    userName: 'Test User',
    userId: 'test123',
    courseName: 'React Fundamentals',
    courseDescription:
      'Learn React from scratch and build amazing web applications',
    courseUrl: 'https://www.theboringeducation.com/shiksha/react-fundamentals',
  };

  try {
    const result = await emailTriggerService.sendCourseEnrollmentEmail(
      testData
    );
    console.log('Course enrollment email result:', {
      success: result.success,
      requestId: result.requestId,
      message: result.message,
      error: result.error,
    });
    return result;
  } catch (error) {
    console.error('Course enrollment email error:', error);
    return null;
  }
}

async function testProjectEnrollmentEmail() {
  console.log('🛠️ Testing project enrollment email...\n');

  const testData: ProjectEnrollmentEmailData = {
    userEmail: TEST_EMAIL,
    userName: 'Test User',
    userId: 'test123',
    projectName: 'Todo App',
    projectDescription:
      'Build a full-stack todo application with React and Node.js',
    projectUrl: 'https://www.theboringeducation.com/projects/todo-app',
  };

  try {
    const result = await emailTriggerService.sendProjectEnrollmentEmail(
      testData
    );
    console.log('Project enrollment email result:', {
      success: result.success,
      requestId: result.requestId,
      message: result.message,
      error: result.error,
    });
    return result;
  } catch (error) {
    console.error('Project enrollment email error:', error);
    return null;
  }
}

async function testInterviewPrepEmail() {
  console.log('💼 Testing interview prep email...\n');

  const testData: InterviewPrepEnrollmentEmailData = {
    userEmail: TEST_EMAIL,
    userName: 'Test User',
    userId: 'test123',
    sheetName: 'DSA Practice Sheet',
    sheetDescription:
      'Comprehensive data structures and algorithms practice problems',
    sheetUrl: 'https://www.theboringeducation.com/interview-prep/dsa-sheet',
  };

  try {
    const result = await emailTriggerService.sendInterviewPrepEnrollmentEmail(
      testData
    );
    console.log('Interview prep email result:', {
      success: result.success,
      requestId: result.requestId,
      message: result.message,
      error: result.error,
    });
    return result;
  } catch (error) {
    console.error('Interview prep email error:', error);
    return null;
  }
}

async function runAllTests() {
  console.log('🧪 Testing Email Service with Enhanced Logging...\n');
  console.log('='.repeat(60));

  // Validate environment first
  const envValid = await validateEnvironment();
  if (!envValid) {
    console.error(
      '❌ Environment validation failed. Please check your environment variables.'
    );
    return;
  }

  console.log('='.repeat(60));

  const results = [];

  // Test all email types
  results.push(await testWelcomeEmail());
  console.log('\n' + '-'.repeat(40) + '\n');

  results.push(await testCourseEnrollmentEmail());
  console.log('\n' + '-'.repeat(40) + '\n');

  results.push(await testProjectEnrollmentEmail());
  console.log('\n' + '-'.repeat(40) + '\n');

  results.push(await testInterviewPrepEmail());
  console.log('\n' + '='.repeat(60) + '\n');

  // Print test summary
  const successCount = results.filter((r) => r?.success).length;
  const totalTests = results.length;

  console.log('🎯 Test Summary:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${totalTests - successCount}`);
  console.log(
    `Success Rate: ${((successCount / totalTests) * 100).toFixed(2)}%\n`
  );

  // Print metrics from emailLogger
  emailLogger.printMetricsSummary();

  console.log('\n✅ Email testing completed!');

  if (successCount < totalTests) {
    console.log(
      '\n⚠️ Some tests failed. Check the logs above for detailed error information.'
    );
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testWelcomeEmail,
  testCourseEnrollmentEmail,
  testProjectEnrollmentEmail,
  testInterviewPrepEmail,
  runAllTests,
};
