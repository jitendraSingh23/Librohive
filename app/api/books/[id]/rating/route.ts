import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { rating } = await req.json()

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Find existing rating
    const existingRating = await db.rating.findFirst({
      where: {
        userId: session.user.id,
        bookId: params.id
      }
    })

    if (existingRating) {
      // Update existing rating
      const updatedRating = await db.rating.update({
        where: {
          id: existingRating.id
        },
        data: {
          value: rating
        }
      })

      // Update book's average rating
      const bookRatings = await db.rating.findMany({
        where: { bookId: params.id }
      })

      const averageRating = bookRatings.reduce((acc, curr) => acc + curr.value, 0) / bookRatings.length

      await db.book.update({
        where: { id: params.id },
        data: {
          rating: averageRating,
          totalRatings: bookRatings.length
        }
      })

      return NextResponse.json({
        userRating: updatedRating.value,
        averageRating,
        totalRatings: bookRatings.length
      })
    } else {
      // Create new rating
      const newRating = await db.rating.create({
        data: {
          value: rating,
          userId: session.user.id,
          bookId: params.id
        }
      })

      // Update book's average rating
      const bookRatings = await db.rating.findMany({
        where: { bookId: params.id }
      })

      const averageRating = bookRatings.reduce((acc, curr) => acc + curr.value, 0) / bookRatings.length

      await db.book.update({
        where: { id: params.id },
        data: {
          rating: averageRating,
          totalRatings: bookRatings.length
        }
      })

      return NextResponse.json({
        userRating: newRating.value,
        averageRating,
        totalRatings: bookRatings.length
      })
    }
  } catch (error) {
    console.error("[BOOK_RATING_POST]", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 