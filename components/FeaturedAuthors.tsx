'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Author {
  id: string;
  name: string;
  image: string | null;
  _count: {
    followers: number;
    books: number;
  };
}

export function FeaturedAuthors() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/featured-authors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch authors');
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }

        setAuthors(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAuthors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!authors.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No featured authors found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {authors.map((author) => (
        <Card key={author.id} className="p-3">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={author.image || ''} alt={author.name} />
              <AvatarFallback>{author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{author.name}</h3>
              <p className="text-xs text-muted-foreground">
                {author._count.followers} followers · {author._count.books} books
              </p>
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => router.push(`/profile/${author.id}`)}
            >
              View Profile
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

