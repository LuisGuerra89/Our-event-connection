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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
                    {/* Profile Image Header */}
                    {match.profile.profile_image_url ? (
                        <div className="relative h-40 w-full bg-muted overflow-hidden">
                            <img
                                src={match.profile.profile_image_url}
                                alt={match.profile.full_name || "User"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    ) : (
                        <div className="h-40 w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-xl font-bold">
                                    {match.profile.full_name?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    <CardContent className="p-5 flex-1 flex flex-col">
                        {/* User Info */}
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">
                                {match.profile.full_name || "Unknown User"}
                            </h3>

                            {match.profile.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                                    {match.profile.bio}
                                </p>
                            )}

                            {match.match_score && match.match_score < 100 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs font-semibold text-muted-foreground">Match Score:</span>
                                    <span className="text-sm font-bold text-primary">{match.match_score}%</span>
                                </div>
                            )}
                        </div>

                        {/* Send Message Button */}
                        <Button
                            onClick={() => handleStartChat(match.matched_user_id)}
                            disabled={loadingMatchId === match.matched_user_id}
                            className="w-full mt-4"
                            size="sm"
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
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
