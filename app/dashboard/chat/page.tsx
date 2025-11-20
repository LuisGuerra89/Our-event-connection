import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatList } from "@/components/chat/chat-list"

export default async function ChatPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select(`
      *,
      user1:profiles!chat_conversations_user1_id_fkey(id, full_name, profile_image_url),
      user2:profiles!chat_conversations_user2_id_fkey(id, full_name, profile_image_url)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your matches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Your recent conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatList conversations={conversations || []} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
