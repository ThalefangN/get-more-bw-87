
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, MessageSquare, Phone, Send, User } from 'lucide-react';

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
}

const sampleMessages: Message[] = [
  {
    id: 1,
    sender: 'driver',
    text: 'Hello! I\'m on my way to pick you up.',
    timestamp: new Date(Date.now() - 120000), // 2 min ago
  },
  {
    id: 2,
    sender: 'user',
    text: 'Great! I\'ll be waiting outside.',
    timestamp: new Date(Date.now() - 60000), // 1 min ago
  },
  {
    id: 3,
    sender: 'driver',
    text: 'I\'m in a white Toyota Corolla. Should be there in about 5 minutes.',
    timestamp: new Date(Date.now() - 30000), // 30 sec ago
  },
];

const WaitingAreaModal = ({ isOpen, onClose, driver }: WaitingAreaModalProps) => {
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('5 minutes');
  const [mapLoaded, setMapLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate countdown for arrival
  useEffect(() => {
    let seconds = 300; // 5 minutes in seconds
    const interval = setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        clearInterval(interval);
        setEstimatedTime('Arrived');
      } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setEstimatedTime(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of messages
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

    // Simulate driver response after a short delay
    setTimeout(() => {
      const driverResponse: Message = {
        id: Date.now() + 1,
        sender: 'driver',
        text: 'I\'m still on my way. Will be there shortly!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, driverResponse]);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img src={driver.image} alt={driver.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-sm text-gray-500">{driver.car}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Arriving in: {estimatedTime}
            </div>
            <a
              href={`tel:${driver.phone}`}
              className="bg-blue-100 text-blue-800 p-2 rounded-full"
            >
              <Phone size={18} />
            </a>
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
            <div className="h-96 relative">
              {mapLoaded ? (
                <div className="absolute inset-0">
                  {/* Simple map placeholder - in a real app use actual map library */}
                  <div className="w-full h-full relative bg-[#e8eef7]">
                    {/* Roads representation */}
                    <div className="absolute w-[80%] h-[20px] bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute w-[20px] h-[80%] bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                    
                    {/* User location */}
                    <div
                      className="absolute w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                      style={{
                        top: '60%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      <User size={14} color="white" />
                    </div>
                    
                    {/* Driver location with animation */}
                    <div
                      className="absolute bg-getmore-purple rounded-full p-1 border-2 border-white animate-pulse"
                      style={{
                        top: '40%',
                        left: '40%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10
                      }}
                    >
                      <Car size={16} color="white" />
                    </div>
                    
                    {/* Path between driver and user */}
                    <div className="absolute w-[15%] h-[2px] bg-getmore-purple top-[50%] left-[45%] transform -rotate-45"></div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white py-2 px-4 rounded-md shadow-md">
                    <p className="font-semibold">ETA: {estimatedTime}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-10 h-10 border-4 border-getmore-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Loading map...</p>
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
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
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
                      }`}
                    >
                      <p>{msg.text}</p>
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
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="ml-2 bg-getmore-purple hover:bg-purple-700"
                  size="icon"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Placeholder Car component since it's not imported
const Car = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export default WaitingAreaModal;
