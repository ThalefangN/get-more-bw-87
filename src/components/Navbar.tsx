
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut, ShoppingBag, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CartButton from "./CartButton";
import NotificationButton from "./NotificationButton";
import { Cart } from "./Cart";
import { NotificationsPanel } from "./NotificationsPanel";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Close dropdown when toggling menu
    setShowDropdown(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white shadow-sm py-4 sticky top-0 z-30 w-full">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-getmore-purple">Get</span>
            <span className="text-2xl font-bold text-getmore-turquoise">More</span>
            <span className="text-xl font-bold">BW</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Categories
            </Link>
            <Link to="/book-cab" className="text-gray-700 hover:text-getmore-purple transition-colors">
              Book Cab
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-getmore-purple transition-colors">
              How It Works
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart & Notification buttons - visible on all views */}
            <div className="flex items-center">
              <CartButton />
              <NotificationButton />
            </div>

            {/* Auth buttons - desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 text-gray-700 hover:text-getmore-purple px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <span>{user?.email?.split('@')[0] || 'User'}</span>
                    <ChevronDown size={16} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>
                      <Link 
                        to="/orders" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShoppingBag size={16} className="mr-2" />
                        Orders
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link 
                    to="/sign-in" 
                    className="px-4 py-2 border border-getmore-purple text-getmore-purple rounded-lg hover:bg-getmore-purple hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/sign-up" 
                    className="px-4 py-2 bg-getmore-purple text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-700 hover:text-getmore-purple"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-20">
          <div className="flex flex-col p-4 space-y-4">
            <Link 
              to="/" 
              className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} className="mr-2" />
              Home
            </Link>
            <Link 
              to="/shop" 
              className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag size={20} className="mr-2" />
              Shop
            </Link>
            <Link 
              to="/categories" 
              className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/book-cab" 
              className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Book Cab
            </Link>
            <Link 
              to="/how-it-works" 
              className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            
            {/* Auth buttons for mobile */}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} className="mr-2" />
                  Profile
                </Link>
                <Link 
                  to="/orders" 
                  className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingBag size={20} className="mr-2" />
                  Orders
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center py-2 px-4 hover:bg-gray-100 rounded-lg text-left w-full"
                >
                  <LogOut size={20} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  to="/sign-in" 
                  className="w-full py-2 border border-getmore-purple text-getmore-purple rounded-lg hover:bg-getmore-purple hover:text-white transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="w-full py-2 bg-getmore-purple text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Cart and Notifications components */}
      <Cart />
      <NotificationsPanel />
    </>
  );
};

export default Navbar;
