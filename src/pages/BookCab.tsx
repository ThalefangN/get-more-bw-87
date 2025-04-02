
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Clock, Calendar, DollarSign, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Cab types with images and details
const cabTypes = [
  {
    id: 'standard',
    name: 'Standard',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
    pricePerKm: 10,
    basePrice: 30,
    features: ['Air conditioning', '4 passengers', 'Luggage space']
  },
  {
    id: 'comfort',
    name: 'Comfort',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2156&auto=format&fit=crop',
    pricePerKm: 15,
    basePrice: 50,
    features: ['Premium interior', 'Water bottles', '4 passengers', 'Extra luggage space']
  },
  {
    id: 'premium',
    name: 'Premium',
    image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=2069&auto=format&fit=crop',
    pricePerKm: 25,
    basePrice: 80,
    features: ['Luxury vehicle', 'Professional chauffeur', '4 passengers', 'Premium amenities']
  },
  {
    id: 'suv',
    name: 'SUV/Minivan',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
    pricePerKm: 20,
    basePrice: 70,
    features: ['Spacious interior', 'Up to 7 passengers', 'Large luggage capacity']
  }
];

// Mock available drivers data
const mockDriversLocations = [
  { id: 1, lat: -24.6282, lng: 25.9231, cabType: 'standard' },
  { id: 2, lat: -24.6372, lng: 25.9111, cabType: 'comfort' },
  { id: 3, lat: -24.6452, lng: 25.9331, cabType: 'premium' },
  { id: 4, lat: -24.6282, lng: 25.9381, cabType: 'standard' },
  { id: 5, lat: -24.6152, lng: 25.9231, cabType: 'suv' },
];

const BookCab = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [fare, setFare] = useState('');
  const [selectedCabType, setSelectedCabType] = useState('');
  const [availableCabs, setAvailableCabs] = useState(cabTypes);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: '/book-cab' } });
    }
  }, [isAuthenticated, navigate]);

  // Set up map display
  useEffect(() => {
    // This is a placeholder for real map implementation
    // In a real app, you would initialize the map here using a library like Mapbox
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter cabs based on fare
  const handleFareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFare(value);
    
    // Only filter if we have a numeric value
    if (value && !isNaN(Number(value))) {
      const fareValue = Number(value);
      if (fareValue < 30) {
        // Show all but mark as unavailable
        setAvailableCabs(cabTypes);
      } else {
        // Filter cabs based on base price
        const filtered = cabTypes.filter(cab => cab.basePrice <= fareValue);
        setAvailableCabs(filtered);
      }
    } else {
      setAvailableCabs(cabTypes);
    }
  };

  const handleBookNow = (cabType: string) => {
    setSelectedCabType(cabType);
    
    // Generate a random arrival time between 3-10 minutes
    const arrivalTime = Math.floor(Math.random() * 8) + 3;
    setEstimatedTime(`${arrivalTime} minutes`);
    
    setShowConfirmation(true);
  };
  
  const handleConfirmBooking = () => {
    setShowConfirmation(false);
    // In a real app, you would send the booking details to the server here
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Book Your <span className="text-getmore-purple">Premium Ride</span></h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your pickup location, destination, and fare budget to find available cabs near you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MapPin className="mr-2 text-getmore-purple" />
                    Location & Available Cabs
                  </h2>
                </div>
                
                {/* Map placeholder */}
                <div className="relative h-[400px] bg-gray-100 flex items-center justify-center">
                  {mapLoaded ? (
                    <>
                      <div className="absolute inset-0 opacity-60">
                        {/* Simple map placeholder - in real app use actual map library */}
                        <div className="w-full h-full relative bg-[#e8eef7]">
                          <div className="absolute w-[80%] h-[30px] bg-getmore-purple/20 top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                          <div className="absolute w-[30px] h-[80%] bg-getmore-purple/20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                          
                          {/* Simulating car markers on map */}
                          {mockDriversLocations.map(driver => (
                            <div 
                              key={driver.id}
                              className="absolute w-4 h-4 bg-getmore-purple rounded-full"
                              style={{ 
                                top: `${(driver.lat + 24.65) * 400}px`, 
                                left: `${(driver.lng - 25.9) * 400 + 200}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          ))}
                          
                          {/* User location */}
                          <div 
                            className="absolute w-6 h-6 bg-blue-500 rounded-full animate-pulse"
                            style={{ 
                              top: '50%', 
                              left: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white py-2 px-4 rounded-md shadow-md text-sm">
                        <p>5 cabs available nearby</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-getmore-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading map...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side - Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Trip Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pickup" className="text-sm font-medium text-gray-700 block mb-1">Pickup Location</label>
                    <Input 
                      id="pickup"
                      placeholder="Enter pickup location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="destination" className="text-sm font-medium text-gray-700 block mb-1">Destination</label>
                    <Input 
                      id="destination"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fare" className="text-sm font-medium text-gray-700 block mb-1">Your Fare Budget (P)</label>
                    <Input 
                      id="fare"
                      type="number"
                      min="30"
                      placeholder="Minimum P30"
                      value={fare}
                      onChange={handleFareChange}
                      className="w-full"
                    />
                    {fare && Number(fare) < 30 && (
                      <p className="text-red-500 text-xs mt-1">Minimum fare is P30</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Available cabs section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Ride</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {availableCabs.map((cab) => {
                const isAvailable = !fare || isNaN(Number(fare)) || Number(fare) >= cab.basePrice;
                
                return (
                  <div 
                    key={cab.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${!isAvailable ? 'opacity-60' : 'hover:shadow-lg'}`}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={cab.image} 
                        alt={cab.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">{cab.name}</h3>
                        <span className="text-getmore-purple font-bold">P{cab.basePrice}+</span>
                      </div>
                      
                      <ul className="text-sm text-gray-600 mb-4">
                        {cab.features.map((feature, index) => (
                          <li key={index} className="flex items-center mb-1">
                            <Check size={14} className="text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        onClick={() => handleBookNow(cab.id)}
                        disabled={!isAvailable || !pickupLocation || !destination}
                        className="w-full bg-getmore-purple hover:bg-purple-700"
                      >
                        {isAvailable ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-getmore-purple text-xl">Your ride is on the way!</DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex justify-center py-6">
                <div className="w-20 h-20 rounded-full bg-getmore-purple/10 flex items-center justify-center">
                  <Car size={36} className="text-getmore-purple" />
                </div>
              </div>
              
              <p className="text-lg font-medium mb-2">
                Estimated arrival time: <span className="font-bold text-getmore-purple">{estimatedTime}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                A {selectedCabType && cabTypes.find(c => c.id === selectedCabType)?.name} cab will arrive at your pickup location shortly.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              If you experience any issues with your ride, including reckless driving or unprofessional conduct, please contact us at <span className="font-medium">getmorecabs@gmail.com</span> with your booking details.
            </p>
          </div>
          
          <Button onClick={handleConfirmBooking} className="w-full">
            OK, Got It
          </Button>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default BookCab;
