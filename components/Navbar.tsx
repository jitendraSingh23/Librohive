'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';
import { BookWithDetails } from '@/lib/books';
import { searchBooks } from '@/lib/actions';
import Image from 'next/image';
import logo from "@/public/img/LibroHivelogo.svg";
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookWithDetails[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      console.log('Searching for:', trimmedQuery);
      const encodedQuery = encodeURIComponent(trimmedQuery);
      console.log('Encoded query:', encodedQuery);
      router.push(`/search?q=${encodedQuery}`);
      setIsSearching(false);
    }
  };

  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        const results = await searchBooks(query.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <Image src={logo} alt='logo' className='h-12 w-28 ' />
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl mx-8 relative">
            <form onSubmit={handleSearch} className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" 
                onClick={handleSearch}
              />
              <Input
                type="search"
                placeholder="Search books, authors, or chapters..."
                value={searchQuery}
                onChange={handleSearchInput}
                className="pl-10"
              />
            </form>

            {/* Search Preview Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50">
                <div className="py-2">
                  {searchResults.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="block px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => setIsSearching(false)}
                    >
                      <div className="flex items-center space-x-3">
                        {book.coverImage && (
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            width={32}
                            height={48}
                            className="w-8 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{book.title}</div>
                          <div className="text-sm text-muted-foreground">
                            by {book.author.name}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {[
              { href: "/home", label: "Home" },
              { href: "/books", label: "Books" },
              { href: "/scroll", label: "Scroll" },
              { href: "/upload/writebook", label: "Write" },
              { href: "/profile", label: "Profile" }
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:origin-left",
                    "after:transition-transform after:duration-300",
                    "hover:text-primary"," hover:bg-transparent",
                    isActive(href) 
                      ? "after:bg-primary after:scale-x-100 text-primary" 
                      : "after:bg-primary/70 after:scale-x-0 hover:after:scale-x-100"
                  )}
                >
                  {label}
                </Button>
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}