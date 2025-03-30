
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  MapPin, Package, History, Settings, Truck, ChevronRight, 
  CheckCircle, XCircle, Phone, Clock, User, LogOut,
  Navigation, ArrowUpRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

interface CourierInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  status: string;
  deliveries: number;
  rating: number;
}

interface DeliveryRequest {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  store_name: string;
  store_address: string;
  items: any[];
  total_amount: number;
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
  courier_assigned?: string;
}

const CourierDashboard = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [courierInfo, setCourierInfo] = useState<CourierInfo | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryRequest[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryRequest[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') {
        navigate('/courier-login');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/courier-login');
        return;
      }
      
      setSession(session);
      fetchCourierInfo(session.user.id);
      
    } catch (error) {
      console.error("Error checking session:", error);
      navigate('/courier-login');
    }
  };
  
  const fetchCourierInfo = async (courierId: string) => {
    setIsLoading(true);
    
    // Check local storage first for quick loading
    const storedCourier = localStorage.getItem('courierInfo');
    if (storedCourier) {
      const parsedCourier = JSON.parse(storedCourier);
      if (parsedCourier.id === courierId) {
        setCourierInfo(parsedCourier);
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('couriers')
        .select('*')
        .eq('id', courierId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCourierInfo(data);
        localStorage.setItem('courierInfo', JSON.stringify(data));
        
        // Fetch deliveries after getting courier info
        fetchDeliveries(courierId);
      }
    } catch (error) {
      console.error("Error fetching courier info:", error);
      toast.error("Could not load courier information");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDeliveries = async (courierId: string) => {
    try {
      // Fetch available deliveries
      const { data: availableData, error: availableError } = await supabase
        .from('orders')
        .select('*, stores(name, address)')
        .eq('status', 'approved')
        .is('courier_assigned', null);
        
      if (availableError) throw availableError;
      
      // Transform data to include store information
      const transformedAvailable = availableData.map((order: any) => ({
        ...order,
        store_name: order.stores?.name || 'Unknown store',
        store_address: order.stores?.address || 'Unknown location',
      }));
      
      setAvailableDeliveries(transformedAvailable);
      
      // Fetch courier's assigned deliveries
      const { data: myData, error: myError } = await supabase
        .from('orders')
        .select('*, stores(name, address)')
        .eq('courier_assigned', courierId)
        .in('status', ['delivering', 'completed']);
        
      if (myError) throw myError;
      
      // Transform data to include store information
      const transformedMy = myData.map((order: any) => ({
        ...order,
        store_name: order.stores?.name || 'Unknown store',
        store_address: order.stores?.address || 'Unknown location',
      }));
      
      setMyDeliveries(transformedMy);
      
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Could not load deliveries");
    }
  };
  
  const handleAcceptDelivery = async (deliveryId: string) => {
    if (!courierInfo) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          courier_assigned: courierInfo.id,
          status: 'delivering'
        })
        .eq('id', deliveryId);
        
      if (error) throw error;
      
      // Update local state
      const updatedAvailable = availableDeliveries.filter(d => d.id !== deliveryId);
      const acceptedDelivery = availableDeliveries.find(d => d.id === deliveryId);
      
      if (acceptedDelivery) {
        const updatedDelivery = {
          ...acceptedDelivery,
          courier_assigned: courierInfo.id,
          status: 'delivering'
        };
        
        setAvailableDeliveries(updatedAvailable);
        setMyDeliveries([updatedDelivery, ...myDeliveries]);
      }
      
      setIsDetailsOpen(false);
      toast.success("Delivery accepted!");
      
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    }
  };
  
  const handleCompleteDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed'
        })
        .eq('id', deliveryId);
        
      if (error) throw error;
      
      // Update local state
      const updatedDeliveries = myDeliveries.map(d => 
        d.id === deliveryId ? { ...d, status: 'completed' } : d
      );
      
      setMyDeliveries(updatedDeliveries);
      
      // Update courier deliveries count
      if (courierInfo) {
        const newDeliveryCount = (courierInfo.deliveries || 0) + 1;
        
        const { error: courierError } = await supabase
          .from('couriers')
          .update({ deliveries: newDeliveryCount })
          .eq('id', courierInfo.id);
          
        if (!courierError) {
          setCourierInfo({
            ...courierInfo,
            deliveries: newDeliveryCount
          });
          
          // Update localStorage
          localStorage.setItem('courierInfo', JSON.stringify({
            ...courierInfo,
            deliveries: newDeliveryCount
          }));
        }
      }
      
      setIsDetailsOpen(false);
      toast.success("Delivery marked as completed!");
      
    } catch (error) {
      console.error("Error completing delivery:", error);
      toast.error("Failed to complete delivery");
    }
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('courierInfo');
      navigate('/courier-login');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-getmore-purple border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading dashboard...</h2>
          <p className="text-gray-500">Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-bold text-xl flex items-center">
              <span className="text-getmore-purple">Get</span>
              <span className="text-getmore-turquoise">More</span>
              <span className="text-gray-800 ml-1">Courier</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-red-500"
            >
              <LogOut size={18} className="mr-1" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courierInfo && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <Avatar className="h-16 w-16 mb-4 md:mb-0 md:mr-6">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courierInfo.name)}&background=8B5CF6&color=fff`} />
                    <AvatarFallback>{courierInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{courierInfo.name}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1 sm:space-x-4">
                      <div className="flex items-center mb-1 sm:mb-0">
                        <Phone size={14} className="mr-1" />
                        {courierInfo.phone}
                      </div>
                      <div className="flex items-center mb-1 sm:mb-0">
                        <Truck size={14} className="mr-1" />
                        {courierInfo.vehicle_type}
                      </div>
                      <div className="flex items-center">
                        <Package size={14} className="mr-1" />
                        {courierInfo.deliveries || 0} Deliveries
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Badge className="bg-green-500">{courierInfo.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-2">
            <TabsTrigger value="available">Available Deliveries</TabsTrigger>
            <TabsTrigger value="my-deliveries">My Deliveries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-6">
            <h2 className="text-xl font-semibold">Available Deliveries</h2>
            
            {availableDeliveries.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No available deliveries</h3>
                <p className="text-gray-500 mt-2">Check back later for new delivery requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-2">
                            <MapPin className="h-5 w-5 text-getmore-purple mr-2 mt-0.5" />
                            <div>
                              <h3 className="font-medium">Delivery to: {delivery.address}</h3>
                              <p className="text-sm text-gray-500">From: {delivery.store_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm mb-4">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-500">
                              {formatDate(delivery.created_at)}
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Items:</span> {delivery.items.length}
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="font-medium">Total:</span> P{delivery.total_amount.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6 flex md:flex-col items-center md:items-end justify-between">
                          <Badge className="mb-4 bg-yellow-500">Needs Courier</Badge>
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setIsDetailsOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-deliveries" className="space-y-6">
            <h2 className="text-xl font-semibold">My Deliveries</h2>
            
            {myDeliveries.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No active deliveries</h3>
                <p className="text-gray-500 mt-2">You haven't accepted any deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-2">
                            <MapPin className="h-5 w-5 text-getmore-purple mr-2 mt-0.5" />
                            <div>
                              <h3 className="font-medium">Delivery to: {delivery.address}</h3>
                              <p className="text-sm text-gray-500">From: {delivery.store_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm mb-4">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-gray-500">
                              {formatDate(delivery.updated_at)}
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Items:</span> {delivery.items.length}
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="font-medium">Customer:</span> {delivery.customer_name}
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6 flex md:flex-col items-center md:items-end justify-between">
                          <Badge className={delivery.status === 'completed' ? 'mb-4 bg-green-500' : 'mb-4 bg-blue-500'}>
                            {delivery.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                          <Button 
                            size="sm" 
                            className="h-8"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setIsDetailsOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Delivery Details Dialog */}
        {selectedDelivery && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delivery Details</DialogTitle>
                <DialogDescription>
                  Complete information about this delivery
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <User size={16} className="mr-2" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Name:</span> {selectedDelivery.customer_name}</p>
                    <p><span className="font-medium">Delivery Address:</span> {selectedDelivery.address}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Store size={16} className="mr-2" />
                    Store Information
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Store:</span> {selectedDelivery.store_name}</p>
                    <p><span className="font-medium">Pickup Address:</span> {selectedDelivery.store_address}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Package size={16} className="mr-2" />
                    Order Details
                  </h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Order ID:</span> {selectedDelivery.id.slice(0, 8)}</p>
                    <p><span className="font-medium">Total Amount:</span> P{selectedDelivery.total_amount.toFixed(2)}</p>
                    <p><span className="font-medium">Status:</span> {selectedDelivery.status}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedDelivery.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Order Items</h3>
                  <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                    {selectedDelivery.items.map((item: any, index: number) => (
                      <div key={index} className="py-2 border-b last:border-0">
                        <div className="flex justify-between">
                          <span>{item.productName || item.name}</span>
                          <span>x{item.quantity}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          P{parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                {selectedDelivery.status === 'approved' && (
                  <Button 
                    onClick={() => handleAcceptDelivery(selectedDelivery.id)}
                    className="w-full"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Accept Delivery
                  </Button>
                )}
                
                {selectedDelivery.status === 'delivering' && (
                  <Button 
                    onClick={() => handleCompleteDelivery(selectedDelivery.id)}
                    className="w-full"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Mark as Completed
                  </Button>
                )}
                
                {selectedDelivery.status === 'completed' && (
                  <Button variant="outline" className="w-full" onClick={() => setIsDetailsOpen(false)}>
                    Close Details
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default CourierDashboard;
