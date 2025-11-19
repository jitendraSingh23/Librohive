import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
  isLiked: boolean
  _count: {
    likes: number
  }
}

interface BookCommentsProps {
  comments: Comment[]
  onLikeComment: (commentId: string) => void
}

export function BookComments({ comments, onLikeComment }: BookCommentsProps) {
  // Filter out any replies if they exist in the data
  const mainComments = comments.filter(comment => !comment.parentId)

  return (
    <div className="space-y-4">
      {mainComments.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          No comments yet
        </p>
      ) : (
        <div className="space-y-4">
          {mainComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.image || ""} />
                <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => onLikeComment(comment.id)}
                >
                  <Heart 
                    className={cn("h-4 w-4 mr-1", {
                      "fill-current text-red-500": comment.isLiked
                    })} 
                  />
                  <span className="text-xs">{comment._count.likes}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}