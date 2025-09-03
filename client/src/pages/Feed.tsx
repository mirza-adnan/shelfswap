import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import axios from "axios";
import MessageButton from "@/components/MessageButton";
import { UserDTO } from "@/lib/type";

interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
}

interface FeedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface FeedMatch {
  user: FeedUser;
  theirBooks: Book[];
  myBooks: Book[];
}

const Feed: React.FC = () => {
  const [matches, setMatches] = useState<FeedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8081/api/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMatches(response.data);
    } catch (error) {
      toast({
        title: "Error loading feed",
        description: "Failed to load your book matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Your Book Matches
            </h1>
            <p className="text-muted-foreground mt-2">
              Found {matches.length} potential book exchanges
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchFeed}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No matches found yet
              </h3>
              <p className="text-muted-foreground">
                Add more books to your shelf and wishlist to find potential
                exchanges.
              </p>
              <Button
                asChild
                className="mt-4"
              >
                <Link to="/profile">Manage Your Books</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <Card
                key={match.user.id}
                className="overflow-hidden shadow-2xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {getInitials(match.user.firstName, match.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        <Link
                          to={`/profile/${match.user.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {match.user.firstName} {match.user.lastName}
                        </Link>
                      </CardTitle>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-accent/10 text-accent"
                    >
                      {match.theirBooks.length + match.myBooks.length} matches
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Books they have that you want */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">
                      They have
                    </h4>
                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {match.theirBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex-shrink-0 w-64 p-3 bg-orange-50 rounded-lg flex items-center space-x-3"
                        >
                          <img
                            src={
                              book.coverUrl ||
                              "https://via.placeholder.com/60x90?text=No+Cover"
                            }
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                              {book.title}
                            </h5>
                            <p className="font-medium text-xs text-muted-foreground line-clamp-1">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Books you have that they want */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">For:</h4>
                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {match.myBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex-shrink-0 w-64 p-3 bg-blue-50 rounded-lg flex items-center space-x-3"
                        >
                          <img
                            src={
                              book.coverUrl ||
                              "https://via.placeholder.com/60x90?text=No+Cover"
                            }
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
                              {book.title}
                            </h5>
                            <p className="font-medium text-xs text-muted-foreground line-clamp-1">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <MessageButton
                      recipient={{
                        id: match.user.id,
                        email: match.user.email,
                        firstName: match.user.firstName,
                        lastName: match.user.lastName,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
