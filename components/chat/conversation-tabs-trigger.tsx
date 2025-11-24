"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TabsTrigger } from "@/components/ui/tabs"

interface ConversationTabsTriggerProps {
    initialCount: number // This prop is kept for compatibility but we'll fetch unread count
    userId: string
}

export function ConversationTabsTrigger({ userId }: ConversationTabsTriggerProps) {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        loadUnreadCount()

        const supabase = createClient()

        // Subscribe to new messages for unread count
        const channel = supabase
            .channel('chat_messages_count_changes')
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
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages'
                },
                () => {
                    loadUnreadCount()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const loadUnreadCount = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .rpc('get_unread_message_count', { p_user_id: userId })

        if (!error && data !== null) {
            setUnreadCount(data)
        }
    }

    return (
        <TabsTrigger value="conversations">
            Conversations
            {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </TabsTrigger>
    )
}
