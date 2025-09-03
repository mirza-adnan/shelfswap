import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, BookPlus, Search, Book } from "lucide-react";
import BookSearchModal from "@/components/BookSearchModal";
import MessageButton from "@/components/MessageButton";
import axios from "axios";
import { BookAddRequest, BookResponse, UserDTO } from "@/lib/type";

interface ProfileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [shelf, setShelf] = useState<BookResponse[]>([]);
  const [wishlist, setWishlist] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchType, setSearchType] = useState<"shelf" | "wishlist">("shelf");

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      if (isOwnProfile) {
        setProfileUser(currentUser as ProfileUser);

        // Fetch current user's shelf and wishlist
        const [shelfResponse, wishlistResponse] = await Promise.all([
          axios.get(`http://localhost:8081/api/books/shelf/${currentUser?.id}`),
          axios.get(
            `http://localhost:8081/api/books/wishlist/${currentUser?.id}`
          ),
        ]);

        setShelf(shelfResponse.data);
        setWishlist(wishlistResponse.data);
      } else {
        // Fetch other user's profile, shelf, and wishlist
        const [userResponse, shelfResponse, wishlistResponse] =
          await Promise.all([
            axios.get(`http://localhost:8081/api/users/${userId}`),
            axios.get(`http://localhost:8081/api/books/shelf/${userId}`),
            axios.get(`http://localhost:8081/api/books/wishlist/${userId}`),
          ]);

        setProfileUser(userResponse.data);
        setShelf(shelfResponse.data);
        setWishlist(wishlistResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error loading profile",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = (book: BookAddRequest, type: "shelf" | "wishlist") => {
    setSearchType(type);
    setShowBookSearch(true);
  };

  const handleBookAdded = async (book: BookAddRequest) => {
    try {
      const endpoint =
        searchType === "shelf" ? "/books/shelf" : "/books/wishlist";

      const res = await axios.post(
        `http://localhost:8081/api${endpoint}`,
        book
      );

      const bookData: BookResponse = res.data;

      if (searchType === "shelf") {
        setShelf([...shelf, bookData]);
      } else {
        setWishlist([...wishlist, bookData]);
      }

      toast({
        title: "Book added!",
        description: `"${book.title}" has been added to your ${searchType}.`,
      });

      setShowBookSearch(false);
    } catch (error) {
      toast({
        title: "Error adding book",
        description: "Failed to add the book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveBook = async (
    bookId: string,
    type: "shelf" | "wishlist"
  ) => {
    try {
      const endpoint = type === "shelf" ? "/books/shelf" : "/books/wishlist";

      await axios.delete(`http://localhost:8081/api${endpoint}/${bookId}`);

      if (type === "shelf") {
        setShelf(shelf.filter((book) => book.id !== bookId));
      } else {
        setWishlist(wishlist.filter((book) => book.id !== bookId));
      }

      toast({
        title: "Book removed!",
        description: `Book has been removed from your ${type}.`,
      });
    } catch (error) {
      toast({
        title: "Error removing book",
        description: "Failed to remove the book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading || !profileUser) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                  {getInitials(profileUser.firstName, profileUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2 relative">
                  <span className="relative">
                    {profileUser.firstName} {profileUser.lastName}
                    {isOwnProfile && (
                      <Badge
                        variant="secondary"
                        className="absolute top-[7px] -right-14"
                      >
                        You
                      </Badge>
                    )}
                  </span>
                </CardTitle>

                <div className="flex space-x-4 mt-4 text-sm">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{shelf.length}</strong>{" "}
                    books on Shelf
                  </span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">
                      {wishlist.length}
                    </strong>{" "}
                    books in Wishlist
                  </span>
                </div>
              </div>
              {!isOwnProfile && (
                <MessageButton
                  recipient={{
                    id: profileUser.id,
                    email: profileUser.email,
                    firstName: profileUser.firstName,
                    lastName: profileUser.lastName,
                  }}
                  className="ml-4"
                />
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Books Section */}
        <Tabs
          defaultValue="shelf"
          className="w-full"
        >
          <TabsList className="grid w-4/5 mx-auto grid-cols-2 mb-6 bg-black text-white">
            <TabsTrigger value="shelf">Shelf</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>

          <TabsContent value="shelf">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">Shelf</CardTitle>
                {isOwnProfile && (
                  <Button onClick={() => handleAddBook(null, "shelf")}>
                    <BookPlus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {shelf.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {isOwnProfile
                        ? "Your shelf is empty"
                        : "No books on shelf"}
                    </h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "Add books you own to start finding exchanges."
                        : "This user hasn't added any books to their shelf yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {shelf.map((book) => (
                      <div
                        key={book.id}
                        className="text-center group relative"
                      >
                        <div className="relative">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-48 object-cover rounded-lg shadow-md mb-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-48 bg-gray-200 rounded-lg shadow-md mb-2 flex items-center justify-center ${book.coverUrl ? 'hidden' : 'flex'}`}
                          >
                            <Book className="h-16 w-16 text-gray-500" />
                          </div>
                          {isOwnProfile && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveBook(book.id, "shelf")}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.author}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">Wishlist</CardTitle>
                {isOwnProfile && (
                  <Button onClick={() => handleAddBook(null, "wishlist")}>
                    <BookPlus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {isOwnProfile
                        ? "Your wishlist is empty"
                        : "No books in wishlist"}
                    </h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "Add books you want to read to find potential exchanges."
                        : "This user hasn't added any books to their wishlist yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {wishlist.map((book) => (
                      <div
                        key={book.id}
                        className="text-center group relative"
                      >
                        <div className="relative">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-48 object-cover rounded-lg shadow-md mb-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-48 bg-gray-200 rounded-lg shadow-md mb-2 flex items-center justify-center ${book.coverUrl ? 'hidden' : 'flex'}`}
                          >
                            <Book className="h-16 w-16 text-gray-500" />
                          </div>
                          {isOwnProfile && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleRemoveBook(book.id, "wishlist")
                              }
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.author}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Search Modal */}
      <BookSearchModal
        open={showBookSearch}
        onClose={() => setShowBookSearch(false)}
        onBookSelect={handleBookAdded}
        type={searchType}
      />
    </div>
  );
};

export default Profile;
