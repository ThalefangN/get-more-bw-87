import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Car, Star, MessageSquare, Phone, MapPin, Navigation2 } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import WaitingAreaModal from './WaitingAreaModal';
import { toast } from 'sonner';

const sampleDrivers = [
  { 
    id: 1, 
    name: 'Kabo Moeng', 
    car: 'Toyota Corolla', 
    rating: 4.8, 
    distance: '3 min away',
    image: 'https://images.unsplash.com/photo-1618213837774-25b243a1e3e3?q=80&w=1287&auto=format&fit=crop',
    phone: '+267 71234567',
    location: { lat: -24.6282, lng: 25.9331 }
  },
  { 
    id: 2, 
    name: 'Boitumelo Ntsima', 
    car: 'Honda Fit', 
    rating: 4.9, 
    distance: '5 min away',
    image: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?q=80&w=1287&auto=format&fit=crop',
    phone: '+267 72345678',
    location: { lat: -24.6372, lng: 25.9131 }
  },
  { 
    id: 3, 
    name: 'Tebogo Kgotla', 
    car: 'VW Golf 5', 
    rating: 4.7, 
    distance: '7 min away',
    image: 'https://images.unsplash.com/photo-1620794108219-aedbaded4eea?q=80&w=1289&auto=format&fit=crop',
    phone: '+267 73456789',
    location: { lat: -24.6452, lng: 25.9231 }
  },
  { 
    id: 4, 
    name: 'Lesego Phiri', 
    car: 'Toyota Vitz', 
    rating: 4.6, 
    distance: '8 min away',
    image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=1286&auto=format&fit=crop',
    phone: '+267 74567890',
    location: { lat: -24.6182, lng: 25.9281 }
  },
  { 
    id: 5, 
    name: 'Khumo Tladi', 
    car: 'Mazda Demio', 
    rating: 4.9, 
    distance: '4 min away',
    image: 'https://images.unsplash.com/photo-1581992652564-44c42f5ad3ad?q=80&w=1290&auto=format&fit=crop',
    phone: '+267 75678901',
    location: { lat: -24.6352, lng: 25.9211 }
  },
  { 
    id: 6, 
    name: 'Mpho Ramotswe', 
    car: 'Toyota Corolla', 
    rating: 4.7, 
    distance: '6 min away',
    image: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=1374&auto=format&fit=crop',
    phone: '+267 76789012',
    location: { lat: -24.6252, lng: 25.9151 }
  },
  { 
    id: 7, 
    name: 'Onalenna Molefe', 
    car: 'Mazda 3', 
    rating: 4.8, 
    distance: '10 min away',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop',
    phone: '+267 77890123',
    location: { lat: -24.6422, lng: 25.9291 }
  },
  { 
    id: 8, 
    name: 'Kagiso Mokgadi', 
    car: 'Honda Fit', 
    rating: 4.9, 
    distance: '5 min away',
    image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1289&auto=format&fit=crop',
    phone: '+267 78901234',
    location: { lat: -24.6302, lng: 25.9271 }
  }
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: NavigateFunction;
}

const BookingModal = ({ isOpen, onClose, navigate }: BookingModalProps) => {
  const [fare, setFare] = useState('');
  const [step, setStep] = useState<'fare' | 'drivers' | 'connecting' | 'confirmed'>('fare');
  const [availableDrivers, setAvailableDrivers] = useState<typeof sampleDrivers>([]);
  const [selectedDriver, setSelectedDriver] = useState<(typeof sampleDrivers)[0] | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showWaitingArea, setShowWaitingArea] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    if (isOpen && step === 'fare') {
      if ('geolocation' in navigator) {
        toast.info("Getting your location", {
          description: "For a better experience, please allow location access"
        });
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            toast.success("Location found", {
              description: "We'll match you with nearby drivers"
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Location access denied", {
              description: "We'll use an approximate location instead"
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [isOpen, step]);
  
  useEffect(() => {
    if (isOpen) {
      setFare('');
      setStep('fare');
      setSelectedDriver(null);
      setAvailableDrivers([]);
    }
  }, [isOpen]);
  
  const handleFareSubmit = () => {
    const fareValue = Number(fare);
    
    if (isNaN(fareValue) || fareValue < 30) {
      return;
    }
    
    if (fareValue < 50) {
      setAvailableDrivers(sampleDrivers.slice(0, 3));
    } else if (fareValue < 80) {
      setAvailableDrivers(sampleDrivers.slice(0, 6));
    } else {
      setAvailableDrivers(sampleDrivers);
    }
    
    setStep('drivers');
  };
  
  const selectDriver = (driver: typeof sampleDrivers[0]) => {
    if (userLocation) {
      const randomOffset = 0.01 + (Math.random() * 0.02);
      const randomDirection = Math.random() * Math.PI * 2;
      
      const updatedDriver = {
        ...driver,
        location: {
          lat: userLocation.lat + (Math.sin(randomDirection) * randomOffset),
          lng: userLocation.lng + (Math.cos(randomDirection) * randomOffset)
        }
      };
      
      setSelectedDriver(updatedDriver);
    } else {
      setSelectedDriver(driver);
    }
    
    setStep('connecting');
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep('confirmed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleProceedToWaitingArea = () => {
    setShowWaitingArea(true);
  };
  
  const handleReportIssue = () => {
    window.open('mailto:getmorecabs@gmail.com', '_blank');
  };
  
  const handleWaitingAreaClose = () => {
    setShowWaitingArea(false);
    onClose();
  };
  
  const handleRefreshLocation = () => {
    if ('geolocation' in navigator) {
      toast.info("Updating your location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success("Location updated", {
            description: "We'll match you with nearby drivers"
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Location access denied", {
            description: "We'll use an approximate location instead"
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };
  
  return (
    <>
      <Dialog open={isOpen && !showWaitingArea} onOpenChange={!showWaitingArea ? onClose : undefined}>
        <DialogContent className="sm:max-w-lg">
          {step === 'fare' && (
            <div className="py-6">
              <h2 className="text-2xl font-bold text-center mb-6 text-getmore-purple">Enter Your Fare Budget</h2>
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-6 bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100">
                    Enter how much you're willing to pay for your ride. 
                    <span className="block mt-1 font-medium text-getmore-purple">Minimum fare is P30.</span>
                  </p>
                  <div className="relative inline-block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-getmore-purple">P</span>
                    <Input
                      type="number"
                      min={30}
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      placeholder="Minimum P30"
                      className="text-lg pl-10 pr-4 py-6 text-center font-bold w-48 rounded-2xl border-2 border-getmore-purple shadow-md focus:ring-2 focus:ring-purple-300 transition-all"
                    />
                  </div>
                  {fare && Number(fare) < 30 && (
                    <p className="text-red-500 mt-2 animate-pulse">Minimum fare is P30</p>
                  )}
                </div>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button 
                    onClick={handleFareSubmit} 
                    disabled={!fare || Number(fare) < 30}
                    className="bg-getmore-purple hover:bg-purple-700 px-10 py-6 text-lg rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-60"
                  >
                    Find Drivers
                  </Button>
                  
                  <Button
                    onClick={handleRefreshLocation}
                    variant="outline"
                    className="rounded-full px-4 py-6"
                    title="Refresh your location"
                  >
                    <Navigation2 className="mr-2" size={18} />
                    Update Location
                  </Button>
                </div>
                
                {userLocation ? (
                  <p className="text-center text-sm text-green-600 mt-2">
                    ✓ Using your current location
                  </p>
                ) : (
                  <p className="text-center text-sm text-amber-600 mt-2">
                    ⚠️ Location access needed for more accurate pickups
                  </p>
                )}
              </div>
            </div>
          )}
          
          {step === 'drivers' && (
            <div className="py-6">
              <h2 className="text-2xl font-bold text-center mb-6">Select Your Driver</h2>
              <p className="text-center text-gray-600 mb-4">
                {availableDrivers.length} drivers available for P{fare}
              </p>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {availableDrivers.map(driver => (
                  <div 
                    key={driver.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => selectDriver(driver)}
                  >
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4 border-2 border-getmore-purple">
                      <img 
                        src={driver.image} 
                        alt={driver.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{driver.name}</h3>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-sm font-medium">{driver.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <div className="flex items-center text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-sm">
                          <Car className="h-4 w-4 mr-1 text-getmore-purple" />
                          <span>{driver.car}</span>
                        </div>
                        <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-full">{driver.distance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center pt-6">
                <Button 
                  onClick={() => setStep('fare')}
                  variant="outline"
                  className="px-6"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          
          {step === 'connecting' && (
            <div className="py-10 text-center">
              <h2 className="text-2xl font-bold mb-8">Connecting you to the driver...</h2>
              
              {selectedDriver && (
                <div className="flex justify-center mb-8">
                  <div className="text-center">
                    <div className="h-24 w-24 mx-auto rounded-full overflow-hidden border-4 border-getmore-purple mb-4">
                      <img 
                        src={selectedDriver.image} 
                        alt={selectedDriver.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-xl">{selectedDriver.name}</h3>
                    <p className="text-gray-600">{selectedDriver.car}</p>
                  </div>
                </div>
              )}
              
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-getmore-purple text-white text-3xl font-bold">
                {countdown}
              </div>
            </div>
          )}
          
          {step === 'confirmed' && (
            <div className="py-6 text-center">
              <div className="bg-green-100 text-green-800 p-2 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Car size={40} />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Your ride is confirmed!</h2>
              <p className="text-gray-600 mb-6">
                {selectedDriver?.name} accepted your ride and is on the way in their {selectedDriver?.car}
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <Button 
                  onClick={handleProceedToWaitingArea}
                  className="bg-getmore-purple hover:bg-purple-700"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Waiting Area
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReportIssue}
                >
                  Report an Issue
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                If you experience any issues with your ride, including reckless driving or 
                unprofessional conduct, please contact us at getmorecabs@gmail.com
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {showWaitingArea && selectedDriver && (
        <WaitingAreaModal
          isOpen={showWaitingArea}
          onClose={handleWaitingAreaClose}
          driver={selectedDriver}
        />
      )}
    </>
  );
};

export default BookingModal;
