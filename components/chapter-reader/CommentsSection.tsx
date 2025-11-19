import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Loader2, Trash2, MessageCircle, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type CommentsSectionProps } from "./types"

export function CommentsSection({
  comments,
  user,
  session,
  onAddComment,
  onDeleteComment,
  onLikeComment
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment.trim())
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(replyContent.trim(), parentId)
      setReplyContent("")
      setReplyingTo(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderComment = (comment: CommentsSectionProps['comments'][0], level = 0) => (
    <div key={comment.id} className="relative">
      {/* Vertical line connecting parent and child comments */}
      {level > 0 && (
        <div 
          className="absolute left-4 top-0 bottom-0 w-px bg-border"
          style={{ marginLeft: `${(level - 1) * 2}rem` }}
        />
      )}
      
      <div className="flex gap-4" style={{ marginLeft: `${level * 2}rem` }}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.image || ""} alt={comment.user.name || ""} />
          <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={comment.isLiked ? "text-red-500" : ""}
                onClick={() => onLikeComment(comment.id)}
                disabled={!session?.user}
              >
                <Heart className="h-4 w-4 mr-1" />
                {comment._count?.likes || 0}
              </Button>
              {session?.user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              {comment.userId === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>

          {replyingTo === comment.id && (
            <div className="mt-4">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Reply'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyContent("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => renderComment(reply, level + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold mb-4">Comments</h3>

      {session?.user ? (
        <div className="mb-6">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Please sign in to add comments
          </p>
          <Button variant="outline" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
        </div>
      )}

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 