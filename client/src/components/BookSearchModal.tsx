import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Plus } from "lucide-react";

interface BookAddRequest {
  id: string;
  title: string;
  author?: string;
  coverId?: number;
}

interface BookSearchModalProps {
  open: boolean;
  onClose: () => void;
  onBookSelect: (book: BookAddRequest) => void;
  type: "shelf" | "wishlist";
}

const BookSearchModal: React.FC<BookSearchModalProps> = ({
  open,
  onClose,
  onBookSelect,
  type,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<BookAddRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          searchQuery
        )}&limit=20`
      );
      const data = await response.json();
      const filteredData = data.docs.filter((book) => {
        return !!book?.author_name && !!book.title && !!book.key;
      });
      const bookData = filteredData.map((book) => {
        return {
          id: book.key,
          title: book.title,
          author: book.author_name[0],
          coverId: book.cover_i || "",
        };
      });
      setBooks(bookData || []);
    } catch (error) {
      console.log(error);
      toast({
        title: "Search failed",
        description: "Failed to search for books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchBooks();
    }
  };

  const getCoverUrl = (book: BookAddRequest) => {
    if (book.coverId) {
      return `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
    }
    return "https://via.placeholder.com/128x192?text=No+Cover";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] bg-primary border-border">
        <DialogHeader>
          <DialogTitle className="text-primary-foreground">
            Add Book to {type === "shelf" ? "Your Shelf" : "Your Wishlist"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for books by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-secondary border-secondary text-primary-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={searchBooks}
              disabled={loading || !searchQuery.trim()}
              className="bg-secondary-accent hover:bg-secondary-accent/90 text-secondary-accent-foreground"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3 pr-4">
            {hasSearched && books.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No books found. Try a different search term.
              </div>
            )}

            {books.map((book) => (
              <Card
                key={book.id}
                className="overflow-hidden bg-secondary border-border"
              >
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <img
                      src={getCoverUrl(book)}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary-foreground mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {book.author || "Unknown Author"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onBookSelect(book)}
                      className="shrink-0 bg-secondary-accent hover:bg-secondary-accent/90 text-secondary-accent-foreground"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!hasSearched && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for books to add to your {type}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookSearchModal;
