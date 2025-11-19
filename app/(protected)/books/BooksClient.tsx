'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter } from 'lucide-react';
import { type BookWithDetails } from '@/lib/books';
import { BookCard } from "@/components/ui/book-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BooksClientProps {
  initialBooks: BookWithDetails[];
}

export default function BooksClient({ initialBooks }: BooksClientProps) {
  const [books] = useState<BookWithDetails[]>(initialBooks);
  const [filteredBooks, setFilteredBooks] = useState<BookWithDetails[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    let filtered = [...books];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredBooks(filtered);
  }, [books, searchQuery, sortBy]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px] bg-muted"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-muted">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="bg-muted">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredBooks.map((book) => (
          <BookCard 
            key={book.id} 
            book={book}
            variant="default"
          />
        ))}
      </div>

      {/* No Results Message */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 