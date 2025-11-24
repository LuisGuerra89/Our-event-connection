import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { ChatWindow } from "@/components/chat/chat-window"

interface ChatConversationPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ChatConversationPage({ params }: ChatConversationPageProps) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Await params in Next.js 15
    const { id } = await params

    // Get conversation details
    const { data: conversation, error } = await supabase
        .from("chat_conversations")
        .select(`
      *,
      user1:profiles!chat_conversations_user1_id_fkey(id, full_name, profile_photo_url),
      user2:profiles!chat_conversations_user2_id_fkey(id, full_name, profile_photo_url)
    `)
        .eq("id", id)
        .single()

    if (error || !conversation) {
        notFound()
    }

    // Verify user is part of this conversation
    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
        redirect("/dashboard/chat")
    }

    // Determine the other user
    const otherUser = conversation.user1_id === user.id ? conversation.user2 : conversation.user1

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card>
                <CardContent className="p-0">
                    <ChatWindow
                        conversationId={id}
                        currentUserId={user.id}
                        otherUser={otherUser}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
