import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatList } from "@/components/chat/chat-list"
import { AvailableMatches } from "@/components/chat/available-matches"
import { ConversationTabsTrigger } from "@/components/chat/conversation-tabs-trigger"

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

  // Get user's referrals (people they referred and who referred them)
  // First, get the user's profile to find who referred them
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", user.id)
    .single()

  // Get people the user referred
  const { data: peopleIReferred } = await supabase
    .from("profiles")
    .select("id, full_name, profile_photo_url, bio")
    .eq("referred_by", user.id)

  // Get the person who referred the user (if any)
  const { data: personWhoReferredMe } = currentProfile?.referred_by
    ? await supabase
      .from("profiles")
      .select("id, full_name, profile_photo_url, bio")
      .eq("id", currentProfile.referred_by)
      .maybeSingle()
    : { data: null }

  // Combine all referrals
  const allReferrals = [
    ...(peopleIReferred || []),
    ...(personWhoReferredMe ? [personWhoReferredMe] : [])
  ]

  // Combine matches and referrals into a single list
  const combinedMatches = [
    ...(matches || []).map(m => ({
      ...m,
      profile: Array.isArray(m.profile) ? m.profile[0] : m.profile
    })),
    ...allReferrals.map(referral => ({
      id: `referral-${referral.id}`,
      matched_user_id: referral.id,
      match_score: 100, // High score for referrals
      profile: referral
    }))
  ]

  // Remove duplicates (in case someone is both a match and a referral)
  const uniqueMatches = combinedMatches.filter((match, index, self) =>
    index === self.findIndex(m => m.matched_user_id === match.matched_user_id)
  )

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your matches and referrals</p>
      </div>

      <Tabs defaultValue="conversations" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <ConversationTabsTrigger initialCount={conversations?.length || 0} userId={user.id} />
          <TabsTrigger value="new-chat">
            Start New Chat
            {uniqueMatches && uniqueMatches.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {uniqueMatches.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Conversations</CardTitle>
              <CardDescription>Recent chats with your matches and referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <ChatList conversations={conversations || []} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available to Chat</CardTitle>
              <CardDescription>Start a conversation with your matches or referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <AvailableMatches matches={uniqueMatches || []} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
