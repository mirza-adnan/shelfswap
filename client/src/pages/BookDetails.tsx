import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users } from "lucide-react";
import { getUsersWhoHaveBook, User } from "@/lib/search-api";
import MessageButton from "@/components/MessageButton";
import axios from "axios";

interface BookData {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

const BookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<BookData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
      fetchUsersWhoHaveBook();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/books/${bookId}`);
      setBook(response.data);
    } catch (err) {
      console.error("Failed to fetch book details:", err);
    }
  };

  const fetchUsersWhoHaveBook = async () => {
    if (!bookId) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await getUsersWhoHaveBook(bookId);
      setUsers(results);
    } catch (err) {
      setError("Failed to load users who have this book");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (loading && !book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <Skeleton className="w-48 h-72 mx-auto lg:mx-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/search" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to search
        </Link>
      </div>

      {book && (
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-shrink-0">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto lg:mx-0"
              onError={(e) => {
                e.currentTarget.src = "/book-placeholder.png";
              }}
            />
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{users.length} {users.length === 1 ? "user has" : "users have"} this book</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Users who have this book:</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Users who have this book:</h2>
          
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No other users found</p>
              <p className="text-muted-foreground">
                No other users currently have this book in their shelf.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          to={`/profile/${user.id}`}
                          className="font-medium hover:underline"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                      </div>
                      <MessageButton
                        recipient={{
                          id: user.id,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          email: user.email,
                        }}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        iconOnly={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookDetails;