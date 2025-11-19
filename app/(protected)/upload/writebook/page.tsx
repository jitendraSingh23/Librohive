"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { BookForm } from "@/components/book/BookForm"
import { updateBookAction } from "./actions"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { BookSchema } from "@/components/book/BookForm"
import { z } from "zod"

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

export default function WriteBookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [book, setBook] = useState<z.infer<typeof BookSchema> | null>(null)
  const [isLoading, setIsLoading] = useState(!!editId)

  useEffect(() => {
    if (!editId) return

    console.log('Effect triggered with ID:', editId)
    
    const fetchBook = async () => {
      console.log('Fetching book with ID:', editId)
      try {
        const response = await fetch(`/api/books/${editId}`)
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
  }, [editId, router])

  const handleSubmit = async (data: z.infer<typeof BookSchema>) => {
    try {
      if (editId) {
        const updatedBook = await updateBookAction(editId, data)
        toast.success('Book updated successfully')
        router.push(`/books/${updatedBook.id}`)
      } else {
        // Handle create new book
        const response = await fetch('/api/upload/writebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create book')
        }

        const newBook = await response.json()
        toast.success('Book created successfully')
        router.push(`/books/${newBook.id}`)
      }
    } catch (error) {
      console.error('Error saving book:', error)
      toast.error('Failed to save book')
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

  return (
    <BookForm
      initialData={book || undefined}
      onSubmit={handleSubmit}
      backUrl={editId ? `/books/${editId}` : '/dashboard'}
      submitLabel={editId ? "Update Book" : "Create Book"}
    />
  )
}