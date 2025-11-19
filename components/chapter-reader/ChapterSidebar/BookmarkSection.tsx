import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BookmarkIcon, BookOpen } from "lucide-react"
import { type BookmarkSectionProps } from "../types"

export function BookmarkSection({ 
  session, 
  bookmarks, 
  onAddBookmark, 
  onDeleteBookmark,
  book,
  currentChapterId
}: BookmarkSectionProps) {
  const [showBookmarkNote, setShowBookmarkNote] = useState(false)
  const [bookmarkNote, setBookmarkNote] = useState("")

  const handleSaveBookmark = () => {
    onAddBookmark(bookmarkNote)
    setShowBookmarkNote(false)
    setBookmarkNote("")
  }

  // Group bookmarks by chapter
  const bookmarksByChapter = bookmarks.reduce((acc, bookmark) => {
    const chapter = book.chapters.find(c => c.id === bookmark.chapterId)
    if (!chapter) return acc
    
    if (!acc[chapter.id]) {
      acc[chapter.id] = {
        chapter,
        bookmarks: []
      }
    }
    acc[chapter.id].bookmarks.push(bookmark)
    return acc
  }, {} as Record<string, { chapter: { id: string; title: string; order: number }; bookmarks: typeof bookmarks }>)

  const handleBookmarkClick = (bookmark: typeof bookmarks[0]) => {
    // If the bookmark is in a different chapter, navigate to that chapter
    if (bookmark.chapterId !== currentChapterId) {
      window.location.href = `/books/${book.id}/chapters/${bookmark.chapterId}?position=${bookmark.position}`
    } else {
      // If in the same chapter, scroll to the bookmark
      const element = document.querySelector(`[data-position="${bookmark.position}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Bookmarks</h3>
        {session?.user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBookmarkNote(true)}
          >
            <BookmarkIcon className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        )}
      </div>

      {showBookmarkNote && (
        <div className="mb-4">
          <Textarea
            placeholder="Add a note about this bookmark (optional)"
            value={bookmarkNote}
            onChange={(e) => setBookmarkNote(e.target.value)}
            className="mb-2"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveBookmark}
              className="flex-1"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowBookmarkNote(false)
                setBookmarkNote("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!session?.user && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Please sign in to add bookmarks
          </p>
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      )}

      {/* {session?.user && (
        <div className="space-y-4">
          {Object.values(bookmarksByChapter).map(({ chapter, bookmarks }) => (
            <div key={chapter.id} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                <span>Chapter {chapter.order}: {chapter.title}</span>
              </div>
              <div className="space-y-2 pl-6">
                {bookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="group flex items-start justify-between gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleBookmarkClick(bookmark)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{bookmark.selectedText}</p>
                      {bookmark.note && (
                        <p className="text-xs text-muted-foreground mt-1">{bookmark.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteBookmark(bookmark.id)
                        }}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {bookmarks.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No bookmarks yet. Select text to add a bookmark!
            </div>
          )}
        </div>
      )} */}
    </div>
  )
} 