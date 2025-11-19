import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { prisma } from '@/lib/prisma';

interface ProfilePageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user with their books and other related data
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      books: {
        include: {
          author: true,
          chapters: true,
          likes: true,
          saves: true,
          ratings: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      followers: {
        where: {
          followingId: session.user.id
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            }
          }
        }
      },
      following: {
        where: {
          followerId: session.user.id
        },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            }
          }
        }
      },
      bookLikes: {
        include: {
          book: {
            include: {
              author: true,
              chapters: true,
              likes: true,
              saves: true,
              ratings: true,
            }
          }
        }
      },
      bookSaves: {
        include: {
          book: {
            include: {
              author: true,
              chapters: true,
              likes: true,
              saves: true,
              ratings: true,
            }
          }
        }
      },
      bookmarks: {
        include: {
          book: {
            include: {
              author: true,
              chapters: true,
              likes: true,
              saves: true,
              ratings: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          books: true,
          followers: true,
          following: true,
          bookLikes: true,
          bookSaves: true,
          bookmarks: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Transform the data to match our BookWithDetails type
  const transformedUser = {
    ...user,
    books: user.books.map(book => ({
      ...book,
      coverImage: book.thumbnail || null, // Use thumbnail directly
      progress: 0,
    })),
    likedBooks: user.bookLikes.map(like => ({
      ...like.book,
      coverImage: like.book.thumbnail || null, // Use thumbnail directly
      progress: 0,
    })),
    savedBooks: user.bookSaves.map(save => ({
      ...save.book,
      coverImage: save.book.thumbnail || null, // Use thumbnail directly
      progress: 0,
    })),
    bookmarks: user.bookmarks.map(bookmark => {
      const chapter = bookmark.book.chapters.find(chapter => chapter.id === bookmark.chapterId);
      return {
        id: bookmark.id,
        book: {
          ...bookmark.book,
          coverImage: bookmark.book.thumbnail || null, // Use thumbnail directly
        },
        chapterId: bookmark.chapterId,
        chapterTitle: chapter?.title || 'Unknown Chapter',
        selectedText: bookmark.selectedText || 'No text selected',
        createdAt: bookmark.createdAt,
      };
    }),
  };

  return <ProfileClient user={transformedUser} initialTab={searchParams.tab || 'books'} />;
}