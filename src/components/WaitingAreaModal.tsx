import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, MessageSquare, Phone, Send, User, Car, X, PhoneCall, MessageCircle, Navigation2 } from 'lucide-react';
import MapDisplay from '@/components/MapDisplay';
import { toast } from 'sonner';

interface Driver {
  id: number;
  name: string;
  car: string;
  rating: number;
  distance: string;
  image: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface WaitingAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
}

interface Message {
  id: number;
  sender: 'user' | 'driver';
  text: string;
  timestamp: Date;
  isSetswana?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: 1,
    sender: 'driver',
    text: 'Dumela! Ke mo tseleng go tla go go tsaya.',
    timestamp: new Date(Date.now() - 120000), // 2 min ago
    isSetswana: true
  },
  {
    id: 2,
    sender: 'user',
    text: 'Ke a leboga! Ke tlaa go leta kwa ntle.',
    timestamp: new Date(Date.now() - 60000), // 1 min ago
    isSetswana: true
  },
  {
    id: 3,
    sender: 'driver',
    text: 'Ke kgweetsa Toyota Corolla e tshweu. Ke tlaa goroga mo metsotsong e metlhano.',
    timestamp: new Date(Date.now() - 30000), // 30 sec ago
    isSetswana: true
  },
];

const setswanaResponses = [
  "Ke santse ke tla. Ke tlaa goroga ka bonako!",
  "Ke kgonne go bona lefelo la gago. Ke mo tseleng.",
  "Ke kopa o letele foo. Ke tlaa goroga mo nakong e khutshwane.",
  "Ke setse ke le gaufi. O ka mpona mo mmepeng.",
  "Ke leboga go leta. Ke tsamaya ka bofefo jo ke ka bo kgonang."
];

const WaitingAreaModal = ({ isOpen, onClose, driver }: WaitingAreaModalProps) => {
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('2 minutes');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const [simulateArrival, setSimulateArrival] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDriverProfile, setShowDriverProfile] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionState, setLocationPermissionState] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    const getUserLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            toast.success("Using your actual location", {
              description: "The driver will come to your current position"
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("Couldn't access your location", {
              description: "Please enable location services in your browser"
            });
            
            if (driver.location) {
              setUserLocation({
                lat: driver.location.lat + 0.01,
                lng: driver.location.lng + 0.01
              });
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        toast.error("Location services not available", {
          description: "Your browser doesn't support geolocation"
        });
        
        if (driver.location) {
          setUserLocation({
            lat: driver.location.lat + 0.01,
            lng: driver.location.lng + 0.01
          });
        }
      }
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermissionState(result.state as 'granted' | 'denied' | 'prompt');
        
        if (result.state === 'granted') {
          getUserLocation();
        } else if (result.state === 'prompt') {
          toast.info("Location access needed", {
            description: "Allow access to your location for better service",
            duration: 5000
          });
          getUserLocation();
        } else {
          toast.error("Location access denied", {
            description: "Please enable location services in your browser settings",
            duration: 5000
          });
          
          if (driver.location) {
            setUserLocation({
              lat: driver.location.lat + 0.01,
              lng: driver.location.lng + 0.01
            });
          }
        }
        
        result.addEventListener('change', () => {
          setLocationPermissionState(result.state as 'granted' | 'denied' | 'prompt');
          if (result.state === 'granted') {
            getUserLocation();
          }
        });
      });
    } else {
      getUserLocation();
    }
  }, [driver.location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let seconds = 120; // 2 minutes in seconds
    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(interval);
        setEstimatedTime('Arrived');
        setSimulateArrival(true);
      } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setEstimatedTime(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'map') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const randomResponse = setswanaResponses[Math.floor(Math.random() * setswanaResponses.length)];
      const driverResponse: Message = {
        id: Date.now() + 1,
        sender: 'driver',
        text: randomResponse,
        timestamp: new Date(),
        isSetswana: true
      };
      setMessages(prev => [...prev, driverResponse]);
    }, 2000);
  };

  const handleCall = (type: 'phone' | 'whatsapp') => {
    setShowCallOptions(false);
    
    if (type === 'phone') {
      window.location.href = `tel:${driver.phone}`;
    } else {
      const phoneWithoutPlus = driver.phone.replace('+', '');
      window.open(`https://wa.me/${phoneWithoutPlus}`, '_blank');
    }
  };

  const mapDriver = {
    id: driver.id,
    name: driver.name,
    car: driver.car,
    cabType: 'standard',
    lat: driver.location?.lat || -24.6282,
    lng: driver.location?.lng || 25.9231,
    rating: driver.rating,
    phone: driver.phone,
    image: driver.image
  };

  const handleStartSimulation = () => {
    setSimulateArrival(true);
  };

  const toggleDriverProfile = () => {
    setShowDriverProfile(!showDriverProfile);
    if (showDriverProfile) {
      if (typeof window.hideDriverProfile === 'function') {
        window.hideDriverProfile(driver.id);
      }
    } else {
      if (typeof window.showDriverProfile === 'function') {
        window.showDriverProfile(driver.id);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-getmore-purple">
              <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-sm text-gray-500">{driver.car}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Arriving in: {estimatedTime}
            </div>
            <button
              onClick={() => setShowCallOptions(true)}
              className="bg-blue-100 text-blue-800 p-2 rounded-full hover:bg-blue-200 transition-colors"
            >
              <Phone size={18} />
            </button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'map'
                ? 'text-getmore-purple border-b-2 border-getmore-purple'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('map')}
          >
            <MapPin className="inline-block mr-1" size={18} /> Track Location
          </button>
          <button
            className={`flex-1 py-2 text-center font-medium ${
              activeTab === 'chat'
                ? 'text-getmore-purple border-b-2 border-getmore-purple'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="inline-block mr-1" size={18} /> Chat with Driver
          </button>
        </div>

        <div className="flex-grow overflow-hidden">
          {activeTab === 'map' && (
            <div className="h-96 relative" ref={mapContainerRef}>
              <MapDisplay 
                drivers={[mapDriver]} 
                userLocation={userLocation || undefined}
                height="100%" 
                simulateArrival={simulateArrival}
                showFullScreenButton={false}
              />
              
              <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2">
                <div className="bg-white py-2 px-4 rounded-md shadow-md">
                  <p className="font-semibold">ETA: {estimatedTime}</p>
                </div>
                
                {!simulateArrival && estimatedTime !== 'Arrived' && (
                  <button 
                    onClick={handleStartSimulation}
                    className="bg-getmore-purple text-white py-2 px-4 rounded-md shadow-md hover:bg-purple-700 transition-colors"
                  >
                    Watch Driver Approach
                  </button>
                )}

                <button
                  onClick={toggleDriverProfile}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  {showDriverProfile ? (
                    <>
                      <X size={16} className="mr-2" />
                      Hide Driver Profile
                    </>
                  ) : (
                    <>
                      <User size={16} className="mr-2" />
                      Show Driver Profile
                    </>
                  )}
                </button>
              </div>
              
              {locationPermissionState === 'denied' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-md shadow-md z-20 max-w-xs text-center">
                  <p className="text-sm">Location access required for accurate driver routing</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'driver' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-getmore-purple">
                        <img
                          src={driver.image}
                          alt={driver.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-getmore-purple text-white'
                          : 'bg-gray-100'
                      } animate-fade-in`}
                      style={{ animationDelay: '100ms' }}
                    >
                      <p>{msg.text}</p>
                      {msg.isSetswana && (
                        <p className="text-xs italic mt-1 opacity-75">
                          {msg.sender === 'driver' 
                            ? "Speaking Setswana" 
                            : "Reply in Setswana"}
                        </p>
                      )}
                      <p className="text-xs opacity-70 text-right mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="border-t p-2 flex items-center"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message in English or Setswana..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="ml-2 bg-getmore-purple hover:bg-purple-700 transition-transform hover:scale-105 duration-300"
                  size="icon"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          )}
        </div>

        {showCallOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Contact Driver</h3>
                <button 
                  onClick={() => setShowCallOptions(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <p className="mb-6 text-gray-600">How would you like to contact {driver.name}?</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleCall('phone')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <PhoneCall className="text-green-600" size={24} />
                  </div>
                  <span className="font-medium">Phone Call</span>
                </button>
                
                <button
                  onClick={() => handleCall('whatsapp')}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <span className="font-medium">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitingAreaModal;
