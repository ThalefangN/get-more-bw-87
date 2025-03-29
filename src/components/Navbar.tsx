
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Search, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CartButton from "./CartButton";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-getmore-purple">Get</span>
              <span className="text-2xl font-bold text-getmore-turquoise">More</span>
              <span className="text-xl font-bold text-gray-700">BW</span>
            </Link>
          </div>
          
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
            <input 
              type="text"
              placeholder="Search for groceries, food, etc."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
            />
            <Search className="absolute right-3 text-gray-400" size={20} />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-getmore-purple">Home</Link>
            <a href="#categories" className="text-gray-700 hover:text-getmore-purple">Categories</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-getmore-purple">How it Works</a>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-getmore-purple">
                  <User size={24} />
                  <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button 
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/sign-in">
                  <Button variant="outline" className="border-getmore-purple text-getmore-purple hover:bg-getmore-purple hover:text-white">
                    Sign in
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button className="bg-getmore-purple hover:bg-purple-700 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
            
            <CartButton />
          </nav>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <CartButton />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="flex items-center relative mb-4">
              <input 
                type="text"
                placeholder="Search for groceries, food, etc."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-getmore-purple"
              />
              <Search className="absolute right-3 text-gray-400" size={20} />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">Home</Link>
              <a href="#categories" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">Categories</a>
              <a href="#how-it-works" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">How it Works</a>
              
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  <div className="flex items-center text-gray-700 py-2 px-3 rounded-md">
                    <User size={20} className="mr-2" />
                    <span>Hello, {user?.name?.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="flex items-center text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100"
                  >
                    <LogOut size={20} className="mr-2" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2 pt-2"></div>
                  <Link to="/sign-in" className="flex items-center text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">
                    <User size={20} className="mr-2" />
                    <span>Sign in</span>
                  </Link>
                  <Link to="/sign-up" className="bg-getmore-purple text-white py-2 px-3 rounded-md hover:bg-purple-700 text-center">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
