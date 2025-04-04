
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Car, MapPin, Clock, Shield, UserPlus, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BookingModal from './BookingModal';

const CabSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleBookCabClick = () => {
    if (!isAuthenticated) {
      toast("Please sign in to book a cab", {
        description: "You need to be signed in to book a cab",
        action: {
          label: "Sign in",
          onClick: () => navigate("/sign-in")
        },
      });
      return;
    }
    
    // Show the fare input modal instead of navigating
    setShowBookingModal(true);
  };
  
  const handleBecomeDriverClick = () => {
    navigate('/driver-signup');
  };
  
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 pr-0 md:pr-12 mb-10 md:mb-0">
            <div 
              className="relative transform transition-all duration-700 hover:scale-105"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`rounded-xl overflow-hidden shadow-2xl transition-shadow duration-500 ${isHovered ? 'shadow-getmore-purple/40' : ''}`}>
                <img 
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" 
                  alt="GetMore BW Premium Cab Service"
                  className={`w-full h-auto object-cover transition-transform duration-1000 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div>
              </div>
              
              {/* Cab Image Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-2 rounded-xl shadow-lg transform transition-transform duration-500 hover:rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1620794108219-aedbaded4eea?q=80&w=1289&auto=format&fit=crop" 
                  alt="Premium Cab Driver"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
              
              {/* Additional cab image */}
              <div className={`absolute -top-6 -right-6 bg-white p-2 rounded-xl shadow-lg transform ${isHovered ? 'rotate-12' : 'rotate-6'} transition-transform duration-500`}>
                <img 
                  src="https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=2069&auto=format&fit=crop" 
                  alt="Luxury Cab"
                  className="w-24 h-16 object-cover rounded-lg"
                />
              </div>
              
              {/* 24/7 Badge */}
              <div className="absolute -bottom-6 -right-6 bg-getmore-purple p-4 rounded-xl shadow-lg text-white flex items-center transform transition-transform duration-500 hover:scale-110">
                <Clock className="mr-2 animate-pulse" />
                <span className="font-bold">Available 24/7</span>
              </div>
              
              {/* Ratings Badge */}
              <div className="absolute top-4 left-4 bg-white/90 p-2 px-3 rounded-full shadow-lg flex items-center">
                <Star className="mr-1 text-yellow-400 fill-yellow-400" size={18} />
                <span className="font-bold text-sm">4.9/5</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative">
              Need a <span className="text-getmore-purple relative">
                ride?
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-getmore-purple/40 rounded-full"></span>
              </span> Get more with our <span className="text-getmore-turquoise">cab service</span>
            </h2>
            
            <p className="text-gray-600 mb-8">
              Book a safe, comfortable ride anywhere in Botswana with our professional drivers. 
              Enjoy fixed prices, no hidden fees, and track your ride in real-time.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start transform transition hover:translate-x-2 duration-300">
                <div className="bg-getmore-purple/10 p-3 rounded-lg mr-4">
                  <Car className="text-getmore-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Professional Drivers</h3>
                  <p className="text-sm text-gray-600">Trained, verified drivers for your safety</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition hover:translate-x-2 duration-300">
                <div className="bg-getmore-purple/10 p-3 rounded-lg mr-4">
                  <MapPin className="text-getmore-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Anywhere in Botswana</h3>
                  <p className="text-sm text-gray-600">City trips or long distance transportation</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition hover:translate-x-2 duration-300">
                <div className="bg-getmore-purple/10 p-3 rounded-lg mr-4">
                  <Clock className="text-getmore-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">On-time Service</h3>
                  <p className="text-sm text-gray-600">Prompt pickups and efficient routes</p>
                </div>
              </div>
              
              <div className="flex items-start transform transition hover:translate-x-2 duration-300">
                <div className="bg-getmore-purple/10 p-3 rounded-lg mr-4">
                  <Shield className="text-getmore-purple" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Safe & Secure</h3>
                  <p className="text-sm text-gray-600">Vehicle tracking and ride monitoring</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleBookCabClick}
                className="bg-getmore-purple text-white px-8 py-4 rounded-lg font-medium hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center text-lg transform hover:scale-105 transition-transform duration-200 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full bg-gradient-to-r from-purple-700 to-getmore-purple group-hover:translate-x-0"></span>
                <span className="relative flex items-center">
                  <Car className="mr-2" size={24} />
                  Book a Ride Now
                </span>
              </button>
              
              <button 
                onClick={handleBecomeDriverClick}
                className="bg-white border-2 border-getmore-purple text-getmore-purple px-8 py-4 rounded-lg font-medium hover:bg-getmore-purple hover:text-white transition-colors shadow-lg flex items-center justify-center text-lg transform hover:scale-105 transition-transform duration-200 group"
              >
                <UserPlus className="mr-2 group-hover:animate-pulse" size={24} />
                Become a Driver
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
        navigate={navigate}
      />
    </section>
  );
};

export default CabSection;
