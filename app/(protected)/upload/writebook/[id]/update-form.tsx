"use client"

import { BookForm, BookSchema } from '@/components/book/BookForm'
import { updateBook } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import * as z from 'zod'

interface Chapter {
  id: string
  title: string
  content: string
  order: number
}

interface Book {
  id: string
  title: string
  description: string
  tags: string[]
  chapters: Chapter[]
  published: boolean
}

interface UpdateBookFormProps {
  book: Book
}

export function UpdateBookForm({ book }: UpdateBookFormProps) {
  const router = useRouter()

  const handleSubmit = async (data: z.infer<typeof BookSchema>) => {
    try {
      const updatedBook = await updateBook(book.id, data)
      router.push(`/books/${updatedBook.id}`)
      toast.success('Book updated successfully')
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    }
  }

  return (
    <div className="container py-10">
      <BookForm
        initialData={{
          title: book.title,
          description: book.description,
          tags: book.tags,
          chapters: book.chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            content: chapter.content,
          })),
          published: book.published,
        }}
        onSubmit={handleSubmit}
        backUrl={`/books/${book.id}`}
        submitLabel="Update Book"
      />
    </div>
  )
} 