import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('n8n_chat_sessions')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ sessions: data })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userEmail, sessionId } = await request.json()

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('n8n_chat_sessions')
      .insert([
        { user_email: userEmail, session_id: sessionId }
      ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}