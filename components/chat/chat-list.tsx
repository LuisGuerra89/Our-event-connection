"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

interface Conversation {
  id: string
  last_message_at: string | null
  user1: {
    id: string
    full_name: string | null
    profile_image_url: string | null
  }
  user2: {
    id: string
    full_name: string | null
    profile_image_url: string | null
  }
}

export function ChatList({ conversations, currentUserId }: { conversations: Conversation[]; currentUserId: string }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No conversations yet</p>
        <p className="text-sm">Start chatting with your matches after meeting them at events</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherUser = conversation.user1.id === currentUserId ? conversation.user2 : conversation.user1

        return (
          <Link key={conversation.id} href={`/dashboard/chat/${conversation.id}`}>
            <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherUser.profile_image_url || undefined} />
                <AvatarFallback>{otherUser.full_name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{otherUser.full_name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">
                  {conversation.last_message_at
                    ? new Date(conversation.last_message_at).toLocaleDateString()
                    : "No messages yet"}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Open
              </Button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
