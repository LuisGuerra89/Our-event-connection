"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ChatButtonProps {
    userId: string
}

interface Conversation {
    id: string
    last_message_at: string | null
    user1_id: string
    user2_id: string
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

export function ChatButton({ userId }: ChatButtonProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        loadConversations()
        loadUnreadCount()

        // Subscribe to real-time updates
        const supabase = createClient()

        // Subscribe to conversation changes
        const conversationsChannel = supabase
            .channel('chat_conversations_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_conversations',
                    filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`
                },
                () => {
                    loadConversations()
                }
            )
            .subscribe()

        // Subscribe to new messages for unread count
        const messagesChannel = supabase
            .channel('chat_messages_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                () => {
                    loadUnreadCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(conversationsChannel)
            supabase.removeChannel(messagesChannel)
        }
    }, [userId])

    const loadConversations = async () => {
        const supabase = createClient()

        const { data } = await supabase
            .from('chat_conversations')
            .select(`
        *,
        user1:profiles!chat_conversations_user1_id_fkey(id, full_name, profile_image_url),
        user2:profiles!chat_conversations_user2_id_fkey(id, full_name, profile_image_url)
      `)
            .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false, nullsFirst: false })
            .limit(5)

        if (data) {
            setConversations(data as Conversation[])
        }
    }

    const loadUnreadCount = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .rpc('get_unread_message_count', { p_user_id: userId })

        if (!error && data !== null) {
            setUnreadCount(data)
        }
    }

    const getOtherUser = (conversation: Conversation) => {
        return conversation.user1_id === userId ? conversation.user2 : conversation.user1
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Messages"
                >
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Messages</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {unreadCount} unread
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="max-h-[400px] overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No conversations yet</p>
                            <p className="text-xs mt-1">Start chatting with your matches</p>
                        </div>
                    ) : (
                        conversations.map((conversation) => {
                            const otherUser = getOtherUser(conversation)

                            return (
                                <DropdownMenuItem
                                    key={conversation.id}
                                    className="flex items-center gap-3 p-3 cursor-pointer"
                                    onClick={() => {
                                        window.location.href = `/dashboard/chat/${conversation.id}`
                                        setIsOpen(false)
                                    }}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={otherUser.profile_image_url || undefined} />
                                        <AvatarFallback>
                                            {otherUser.full_name?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {otherUser.full_name || "Unknown User"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {conversation.last_message_at
                                                ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                                                : "No messages yet"}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })
                    )}
                </div>

                {conversations.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard/chat"
                                className="w-full text-center text-sm cursor-pointer"
                            >
                                View all conversations
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
