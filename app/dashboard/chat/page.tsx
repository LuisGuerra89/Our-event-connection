import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatList } from "@/components/chat/chat-list"
import { AvailableMatches } from "@/components/chat/available-matches"

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Get existing conversations
  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select(`
      *,
      user1:profiles!chat_conversations_user1_id_fkey(id, full_name, profile_photo_url),
      user2:profiles!chat_conversations_user2_id_fkey(id, full_name, profile_photo_url)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  // Get user's matches
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      matched_user_id,
      match_score,
      profile:profiles!matches_matched_user_id_fkey(id, full_name, profile_photo_url, bio)
    `)
    .eq("user_id", user.id)
    .order("match_score", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your matches</p>
      </div>

      <Tabs defaultValue="conversations" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="conversations">
            Conversations
            {conversations && conversations.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {conversations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="new-chat">
            Start New Chat
            {matches && matches.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {matches.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Conversations</CardTitle>
              <CardDescription>Recent chats with your matches</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatList conversations={conversations || []} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Matches</CardTitle>
              <CardDescription>Start a conversation with your matches</CardDescription>
            </CardHeader>
            <CardContent>
              <AvailableMatches matches={matches || []} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
