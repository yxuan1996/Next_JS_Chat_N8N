'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase'

export default function ChatInterface({ user, sessionId, onSessionCreated }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const supabase = createClient()

  // Load messages and setup realtime subscription when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId)
      
      // Subscribe to realtime changes
      const channel = supabase
        .channel('n8n_chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'n8n_chat_messages',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log('New message received:', payload)
            // Add the new message to the list
            const newMessage = payload.new
            const formattedMessage = {
              role: newMessage.message.type === 'human' ? 'user' : 'assistant',
              content: newMessage.message.text || newMessage.message.content || '',
            }
            setMessages((prev) => [...prev, formattedMessage])
          }
        )
        .subscribe()

      // Cleanup subscription on unmount or session change
      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      // Clear messages for new chat
      setMessages([])
    }
  }, [sessionId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async (sid) => {
    try {
      const response = await fetch(`/api/messages?sessionId=${sid}`)
      const data = await response.json()
      
      if (data.messages) {
        // Transform database messages to chat format
        const formattedMessages = data.messages.map(msg => ({
          role: msg.message.type === 'human' ? 'user' : 'assistant',
          content: msg.message.text || msg.message.content || '',
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    const isNewChat = !sessionId
    setInput('')
    
    // Optimistically add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          userEmail: user.email,
          isNewChat: isNewChat,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // If new session was created, notify parent
      if (isNewChat && data.sessionId) {
        onSessionCreated(data.sessionId)
      }

      // Add assistant response optimistically
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto pb-4">
              {messages.map((message, index) => (
                <Card
                  key={index}
                  className={`p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white ml-auto max-w-[80%]'
                      : 'bg-white max-w-[80%]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
              ))}
              {loading && (
                <Card className="p-4 bg-white max-w-[80%]">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Fixed Input Bar at Bottom */}
      <div className="border-t bg-white shadow-lg">
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex gap-3 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 min-h-[56px] text-base resize-none"
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="h-[56px] px-8"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}