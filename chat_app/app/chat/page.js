'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ChatList from '@/components/ChatList'
import ChatInterface from '@/components/ChatInterface'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
      } else {
        setUser(session.user)
        loadSessions(session.user.email)
      }
      setLoading(false)
    })
  }, [router, supabase.auth])

  const loadSessions = async (email) => {
    try {
      const response = await fetch(`/api/sessions?email=${email}`)
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleNewChat = () => {
    setCurrentSessionId(null)
  }

  const handleSessionCreated = (sessionId) => {
    setCurrentSessionId(sessionId)
    if (user) {
      loadSessions(user.email)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chat App</h1>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
          <Button onClick={handleNewChat} className="w-full">
            + New Chat
          </Button>
        </div>
        <ChatList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1">
        <ChatInterface
          user={user}
          sessionId={currentSessionId}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  )
}