"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns"
import { MessageInput } from "@/components/chat/message-input"

interface Message {
    id: string
    conversation_id: string
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
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastTypingSentRef = useRef<number>(0)

    useEffect(() => {
        loadMessages()
        markAsRead()

        // Subscribe to new messages and typing events
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
                    setIsOtherUserTyping(false) // Stop typing indicator when message received

                    // Mark as read if message is from other user
                    if (payload.new.sender_id !== currentUserId) {
                        markAsRead()
                    }
                }
            )
            .on(
                'broadcast',
                { event: 'typing' },
                (payload) => {
                    // Only show if it's from the other user
                    if (payload.payload.sender_id !== currentUserId) {
                        setIsOtherUserTyping(true)

                        // Clear existing timeout
                        if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current)
                        }

                        // Set new timeout to hide indicator after 3 seconds
                        typingTimeoutRef.current = setTimeout(() => {
                            setIsOtherUserTyping(false)
                        }, 3000)

                        scrollToBottom()
                    }
                }
            )
            .subscribe()

        return () => {
            console.log('[Chat] Cleaning up Realtime subscription')
            supabase.removeChannel(channel)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
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
            .select()
            .single()

        if (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleTyping = async () => {
        const now = Date.now()
        // Throttle typing events to once every 2 seconds
        if (now - lastTypingSentRef.current > 2000) {
            lastTypingSentRef.current = now
            const supabase = createClient()
            await supabase.channel(`conversation_${conversationId}`).send({
                type: 'broadcast',
                event: 'typing',
                payload: { sender_id: currentUserId }
            })
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
        <div className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden border rounded-lg bg-background shadow-sm">
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center gap-3 bg-card/50 shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser.profile_photo_url || undefined} />
                    <AvatarFallback>
                        {otherUser.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{otherUser.full_name || "Unknown User"}</h3>
                    {isOtherUserTyping && (
                        <p className="text-xs text-muted-foreground animate-pulse">typing...</p>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 w-full">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No messages yet</p>
                            <p className="text-sm mt-1">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isCurrentUser = message.sender_id === currentUserId

                            // Date separator logic
                            const messageDate = new Date(message.created_at)
                            const previousMessage = index > 0 ? messages[index - 1] : null
                            const previousMessageDate = previousMessage ? new Date(previousMessage.created_at) : null

                            const showDateSeparator = !previousMessage ||
                                messageDate.toDateString() !== previousMessageDate?.toDateString()

                            let dateSeparatorText = ""
                            if (showDateSeparator) {
                                if (isToday(messageDate)) {
                                    dateSeparatorText = "Today"
                                } else if (isYesterday(messageDate)) {
                                    dateSeparatorText = "Yesterday"
                                } else {
                                    dateSeparatorText = format(messageDate, "MMMM d, yyyy")
                                }
                            }

                            return (
                                <div key={message.id}>
                                    {showDateSeparator && (
                                        <div className="flex justify-center my-4 sticky top-0 z-10">
                                            <span className="bg-muted/80 backdrop-blur-sm text-muted-foreground text-xs px-3 py-1 rounded-full shadow-sm border">
                                                {dateSeparatorText}
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words break-all">
                                                {message.message_text}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${isCurrentUser
                                                    ? 'text-primary-foreground/70'
                                                    : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {format(new Date(message.created_at), "h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    {isOtherUserTyping && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-4 py-2">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="border-t p-4 bg-card/50 shrink-0">
                <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
            </div>
        </div>
    )
}
