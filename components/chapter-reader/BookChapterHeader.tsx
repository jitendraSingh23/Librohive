import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Maximize2, Minimize2, Heart, Bookmark, Share2, Loader2, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BookChapterHeaderProps {
  bookTitle: string
  bookId: string
  isFullscreen: boolean
  isLiked: boolean
  isSaved: boolean
  likeCount: number
  viewCount: number
  isLoading: boolean
  onToggleFullscreen: () => void
  onToggleLike: () => void
  onToggleSave: () => void
  onShare: () => void
}

export function BookChapterHeader({
  bookTitle,
  bookId,
  isFullscreen,
  isLiked,
  isSaved,
  likeCount,
  viewCount,
  isLoading,
  onToggleFullscreen,
  onToggleLike,
  onToggleSave,
  onShare
}: BookChapterHeaderProps) {
  const handleShare = (platform?: 'twitter' | 'facebook' | 'linkedin') => {
    const url = window.location.href
    const text = `Check out ${bookTitle} on LibroHive!`
    
    if (!platform) {
      onShare()
      return
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(bookTitle)}`
    }

    window.open(shareUrls[platform], '_blank')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/books/${bookId}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Book
            </Link>
          </Button>
          <h1 className="text-xl font-semibold truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
            {bookTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground mr-4">
            <Eye className="h-4 w-4" />
            <span>{viewCount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"} transition-colors`}
              onClick={onToggleLike}
              disabled={isLoading}
              title="Like this chapter"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
              )}
              <span className="hidden sm:inline">{likeCount.toLocaleString()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`${isSaved ? "text-primary hover:text-primary/90" : "text-muted-foreground"} transition-colors`}
              onClick={onToggleSave}
              disabled={isLoading}
              title="Save for later"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`} />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  title="Share options"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare()}>
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                  Share on LinkedIn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              disabled={isLoading}
              className="text-muted-foreground"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 