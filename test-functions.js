// Simple test script for Edge Functions
// Run this after starting Supabase locally

const testFunctions = async () => {
  console.log('🧪 Testing Edge Functions...\n')

  // Get the anon key from Supabase (you can copy this from supabase status)
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

  // Test 1: Create Portal Session
  try {
    console.log('1️⃣ Testing create-portal-session...')
    const response = await fetch('http://localhost:54321/functions/v1/create-portal-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({ customerId: 'cus_test123' })
    })
    
    const result = await response.json()
    console.log('✅ create-portal-session response:', result)
  } catch (error) {
    console.log('❌ create-portal-session error:', error.message)
  }

  // Test 2: Stripe Webhook (basic test)
  try {
    console.log('\n2️⃣ Testing stripe-webhook...')
    const response = await fetch('http://localhost:54321/functions/v1/stripe-webhook', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({ test: 'data' })
    })
    
    const result = await response.json()
    console.log('✅ stripe-webhook response:', result)
  } catch (error) {
    console.log('❌ stripe-webhook error:', error.message)
  }

  console.log('\n🎉 Function tests completed!')
}

// Run tests
testFunctions()
