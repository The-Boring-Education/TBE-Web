import { config, API_ENDPOINTS } from '@/config'
import { APIClient } from '@/services/base'

// Debug utility to check API URL construction
export function debugAPIUrls() {
  console.log('🔍 API Configuration Debug:')
  console.log('Base URL:', config.API_BASE_URL)
  console.log('')
  
  console.log('📍 Constructed URLs:')
  console.log('Categories:', `${config.API_BASE_URL}${API_ENDPOINTS.QUIZ_CATEGORIES}`)
  console.log('Quiz Questions (test-id):', `${config.API_BASE_URL}${API_ENDPOINTS.QUIZ_QUESTIONS('test-id')}`)
  console.log('Quiz Submit (test-id):', `${config.API_BASE_URL}${API_ENDPOINTS.QUIZ_SUBMIT('test-id')}`)
  console.log('Performance (test-user):', `${config.API_BASE_URL}${API_ENDPOINTS.QUIZ_PERFORMANCE('test-user')}`)
  console.log('Leaderboard:', `${config.API_BASE_URL}${API_ENDPOINTS.QUIZ_LEADERBOARD}`)
  console.log('User Create:', `${config.API_BASE_URL}${API_ENDPOINTS.USER_CREATE}`)
  console.log('User Onboarding:', `${config.API_BASE_URL}${API_ENDPOINTS.USER_ONBOARDING}`)
  console.log('')
  
  console.log('✅ Expected Endpoints:')
  console.log('Categories: http://localhost:3000/api/v1/quiz')
  console.log('Quiz Questions: http://localhost:3000/api/v1/quiz/test-id')
  console.log('Quiz Submit: http://localhost:3000/api/v1/quiz/test-id/submit')
  console.log('Performance: http://localhost:3000/api/v1/quiz/performance/test-user')
  console.log('Leaderboard: http://localhost:3000/api/v1/quiz/leaderboard')
  console.log('User Create: http://localhost:3000/api/v1/user')
  console.log('User Onboarding: http://localhost:3000/api/v1/user/onboarding')
}

// Test the APIClient URL construction
export function testAPIClientUrls() {
  console.log('🧪 Testing APIClient URL Construction:')
  
  const apiClient = new APIClient()
  
  // Test user endpoints
  console.log('User Create:', apiClient['buildURL']('/user'))
  console.log('User Onboarding:', apiClient['buildURL']('/user/onboarding'))
  console.log('User Profile:', apiClient['buildURL']('/user/profile'))
  
  // Test quiz endpoints
  console.log('Quiz Categories:', apiClient['buildURL']('/quiz'))
  console.log('Quiz Questions:', apiClient['buildURL']('/quiz/test-id'))
  console.log('Quiz Submit:', apiClient['buildURL']('/quiz/test-id/submit'))
  
  console.log('')
  console.log('🔧 Base URL being used:', apiClient['baseURL'])
}