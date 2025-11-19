import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { BookSchema } from "@/schemas/book"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const book = await db.book.findUnique({
      where: { 
        id: params.id,
        authorId: session.user.id // Only allow fetching books owned by the user
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!book) {
      return new NextResponse("Book not found", { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('[BOOK_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const validatedData = BookSchema.parse(body)

    // Verify book ownership
    const book = await db.book.findUnique({
      where: {
        id: params.id,
        authorId: session.user.id
      }
    })

    if (!book) {
      return new NextResponse("Book not found", { status: 404 })
    }

    // Update the book
    const updatedBook = await db.book.update({
      where: {
        id: params.id,
        authorId: session.user.id
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        thumbnail: validatedData.thumbnail || null,
        tags: validatedData.tags,
        published: validatedData.published,
        chapters: {
          deleteMany: {},
          create: validatedData.chapters.map((ch, index) => ({
            title: ch.title,
            content: ch.content,
            order: index + 1
          }))
        }
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('[BOOK_UPDATE]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 