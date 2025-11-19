"use client"

import { useState } from "react"
import { Heart, MessageSquare, Star, BookOpen, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
// import { CommentsSection } from "@/components/chapter-reader/CommentsSection"
import { RatingSection } from "@/components/chapter-reader/RatingSection"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { toggleBookLike, toggleBookSave } from "@/lib/actions"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BookComments } from "./book-comments"

interface BookWithDetails {
  id: string
  title: string
  description: string
  thumbnail?: string
  createdAt: string
  isLiked: boolean
  isBookmarked: boolean
  isSaved: boolean
  userRating?: number
  rating?: number
  totalRatings?: number
  _count: {
    likes: number
    comments: number
    ratings: number
  }
  author: {
    id: string
    name: string
    image?: string
  }
  comments?: Array<Comment>
  ratings?: Array<{ value: number }>
}

export function BookCard({ book }: { book: BookWithDetails }) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(book.isLiked)
  // const [isBookmarked, setIsBookmarked] = useState(book.isBookmarked)
  const [isSaved, setIsSaved] = useState(book.isSaved)
  const [likesCount, setLikesCount] = useState(book._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [showRating, setShowRating] = useState(false)

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
      
      const result = await toggleBookLike(book.id)
      
      if (result.error) {
        throw new Error(result.error)
      }
    } catch (error) {
      setIsLiked(book.isLiked)
      setLikesCount(book._count.likes)
      toast.error("Failed to like book")
    }
  }

  // const handleBookmark = async () => {
  //   try {
  //     setIsBookmarked(!isBookmarked)
      
  //     const result = await toggleBookmark(book.id)
      
  //     if (result.error) {
  //       throw new Error(result.error)
  //     }
      
  //     toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  //   } catch (error) {
  //     setIsBookmarked(book.isBookmarked)
  //     toast.error("Failed to bookmark book")
  //   }
  // }

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved)
      
      const result = await toggleBookSave(book.id)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      toast.success(isSaved ? "Removed from reading list" : "Added to reading list")
    } catch (error) {
      setIsSaved(book.isSaved)
      toast.error("Failed to update reading list")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/chapters/${book.id}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to like comment')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Main Content */}
      <div className="w-full max-w-md h-[80vh] relative rounded-xl overflow-hidden">
        {/* Book Cover */}
        {book.thumbnail ? (
          <Image
            src={book.thumbnail}
            alt={book.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}

        {/* Title Overlay - Top */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h2 className="text-xl font-bold text-white">
            {book.title}
          </h2>
        </div>

        {/* Interaction Buttons - Right */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className=" bg-transparent hover:bg-transparent flex flex-col gap-0"
            onClick={handleLike}
          >
            <Heart 
              className={cn("h-7 w-7 text-white", {
                "fill-current text-red-500": isLiked
              })} 
            />
            <span className="text-xs font-medium text-white mt-1">
              {likesCount}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="bg-transparent hover:bg-transparent flex flex-col gap-0"
            onClick={() => setShowComments(true)}
          >
            <MessageSquare className="h-7 w-7 text-white" />
            <span className="text-xs font-medium text-white mt-1">
              {book._count.comments}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className=" bg-transparent hover:bg-transparent flex flex-col gap-0"
            onClick={() => setShowRating(true)}
          >
            <Star className="h-7 w-7 text-white" />
            <span className="text-xs font-medium text-white mt-1">
              {book.rating ? (
                <>
                  {book.rating.toFixed(1)}
                </>
              ) : (
                "No ratings"
              )}
            </span>
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className={cn(" bg-transparent hover:bg-transparent")}
            onClick={handleSave}
          >
            {isSaved ? (
              <Bookmark className="h-7 w-7 text-primary fill-primary" />
            ) : (
              <Bookmark className="h-7 w-7 text-white" />
            )}
          </Button>
        </div>

        {/* Author Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white">
              <AvatarImage src={book.author.image || ""} />
              <AvatarFallback>{book.author.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${book.author.id}`}
                className="text-white hover:underline font-medium"
              >
                {book.author.name}
              </Link>
              <p className="text-sm text-white/80 line-clamp-2">
                {book.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogTitle title="comments"/>
        <DialogContent className="max-h-[80vh] overflow-auto">
          <BookComments 
            comments={book.comments || []}
            onLikeComment={handleLikeComment}
          />
          
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRating} onOpenChange={setShowRating}>
        <DialogTitle title="ratings"/>
        <DialogContent>
          <RatingSection 
            bookId={book.id} 
            rating={book.rating}
            totalRatings={book.totalRatings}
            userRating={book.userRating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}