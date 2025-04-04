import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Clock, Calendar, DollarSign, Check, X, MessageSquare, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MapDisplay from '@/components/MapDisplay';
import WaitingAreaModal from '@/components/WaitingAreaModal';
import { toast } from "sonner";

// Cab types with images and details
const cabTypes = [
  {
    id: 'standard',
    name: 'Standard',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
    pricePerKm: 10,
    basePrice: 30,
    features: ['Air conditioning', '4 passengers', 'Luggage space'],
    cars: ['Toyota Vitz', 'Honda Fit']
  },
  {
    id: 'comfort',
    name: 'Comfort',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2156&auto=format&fit=crop',
    pricePerKm: 15,
    basePrice: 50,
    features: ['Premium interior', 'Water bottles', '4 passengers', 'Extra luggage space'],
    cars: ['Toyota Corolla', 'Mazda 3']
  },
  {
    id: 'premium',
    name: 'Premium',
    image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=2069&auto=format&fit=crop',
    pricePerKm: 25,
    basePrice: 80,
    features: ['Luxury vehicle', 'Professional chauffeur', '4 passengers', 'Premium amenities'],
    cars: ['BMW 3 Series', 'Mercedes C-Class']
  },
  {
    id: 'suv',
    name: 'SUV/Minivan',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
    pricePerKm: 20,
    basePrice: 70,
    features: ['Spacious interior', 'Up to 7 passengers', 'Large luggage capacity'],
    cars: ['Toyota Fortuner', 'Volkswagen Tiguan']
  }
];

// Mock available drivers data
const mockDriversLocations = [
  { id: 1, name: "Kabo Moeng", car: "Honda Fit", cabType: 'standard', lat: -24.6282, lng: 25.9231, rating: 4.8, phone: "+267 71234567", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Boitumelo Ntsima", car: "Toyota Corolla", cabType: 'comfort', lat: -24.6372, lng: 25.9111, rating: 4.9, phone: "+267 72345678", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Tebogo Kgotla", car: "BMW 3 Series", cabType: 'premium', lat: -24.6452, lng: 25.9331, rating: 4.7, phone: "+267 73456789", image: "https://randomuser.me/api/portraits/men/22.jpg" },
  { id: 4, name: "Lesego Phiri", car: "Toyota Vitz", cabType: 'standard', lat: -24.6282, lng: 25.9381, rating: 4.6, phone: "+267 74567890", image: "https://randomuser.me/api/portraits/women/29.jpg" },
  { id: 5, name: "Khumo Tladi", car: "Toyota Fortuner", cabType: 'suv', lat: -24.6152, lng: 25.9231, rating: 4.9, phone: "+267 75678901", image: "https://randomuser.me/api/portraits/men/55.jpg" },
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
  const [showWaitingArea, setShowWaitingArea] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [connectingToDriver, setConnectingToDriver] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  
  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: '/book-cab' } });
    }
  }, [isAuthenticated, navigate]);

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

  const handleDriverClick = (driver: any) => {
    toast.info(`${driver.name} selected`, {
      description: `${driver.car} - Rating: ${driver.rating}/5`
    });
    setSelectedDriver(driver);
  };

  const handleBookNow = (cabType: string) => {
    setSelectedCabType(cabType);
    setConnectingToDriver(true);
    
    // Find a driver with the selected cab type
    const availableDrivers = mockDriversLocations.filter(driver => driver.cabType === cabType);
    const selectedDriver = availableDrivers.length > 0 ? 
                           availableDrivers[Math.floor(Math.random() * availableDrivers.length)] : 
                           mockDriversLocations[0];
    
    setSelectedDriver(selectedDriver);
    
    // Start countdown
    let timer = 5;
    setCountdown(timer);
    
    const countdownInterval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      
      if (timer <= 0) {
        clearInterval(countdownInterval);
        setConnectingToDriver(false);
        
        // Generate a random arrival time between 3-10 minutes
        const arrivalTime = Math.floor(Math.random() * 8) + 3;
        setEstimatedTime(`${arrivalTime} minutes`);
        
        setShowConfirmation(true);
      }
    }, 1000);
  };
  
  const handleConfirmBooking = () => {
    setShowConfirmation(false);
    // In a real app, you would send the booking details to the server here
    navigate('/');
  };
  
  const handleReportIssue = () => {
    window.open('mailto:getmorecabs@gmail.com', '_blank');
  };
  
  const handleWaitingArea = () => {
    setShowWaitingArea(true);
    setShowConfirmation(false);
  };
  
  const handleCloseWaitingArea = () => {
    setShowWaitingArea(false);
    // In a real app, you would redirect to a tracking page
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">Book Your <span className="text-getmore-purple">Premium Ride</span></h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select your pickup location, destination, and fare budget to find available cabs near you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Map */}
            <div className="lg:col-span-2 animate-fade-in">
              <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-500 hover:shadow-lg">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MapPin className="mr-2 text-getmore-purple" />
                    Location & Available Drivers
                  </h2>
                </div>
                
                <MapDisplay 
                  drivers={mockDriversLocations}
                  onDriverClick={handleDriverClick}
                  height="400px"
                />
              </div>
            </div>
            
            {/* Right side - Booking Form */}
            <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="bg-white rounded-xl shadow-md p-6 transform transition-all duration-500 hover:shadow-lg">
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
          <div className="mt-12 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Ride</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {availableCabs.map((cab) => {
                const isAvailable = !fare || isNaN(Number(fare)) || Number(fare) >= cab.basePrice;
                
                return (
                  <div 
                    key={cab.id}
                    className={`bg-white rounded-xl shadow-md overflow-hidden transition-all transform hover:-translate-y-1 duration-300 ${!isAvailable ? 'opacity-60' : 'hover:shadow-xl'}`}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={cab.image} 
                        alt={cab.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">{cab.name}</h3>
                        <span className="text-getmore-purple font-bold">P{cab.basePrice}+</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p>Available cars: {cab.cars.join(', ')}</p>
                      </div>
                      
                      <ul className="text-sm text-gray-600 mb-4">
                        {cab.features.map((feature, index) => (
                          <li key={index} className="flex items-center mb-1 transform transition-all hover:translate-x-1 duration-300">
                            <Check size={14} className="text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        onClick={() => handleBookNow(cab.id)}
                        disabled={!isAvailable || !pickupLocation || !destination}
                        className={`w-full relative overflow-hidden group ${isAvailable && pickupLocation && destination ? 'bg-getmore-purple hover:bg-purple-700' : 'bg-gray-400'}`}
                      >
                        {isAvailable && pickupLocation && destination && (
                          <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
                        )}
                        <span className="relative">
                          {isAvailable ? 'Book Now' : 'Unavailable'}
                        </span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Connecting to Driver Dialog */}
      <Dialog open={connectingToDriver} onOpenChange={(open) => !open && setConnectingToDriver(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Connecting you to a driver...</DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex justify-center py-6">
                {selectedDriver && (
                  <div className="text-center animate-pulse">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-getmore-purple mb-2">
                      <img src={selectedDriver.image} alt={selectedDriver.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="font-medium">{selectedDriver.name}</p>
                    <p className="text-sm text-gray-500">{selectedDriver.car}</p>
                  </div>
                )}
              </div>
              
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-getmore-purple text-white text-2xl font-bold animate-pulse">
                {countdown}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-getmore-purple text-xl">Your ride is on the way!</DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex justify-center py-6">
                <div className="w-20 h-20 rounded-full bg-getmore-purple/10 flex items-center justify-center animate-pulse">
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
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleWaitingArea}
              className="bg-getmore-purple hover:bg-purple-700 transform transition-transform hover:scale-105"
            >
              <MapPin className="mr-2" size={16} />
              Go to Waiting Area
            </Button>
            
            <Button 
              onClick={handleReportIssue}
              variant="outline"
              className="transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Report an Issue
            </Button>
            
            <Button 
              onClick={handleConfirmBooking} 
              variant="ghost"
              className="text-gray-500 hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Waiting Area Dialog using WaitingAreaModal component */}
      {selectedDriver && (
        <WaitingAreaModal 
          isOpen={showWaitingArea}
          onClose={handleCloseWaitingArea}
          driver={selectedDriver}
        />
      )}
      
      <Footer />
    </>
  );
};

export default BookCab;
