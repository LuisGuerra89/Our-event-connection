"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
    id: string
    full_name: string | null
    profile_image_url: string | null
    bio?: string | null
}

interface Match {
    id: string
    matched_user_id: string
    match_score: number
    profile: Profile
}

interface AvailableMatchesProps {
    matches: Match[]
    currentUserId: string
}

export function AvailableMatches({ matches, currentUserId }: AvailableMatchesProps) {
    const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null)
    const router = useRouter()

    const handleStartChat = async (matchedUserId: string) => {
        setLoadingMatchId(matchedUserId)

        try {
            const supabase = createClient()

            // Call the function to get or create conversation
            const { data, error } = await supabase.rpc('get_or_create_conversation', {
                p_user1_id: currentUserId,
                p_user2_id: matchedUserId
            })

            if (error) {
                console.error('Error creating conversation:', error)
                alert('Error starting chat. Please try again.')
                return
            }

            // Redirect to the conversation
            if (data) {
                router.push(`/dashboard/chat/${data}`)
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error starting chat. Please try again.')
        } finally {
            setLoadingMatchId(null)
        }
    }

    if (matches.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No matches yet</p>
                <p className="text-sm mt-1">
                    Complete your profile and attend events to find matches
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={match.profile.profile_image_url || undefined} />
                                <AvatarFallback>
                                    {match.profile.full_name?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">
                                    {match.profile.full_name || "Unknown User"}
                                </h3>

                                {match.profile.bio && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {match.profile.bio}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        onClick={() => handleStartChat(match.matched_user_id)}
                                        disabled={loadingMatchId === match.matched_user_id}
                                        className="w-full"
                                    >
                                        {loadingMatchId === match.matched_user_id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Opening...
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
