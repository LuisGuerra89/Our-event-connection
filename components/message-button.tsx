"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { MembershipRequiredChatModal } from "@/components/membership-required-chat-modal"
import { createClient } from "@/lib/supabase/client"

interface MessageButtonProps {
  recipientId: string
  recipientName: string
  type: "message" | "chat"
}

export function MessageButton({ recipientId, recipientName, type }: MessageButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  const handleUpgrade = () => {
    setIsModalOpen(false)
    router.push("/membership")
  }

  const handleClick = async () => {
    setIsLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check subscription status using user_subscriptions table
      const { data: subscriptions, error: subError } = await supabase
        .from("user_subscriptions")
        .select("id, status, end_date")
        .eq("user_id", user.id)

      // Check if subscription exists and is active
      const subscription = subscriptions?.[0]
      if (!subscription || subscription.status !== "active") {
        setIsLoading(false)
        setIsModalOpen(true)
        return
      }

      // Check if subscription has expired
      if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
        setIsLoading(false)
        setIsModalOpen(true)
        return
      }

      // Ensure consistent ordering (user1_id < user2_id) for chat_conversations table
      const [user1_id, user2_id] = user.id < recipientId ? [user.id, recipientId] : [recipientId, user.id]

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("user1_id", user1_id)
        .eq("user2_id", user2_id)
        .single()

      let conversationId = existingConversation?.id

      if (!conversationId) {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("chat_conversations")
          .insert({
            user1_id,
            user2_id,
          })
          .select("id")
          .single()

        if (error) {
          console.error("Error creating conversation:", error)
          return
        }

        conversationId = newConversation?.id
      }

      // Navigate to chat
      router.push(`/dashboard/chat/${conversationId}`)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        size="sm"
        className="gap-2 bg-red-600 hover:bg-red-700" 
        onClick={handleClick} 
        disabled={isLoading}
      >
        <MessageCircle className="h-4 w-4" />
        {isLoading ? "Loading..." : "Message"}
      </Button>
      
      <MembershipRequiredChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userName={recipientName}
        onUpgrade={handleUpgrade}
        isLoading={isLoading}
      />
    </>
  )
}
