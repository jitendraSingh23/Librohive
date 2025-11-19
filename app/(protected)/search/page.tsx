import { prisma } from '@/lib/prisma';
import { transformBook } from '@/lib/books';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCard } from "@/components/ui/book-card";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const query = searchParams.q || '';
  console.log('Search query:', query);
  console.log('Search params:', searchParams);

  // Base query for books
  const baseQuery = {
    include: {
      author: true,
      chapters: {
        include: {
          readingProgress: {
            where: { userId: session.user.id }
          }
        }
      },
      likes: true,
    },
  };

  // First, let's check if we can get any books at all
  const allBooks = await prisma.book.findMany({
    ...baseQuery,
    where: {
      OR: [
        { published: true },
        { authorId: session.user.id }
      ]
    }
  });
  console.log('Total books in database:', allBooks.length);

  // Fetch all books matching the search query
  const books = await prisma.book.findMany({
    ...baseQuery,
    where: {
      AND: [
        {
          OR: [
            { published: true },
            { authorId: session.user.id }
          ]
        },
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { author: { name: { contains: query, mode: 'insensitive' } } },
            { chapters: { some: { title: { contains: query, mode: 'insensitive' } } } },
          ],
        } : {}
      ]
    }
  });
  console.log('Found books:', books.length);
  console.log('Books:', books.map(b => ({ id: b.id, title: b.title })));

  // Fetch user's liked books matching the search query
  const likedBooks = await prisma.bookLike.findMany({
    where: {
      userId: session.user.id,
      ...(query ? {
        book: {
          AND: [
            {
              OR: [
                { published: true },
                { authorId: session.user.id }
              ]
            },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { author: { name: { contains: query, mode: 'insensitive' } } },
                { chapters: { some: { title: { contains: query, mode: 'insensitive' } } } },
              ],
            }
          ]
        },
      } : {}),
    },
    include: {
      book: {
        ...baseQuery,
      },
    },
  });
  console.log('Found liked books:', likedBooks.length);
  console.log('Liked books:', likedBooks.map(lb => ({ id: lb.book.id, title: lb.book.title })));

  // Fetch user's saved books matching the search query
  const savedBooks = await prisma.bookSave.findMany({
    where: {
      userId: session.user.id,
      ...(query ? {
        book: {
          AND: [
            {
              OR: [
                { published: true },
                { authorId: session.user.id }
              ]
            },
            {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { author: { name: { contains: query, mode: 'insensitive' } } },
                { chapters: { some: { title: { contains: query, mode: 'insensitive' } } } },
              ],
            }
          ]
        },
      } : {}),
    },
    include: {
      book: {
        ...baseQuery,
      },
    },
  });
  console.log('Found saved books:', savedBooks.length);
  console.log('Saved books:', savedBooks.map(sb => ({ id: sb.book.id, title: sb.book.title })));

  const transformedBooks = books.map(book => transformBook(book));
  const transformedLikedBooks = likedBooks.map(like => transformBook(like.book));
  const transformedSavedBooks = savedBooks.map(save => transformBook(save.book));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search Results for "${query}"` : 'All Books'}
      </h1>
      
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Books ({transformedBooks.length})</TabsTrigger>
          <TabsTrigger value="liked">Liked ({transformedLikedBooks.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({transformedSavedBooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {transformedBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {query ? 'No books found matching your search.' : 'No books available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {transformedBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  variant="default"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="space-y-6">
          {transformedLikedBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No liked books.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {transformedLikedBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  variant="default"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {transformedSavedBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No saved books.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {transformedSavedBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  variant="default"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 