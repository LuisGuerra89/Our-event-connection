"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { MessageInput } from "@/components/chat/message-input"

interface Message {
    id: string
    sender_id: string
    message_text: string
    created_at: string
    is_read: boolean
    message_type: string
    attachment_url?: string
}

interface Profile {
    id: string
    full_name: string | null
    profile_photo_url: string | null
}

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
    otherUser: Profile
}

export function ChatWindow({ conversationId, currentUserId, otherUser }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadMessages()
        markAsRead()

        // Subscribe to new messages
        const supabase = createClient()
        const channel = supabase
            .channel(`conversation_${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message])
                    scrollToBottom()

                    // Mark as read if message is from other user
                    if (payload.new.sender_id !== currentUserId) {
                        markAsRead()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, currentUserId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        setIsLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (data && !error) {
            setMessages(data)
        }

        setIsLoading(false)
    }

    const markAsRead = async () => {
        const supabase = createClient()

        await supabase.rpc('mark_conversation_as_read', {
            p_conversation_id: conversationId,
            p_user_id: currentUserId
        })
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async (messageText: string) => {
        const supabase = createClient()

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                conversation_id: conversationId,
                sender_id: currentUserId,
                message_text: messageText,
                message_type: 'text'
            })

        if (error) {
            console.error('Error sending message:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">Loading messages...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.profile_photo_url || undefined} />
                    <AvatarFallback>
                        {otherUser.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{otherUser.full_name || "Unknown User"}</h3>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No messages yet</p>
                            <p className="text-sm mt-1">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCurrentUser = message.sender_id === currentUserId

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.message_text}
                                        </p>
                                        <p
                                            className={`text-xs mt-1 ${isCurrentUser
                                                ? 'text-primary-foreground/70'
                                                : 'text-muted-foreground'
                                                }`}
                                        >
                                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    )
}
