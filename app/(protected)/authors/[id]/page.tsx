import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookCard } from "@/components/ui/book-card";
import { FollowButton } from '@/components/FollowButton';
import { auth } from '@/auth';
import { BookOpen, Users, UserPlus, PenTool } from 'lucide-react';
import { transformBook } from '@/lib/books';
import { isFollowingUser, getFollowCounts } from "@/lib/user";

interface AuthorPageProps {
  params: {
    id: string;
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const author = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    include: {
      books: {
        where: {
          published: true
        },
        include: {
          author: true,
          chapters: {
            include: {
              readingProgress: {
                where: currentUserId ? {
                  userId: currentUserId,
                } : undefined,
              },
            },
          },
          likes: true,
          ratings: true,
          saves: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      // Get followers (users who are following this author)
      followers: {
        where: {
          followingId: params.id  // This author is being followed
        },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      },
      // Get following (users this author is following)
      following: {
        where: {
          followerId: params.id  // This author is following others
        },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      },
      _count: {
        select: {
          followers: true,  // Count of users following this author
          following: true,  // Count of users this author is following
        }
      }
    },
  });

  if (!author) {
    notFound();
  }

  // Check if current user is following this author
  const isFollowing = await isFollowingUser(session?.user?.id, author.id);
  const { followersCount } = await getFollowCounts(author.id);
  
  // Get counts
  const followerCount = author._count.followers;  // Number of users following this author
  const followingCount = author._count.following;  // Number of users this author is following
  const totalBooks = author.books.length;
  const totalLikes = author.books.reduce((acc, book) => acc + book.likes.length, 0);
  const totalViews = author.books.reduce((acc, book) => acc + book.views, 0);
  const totalChapters = author.books.reduce((acc, book) => acc + book.chapters.length, 0);

  const transformedBooks = author.books.map(book => transformBook(book));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card border-b rounded-4xl m-4">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 md:w-48 md:h-48">
              <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                <div className="text-6xl font-bold text-primary">
                  {author.name?.[0]?.toUpperCase() || 'A'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-2 shadow-lg">
                <PenTool className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{author.name}</h1>
              <p className="text-muted-foreground mb-6 max-w-2xl">{author.bio || 'No bio available'}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">{totalBooks} Books</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">{followerCount} Followers</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">{followingCount} Following</span>
                </div>
              </div>
              {currentUserId && currentUserId !== author.id && (
                <FollowButton 
                  authorId={author.id}
                  initialIsFollowing={isFollowing}
                  followersCount={followersCount}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">{totalBooks}</div>
            <div className="text-muted-foreground">Total Books</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">{totalChapters}</div>
            <div className="text-muted-foreground">Total Chapters</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">{totalLikes}</div>
            <div className="text-muted-foreground">Total Likes</div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">{totalViews}</div>
            <div className="text-muted-foreground">Total Views</div>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Books by {author.name}</h2>
          {/* <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Sort by Latest
            </Button>
            <Button variant="outline" size="sm">
              Sort by Popular
            </Button>
          </div> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {transformedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="default"
            />
          ))}
        </div>
      </div>
    </div>
  );
}