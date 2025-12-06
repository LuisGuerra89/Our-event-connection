"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, MessageCircle } from "lucide-react"
import { ProfileModal } from "@/components/profile-modal"
import { ChatModal } from "@/components/chat-modal"
import { MembershipRequiredChatModal } from "@/components/membership-required-chat-modal"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface MatchUser {
  id: string
  display_name: string
  profile_image_url: string | null
  location_city: string | null
  location_state: string | null
  gender: string | null
  bio: string | null
  matchScore?: number
  user_attributes?: any
}

interface MatchesGridProps {
  matches: MatchUser[]
  currentUserId?: string
}

export function MatchesGrid({ matches, currentUserId }: MatchesGridProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<{ userId: string; userName: string; userImage: string } | null>(null)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [pendingChatUser, setPendingChatUser] = useState<{ userId: string; userName: string; userImage: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const checkSubscriptionAndOpenChat = async (userId: string, userName: string, userImage: string) => {
    if (!currentUserId) return

    try {
      // Check subscription status
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("id, status, end_date")
        .eq("user_id", currentUserId)

      const subscription = subscriptions?.[0]
      
      // Check if subscription exists and is active
      if (!subscription || subscription.status !== "active") {
        setPendingChatUser({ userId, userName, userImage })
        setShowMembershipModal(true)
        return
      }

      // Check if subscription has expired
      if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
        setPendingChatUser({ userId, userName, userImage })
        setShowMembershipModal(true)
        return
      }

      // User has active subscription, open chat
      setSelectedChat({ userId, userName, userImage })
    } catch (error) {
      console.error("Error checking subscription:", error)
    }
  }

  const handleUpgrade = () => {
    setShowMembershipModal(false)
    router.push("/membership")
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
        {matches.map((match) => (
          <Card key={match.id} className="group hover:shadow-2xl transition-all duration-300 border-pink-200 dark:border-pink-900 overflow-hidden flex flex-col">
            {match.profile_image_url ? (
              <div className="relative h-48 w-full bg-muted overflow-hidden">
                <img
                  src={match.profile_image_url}
                  alt={match.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600">
                  <Heart className="h-3 w-3 mr-1" />
                  {match.matchScore}% Match
                </Badge>
                <div className="absolute bottom-3 left-3 right-3">
                  <CardTitle className="text-white text-xl mb-1">{match.display_name}</CardTitle>
                  {match.gender && (
                    <CardDescription className="text-white/80 capitalize text-sm">
                      {match.gender}
                    </CardDescription>
                  )}
                </div>
              </div>
            ) : (
              <CardHeader className="pb-3">
                <div className="relative">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-pink-200 dark:ring-pink-800 group-hover:ring-pink-400 transition-all">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                      {match.display_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600">
                    <Heart className="h-3 w-3 mr-1" />
                    {match.matchScore}% Match
                  </Badge>
                </div>
                <CardTitle className="text-center text-xl">{match.display_name}</CardTitle>
                {match.gender && (
                  <CardDescription className="text-center capitalize">
                    {match.gender}
                  </CardDescription>
                )}
              </CardHeader>
            )}
            
            <CardContent className="flex flex-col flex-1 pt-4">
              <div className="space-y-3 flex-1">
                <div className="min-h-[40px]">
                  {match.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {match.bio}
                    </p>
                  )}
                </div>
                
                <div className="min-h-[24px]">
                  {(match.location_city || match.location_state) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <span>
                        {match.location_city && match.location_state
                          ? `${match.location_city}, ${match.location_state}`
                          : match.location_city || match.location_state}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-h-[28px]">
                  {match.user_attributes && (
                    <div className="flex flex-wrap gap-2">
                      {match.user_attributes.hair_color && (
                        <Badge variant="outline" className="text-xs">
                          {match.user_attributes.hair_color}
                        </Badge>
                      )}
                      {match.user_attributes.eye_color && (
                        <Badge variant="outline" className="text-xs">
                          {match.user_attributes.eye_color} eyes
                        </Badge>
                      )}
                      {match.user_attributes.body_type && (
                        <Badge variant="outline" className="text-xs">
                          {match.user_attributes.body_type}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 mt-auto">
                <Button 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
                  onClick={() => setSelectedProfile(match.id)}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                {currentUserId && (
                  <Button 
                    variant="outline" 
                    className="border-pink-300 hover:bg-pink-100 dark:border-pink-800 dark:hover:bg-pink-950"
                    onClick={() => checkSubscriptionAndOpenChat(match.id, match.display_name, match.profile_image_url || "")}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          userId={selectedProfile}
          open={!!selectedProfile}
          onOpenChange={(open) => !open && setSelectedProfile(null)}
          onMessageClick={(userId) => {
            const match = matches.find(m => m.id === userId)
            if (match) {
              checkSubscriptionAndOpenChat(userId, match.display_name, match.profile_image_url || "")
            }
          }}
        />
      )}

      {/* Chat Modal */}
      {selectedChat && currentUserId && (
        <ChatModal
          userId={selectedChat.userId}
          currentUserId={currentUserId}
          userName={selectedChat.userName}
          userImage={selectedChat.userImage}
          open={!!selectedChat}
          onOpenChange={(open) => !open && setSelectedChat(null)}
        />
      )}

      {/* Membership Required Modal */}
      {showMembershipModal && pendingChatUser && (
        <MembershipRequiredChatModal
          isOpen={showMembershipModal}
          onClose={() => {
            setShowMembershipModal(false)
            setPendingChatUser(null)
          }}
          userName={pendingChatUser.userName}
          onUpgrade={handleUpgrade}
        />
      )}
    </>
  )
}
