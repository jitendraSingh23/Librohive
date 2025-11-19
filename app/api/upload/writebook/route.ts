import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

interface Chapter {
  title: string;
  content: string;
  order: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, thumbnail, tags, chapters, published, readTime } = body

    const book = await db.book.create({
      data: {
        title,
        description,
        thumbnail,
        tags,
        published,
        readTime,
        authorId: session.user.id,
        chapters: {
          create: chapters.map((chapter: Chapter) => ({
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

    return NextResponse.json(book)
  } catch (error) {
    console.error("[BOOKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}