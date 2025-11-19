import Image from "next/image"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type BookInfoProps } from "../types"
import { type Book, type Chapter } from "@prisma/client"

interface BookWithDetails extends Book {
  rating: number;
  totalRatings: number;
  views: number;
  coverImage: string | null;
  tags: string[];
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  chapters: Array<Chapter & {
    readingProgress: Array<{
      progress: number;
    }>;
  }>;
}

export function BookInfo({ book: initialBook }: BookInfoProps) {
  const [book, setBook] = useState<BookWithDetails>(initialBook as unknown as BookWithDetails)
  const [overallProgress, setOverallProgress] = useState(0)

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent<BookWithDetails>) => {
      console.log('Progress update received:', event.detail)
      setBook(event.detail)
    }

    window.addEventListener('bookProgressUpdated', handleProgressUpdate as EventListener)
    return () => {
      window.removeEventListener('bookProgressUpdated', handleProgressUpdate as EventListener)
    }
  }, [])

  // Calculate overall reading progress as a percentage
  useEffect(() => {
    console.log('Calculating progress for chapters:', book.chapters)
    
    const completedChapters = book.chapters.filter(chapter => {
      const progress = chapter.readingProgress?.[0]?.progress || 0
      return progress >= 100
    }).length

    const totalChapters = book.chapters.length
    const calculatedProgress = (completedChapters / totalChapters) * 100
    
    console.log('Completed chapters:', completedChapters, 'Total chapters:', totalChapters, 'Progress:', calculatedProgress)
    
    setOverallProgress(Math.round(calculatedProgress))
  }, [book.chapters])

  // Calculate rating display values with defaults
  const rating = book.rating ?? 0
  const totalRatings = book.totalRatings ?? 0

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <div className="flex gap-4 items-start">
        <Image
          src={book.coverImage || "/placeholder.svg"}
          alt={book.title}
          width={80}
          height={120}
          className="rounded-md object-cover"
        />
        <div>
          <h2 className="font-bold text-xl">{book.title}</h2>
          <p className="text-sm text-muted-foreground">by {book.author.name}</p>
          <div className="flex mt-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({rating.toFixed(1)}) ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <span>Reading Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        
        {book.tags && book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {book.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 