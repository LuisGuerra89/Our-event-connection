"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface MessageInputProps {
    onSendMessage: (message: string) => Promise<void>
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = async () => {
        const trimmedMessage = message.trim()

        if (!trimmedMessage || isSending) return

        setIsSending(true)

        try {
            await onSendMessage(trimmedMessage)
            setMessage("")

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)

        // Auto-resize textarea
        const textarea = e.target
        textarea.style.height = 'auto'
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }

    return (
        <div className="flex items-end gap-2">
            <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[44px] max-h-[150px] resize-none"
                disabled={isSending}
                rows={1}
            />
            <Button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                size="icon"
                className="flex-shrink-0"
            >
                <Send className="h-4 w-4" />
            </Button>
        </div>
    )
}
