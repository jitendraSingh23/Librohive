import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CommentItem } from "./CommentItem"
import { type Comment, type User } from "@prisma/client"

interface CommentListProps {
  chapterId: string;
  currentUserId?: string;
}

interface CommentWithUser extends Comment {
  user: User;
  _count: {
    likes: number;
    replies: number;
  };
  isLiked: boolean;
  replies?: CommentWithUser[];
}

export function CommentList({ chapterId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/comments`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [chapterId])

  const handleReply = async (commentId: string, content: string) => {
    const response = await fetch(`/api/chapters/${chapterId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error('Failed to post reply')
    }

    const newReply = await response.json()
    
    // Update the comments state to include the new reply
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          _count: {
            ...comment._count,
            replies: comment._count.replies + 1
          },
          replies: [newReply, ...(comment.replies || [])]
        }
      }
      return comment
    }))
  }

  const handleLike = async (commentId: string) => {
    const response = await fetch(`/api/chapters/${chapterId}/comments/${commentId}/like`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('Failed to like comment')
    }

    const updatedComment = await response.json()
    
    // Update the comments state to reflect the like status
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: updatedComment.isLiked,
          _count: {
            ...comment._count,
            likes: updatedComment._count.likes
          }
        }
      }
      // Also update replies if they exist
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: updatedComment.isLiked,
                _count: {
                  ...reply._count,
                  likes: updatedComment._count.likes
                }
              }
            }
            return reply
          })
        }
      }
      return comment
    }))
  }

  const handleDelete = async (commentId: string) => {
    const response = await fetch(`/api/chapters/${chapterId}/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete comment')
    }

    // Update the comments state to remove the deleted comment
    setComments(prev => {
      // First try to find and remove from top-level comments
      const filteredComments = prev.filter(comment => comment.id !== commentId)
      
      // Then try to find and remove from replies
      return filteredComments.map(comment => {
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId)
          }
        }
        return comment
      })
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No comments yet. Be the first to comment!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <CommentItem
            comment={comment}
            onReply={handleReply}
            onLike={handleLike}
            onDelete={currentUserId === comment.userId ? handleDelete : undefined}
            currentUserId={currentUserId}
          />
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={handleReply}
                  onLike={handleLike}
                  onDelete={currentUserId === reply.userId ? handleDelete : undefined}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 