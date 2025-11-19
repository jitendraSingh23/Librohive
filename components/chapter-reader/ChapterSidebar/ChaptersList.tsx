import Link from "next/link"
import { BookmarkIcon, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ChaptersListProps } from "../types"

export function ChaptersList({
  book,
  currentChapter,
  bookmarks,
  onBookmarkClick,
  onDeleteBookmark
}: ChaptersListProps) {
  const getChapterUrl = (order: number) => {
    return `/books/${book.id}/chapters/${order}`
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold mb-4">Chapters</h3>
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[200px] pr-4">
          <TabsContent value="all" className="space-y-2">
            {book.chapters.map((ch) => (
              <Link
                key={ch.id}
                href={getChapterUrl(ch.order)}
              >
                <button
                  className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
                    currentChapter.id === ch.id ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm">
                      Chapter {ch.order}: {ch.title}
                    </div>
                    {ch.progress > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {ch.progress === 100 ? "Completed" : `${ch.progress}% read`}
                      </div>
                    )}
                  </div>
                  {ch.progress === 100 && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </button>
              </Link>
            ))}
          </TabsContent>
          <TabsContent value="bookmarked" className="space-y-2">
            {book.chapters.map((ch) => {
              // Find bookmarks for this chapter
              const chapterBookmarks = bookmarks.filter(b => b.chapterId === ch.id)
              if (chapterBookmarks.length === 0) return null

              return (
                <div key={ch.id} className="space-y-2">
                  <Link href={getChapterUrl(ch.order)}>
                    <button
                      className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
                        currentChapter.id === ch.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm">
                          Chapter {ch.order}: {ch.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chapterBookmarks.length} bookmark{chapterBookmarks.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <BookmarkIcon className="h-4 w-4 text-primary" />
                    </button>
                  </Link>
                  {/* Show bookmarks for this chapter */}
                  <div className="ml-4 space-y-1">
                    {chapterBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="text-sm text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted group relative"
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            window.location.href = `${getChapterUrl(ch.order)}?position=${bookmark.position}`
                            onBookmarkClick(bookmark.position)
                          }}
                        >
                          {bookmark.selectedText ? (
                            <span className="italic">&ldquo;{bookmark.selectedText}&rdquo;</span>
                          ) : (
                            <span>At {Math.round(bookmark.position)}%</span>
                          )}
                          {bookmark.note && (
                            <div className="text-xs mt-0.5">{bookmark.note}</div>
                          )}
                        </div>
                        <button
                          onClick={() => onDeleteBookmark(bookmark.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }).filter(Boolean)}
            {!bookmarks.length && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No bookmarked chapters yet
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
} 