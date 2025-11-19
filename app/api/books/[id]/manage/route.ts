import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { action } = await request.json();
    const bookId = params.id;

    // Find the book and verify ownership
    const book = await db.book.findUnique({
      where: { id: bookId },
      select: { authorId: true }
    });

    if (!book) {
      return new NextResponse('Book not found', { status: 404 });
    }

    if (book.authorId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    switch (action) {
      case 'publish':
        await db.book.update({
          where: { id: bookId },
          data: { published: true }
        });
        return new NextResponse('Book published successfully');

      case 'unpublish':
        await db.book.update({
          where: { id: bookId },
          data: { published: false }
        });
        return new NextResponse('Book unpublished successfully');

      case 'delete':
        // Delete all related records first
        await db.readingProgress.deleteMany({
          where: { bookId }
        });
        await db.bookmark.deleteMany({
          where: { bookId }
        });
        await db.bookLike.deleteMany({
          where: { bookId }
        });
        await db.bookSave.deleteMany({
          where: { bookId }
        });
        await db.chapter.deleteMany({
          where: { bookId }
        });
        // Finally delete the book
        await db.book.delete({
          where: { id: bookId }
        });
        return new NextResponse('Book deleted successfully');

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }
  } catch (error) {
    console.error('[BOOK_MANAGE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 