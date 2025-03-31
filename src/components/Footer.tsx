
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-getmore-purple">Get</span>
              <span className="text-2xl font-bold text-getmore-turquoise">More</span>
              <span className="text-xl font-bold text-white">BW</span>
            </div>
            <p className="text-gray-400 mb-6">
              Quick commerce platform delivering groceries and essentials across Botswana in minutes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-getmore-purple transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-getmore-purple transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-getmore-purple transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-getmore-turquoise">Home</Link>
              </li>
              <li>
                <Link to="/learn-more" className="text-gray-400 hover:text-getmore-turquoise">About Us</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Categories</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-getmore-turquoise">How it Works</Link>
              </li>
              <li>
                <Link to="/become-courier" className="text-gray-400 hover:text-getmore-turquoise">Become a Courier</Link>
              </li>
              <li>
                <Link to="/store-signup" className="text-gray-400 hover:text-getmore-turquoise">Host Your Store</Link>
              </li>
              <li>
                <Link to="/courier-login" className="text-gray-400 hover:text-getmore-turquoise">Courier Login</Link>
              </li>
              <li>
                <Link to="/admin-signup" className="text-gray-400 hover:text-getmore-turquoise">Admin Portal</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Groceries</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Fruits & Vegetables</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Beverages</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Meat & Poultry</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-getmore-turquoise">Ready Meals</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mt-1 mr-2 text-getmore-turquoise" />
                <span className="text-gray-400">123 Main Street, Gaborone, Botswana</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-getmore-turquoise" />
                <span className="text-gray-400">+267 71 234 567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-getmore-turquoise" />
                <span className="text-gray-400">info@getmorebw.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Get More BW. All rights reserved.</p>
          <p className="text-gray-500 mt-2">Built with ❤️ by DevGen Botswana</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
