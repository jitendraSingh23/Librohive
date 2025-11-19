import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type Comment, type User } from "@prisma/client"

interface CommentItemProps {
  comment: Comment & {
    user: User;
    _count: {
      likes: number;
      replies: number;
    };
    isLiked: boolean;
  };
  onReply: (commentId: string, content: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  currentUserId?: string;
}

export function CommentItem({ comment, onReply, onLike, onDelete, currentUserId }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await onReply(comment.id, replyContent)
      setReplyContent("")
      setIsReplying(false)
      toast({
        title: "Success",
        description: "Your reply has been posted.",
      })
    } catch (error) {
      console.error('Error posting reply:', error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async () => {
    try {
      await onLike(comment.id)
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    try {
      await onDelete(comment.id)
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.image || ""} alt={comment.user.name || ""} />
        <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          {currentUserId === comment.userId && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm mt-1">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleLike}
          >
            <Heart
              className={`h-4 w-4 mr-1 ${
                comment.isLiked ? "fill-current text-red-500" : ""
              }`}
            />
            {comment._count.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            {comment._count.replies}
          </Button>
        </div>
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReplying(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 