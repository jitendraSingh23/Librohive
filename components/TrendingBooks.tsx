'use client';

import { useState, useEffect } from 'react';
import { BookCard } from './ui/book-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
  };
  ratings: Array<{
    id: string;
    value: number;
    userId: string;
  }>;
  saves: any[];
  comments: any[];
  tags: string[];
  _count: {
    ratings: number;
    likes: number;
    comments: number;
  };
}

export default function TrendingBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        const response = await fetch('/api/trending', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          next: { revalidate: 0 }
        });

        // Log response details for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        setBooks(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-[250px]">
              <Skeleton className="h-[400px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No trending books available
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <div 
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide whitespace-nowrap 
          after:absolute after:right-0 after:top-0 after:h-full after:w-24 after:bg-gradient-to-l after:from-background after:to-transparent"
        >
          {books.map((book) => (
            <div key={book.id} className="snap-start shrink-0 w-[250px]">
              <BookCard
                book={{
                  ...book,
                  userRating: null,
                  published: true,
                  progress: 0,
                }}
                variant="default"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center py-15">
        <Link href="/books">
        <Button variant="outline" size="lg">
          Discover More Books
        </Button>
        </Link>
      </div>
    </div>
  );
}