/**
 * Test file for manually testing email functionality
 * This file is for development/testing purposes only
 * 
 * Usage:
 * 1. Set up your environment variables
 * 2. Run: npx ts-node src/services/email/test-email.ts
 */

import { emailTriggerService } from './triggers';
import type { EmailTriggerData, CourseEnrollmentEmailData } from '@/interfaces/email';

async function testWelcomeEmail() {
  console.log('Testing welcome email...');
  
  const testData: EmailTriggerData = {
    userEmail: 'test@example.com', // Replace with your test email
    userName: 'Test User',
    userId: 'test123',
  };

  try {
    const result = await emailTriggerService.sendWelcomeEmail(testData);
    console.log('Welcome email result:', result);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
}

async function testCourseEnrollmentEmail() {
  console.log('Testing course enrollment email...');
  
  const testData: CourseEnrollmentEmailData = {
    userEmail: 'test@example.com', // Replace with your test email
    userName: 'Test User',
    userId: 'test123',
    courseName: 'React Fundamentals',
    courseDescription: 'Learn React from scratch and build amazing web applications',
    courseUrl: 'https://www.theboringeducation.com/shiksha/react-fundamentals',
  };

  try {
    const result = await emailTriggerService.sendCourseEnrollmentEmail(testData);
    console.log('Course enrollment email result:', result);
  } catch (error) {
    console.error('Course enrollment email error:', error);
  }
}

async function runTests() {
  console.log('🧪 Testing Email Service...\n');
  
  await testWelcomeEmail();
  console.log('\n---\n');
  
  await testCourseEnrollmentEmail();
  console.log('\n✅ Email tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testWelcomeEmail, testCourseEnrollmentEmail };