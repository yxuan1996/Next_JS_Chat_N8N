const baseUrl = 'http://localhost:3000' // Change if different

async function testSessionsAPI() {
  console.log('\n🧪 Testing Sessions API...\n')

  const testEmail = 'test@example.com'
  const testSessionId = `test-session-${Date.now()}`

  try {
    // Test POST - Create session
    console.log('1️⃣ Creating new session...')
    const createResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: testEmail,
        sessionId: testSessionId,
      }),
    })

    const createResult = await createResponse.json()
    console.log('✅ Create Response:', createResult)

    // Test GET - Fetch sessions
    console.log('\n2️⃣ Fetching sessions...')
    const fetchResponse = await fetch(`${baseUrl}/api/sessions?email=${testEmail}`)
    const fetchResult = await fetchResponse.json()
    console.log('✅ Fetch Response:', fetchResult)
    console.log(`   Found ${fetchResult.sessions?.length || 0} sessions`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testChatAPI() {
  console.log('\n🧪 Testing Chat API...\n')

  const testEmail = 'test@example.com'

  try {
    // Test new chat
    console.log('1️⃣ Sending first message (new chat)...')
    const firstResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        sessionId: null,
        userEmail: testEmail,
        isNewChat: true,
      }),
    })

    const firstResult = await firstResponse.json()
    console.log('✅ First Message Response:')
    console.log('   Session ID:', firstResult.sessionId)
    console.log('   Reply:', firstResult.reply?.substring(0, 100) + '...')

    // Test follow-up message
    console.log('\n2️⃣ Sending follow-up message...')
    const followUpResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'This is a follow-up message',
        sessionId: firstResult.sessionId,
        userEmail: testEmail,
        isNewChat: false,
      }),
    })

    const followUpResult = await followUpResponse.json()
    console.log('✅ Follow-up Response:')
    console.log('   Session ID:', followUpResult.sessionId)
    console.log('   Reply:', followUpResult.reply?.substring(0, 100) + '...')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...')
  console.log('⚠️  Make sure your dev server is running on', baseUrl)

  await testSessionsAPI()
  await testChatAPI()

  console.log('\n✨ Tests completed!\n')
}

runAllTests()