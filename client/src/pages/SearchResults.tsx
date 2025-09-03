import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Book as BookIcon } from "lucide-react";
import { searchBooks, Book as BookType } from "@/lib/search-api";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (err) {
      setError("Failed to search for books");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">Searching for "{query}"...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="aspect-[2/3]">
              <CardContent className="p-0">
                <Skeleton className="w-full h-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <p className="text-muted-foreground">
          {books.length} {books.length === 1 ? "book" : "books"} found matching "{query}"
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {books.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <BookIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-semibold mb-2">No books found</p>
          <p className="text-muted-foreground">
            No books match your search for "{query}". Try a different search term.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {books.map((book) => (
          <div 
            key={book.id} 
            className="cursor-pointer hover:scale-105 transition-transform group"
            onClick={() => handleBookClick(book.id)}
          >
            <Card className="aspect-[2/3] mb-2">
              <CardContent className="p-0 h-full relative">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`absolute inset-0 bg-gray-200 rounded-md flex items-center justify-center ${book.coverUrl ? 'hidden' : 'flex'}`}
                >
                  <BookIcon className="h-12 w-12 text-gray-500" />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-1 px-1">
              <p className="text-sm font-medium line-clamp-2 leading-tight">{book.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;