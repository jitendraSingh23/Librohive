'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, BookMarked, Heart, Pencil } from 'lucide-react';
import { BookCard } from "@/components/ui/book-card";
import { User } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { type BookWithDetails } from '@/lib/books';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import LogoutButton from '@/components/auth/logout-button';

interface ProfileClientProps {
  user: User & {
    books: BookWithDetails[];
    likedBooks: BookWithDetails[];
    savedBooks: BookWithDetails[];
    bookmarks: {
      id: string;
      book: BookWithDetails;
      chapterId: string;
      chapterTitle: string;
      selectedText: string;
      createdAt: Date;
    }[];
    followers: {
      follower: {
        id: string;
        name: string | null;
        image: string | null;
        email: string | null;
      };
    }[];
    following: {
      following: {
        id: string;
        name: string | null;
        image: string | null;
        email: string | null;
      };
    }[];
    _count: {
      books: number;
      followers: number;
      following: number;
      likedBooks: number;
      savedBooks: number;
      bookmarks: number;
      bookLikes: number;
      bookSaves: number;
    };
  };
  initialTab: string;
}

export default function ProfileClient({ user, initialTab }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const router = useRouter()

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href)
    if (activeTab === 'books') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', activeTab)
    }
    window.history.replaceState({}, '', url.toString())
  }, [activeTab])

  return (
    <div className="min-h-screen bg-background ">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center w-screen">
        {/* Profile Info Section */}
        <div className="relative mt-5 mb-8 ">
          <div className="flex flex-col md:flex-row gap-20 items-start">
            {/* Avatar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'Profile'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => router.push('/settings')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.bio && (
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            )}
                  {/* <p className="text-sm text-gray-500 mt-1">
                    Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </p> */}
                </div>
              </div>
            </div>

            

            {/* Simple Stats */}
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.books}</div>
                <div className="text-sm text-gray-500">Books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user._count.following}</div>
                <div className="text-sm text-gray-500">Following</div>
      <div className='my-4 py-4'>
        
        </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="liked">Liked Books</TabsTrigger>
            <TabsTrigger value="saved">Reading List</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-8">
            <div className="container max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {user.books.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    variant="manageable"
                    onDelete={async (bookId) => {
                      const response = await fetch(`/api/books/${bookId}/manage`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          action: 'delete' 
                        })
                      });
                      if (!response.ok) throw new Error('Failed to delete book');
                      router.refresh();
                    }}
                    onPublish={async (bookId) => {
                      const response = await fetch(`/api/books/${bookId}/manage`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          action: book.published ? 'unpublish' : 'publish' 
                        })
                      });
                      if (!response.ok) throw new Error('Failed to update book status');
                      router.refresh();
                    }}
                  />
                ))}
              </div>
            </div>
            {user.books.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Books Yet</h3>
                <p className="text-muted-foreground">Start writing your first book!</p>
                <Button className="mt-4" onClick={() => router.push('/upload/writebook')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Book
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="space-y-8">
            <div className="container max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {user.likedBooks.map((book) => {
                  console.log('Profile Book Data:', {
                    id: book.id,
                    title: book.title,
                    coverImage: book.coverImage,    
                  });
                  
                  return (
                    <BookCard 
                      key={book.id} 
                      book={{
                        ...book,
                        coverImage: book.coverImage || null // Ensure coverImage is properly passed
                      }}
                      variant="default"
                    />
                  );
                })}
              </div>
            </div>
            {user.likedBooks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Liked Books</h3>
                <p className="text-muted-foreground">Books you like will appear here</p>
                <Button variant="outline" className="mt-4">
                  <Heart className="h-4 w-4 mr-2" />
                  Discover Books
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-8">
            <div className="container max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {user.savedBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book}
                    variant="default"
                  />
                ))}
              </div>
            </div>
            {user.savedBooks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Your Reading List is Empty</h3>
                <p className="text-muted-foreground">Save books to read later</p>
                <Button variant="outline" className="mt-4">
                  <BookMarked className="h-4 w-4 mr-2" />
                  Browse Books
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-8">
            <div className="grid gap-4">
              {user.bookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{bookmark.book.title}</h3>
                        <p className="text-sm text-muted-foreground">Chapter: {bookmark.chapterTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Bookmarked {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-4"
                        onClick={() => {
                          const chapter = bookmark.book.chapters.find(ch => ch.id === bookmark.chapterId);
                          if (chapter) {
                            router.push(`/books/${bookmark.book.id}/chapters/${chapter.order}`);
                          }
                        }}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm italic">"{bookmark.selectedText}"</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {user.bookmarks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No Bookmarks Yet</h3>
                <p className="text-muted-foreground">Your bookmarked text will appear here</p>
                <Button variant="outline" className="mt-4">
                  <BookMarked className="h-4 w-4 mr-2" />
                  Browse Books
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.followers.map((follow) => (
                <Card key={follow.follower.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={follow.follower.image || '/placeholder-user.png'}
                        alt={follow.follower.name || 'User'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{follow.follower.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{follow.follower.email?.split('@')[0]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.following.map((follow) => (
                <Card key={follow.following.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={follow.following.image || '/placeholder-user.png'}
                        alt={follow.following.name || 'User'}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{follow.following.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{follow.following.email?.split('@')[0]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}