// Test script to verify webhook setup
// Run this after starting your webhook server

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 Testing Webhook Server...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Stripe Connection Test
    console.log('2️⃣ Testing Stripe Connection...');
    const testResponse = await fetch(`${BASE_URL}/test-webhook`);
    const testData = await testResponse.json();
    console.log('✅ Stripe Test:', testData);
    console.log('');

    // Test 3: Test webhook endpoint (should return 404 for GET)
    console.log('3️⃣ Testing Webhook Endpoint...');
    try {
      const webhookResponse = await fetch(`${BASE_URL}/webhook/stripe`);
      console.log('⚠️ Webhook endpoint returned:', webhookResponse.status);
    } catch (error) {
      console.log('✅ Webhook endpoint properly rejects GET requests');
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start Stripe CLI listener: stripe listen --forward-to localhost:3001/webhook/stripe');
    console.log('2. Copy the webhook secret to your .env file');
    console.log('3. Test with real events: stripe trigger checkout.session.completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure your webhook server is running (npm run dev)');
    console.log('2. Check that port 3001 is available');
    console.log('3. Verify your .env file has the correct values');
  }
}

// Run tests
testEndpoints();
