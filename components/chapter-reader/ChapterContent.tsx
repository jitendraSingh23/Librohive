import { ChevronLeft, ChevronRight, Minus, Plus, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { type Book, type Chapter } from "@prisma/client"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BookmarkWithText {
  id: string;
  position: number;
  note?: string;
  text: string;
}

function findTextAtPosition(content: string, position: number, length: number = 20): { text: string; start: number; end: number } | null {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const plainText = tempDiv.textContent || ''

  const start = Math.max(0, position - Math.floor(length / 2))
  const end = Math.min(plainText.length, position + Math.ceil(length / 2))
  const text = plainText.substring(start, end)

  return { text, start, end }
}

interface ChapterContentProps {
  chapter: Chapter & {
    readingProgress?: Array<{
      progress: number;
    }>;
  };
  book: Book & {
    chapters: Array<Chapter & {
      readingProgress?: Array<{
        progress: number;
      }>;
    }>;
  };
  isFirstChapter: boolean;
  isLastChapter: boolean;
  prevChapter?: Chapter;
  nextChapter?: Chapter;
  bookmarks: Array<{
    id: string;
    position: number;
    note?: string;
    chapterId: string;
    selectedText: string;
  }>;
  isFullscreen: boolean;
}

const FONT_FAMILIES = [
  { value: "system-ui", label: "System" },
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
]

export function ChapterContent({
  book,
  chapter,
  isFirstChapter,
  isLastChapter,
  prevChapter,
  nextChapter,
  bookmarks,
  isFullscreen,
}: ChapterContentProps) {
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("system-ui")
  const [highlightedContent, setHighlightedContent] = useState(chapter.content || "")

  useEffect(() => {
    const savedFontSize = localStorage.getItem('chapterFontSize')
    const savedFontFamily = localStorage.getItem('chapterFontFamily')
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize))
    }
    if (savedFontFamily) {
      setFontFamily(savedFontFamily)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chapterFontSize', fontSize.toString())
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('chapterFontFamily', fontFamily)
  }, [fontFamily])

  useEffect(() => {
    if (!chapter.content || !bookmarks.length) {
      setHighlightedContent(chapter.content || "")
      return
    }

    try {
      const chapterBookmarks = bookmarks.filter(
        bookmark => bookmark.chapterId === chapter.id
      )

      let contentWithHighlights = chapter.content
      chapterBookmarks.forEach(bookmark => {
        if (!bookmark.selectedText) return

        const highlightedText = `
          <mark 
            class="bg-yellow-200 dark:bg-yellow-900/50 cursor-pointer hover:bg-yellow-300 dark:hover:bg-yellow-800/50 transition-colors relative group"
            data-bookmark-id="${bookmark.id}"
            data-position="${bookmark.position}"
          >
            ${bookmark.selectedText}
            ${bookmark.note ? `
              <span class="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 text-white text-xs rounded p-2 mb-2 whitespace-nowrap z-50">
                ${bookmark.note}
              </span>
            ` : ''}
          </mark>
        `

        const escapedText = bookmark.selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedText, 'g')
        contentWithHighlights = contentWithHighlights.replace(regex, highlightedText)
      })

      setHighlightedContent(contentWithHighlights)
    } catch (error) {
      console.error('Error highlighting bookmarks:', error)
      setHighlightedContent(chapter.content || "")
    }
  }, [chapter.content, bookmarks, chapter.id])

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12))
  }

  return (
    <div className={`bg-card rounded-lg shadow-sm border p-6 ${isFullscreen ? 'w-full max-w-none' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{chapter.title}</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="icon"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium min-w-[2.5rem] text-center">
              {fontSize}px
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="bg-muted/50 rounded-lg">
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-[140px] h-8 border-0 bg-transparent">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div 
        className={`prose dark:prose-invert ${isFullscreen ? 'max-w-none' : ''}`} 
        style={{ 
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t">
        <div className="flex gap-4">
          {!isFirstChapter && prevChapter ? (
            <Button variant="outline" asChild>
              <Link href={`/books/${book.id}/chapters/${prevChapter.order}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {!isLastChapter && nextChapter ? (
            <Button variant="outline" asChild>
              <Link href={`/books/${book.id}/chapters/${nextChapter.order}`}>
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}