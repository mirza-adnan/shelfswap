import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  User,
  Inbox,
  Search,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MessagingModal from "./MessagingModal";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-primary border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to={user ? "/feed" : "/"}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="h-8 w-8 text-primary-foreground" />
          <span className="text-2xl font-bold text-primary-foreground font-manrope">
            shelfswap
          </span>
        </Link>

        {/* Search Bar - Only show when logged in */}
        {user && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-secondary text-primary-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMessagingModalOpen(true)}
                className="text-primary-foreground hover:bg-secondary"
              >
                <Inbox className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-primary-foreground hover:bg-secondary"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:block">{user.firstName}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                >
                  <DropdownMenuItem
                    className="space-y-4 hover:bg-secondary cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-secondary cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-secondary cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-white hover:bg-secondary"
              >
                <Link to="/auth">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-white text-black hover:bg-white/80"
              >
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={() => setIsMessagingModalOpen(false)}
      />
    </header>
  );
};

export default Header;
