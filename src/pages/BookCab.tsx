
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, AlertCircle, Calendar, Clock, User, Phone, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

interface VehicleType {
  id: string;
  name: string;
  image: string;
  description: string;
  capacity: number;
  pricePerKm: number;
  estimatedTime: string;
}

const vehicles: VehicleType[] = [
  {
    id: "standard",
    name: "Standard",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=60",
    description: "Comfortable sedan for everyday rides",
    capacity: 4,
    pricePerKm: 10,
    estimatedTime: "15 min"
  },
  {
    id: "premium",
    name: "Premium",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format&fit=crop&q=60",
    description: "Luxury vehicle for comfort and style",
    capacity: 4,
    pricePerKm: 15,
    estimatedTime: "12 min"
  },
  {
    id: "suv",
    name: "SUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60",
    description: "Spacious SUV for groups or extra luggage",
    capacity: 6,
    pricePerKm: 18,
    estimatedTime: "18 min"
  }
];

const BookCab: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.email?.split("@")[0] || "");
  const [phone, setPhone] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    // Protect this page from non-authenticated users
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a cab",
        variant: "destructive",
      });
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate, toast]);

  useEffect(() => {
    // Simulate calculating distance between pickup and dropoff
    if (pickupLocation && dropoffLocation && step === 2) {
      // In a real app, this would call a mapping API
      const simulatedDistance = Math.floor(Math.random() * 20) + 5; // 5-25 km
      setDistance(simulatedDistance);
    }
  }, [pickupLocation, dropoffLocation, step]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!pickupLocation || !dropoffLocation) {
        toast({
          title: "Missing information",
          description: "Please enter both pickup and dropoff locations",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedVehicle) {
        toast({
          title: "Select a vehicle",
          description: "Please select a vehicle type to continue",
          variant: "destructive",
        });
        return;
      }
      if (!date || !time) {
        toast({
          title: "Missing information",
          description: "Please select date and time for your ride",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!name || !phone) {
        toast({
          title: "Missing information",
          description: "Please enter your name and phone number",
          variant: "destructive",
        });
        return;
      }
      handleBookRide();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectVehicle = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
  };

  const handleBookRide = () => {
    setIsLoading(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsLoading(false);
      setBookingComplete(true);
      // Generate a random booking ID
      setBookingId(`BW-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    }, 2000);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Enter your ride details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-2 text-getmore-purple" />
                  Pickup Location
                </label>
                <Input
                  placeholder="Enter pickup location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <MapPin size={18} className="mr-2 text-getmore-purple" />
                  Dropoff Location
                </label>
                <Input
                  placeholder="Enter destination"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Choose your vehicle</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? "border-getmore-purple ring-2 ring-getmore-purple/30 shadow-md"
                      : "border-gray-200 hover:border-getmore-purple/50"
                  }`}
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold">{vehicle.name}</h4>
                      <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                        {vehicle.estimatedTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{vehicle.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs flex items-center">
                        <User size={14} className="mr-1" />
                        {vehicle.capacity} seats
                      </span>
                      <span className="font-medium text-getmore-purple">
                        P{vehicle.pricePerKm}/km
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <Calendar size={18} className="mr-2 text-getmore-purple" />
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <Clock size={18} className="mr-2 text-getmore-purple" />
                  Time
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Confirm your booking</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <User size={18} className="mr-2 text-getmore-purple" />
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-gray-700">
                  <Phone size={18} className="mr-2 text-getmore-purple" />
                  Phone Number
                </label>
                <Input
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-gray-300 focus:border-getmore-purple"
                />
              </div>
            </div>
            
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Ride Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup:</span>
                    <span className="font-medium">{pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dropoff:</span>
                    <span className="font-medium">{dropoffLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">{date}, {time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium">{selectedVehicle?.name}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Distance:</span>
                    <span className="font-medium">{distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per km:</span>
                    <span className="font-medium">P{selectedVehicle?.pricePerKm.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="font-bold text-getmore-purple">
                      P{(selectedVehicle?.pricePerKm && distance ? selectedVehicle.pricePerKm * distance : 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (bookingComplete) {
    return (
      <>
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container-custom max-w-xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Car size={30} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">Your cab has been booked successfully</p>
              
              <Card className="bg-gray-50 border-gray-200 mb-6">
                <CardContent className="p-4 text-left">
                  <h4 className="font-medium mb-3">Booking Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-bold">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup:</span>
                      <span className="font-medium">{pickupLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dropoff:</span>
                      <span className="font-medium">{dropoffLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{date}, {time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{selectedVehicle?.name}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium">Estimated Total:</span>
                      <span className="font-bold text-getmore-purple">
                        P{(selectedVehicle?.pricePerKm && distance ? selectedVehicle.pricePerKm * distance : 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  className="bg-getmore-purple hover:bg-purple-700"
                  onClick={() => navigate("/")}
                >
                  Return to Home
                </Button>
                <Button 
                  variant="outline" 
                  className="border-getmore-purple text-getmore-purple hover:bg-getmore-purple/5"
                  onClick={() => {
                    setBookingComplete(false);
                    setStep(1);
                    setSelectedVehicle(null);
                    setPickupLocation("");
                    setDropoffLocation("");
                    setDate("");
                    setTime("");
                    setDistance(null);
                  }}
                >
                  Book Another Ride
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-10 flex items-center">
            <Car className="mr-3 text-getmore-purple" />
            Book Your Cab
          </h1>
          
          {/* Step Indicator */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-getmore-purple' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-getmore-purple' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-getmore-purple text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-gray-200 shadow-md bg-white">
              <CardContent className="p-6">
                {renderStepContent()}
                
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      className="border-gray-300"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button
                    onClick={handleNextStep}
                    className="bg-getmore-purple hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : step === 3 ? (
                      "Confirm Booking"
                    ) : (
                      <span className="flex items-center">
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookCab;
