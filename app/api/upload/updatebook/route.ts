import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, thumbnail, tags, chapters } = body

    // Verify book ownership
    const book = await db.book.findUnique({
      where: {
        id: params.bookId,
        authorId: session.user.id
      }
    })

    if (!book) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Update book and chapters
    const updatedBook = await db.book.update({
      where: {
        id: params.bookId
      },
      data: {
        title,
        description,
        thumbnail,
        tags,
        chapters: {
          deleteMany: {},
          create: chapters.map((chapter: { title: string; content: string; order: number }) => ({
            title: chapter.title,
            content: chapter.content,
            order: chapter.order
          }))
        }
      },
      include: {
        chapters: true
      }
    })

    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error("[BOOK_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify book ownership
    const book = await db.book.findUnique({
      where: {
        id: params.bookId,
        authorId: session.user.id
      }
    })

    if (!book) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Delete book and its chapters
    await db.book.delete({
      where: {
        id: params.bookId
      }
    })

    return NextResponse.json({ message: "Book deleted" })
  } catch (error) {
    console.error("[BOOK_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}