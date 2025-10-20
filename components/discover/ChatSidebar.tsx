'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Trash2,
  Clock,
} from 'lucide-react'
import { useDiscoveryChats, DiscoveryChat } from '@/hooks/useDiscoveryChats'
import { formatDistanceToNow } from 'date-fns'

interface ChatSidebarProps {
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

export function ChatSidebar({
  currentChatId,
  onChatSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { chats, loading, deleteChat } = useDiscoveryChats()

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this conversation?')) return
    await deleteChat(chatId)
  }

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          aria-label="New chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Conversations</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-3">
        {loading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-muted rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onClick={() => onChatSelect(chat.id)}
                onDelete={(e) => handleDelete(chat.id, e)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

interface ChatItemProps {
  chat: DiscoveryChat
  isActive: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

function ChatItem({ chat, isActive, onClick, onDelete }: ChatItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative rounded-md transition-colors group',
        'hover:bg-muted',
        isActive && 'bg-muted border-l-2 border-primary'
      )}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {chat.title || 'Untitled Chat'}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(chat.updated_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </button>
      {isHovered && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 h-6 w-6 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent flex items-center justify-center"
          aria-label="Delete chat"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
