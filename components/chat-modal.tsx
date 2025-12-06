"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ChatModalProps {
  userId: string
  currentUserId: string
  userName?: string
  userImage?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message_text: string
  created_at: string
  is_read: boolean
}

export function ChatModal({ userId, currentUserId, userName, userImage, open, onOpenChange }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open && userId && currentUserId) {
      initializeConversation()
    }
  }, [open, userId, currentUserId])

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`conversation_${conversationId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}` 
          }, 
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message])
            scrollToBottom()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const initializeConversation = async () => {
    console.log("Initializing conversation...", { currentUserId, userId })
    setLoading(true)
    try {
      // Use the RPC function to get or create conversation (handles user ordering)
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        p_user1_id: currentUserId,
        p_user2_id: userId
      })

      if (error) {
        console.error("Error getting/creating conversation:", error)
        throw error
      }
      
      console.log("Got conversation ID:", conversationId)
      setConversationId(conversationId)
    } catch (error) {
      console.error("Error initializing conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!conversationId) return
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("handleSendMessage called", { newMessage, sending, conversationId })
    
    if (!newMessage.trim() || sending || !conversationId) {
      console.log("Message blocked:", { 
        hasMessage: !!newMessage.trim(), 
        sending, 
        hasConversation: !!conversationId 
      })
      return
    }

    const messageToSend = newMessage.trim()
    setNewMessage("") // Clear input immediately
    setSending(true)
    
    try {
      console.log("Sending message to Supabase...")
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message_text: messageToSend,
          message_type: 'text',
          is_read: false
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      console.log("Message sent successfully:", data)
      
      // Update conversation last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
      
      // Add message to state (might already be added by realtime subscription)
      setMessages(prev => {
        // Check if message already exists (from realtime)
        if (prev.some(m => m.id === data.id)) {
          return prev
        }
        return [...prev, data]
      })
      
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
      // Restore message in input on error
      setNewMessage(messageToSend)
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userImage || ""} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                {userName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <DialogTitle>{userName || "User"}</DialogTitle>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender_id === currentUserId
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.message_text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUserId ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="border-t px-6 py-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
