import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request) {
  try {
    const { message, sessionId, userEmail, isNewChat } = await request.json()

    let currentSessionId = sessionId

    // If new chat, generate sessionId and save to database
    if (isNewChat && !sessionId) {
      currentSessionId = randomUUID()
      
      // Save session to database
      await fetch(`http://127.0.0.1:3000/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          sessionId: currentSessionId,
        }),
      })
    }

    // Call n8n webhook with message and sessionId
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: currentSessionId,
      }),
    })

    if (!n8nResponse.ok) {
      throw new Error('n8n webhook failed')
    }

    const data = await n8nResponse.json()

    // n8n returns: [{ "output": "response text" }]
    // Extract the output from the first array element
    const reply = data[0]?.output || 'No response received'

    return NextResponse.json({
      reply,
      sessionId: currentSessionId,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}