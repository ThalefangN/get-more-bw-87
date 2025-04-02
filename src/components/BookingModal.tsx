
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Car, Star, MessageSquare, Phone, MapPin } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';
import WaitingAreaModal from './WaitingAreaModal';

// Sample drivers data
const sampleDrivers = [
  { 
    id: 1, 
    name: 'Kabo Moeng', 
    car: 'Toyota Corolla', 
    rating: 4.8, 
    distance: '3 min away',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '+267 71234567',
    location: { lat: -24.6282, lng: 25.9331 }
  },
  { 
    id: 2, 
    name: 'Boitumelo Ntsima', 
    car: 'Honda Fit', 
    rating: 4.9, 
    distance: '5 min away',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '+267 72345678',
    location: { lat: -24.6372, lng: 25.9131 }
  },
  { 
    id: 3, 
    name: 'Tebogo Kgotla', 
    car: 'VW Golf 5', 
    rating: 4.7, 
    distance: '7 min away',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    phone: '+267 73456789',
    location: { lat: -24.6452, lng: 25.9231 }
  },
  { 
    id: 4, 
    name: 'Lesego Phiri', 
    car: 'Toyota Vitz', 
    rating: 4.6, 
    distance: '8 min away',
    image: 'https://randomuser.me/api/portraits/women/29.jpg',
    phone: '+267 74567890',
    location: { lat: -24.6182, lng: 25.9281 }
  },
  { 
    id: 5, 
    name: 'Khumo Tladi', 
    car: 'Mazda Demio', 
    rating: 4.9, 
    distance: '4 min away',
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
    phone: '+267 75678901',
    location: { lat: -24.6352, lng: 25.9211 }
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
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFare('');
      setStep('fare');
      setSelectedDriver(null);
      setAvailableDrivers([]);
    }
  }, [isOpen]);
  
  // Handle fare submission
  const handleFareSubmit = () => {
    const fareValue = Number(fare);
    
    if (isNaN(fareValue) || fareValue < 30) {
      // Invalid fare
      return;
    }
    
    // Filter drivers based on fare
    if (fareValue < 50) {
      setAvailableDrivers(sampleDrivers.slice(0, 2));
    } else if (fareValue < 80) {
      setAvailableDrivers(sampleDrivers.slice(0, 4));
    } else {
      setAvailableDrivers(sampleDrivers);
    }
    
    setStep('drivers');
  };
  
  // Handle driver selection
  const selectDriver = (driver: typeof sampleDrivers[0]) => {
    setSelectedDriver(driver);
    setStep('connecting');
    setCountdown(5);
    
    // Start countdown
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
  
  // Close modal and navigate to book-cab page
  const handleProceedToWaitingArea = () => {
    setShowWaitingArea(true);
  };
  
  // Handle reporting issues
  const handleReportIssue = () => {
    // For now, just show an email address
    window.open('mailto:getmorecabs@gmail.com', '_blank');
  };
  
  // Handle close of waiting area
  const handleWaitingAreaClose = () => {
    setShowWaitingArea(false);
    onClose();
  };
  
  return (
    <>
      <Dialog open={isOpen && !showWaitingArea} onOpenChange={!showWaitingArea ? onClose : undefined}>
        <DialogContent className="sm:max-w-lg">
          {step === 'fare' && (
            <div className="py-6">
              <h2 className="text-2xl font-bold text-center mb-6">Enter Your Fare Budget</h2>
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-4">
                    Enter how much you're willing to pay for your ride. 
                    Minimum fare is P30.
                  </p>
                  <div className="relative inline-block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold">P</span>
                    <Input
                      type="number"
                      min={30}
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                      placeholder="Minimum P30"
                      className="text-lg pl-8 pr-4 py-6 text-center font-bold w-40"
                    />
                  </div>
                  {fare && Number(fare) < 30 && (
                    <p className="text-red-500 mt-2">Minimum fare is P30</p>
                  )}
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleFareSubmit} 
                    disabled={!fare || Number(fare) < 30}
                    className="bg-getmore-purple hover:bg-purple-700 px-8 py-6 text-lg"
                  >
                    Find Drivers
                  </Button>
                </div>
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
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                      <img 
                        src={driver.image} 
                        alt={driver.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{driver.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-sm">{driver.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-gray-500">
                          <Car className="h-4 w-4 mr-1" />
                          <span className="text-sm">{driver.car}</span>
                        </div>
                        <span className="text-sm text-gray-500">{driver.distance}</span>
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
      
      {/* Waiting Area Modal */}
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
