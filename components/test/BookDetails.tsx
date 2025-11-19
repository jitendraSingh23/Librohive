"use client";

import Link from 'next/link';
import Image from 'next/image';
import { type BookWithDetails } from '@/lib/books';
import { Bookmark, Star, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface BookDetailsProps {
  book: BookWithDetails;
}

export default function BookDetails({ book }: BookDetailsProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!session?.user) return;
      try {
        const response = await fetch(`/api/books/${book.id}/saves`);
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error('Error checking save status:', error);
      }
    };

    checkSaveStatus();
  }, [book.id, session?.user]);

  const handleSave = async () => {
    if (!session?.user) {
      toast.error('Please sign in to save books');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${book.id}/saves`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
        toast.success(data.isSaved ? 'Book saved' : 'Book removed from saves');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the slug creation since we'll use ID
  console.log('Book data:', {
    id: book.id,
    title: book.title,
    chaptersCount: book.chapters.length,
    chaptersWithProgress: book.chapters.map(chapter => ({
      order: chapter.order,
      title: chapter.title,
      progress: chapter.readingProgress?.[0]?.progress || 0
    }))
  });
  
  // Calculate reading progress
  const progress = book.chapters.reduce((acc, chapter) => {
    const chapterProgress = chapter.readingProgress?.[0]?.progress || 0;
    console.log(`Chapter ${chapter.order} progress:`, chapterProgress);
    if (chapterProgress >= 100) return acc + 1;
    return acc;
  }, 0) / book.chapters.length * 100;
  
  console.log('Overall progress:', progress);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover and Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="relative h-80 w-full md:h-96 md:max-w-xs mx-auto">
            <Image
              src={book.coverImage || '/placeholder.svg?height=400&width=300'}
              alt={book.title}
              fill
              className="object-contain rounded-lg shadow-md"
            />
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/books/${book.id}/chapters/1`}>Read Now</Link>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSave}
              disabled={isLoading}
              className={isSaved ? 'bg-primary/10' : ''}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-primary mr-2" />
              <span className="font-semibold">{book.rating.toFixed(1)}</span>
              <span className="text-muted-foreground ml-2">
                ({book.totalRatings} {book.totalRatings === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
            
            <div className="flex items-center">
              <User className="w-5 h-5 text-muted-foreground mr-2" />
              <Link 
                href={`/authors/${book.author.id}`}
                className="text-primary hover:underline"
              >
                {book.author.name}
              </Link>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">{book.chapters.length} chapters</span>
            </div>
          </div>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Book Info and Chapters */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
            <p className="text-muted-foreground whitespace-pre-line">
              {book.description || 'No description available.'}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Reading Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Chapters</h2>
            <div className="space-y-3">
              {book.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/books/${book.id}/chapters/${chapter.order}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Chapter {chapter.order}:</span> {chapter.title}
                    </div>
                    {chapter.readingProgress?.[0]?.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full"
                            style={{ width: `${chapter.readingProgress[0].progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {chapter.readingProgress[0].progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}