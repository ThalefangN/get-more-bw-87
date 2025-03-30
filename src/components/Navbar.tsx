import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartButton from "@/components/CartButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link to="/" className="inline-flex items-center">
            <span className="text-2xl font-bold text-getmore-purple">Get</span>
            <span className="text-2xl font-bold text-getmore-turquoise">More</span>
            <span className="text-xl font-bold text-gray-700">BW</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Categories
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-getmore-purple transition-colors">
              How It Works
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <CartButton />
                <div className="relative group">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-getmore-purple text-white">{user.email ? user.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button variant="outline" className="border-getmore-purple text-getmore-purple hover:bg-getmore-purple hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button className="bg-getmore-purple hover:bg-purple-700 text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container-custom py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-getmore-purple transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-getmore-purple transition-colors" onClick={toggleMenu}>
                Shop
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-getmore-purple transition-colors" onClick={toggleMenu}>
                Categories
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-getmore-purple transition-colors" onClick={toggleMenu}>
                How It Works
              </Link>
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-getmore-purple text-white">{user.email ? user.email.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CartButton />
                      <NotificationBell />
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/sign-in" className="w-full" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full border-getmore-purple text-getmore-purple hover:bg-getmore-purple hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/sign-up" className="w-full" onClick={toggleMenu}>
                      <Button className="w-full bg-getmore-purple hover:bg-purple-700 text-white">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
