import { prisma } from './prisma';
import type { Book, Chapter, User } from '@prisma/client';

// Type definitions that match our frontend needs
export interface BookWithDetails {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;  // Match Prisma schema
  published: boolean;  // Add published field
  tags: string[];  // Add tags field
  author: {
    id: string;
    name: string;
    image: string | null;  // Match ChapterReaderProps
  };
  chapters: {
    id: string;
    title: string;
    content: string;
    order: number;
    readingProgress: Array<{
      progress: number;
    }>;
  }[];
  views: number;
  likes: Array<{
    id: string;
    userId: string;
    bookId: string;
    createdAt: Date;
  }>;
  saves: Array<{
    id: string;
    userId: string;
    bookId: string;
    createdAt: Date;
  }>;
  rating: number;
  totalRatings: number;
  ratings: Array<{
    id: string;
    value: number;
    userId: string;
  }>;
  _count: {
    ratings: number;
    likes: number;
    comments: number;
  };
  userRating: number | null;
}

// Maps database book to our frontend format
export function transformBook(book: Book & { 
  author: User; 
  chapters: (Chapter & {
    readingProgress: Array<{
      progress: number;
    }>;
  })[];
  likes?: Array<{
    id: string;
    userId: string;
    bookId: string;
    createdAt: Date;
  }>;
  saves?: Array<{
    id: string;
    userId: string;
    bookId: string;
    createdAt: Date;
  }>;
  ratings?: Array<{
    id: string;
    value: number;
    userId: string;
    bookId: string;
    createdAt: Date;
  }>;
}): BookWithDetails {
  // Calculate average rating from ratings array if available
  const ratings = book.ratings || [];
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings
    : 0;

  return {
    id: book.id,
    title: book.title,
    description: book.description,
    coverImage: book.thumbnail,  // Already optional in schema
    published: book.published,  // Add published field
    tags: book.tags || [],  // Add tags with fallback to empty array
    author: {
      id: book.author.id,
      name: book.author.name || 'Unknown Author',
      image: book.author.image,  // Already optional in schema
    },
    chapters: book.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      order: chapter.order,
      readingProgress: chapter.readingProgress || [],
    })),
    views: book.views || 0,
    likes: book.likes || [],
    saves: book.saves || [],
    rating: averageRating,
    totalRatings: totalRatings,
    ratings: book.ratings || [],
    _count: {
      ratings: book.ratings?.length || 0,
      likes: book.likes?.length || 0,
      comments: book.comments?.length || 0,
    },
    userRating: null, // This will be set in the API route
  };
}

// Get all books
export async function getBooks(userId?: string) {
  const books = await prisma.book.findMany({
    where: {
      OR: [
        { published: true }, // Show all published books
        { authorId: userId || '' } // Show all books (including drafts) to the author
      ]
    },
    include: {
      author: true,
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          readingProgress: {
            where: { userId: userId || '' }
          }
        }
      },
      likes: true,
      saves: true,
      ratings: true
    },
  });
  
  return books.map(book => transformBook(book));
}

// Get a single book by id
export async function getBook(id: string, userId?: string) {
  console.log('Fetching book with id:', id, 'userId:', userId);

  const book = await prisma.book.findUnique({
    where: { 
      id: id,
      OR: [
        { published: true },
        { authorId: userId || '' }
      ]
    },
    include: {
      author: true,
      chapters: {
        orderBy: {
          order: 'asc' as const
        },
        include: {
          readingProgress: true
        }
      },
      likes: true,
      saves: true,
      ratings: true
    }
  });

  if (!book) {
    console.log('Book not found');
    return null;
  }

  // Filter reading progress for the current user
  const bookWithFilteredProgress = {
    ...book,
    chapters: book.chapters.map(chapter => ({
      ...chapter,
      readingProgress: userId 
        ? chapter.readingProgress.filter(progress => progress.userId === userId)
        : []
    }))
  };

  console.log('Found book:', {
    title: book.title,
    chaptersCount: book.chapters.length,
    rating: book.rating,
    totalRatings: book.totalRatings,
    chaptersWithProgress: book.chapters.map(chapter => ({
      order: chapter.order,
      title: chapter.title,
      readingProgress: chapter.readingProgress.filter(progress => progress.userId === userId)
    }))
  });

  return transformBook(bookWithFilteredProgress);
}

// Get a specific chapter with its content
export async function getChapter(bookId: string, chapterNumber: number, userId?: string) {
  const chapter = await prisma.chapter.findFirst({
    where: {
      bookId,
      order: chapterNumber,
    },
    include: {
      book: {
        include: {
          author: true,
        },
      },
      readingProgress: userId ? {
        where: { userId }
      } : false,
    },
  });

  if (!chapter) {
    return null;
  }

  // Initialize reading progress if userId is provided and no progress exists
  if (userId && chapter.readingProgress.length === 0) {
    // First verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      await prisma.readingProgress.create({
        data: {
          userId,
          bookId,
          chapterId: chapter.id,
          progress: 0, // Initialize with 0 progress
        },
      });
    }
  }

  return chapter;
}