"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CommentFormProps {
  bookId: string
}

export function CommentForm({ bookId }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, content }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      setContent("")
      toast.success("Comment posted successfully")
    } catch (error) {
      toast.error("Failed to post comment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add a Comment</h3>
      <Textarea
        placeholder="Write your comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        type="submit" 
        disabled={!content.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  )
}