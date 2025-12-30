'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'

export default function ChatList({ sessions, currentSessionId, onSelectSession }) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No chats yet. Start a new chat!
          </p>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentSessionId === session.session_id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => onSelectSession(session.session_id)}
            >
              <p className="text-sm font-medium truncate">
                Chat {session.session_id.slice(0, 8)}...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(session.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  )
}