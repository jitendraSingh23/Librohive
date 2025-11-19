import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[BOOK_VIEWS_POST] Starting view count update for book:", params.id)
    
    // Get the cookie to check if user has viewed recently
    const cookieStore = await cookies()
    const viewCookie = cookieStore.get(`book_${params.id}_view`)
    
    console.log("[BOOK_VIEWS_POST] View cookie:", viewCookie?.value)
    
    // If user has viewed in the last 24 hours, don't increment
    if (viewCookie) {
      const lastViewTime = parseInt(viewCookie.value)
      const now = Date.now()
      const hoursSinceLastView = (now - lastViewTime) / (1000 * 60 * 60)
      
      console.log("[BOOK_VIEWS_POST] Hours since last view:", hoursSinceLastView)
      
      if (hoursSinceLastView < 24) {
        console.log("[BOOK_VIEWS_POST] Returning current views without increment")
        // Return current views without incrementing
        const book = await db.book.findUnique({
          where: { id: params.id }
        })
        
        if (!book) {
          return NextResponse.json(
            { message: "Book not found" },
            { status: 404 }
          )
        }

        return NextResponse.json({
          views: book.views
        })
      }
    }

    // Find the book by ID
    const book = await db.book.findUnique({
      where: { id: params.id }
    })

    if (!book) {
      return NextResponse.json(
        { message: "Book not found" },
        { status: 404 }
      )
    }

    console.log("[BOOK_VIEWS_POST] Current views before increment:", book.views)

    // Increment the views count
    const updatedBook = await db.book.update({
      where: {
        id: book.id
      },
      data: {
        views: {
          increment: 1
        }
      }
    })

    console.log("[BOOK_VIEWS_POST] Updated views:", updatedBook.views)

    // Set a cookie to track the view time
    const response = NextResponse.json({
      views: updatedBook.views
    })

    // Set cookie that expires in 24 hours
    response.cookies.set(`book_${params.id}_view`, Date.now().toString(), {
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      sameSite: 'lax',
      httpOnly: true // Make the cookie httpOnly for better security
    })

    return response
  } catch (error) {
    console.error("[BOOK_VIEWS_POST] Error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 