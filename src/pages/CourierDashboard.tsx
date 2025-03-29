import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCourier } from "@/contexts/CourierContext";
import { MapPin, Navigation, LogOut, Truck, Clock, CheckCircle, Package, Info, MessageSquare, PhoneCall, User, MapPinned, AlertCircle, Store } from "lucide-react";

const CourierDashboard = () => {
  const navigate = useNavigate();
  const { 
    currentCourier, 
    isAuthenticated, 
    deliveryRequests, 
    activeDeliveries, 
    deliveryHistory,
    toggleAvailability, 
    updateLocation,
    acceptDelivery,
    updateDeliveryStatus,
    logout
  } = useCourier();
  
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/courier-login");
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate("/courier-login");
  };
  
  const handleAvailabilityToggle = (checked: boolean) => {
    toggleAvailability(checked);
    toast.success(`You are now ${checked ? "available" : "unavailable"} for deliveries`);
  };
  
  const handleUpdateLocation = () => {
    if (!location) {
      toast.error("Please enter your location");
      return;
    }
    
    updateLocation(location);
    toast.success("Location updated successfully");
  };
  
  const handleAcceptDelivery = (requestId: string) => {
    setIsLoading(true);
    try {
      acceptDelivery(requestId);
      toast.success("Delivery accepted");
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateDeliveryStatus = (requestId: string, status: string) => {
    setIsLoading(true);
    try {
      updateDeliveryStatus(requestId, status as any);
      toast.success(`Delivery marked as ${status}`);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update delivery status");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentCourier) {
    return null;
  }
  
  const pendingDeliveries = deliveryRequests.filter(
    delivery => delivery.status === 'pending' && !delivery.courierId
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentCourier.name)}&background=8B5CF6&color=fff`} alt={currentCourier.name} />
                <AvatarFallback>{currentCourier.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold">{currentCourier.name}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Truck size={14} className="mr-1" />
                  {currentCourier.vehicleType || "Courier"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center mr-4">
                <Switch 
                  id="available" 
                  checked={currentCourier.isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                />
                <label htmlFor="available" className="ml-2 text-sm font-medium">
                  {currentCourier.isAvailable ? "Available" : "Unavailable"}
                </label>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-1.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 text-getmore-purple" size={18} />
                Update Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <Input
                    placeholder="Enter your current area or location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-getmore-purple hover:bg-purple-700"
                  onClick={handleUpdateLocation}
                >
                  <Navigation size={16} className="mr-1.5" />
                  Update
                </Button>
              </div>
              {currentCourier.currentLocation && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  <MapPinned size={14} className="mr-1.5" />
                  Current location: {currentCourier.currentLocation}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-getmore-purple/10 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                    <Package size={20} className="text-getmore-purple" />
                  </div>
                  <p className="text-sm text-gray-500">Deliveries</p>
                  <p className="text-2xl font-bold">{currentCourier.completedDeliveries || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-getmore-turquoise/10 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                    <Clock size={20} className="text-getmore-turquoise" />
                  </div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                    <AlertCircle size={20} className="text-yellow-500" />
                  </div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{pendingDeliveries.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                    <User size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-2xl font-bold">{currentCourier.rating || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="available">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="available">
                Available
                {pendingDeliveries.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500">{pendingDeliveries.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {activeDeliveries.length > 0 && (
                  <Badge className="ml-2 bg-getmore-purple">{activeDeliveries.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="available">
              {pendingDeliveries.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Info size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Available Deliveries</h3>
                    <p className="text-gray-500">Check back soon for new delivery requests.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingDeliveries.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Store size={18} className="mr-2 text-getmore-purple" />
                            <h3 className="font-medium">{delivery.storeName}</h3>
                          </div>
                          <Badge className="bg-yellow-500">Pending</Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start">
                            <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-gray-500" />
                            <p className="text-sm">{delivery.customerAddress}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              {new Date(delivery.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full bg-getmore-purple hover:bg-purple-700" 
                          onClick={() => handleAcceptDelivery(delivery.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Accepting..." : "Accept Delivery"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              {activeDeliveries.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Info size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Active Deliveries</h3>
                    <p className="text-gray-500">You don't have any active deliveries at the moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeDeliveries.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Store size={18} className="mr-2 text-getmore-purple" />
                            <h3 className="font-medium">{delivery.storeName}</h3>
                          </div>
                          <Badge className={delivery.status === 'accepted' ? 'bg-blue-500' : 'bg-green-500'}>
                            {delivery.status === 'accepted' ? 'Accepted' : 'Picked Up'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start">
                            <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-gray-500" />
                            <p className="text-sm">{delivery.customerAddress}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              {delivery.status === 'accepted' 
                                ? `Accepted: ${new Date(delivery.acceptedAt).toLocaleString()}`
                                : `Picked up: ${new Date(delivery.pickedUpAt).toLocaleString()}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          {delivery.status === 'accepted' ? (
                            <Button 
                              className="w-full sm:flex-1 bg-getmore-turquoise hover:bg-teal-600"
                              onClick={() => handleUpdateDeliveryStatus(delivery.id, 'picked_up')}
                              disabled={isLoading}
                            >
                              <Truck size={16} className="mr-1.5" />
                              Mark as Picked Up
                            </Button>
                          ) : (
                            <Button 
                              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateDeliveryStatus(delivery.id, 'delivered')}
                              disabled={isLoading}
                            >
                              <CheckCircle size={16} className="mr-1.5" />
                              Mark as Delivered
                            </Button>
                          )}
                          
                          <div className="flex w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                            <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                              <MessageSquare size={16} />
                            </Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
                              <PhoneCall size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {deliveryHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Info size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Delivery History</h3>
                    <p className="text-gray-500">You haven't completed any deliveries yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {deliveryHistory.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Store size={18} className="mr-2 text-getmore-purple" />
                            <h3 className="font-medium">{delivery.storeName}</h3>
                          </div>
                          <Badge className={delivery.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'}>
                            {delivery.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-gray-500" />
                            <p className="text-sm">{delivery.customerAddress}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              {delivery.status === 'delivered'
                                ? `Delivered: ${new Date(delivery.deliveredAt).toLocaleString()}`
                                : `Cancelled: ${new Date(delivery.updatedAt || delivery.createdAt).toLocaleString()}`
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default CourierDashboard;
