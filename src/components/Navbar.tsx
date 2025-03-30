import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import CartButton from "./CartButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogOut, User, ShoppingBag } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationBell from "./NotificationBell";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Close the mobile menu when the route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm">
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <Link to="/" className="font-bold text-xl">
              <span className="text-getmore-purple">Get</span>
              <span className="text-getmore-turquoise">More</span>
              <span className="text-gray-800">BW</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="p-4">
            <Link
              to="/shop"
              className="block py-2 text-gray-700 hover:text-getmore-purple"
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="block py-2 text-gray-700 hover:text-getmore-purple"
            >
              Categories
            </Link>
            <Link
              to="/how-it-works"
              className="block py-2 text-gray-700 hover:text-getmore-purple"
            >
              How it works
            </Link>
            <Link
              to="/learn-more"
              className="block py-2 text-gray-700 hover:text-getmore-purple"
            >
              Learn More
            </Link>
            {user && (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 hover:text-getmore-purple"
                >
                  Profile
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 mt-6"
                  onClick={signOut}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
      
      <div className="border-b">
        <div className="container-custom flex items-center justify-between py-3">
          <Link to="/" className="font-bold text-xl flex items-center">
            <span className="text-getmore-purple">Get</span>
            <span className="text-getmore-turquoise">More</span>
            <span className="text-gray-800">BW</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/shop"
              className="text-gray-600 hover:text-getmore-purple text-sm"
            >
              Shop
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-getmore-purple text-sm"
            >
              Categories
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-600 hover:text-getmore-purple text-sm"
            >
              How it works
            </Link>
            <Link
              to="/learn-more"
              className="text-gray-600 hover:text-getmore-purple text-sm"
            >
              Learn More
            </Link>
          </nav>

          <div className="flex items-center">
            <NotificationBell />
            <CartButton />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8B5CF6&color=fff`} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Link
                  to="/sign-in"
                  className="text-gray-600 hover:text-getmore-purple text-sm"
                >
                  Sign In
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/sign-up"
                  className="text-gray-600 hover:text-getmore-purple text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 lg:hidden text-gray-600"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
