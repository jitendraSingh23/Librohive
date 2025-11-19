"use client"

import { useEffect, useState, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { BookCard } from "@/components/book-card"
import { Spinner } from "@/components/ui/spinner"
import { Book } from "@prisma/client"
import { cn } from "@/lib/utils"

interface BookWithDetails extends Book {
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  _count: {
    likes: number;
    comments: true;
    ratings: number;
    bookmarks: number;
  };
}

export function ScrollFeed() {
  const [books, setBooks] = useState<BookWithDetails[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { ref: inViewRef, inView } = useInView()

  useEffect(() => {
    loadMoreBooks()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreBooks()
    }
  }, [inView, hasMore, loading])

  const loadMoreBooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/books/feed?page=${page}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const newBooks = await res.json()

      if (newBooks.length < 10) {
        setHasMore(false)
      }

      setBooks(prev => [...prev, ...newBooks])
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault()
      
      if (e.deltaY > 0 && currentIndex < books.length - 1) {
        setCurrentIndex(prev => prev + 1)
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll)
      }
    }
  }, [currentIndex, books.length])

  if (books.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">No books found</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-4rem)] overflow-hidden relative snap-y snap-mandatory bg-accent-foreground"
    >
      {books.map((book, index) => (
        <div
          key={book.id}
          className={cn(
            "h-full w-full absolute top-0 left-0 transition-transform duration-500 snap-start",
            {
              "translate-y-0": index === currentIndex,
              "translate-y-full": index > currentIndex,
              "-translate-y-full": index < currentIndex,
            }
          )}
        >
          <BookCard book={book} />
        </div>
      ))}
      
      <div ref={inViewRef} className="absolute bottom-0 w-full">
        {loading && (
          <div className="flex justify-center py-4">
            <Spinner className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}