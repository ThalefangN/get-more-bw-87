
import { useState } from "react";
import { Menu, X, User, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartButton from "./CartButton";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-getmore-purple">Get</span>
              <span className="text-2xl font-bold text-getmore-turquoise">More</span>
              <span className="text-xl font-bold text-gray-700">BW</span>
            </a>
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
            <a href="#" className="text-gray-700 hover:text-getmore-purple">Home</a>
            <a href="#categories" className="text-gray-700 hover:text-getmore-purple">Categories</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-getmore-purple">How it Works</a>
            <button className="text-gray-700 hover:text-getmore-purple">
              <User size={24} />
            </button>
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
              <a href="#" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">Home</a>
              <a href="#categories" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">Categories</a>
              <a href="#how-it-works" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100">How it Works</a>
              <a href="#" className="text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                <User size={20} className="mr-2" />
                <span>Account</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
