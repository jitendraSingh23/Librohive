"use client"

import { useRouter } from "next/navigation"
import { BookForm } from "@/components/book/BookForm"
import { updateBookAction } from "./actions"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { BookSchema } from "@/components/book/BookForm"
import { z } from "zod"

interface PageProps {
  params: {
    id: string
  }
}

interface ChapterData {
  id: string
  title: string
  content: string
  order: number
}

interface BookData {
  id: string
  title: string
  description: string
  tags: string[]
  chapters: ChapterData[]
  published: boolean
  authorId: string
}

export default function UpdateBookPage({ params }: PageProps) {
  const router = useRouter()
  const [book, setBook] = useState<z.infer<typeof BookSchema> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('Effect triggered with ID:', params.id)
    
    const fetchBook = async () => {
      console.log('Fetching book with ID:', params.id)
      try {
        const response = await fetch(`/api/books/${params.id}`)
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Book not found')
            toast.error('Book not found')
            router.push('/dashboard')
            return
          }
          if (response.status === 401) {
            console.log('Unauthorized')
            toast.error('Please login to edit this book')
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch book')
        }
        
        const data: BookData = await response.json()
        console.log('Received book data:', data)
        
        // Transform the book data to match the form schema
        const transformedData = {
          title: data.title,
          description: data.description,
          tags: data.tags,
          chapters: data.chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            content: chapter.content || "",
            order: chapter.order
          })),
          published: data.published,
        }
        console.log('Transformed data:', transformedData)
        setBook(transformedData)
      } catch (error) {
        console.error('Error fetching book:', error)
        toast.error('Failed to fetch book')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBook()
  }, [params.id, router])

  const handleSubmit = async (data: z.infer<typeof BookSchema>) => {
    try {
      const updatedBook = await updateBookAction(params.id, data)
      toast.success('Book updated successfully')
      router.push(`/books/${updatedBook.id}`)
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  return (
    <BookForm
      initialData={book}
      onSubmit={handleSubmit}
      backUrl={`/books/${params.id}`}
      submitLabel="Update Book"
    />
  )
} 