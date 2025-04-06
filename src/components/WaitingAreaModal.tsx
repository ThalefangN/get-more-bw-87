import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, MessageSquare, Phone, Star, X, Headphones, User } from 'lucide-react';

const WaitingAreaModal = ({ isOpen, onClose, driverInfo }) => {
  const [driverStatus, setDriverStatus] = useState('waiting');
  const [showDriverProfile, setShowDriverProfile] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (driverStatus === 'arrived') {
      // Play sound and vibrate
      if (audioRef.current) {
        audioRef.current.play();
      }
      vibratePhone();
    }
  }, [driverStatus]);

  const vibratePhone = () => {
    if ('vibrate' in navigator) {
      // Define vibration pattern (200ms on, 100ms off, 200ms on)
      const pattern = [200, 100, 200];
      navigator.vibrate(pattern);
    }
  };

  const handleClose = () => {
    setDriverStatus('waiting'); // Reset status when closing
    setShowDriverProfile(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Waiting Area</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <p>Your driver is {driverStatus === 'waiting' ? 'on the way' : 'arrived'}.</p>
        </div>

        {showDriverProfile && driverStatus === 'waiting' && (
          <div className="mt-4 flex items-center space-x-4">
            <User className="h-10 w-10 rounded-full bg-gray-200 p-2" />
            <div>
              <p className="font-medium">{driverInfo.name}</p>
              <div className="flex items-center space-x-2 text-gray-500">
                <Star className="h-4 w-4" />
                <span>{driverInfo.rating}</span>
              </div>
            </div>
          </div>
        )}

        {driverStatus === 'arrived' && (
          <div className="mt-4">
            <p className="font-semibold">Your driver has arrived!</p>
            <audio ref={audioRef} src="/driver-arrival.mp3" preload="auto" />
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">{driverInfo.location}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          {driverStatus === 'waiting' && (
            <Button onClick={() => setDriverStatus('arrived')} className="bg-green-500 hover:bg-green-700 text-white">
              Driver Arrived
            </Button>
          )}
          <Button onClick={() => setShowDriverProfile(!showDriverProfile)} className="bg-blue-500 hover:bg-blue-700 text-white">
            {showDriverProfile ? 'Hide Driver Profile' : 'Show Driver Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingAreaModal;
