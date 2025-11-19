"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { BookChapterHeader } from "./BookChapterHeader"
import { ChapterContent } from "./ChapterContent"
import { CommentsSection } from "./CommentsSection"
import { RatingSection } from "./RatingSection"
import { BookInfo, BookmarkSection, ChaptersList, AuthorInfo } from "./ChapterSidebar"
import { type ChapterReaderProps, type Bookmark, type AuthorData, type Comment } from "./types"

export function ChapterReader({
  book,
  chapter: initialChapter,
  user
}: ChapterReaderProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)
  const viewUpdateRef = useRef(false)
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)

  // Initialize fullscreen state from URL
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('fullscreen') === 'true'
    }
    return false
  })

  // Update URL when fullscreen state changes
  useEffect(() => {
    const url = new URL(window.location.href)
    if (isFullscreen) {
      url.searchParams.set('fullscreen', 'true')
    } else {
      url.searchParams.delete('fullscreen')
    }
    window.history.replaceState({}, '', url.toString())
  }, [isFullscreen])

  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(book.likes?.length || 0)
  const [viewCount, setViewCount] = useState(book.views || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [chapter] = useState(initialChapter)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [authorData, setAuthorData] = useState<AuthorData>({ books: [], followers: [] })
  const [comments, setComments] = useState<Comment[]>([])

  // Track reading progress using window scroll
  useEffect(() => {
    if (!session?.user || !contentRef.current) return

    const handleScroll = () => {
      const content = contentRef.current
      if (!content) return

      // Get the element's position relative to the viewport
      const rect = content.getBoundingClientRect()
      const contentTop = rect.top
      const windowHeight = window.innerHeight
      const totalHeight = rect.height
      
      // Calculate progress based on how much content has been scrolled past
      const progress = Math.min(
        Math.round(((windowHeight - contentTop) / totalHeight) * 100),
        100
      )

      // Only update if progress has increased
      if (progress > currentProgress) {
        setCurrentProgress(progress)
        
        // If progress is >= 80%, mark as complete
        if (progress >= 80 && !hasUpdatedProgress) {
          console.log('Marking chapter as complete')
          updateReadingProgress(100)
          setHasUpdatedProgress(true)
        }
      }
    }

    // Add scroll listener to window
    console.log('Adding scroll listener')
    window.addEventListener('scroll', handleScroll)
    
    // Check initial position
    handleScroll()
    
    return () => {
      console.log('Removing scroll listener')
      window.removeEventListener('scroll', handleScroll)
    }
  }, [session?.user, hasUpdatedProgress, currentProgress, chapter.id])

  // Function to update reading progress
  const updateReadingProgress = async (progress: number) => {
    if (!session?.user) {
      console.log('No user session, skipping progress update')
      return
    }

    console.log('Sending progress update request:', {
      chapterId: chapter.id,
      progress,
      endpoint: `/api/chapters/${chapter.id}/progress`
    })

    try {
      const response = await fetch(`/api/chapters/${chapter.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Progress update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error
        })
        throw new Error(data.error || 'Failed to update progress')
      }

      console.log('Progress update successful:', data)

      // Create a new book object with the updated chapter
      const updatedBook = {
        ...book,
        chapters: book.chapters.map(ch => 
          ch.id === chapter.id 
            ? { 
                ...ch, 
                readingProgress: [{ 
                  progress,
                  userId: session.user.id,
                  chapterId: chapter.id
                }] 
              }
            : ch
        ),
      }

      // Force a re-render of the BookInfo component
      console.log('Dispatching progress update event with book:', updatedBook)
      window.dispatchEvent(new CustomEvent('bookProgressUpdated', { 
        detail: updatedBook 
      }))

    } catch (error) {
      console.error('Error updating reading progress:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reading progress",
        variant: "destructive",
      })
    }
  }

  // Fetch initial like status and count
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/books/${book.id}/likes`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.isLiked)
          setLikeCount(data.likeCount)
        }
      } catch (error) {
        console.error('Error fetching like status:', error)
      }
    }

    fetchLikeStatus()
  }, [session?.user, book.id])

  // Fetch initial save status
  useEffect(() => {
    const fetchSaveStatus = async () => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/books/${book.id}/saves`)
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.isSaved)
        }
      } catch (error) {
        console.error('Error fetching save status:', error)
      }
    }

    fetchSaveStatus()
  }, [session?.user, book.id])

  // Fetch bookmarks when component mounts
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!session?.user) {
        console.log("[BOOKMARKS] No user session, skipping fetch")
        return
      }

      if (!book?.id) {
        console.log("[BOOKMARKS] No book ID available, skipping fetch")
        return
      }

      try {
        console.log("[BOOKMARKS] Fetching bookmarks for book:", book.id)
        const response = await fetch(`/api/books/${book.id}/bookmarks?chapterId=${chapter.id}`)
        console.log("[BOOKMARKS] Response status:", response.status)
        
        if (!response.ok) {
          let errorMessage = `Failed to fetch bookmarks: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
            console.error("[BOOKMARKS] Error response data:", errorData)
          } catch {
            // If we can't parse the error response as JSON, use the status text
            errorMessage = response.statusText || errorMessage
            console.error("[BOOKMARKS] Non-JSON error response:", response.statusText)
          }
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        console.log("[BOOKMARKS] Received bookmarks:", data)
        setBookmarks(data || [])
      } catch (error) {
        console.error('[BOOKMARKS] Error details:', error)
        // Don't show error toast for missing bookmarks, just set empty array
        if (error instanceof Error && error.message.includes("Book not found")) {
          console.log("[BOOKMARKS] Book not found, setting empty bookmarks array")
          setBookmarks([])
          return
        }
        toast({
          title: "Error",
          description: "Failed to load bookmarks. Please try again later.",
          variant: "destructive",
        })
      }
    }

    fetchBookmarks()
  }, [book?.id, chapter.id, session?.user, toast])

  // Fetch author data
  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const response = await fetch(`/api/authors/${book.author.id}`)
        if (!response.ok) throw new Error('Failed to fetch author data')
        const data = await response.json()
        setAuthorData(data)
      } catch (error) {
        console.error('Failed to fetch author data:', error)
      }
    }

    fetchAuthorData()
  }, [book.author.id])

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/chapters/${chapter.id}/comments`)
        if (!response.ok) throw new Error('Failed to fetch comments')
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }

    fetchComments()
  }, [chapter.id])

  // Update view count when component mounts
  useEffect(() => {
    const updateViewCount = async () => {
      // Prevent multiple calls in development mode
      if (viewUpdateRef.current) return
      viewUpdateRef.current = true

      try {
        const response = await fetch(`/api/books/${book.id}/views`, {
          method: 'POST',
        })
        if (response.ok) {
          const data = await response.json()
          setViewCount(data.views)
        }
      } catch (error) {
        console.error('Error updating view count:', error)
        // Reset the ref if there was an error
        viewUpdateRef.current = false
      }
    }

    updateViewCount()
  }, [book.id])

  const handleToggleLike = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this book",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/books/${book.id}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikeCount(data.likeCount)
        toast({
          title: data.isLiked ? "Book liked" : "Book unliked",
          description: data.isLiked ? "Added to your liked books" : "Removed from your liked books",
        })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSave = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save this book",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/books/${book.id}/saves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsSaved(data.isSaved)
        toast({
          title: data.isSaved ? "Book saved" : "Book unsaved",
          description: data.isSaved ? "Added to your saved books" : "Removed from your saved books",
        })
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Book link copied to clipboard",
      })
    } catch (error) {
      console.error('Error copying link:', error)
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleAddBookmark = async (note: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add bookmarks",
        variant: "destructive",
      })
      return
    }

    try {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        toast({
          title: "No text selected",
          description: "Please select some text to bookmark",
          variant: "destructive",
        })
        return
      }

      const range = selection.getRangeAt(0)
      const selectedText = range.toString()
      const position = (range.startOffset / document.body.textContent!.length) * 100

      const response = await fetch(`/api/books/${book.id}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedText,
          position,
          note,
          selectionStart: range.startOffset,
          selectionEnd: range.endOffset,
          selectionWidth: range.getBoundingClientRect().width,
          selectionLeft: range.getBoundingClientRect().left,
          chapterId: chapter.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add bookmark")
      }

      const newBookmark = await response.json()
      setBookmarks([...bookmarks, newBookmark])
      toast({
        title: "Bookmark added",
        description: "Text has been bookmarked successfully",
      })
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add bookmark",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${book.id}/bookmarks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete bookmark")
      }

      setBookmarks(bookmarks.filter(b => b.id !== id))
      toast({
        title: "Bookmark deleted",
        description: "Bookmark has been removed successfully",
      })
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bookmark",
        variant: "destructive",
      })
    }
  }

  const handleBookmarkClick = (position: number) => {
    const element = document.querySelector(`[data-position="${position}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Get previous and next chapters
  const chapterIndex = book.chapters.findIndex(c => c.id === chapter.id)
  const prevChapter = chapterIndex > 0 ? book.chapters[chapterIndex - 1] : undefined
  const nextChapter = chapterIndex < book.chapters.length - 1 ? book.chapters[chapterIndex + 1] : undefined
  const isFirstChapter = chapterIndex === 0
  const isLastChapter = chapterIndex === book.chapters.length - 1

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add comments",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/chapters/${chapter.id}/comments${parentId ? `/${parentId}/replies` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        const newComment = await response.json()
        if (parentId) {
          // Update the parent comment's replies
          setComments(comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment]
              }
            }
            return comment
          }))
        } else {
          // Add new top-level comment
          setComments([newComment, ...comments])
        }
        toast({
          title: "Comment added",
          description: "Your comment has been posted successfully",
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/chapters/${chapter.id}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove the comment and its replies from the state
        setComments(comments.filter(c => c.id !== commentId))
        toast({
          title: "Comment deleted",
          description: "Comment has been removed successfully",
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/chapters/${chapter.id}/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const updatedComment = await response.json()
        // Update the comment in the state, including nested replies
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return updatedComment
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId ? updatedComment : reply
              )
            }
          }
          return comment
        }))
      }
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <BookChapterHeader
        bookTitle={book.title}
        bookId={book.id}
        isFullscreen={isFullscreen}
        isLiked={isLiked}
        isSaved={isSaved}
        likeCount={likeCount}
        viewCount={viewCount}
        isLoading={isLoading}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
      />

      <main className={`${isFullscreen ? 'w-full max-w-none' : 'container'} py-6`}>
        <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
          <div className={`${isFullscreen ? 'w-full' : 'lg:col-span-2'} space-y-6`}>
            <div ref={contentRef}>
              <ChapterContent
                chapter={chapter}
                book={book}
                bookmarks={bookmarks}
                isFirstChapter={isFirstChapter}
                isLastChapter={isLastChapter}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                isFullscreen={isFullscreen}
              />
            </div>

            {!isFullscreen && (
              <>
                <CommentsSection
                  chapterId={chapter.id}
                  comments={comments}
                  user={session?.user}
                  session={session}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onLikeComment={handleLikeComment}
                />

                <RatingSection
                  bookId={book.id}
                  rating={book.rating || 0}
                  totalRatings={book.totalRatings || 0}
                  userRating={book.userRating}
                />
              </>
            )}
          </div>

          {!isFullscreen && (
            <div className="lg:col-span-1 space-y-6">
              <BookInfo book={book} />
              
              <BookmarkSection
                session={session}
                bookmarks={bookmarks}
                onAddBookmark={handleAddBookmark}
                onDeleteBookmark={handleDeleteBookmark}
                book={book}
                currentChapterId={chapter.id}
              />

              <ChaptersList
                book={book}
                currentChapter={chapter}
                bookmarks={bookmarks}
                onBookmarkClick={handleBookmarkClick}
                onDeleteBookmark={handleDeleteBookmark}
              />

              <AuthorInfo
                author={book.author}
                authorData={authorData}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 