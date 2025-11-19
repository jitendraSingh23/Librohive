import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { chapterId, progress } = body

    // First verify that the user exists
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update reading progress
    await db.readingProgress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId
        }
      },
      update: {
        progress
      },
      create: {
        userId: session.user.id,
        chapterId,
        progress,
        bookId: params.bookId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PROGRESS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}