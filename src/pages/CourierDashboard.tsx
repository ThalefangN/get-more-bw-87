
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Bike,
  Clock,
  Map,
  Phone,
  User,
  DollarSign,
  LogOut,
  Menu,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCourier } from "@/contexts/CourierContext";

const CourierDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentCourier, isAuthenticated, logout } = useCourier();
  
  const [loading, setLoading] = useState(true);
  const [courier, setCourier] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("available");
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [isAccepting, setIsAccepting] = useState(false);
  const [storeCache, setStoreCache] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!isAuthenticated && !currentCourier) {
      navigate("/courier-login");
      return;
    }
    
    // Set courier from context if authenticated
    if (isAuthenticated && currentCourier) {
      setCourier(currentCourier);
      setLoading(false);
      fetchAvailableOrders();
      fetchMyDeliveries();
    } else {
      checkSession();
    }
  }, [isAuthenticated, currentCourier, navigate]);

  const checkSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) {
        navigate("/courier-login");
        return;
      }
      
      // Check if courier profile exists
      const { data: courierData, error: courierError } = await supabase
        .from('couriers')
        .select('*')
        .eq('email', sessionData.session.user.email)
        .maybeSingle();
      
      if (courierError) {
        if (courierError.code === 'PGRST116') {
          toast.error("Your courier account has not been approved yet");
          await supabase.auth.signOut();
          navigate("/courier-login");
          return;
        }
        throw courierError;
      }
      
      if (!courierData) {
        toast.error("No courier account found");
        await supabase.auth.signOut();
        navigate("/courier-login");
        return;
      }
      
      setCourier(courierData);
      setLoading(false);
      
      fetchAvailableOrders();
      fetchMyDeliveries();
    } catch (error: any) {
      console.error("Session check error:", error);
      toast.error(error.message || "Authentication error");
      navigate("/courier-login");
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or('courier_assigned.is.null,status.eq.pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAvailableOrders(data);
        
        // Fetch store details for each order
        data.forEach(async (order) => {
          if (order.store_id && !storeCache[order.store_id]) {
            await fetchStoreDetails(order.store_id);
          }
        });
      }
    } catch (error: any) {
      console.error("Error fetching available orders:", error);
    }
  };
  
  const fetchMyDeliveries = async () => {
    if (!courier) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('courier_assigned', courier.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setMyDeliveries(data);
        
        // Fetch store details for each order
        data.forEach(async (order) => {
          if (order.store_id && !storeCache[order.store_id]) {
            await fetchStoreDetails(order.store_id);
          }
        });
      }
    } catch (error: any) {
      console.error("Error fetching my deliveries:", error);
    }
  };
  
  const fetchStoreDetails = async (storeId: string) => {
    if (storeCache[storeId]) return;
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setStoreCache(prev => ({ ...prev, [storeId]: data }));
      }
    } catch (error: any) {
      console.error(`Error fetching store details for ${storeId}:`, error);
    }
  };

  const handleAcceptOrder = async (order: any) => {
    if (!courier) return;
    
    setIsAccepting(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          courier_assigned: courier.email,
          status: 'delivery_accepted'
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success("Order accepted successfully!");
      
      // Update local state
      setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
      setMyDeliveries(prev => [...prev, { ...order, courier_assigned: courier.email, status: 'delivery_accepted' }]);
      
      setActiveTab("my-deliveries");
    } catch (error: any) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };
  
  const handleUpdateDeliveryStatus = async (order: any, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success(`Order marked as ${newStatus.replace('_', ' ')}!`);
      
      // Update local state
      setMyDeliveries(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
      );
    } catch (error: any) {
      console.error("Error updating delivery status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      if (logout) {
        logout();
      }
      toast.success("Signed out successfully");
      navigate("/courier-login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-getmore-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-lg border border-red-300">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Account Error</h2>
            <p className="text-gray-600 mb-4">Unable to load your courier profile. Please log in again.</p>
            <Button onClick={() => navigate("/courier-login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'delivery_accepted':
        return <Badge className="bg-blue-500">Accepted</Badge>;
      case 'picked_up':
        return <Badge className="bg-purple-500">Picked Up</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="font-bold text-xl flex items-center">
              <span className="text-getmore-purple">Get</span>
              <span className="text-getmore-turquoise">More</span>
              <span className="text-gray-800 ml-1">Courier</span>
            </div>
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-600"
          >
            {showMobileMenu ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r">
          <div className="p-6 border-b">
            <div className="font-bold text-xl flex items-center">
              <span className="text-getmore-purple">Get</span>
              <span className="text-getmore-turquoise">More</span>
              <span className="text-gray-800 ml-1">Courier</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courier?.name || 'Courier')}&background=8B5CF6&color=fff`} alt={courier?.name} />
                <AvatarFallback>{courier?.name?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{courier?.name}</p>
                <p className="text-sm text-gray-500">{courier?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("available")}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === "available"
                    ? "bg-getmore-purple text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Package size={18} className="mr-2" />
                Available Orders
              </button>
              <button
                onClick={() => setActiveTab("my-deliveries")}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === "my-deliveries"
                    ? "bg-getmore-purple text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bike size={18} className="mr-2" />
                My Deliveries
              </button>
              <button
                onClick={() => setActiveTab("earnings")}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === "earnings"
                    ? "bg-getmore-purple text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <DollarSign size={18} className="mr-2" />
                Earnings
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === "profile"
                    ? "bg-getmore-purple text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User size={18} className="mr-2" />
                Profile
              </button>
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600"
                onClick={handleSignOut}
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-white z-50 lg:hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="font-bold text-xl flex items-center">
                <span className="text-getmore-purple">Get</span>
                <span className="text-getmore-turquoise">More</span>
                <span className="text-gray-800 ml-1">Courier</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courier?.name || 'Courier')}&background=8B5CF6&color=fff`} alt={courier?.name} />
                  <AvatarFallback>{courier?.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{courier?.name}</p>
                  <p className="text-sm text-gray-500">{courier?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("available");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                    activeTab === "available"
                      ? "bg-getmore-purple text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Package size={18} className="mr-2" />
                  Available Orders
                </button>
                <button
                  onClick={() => {
                    setActiveTab("my-deliveries");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                    activeTab === "my-deliveries"
                      ? "bg-getmore-purple text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Bike size={18} className="mr-2" />
                  My Deliveries
                </button>
                <button
                  onClick={() => {
                    setActiveTab("earnings");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                    activeTab === "earnings"
                      ? "bg-getmore-purple text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <DollarSign size={18} className="mr-2" />
                  Earnings
                </button>
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                    activeTab === "profile"
                      ? "bg-getmore-purple text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <User size={18} className="mr-2" />
                  Profile
                </button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 mt-6"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="available">
              <h2 className="text-2xl font-bold mb-6">Available Orders</h2>
              
              {availableOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No orders available</h3>
                  <p className="text-gray-500 mt-2">Check back later for new delivery requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableOrders.map((order) => {
                    const store = storeCache[order.store_id] || null;
                    
                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex-1 mb-4 md:mb-0">
                              <div className="flex items-center mb-2">
                                {store ? (
                                  <>
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarImage src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=8B5CF6&color=fff`} alt={store.name} />
                                      <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-medium">{store.name}</h3>
                                  </>
                                ) : (
                                  <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                                )}
                                <div className="ml-auto">
                                  {renderStatusBadge(order.status)}
                                </div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex">
                                  <Map size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">Deliver to: {order.address}</span>
                                </div>
                                <div className="flex">
                                  <Package size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {Array.isArray(order.items) ? `${order.items.length} items` : 'Items not available'}
                                  </span>
                                </div>
                                <div className="flex">
                                  <Clock size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {new Date(order.created_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 md:ml-6">
                              <div className="text-xl font-bold text-center md:text-right">
                                P{order.total_amount}
                              </div>
                              <Button 
                                onClick={() => handleAcceptOrder(order)}
                                disabled={isAccepting}
                                className="w-full md:w-auto"
                              >
                                {isAccepting ? "Accepting..." : "Accept Delivery"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="my-deliveries">
              <h2 className="text-2xl font-bold mb-6">My Deliveries</h2>
              
              {myDeliveries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Bike size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">No active deliveries</h3>
                  <p className="text-gray-500 mt-2">Accept orders to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myDeliveries.map((order) => {
                    const store = storeCache[order.store_id] || null;
                    
                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col">
                            <div className="flex items-center mb-2">
                              {store ? (
                                <>
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=8B5CF6&color=fff`} alt={store.name} />
                                    <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <h3 className="font-medium">{store.name}</h3>
                                </>
                              ) : (
                                <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                              )}
                              <div className="ml-auto">
                                {renderStatusBadge(order.status)}
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2 text-sm">
                                <div className="flex">
                                  <User size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">Customer: {order.customer_name}</span>
                                </div>
                                <div className="flex">
                                  <Map size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">Address: {order.address}</span>
                                </div>
                                <div className="flex">
                                  <Phone size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">Contact: {store?.phone || 'N/A'}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex">
                                  <Package size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {Array.isArray(order.items) ? `${order.items.length} items` : 'Items not available'}
                                  </span>
                                </div>
                                <div className="flex">
                                  <Clock size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {new Date(order.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex">
                                  <DollarSign size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-700 font-bold">
                                    P{order.total_amount}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t pt-4 mt-2">
                              <div className="flex flex-wrap gap-2 justify-end">
                                {order.status === 'delivery_accepted' && (
                                  <Button 
                                    onClick={() => handleUpdateDeliveryStatus(order, 'picked_up')}
                                    className="flex items-center"
                                  >
                                    <CheckCircle size={16} className="mr-2" />
                                    Mark as Picked Up
                                  </Button>
                                )}
                                
                                {order.status === 'picked_up' && (
                                  <Button 
                                    onClick={() => handleUpdateDeliveryStatus(order, 'delivered')}
                                    className="flex items-center"
                                  >
                                    <CheckCircle size={16} className="mr-2" />
                                    Mark as Delivered
                                  </Button>
                                )}
                                
                                {(order.status === 'delivery_accepted' || order.status === 'picked_up') && (
                                  <Button 
                                    variant="outline" 
                                    className="text-red-600 border-red-600"
                                    onClick={() => handleUpdateDeliveryStatus(order, 'cancelled')}
                                  >
                                    <XCircle size={16} className="mr-2" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="earnings">
              <h2 className="text-2xl font-bold mb-6">Earnings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Today's Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">P0.00</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">P0.00</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Deliveries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myDeliveries.filter(d => d.status === 'delivered').length}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Earning History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No earnings yet</h3>
                    <p className="text-gray-500 mt-2">Complete deliveries to see your earnings history</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <h2 className="text-2xl font-bold mb-6">My Profile</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courier?.name || 'Courier')}&background=8B5CF6&color=fff`} alt={courier?.name} />
                      <AvatarFallback>{courier?.name?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{courier?.name}</h3>
                    <p className="text-gray-500">{courier?.email}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                        <p className="text-lg">{courier?.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Vehicle Type</h4>
                        <p className="text-lg">{courier?.vehicle_type}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <p className="text-lg flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${courier?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {courier?.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Joined</h4>
                        <p className="text-lg">{new Date(courier?.registered_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">Account Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        Update Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default CourierDashboard;
