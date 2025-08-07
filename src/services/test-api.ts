// Test script for Bank Statement Converter API integration
// This file can be used to test the API integration manually

import { apiService } from './api';

export async function testApiIntegration() {
  console.log('🧪 Testing Bank Statement Converter API integration...');
  
  try {
    // Test 1: Health Check (User Credits)
    console.log('1️⃣ Testing health check...');
    const healthResult = await apiService.healthCheck();
    console.log('✅ Health check passed:', healthResult);
    
    // Test 2: Get User Credits
    console.log('2️⃣ Testing user credits...');
    const creditsResult = await apiService.getUserCredits();
    console.log('✅ User credits:', {
      paidCredits: creditsResult.credits.paidCredits,
      freeCredits: creditsResult.credits.freeCredits,
      unlimited: creditsResult.unlimitedCredits
    });
    
    console.log('🎉 API integration test completed successfully!');
    return {
      success: true,
      health: healthResult,
      credits: creditsResult
    };
    
  } catch (error) {
    console.error('❌ API integration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test file validation
export function testFileValidation() {
  console.log('🧪 Testing file validation...');
  
  // Test valid file
  const validFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
  const validResult = apiService.validatePdfFile(validFile);
  console.log('✅ Valid PDF test:', validResult);
  
  // Test invalid file type
  const invalidFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
  const invalidResult = apiService.validatePdfFile(invalidFile);
  console.log('✅ Invalid file test:', invalidResult);
  
  // Test oversized file (simulate 15MB file)
  const oversizedFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
  const oversizedResult = apiService.validatePdfFile(oversizedFile);
  console.log('✅ Oversized file test:', oversizedResult);
  
  return {
    validFile: validResult,
    invalidFile: invalidResult,
    oversizedFile: oversizedResult
  };
}

// Usage example:
// import { testApiIntegration, testFileValidation } from './services/test-api';
// testApiIntegration().then(result => console.log(result));
// testFileValidation();
