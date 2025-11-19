import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { transformBook } from "@/lib/books";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/ui/book-card";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's reading progress and unstarted books
  const booksToRead = await prisma.book.findMany({
    where: {
      published: true,
      NOT: {
        authorId: session.user.id, // Exclude user's own books
      },
    },
    include: {
      author: true,
      chapters: {
        include: {
          readingProgress: {
            where: {
              userId: session.user.id,
            },
            select: {
              progress: true,
            },
          },
        },
      },
      likes: true,
      ratings: true,
      saves: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    take: 4,
  });

  // Fetch user's saved books
  const savedBooks = await prisma.bookSave.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      book: {
        include: {
          author: true,
          chapters: {
            include: {
              readingProgress: {
                where: {
                  userId: session.user.id,
                },
                select: {
                  progress: true,
                },
              },
            },
          },
          ratings: true,
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  // Fetch user's liked books
  const likedBooks = await prisma.bookLike.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      book: {
        include: {
          author: true,
          chapters: {
            include: {
              readingProgress: {
                where: {
                  userId: session.user.id,
                },
                select: {
                  progress: true,
                },
              },
            },
          },
          ratings: true,
          _count: {
            select: {
              likes: true,
              saves: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  const transformedBooksToRead = booksToRead
    .map((book) => {
      // Calculate overall book progress based on chapters
      const totalChapters = book.chapters.length;
      const completedChapters = book.chapters.filter(
        (chapter) => chapter.readingProgress[0]?.progress >= 100
      ).length;
      const bookProgress =
        totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

      return {
        ...transformBook(book),
        progress: bookProgress,
      };
    })
    .filter((book) => book.progress > 0 && book.progress < 100)
    .sort((a, b) => b.progress - a.progress);

  const transformedSavedBooks = savedBooks.map((save) =>
    transformBook(save.book)
  );
  const transformedLikedBooks = likedBooks.map((like) =>
    transformBook(like.book)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground">Continue your reading journey</p>
      </div>

      {/* Quick Actions */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Link href="/books/new">
          <Button className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span>Write New Book</span>
          </Button>
        </Link>
        <Link href="/bookmarks">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <Bookmark className="h-6 w-6" />
            <span>Your Bookmarks</span>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <Star className="h-6 w-6" />
            <span>Your Profile</span>
          </Button>
        </Link>
        <Link href="/books">
          <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
            <Clock className="h-6 w-6" />
            <span>Continue Reading</span>
          </Button>
        </Link>
      </div> */}

      {/* Finish Reading Section */}
      {transformedBooksToRead.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Finish Reading</h2>
            <Link href="/profile?tab=books">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-hidden">
            {transformedBooksToRead.map((book) => (
              <div key={book.id} className="relative">
                <div className=" flex flex-col overflow-hidden gap-4 w-auto ">
                  <BookCard book={book} variant="default"  />
                  <div className="h-1 bg-muted rounded-b-lg ">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${book.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Books */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Saved for Later</h2>
          <Link href="/profile?tab=saved">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        {transformedSavedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {transformedSavedBooks.map((book) => (
              <BookCard key={book.id} book={book} variant="default" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No saved books yet</p>
            <Link href="/books">
              <Button className="mt-4">Browse Books</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Liked Books */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Books You Like</h2>
          <Link href="/profile?tab=liked">
            <Button variant="ghost">View All</Button>
          </Link>
        </div>
        {transformedLikedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {transformedLikedBooks.map((book) => (
              <BookCard key={book.id} book={book} variant="default" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No liked books yet</p>
            <Link href="/books">
              <Button className="mt-4">Discover Books</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
