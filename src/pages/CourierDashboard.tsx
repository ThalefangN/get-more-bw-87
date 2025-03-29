
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useCourier, DeliveryRequest } from "@/contexts/CourierContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Package, Clock, CheckCircle, MapPin, TrendingUp, DollarSign, User } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const CourierDashboard = () => {
  const { currentCourier, isAuthenticated, logout, toggleAvailability } = useCourier();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/courier-login" />;
  }
  
  const handleLogout = () => {
    logout();
    navigate("/courier-login");
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    toggleAvailability(checked);
    toast.info(`You are now ${checked ? 'available' : 'unavailable'} for deliveries`);
  };
  
  const navigation = [
    { name: "Dashboard", href: "/courier-dashboard", icon: TrendingUp },
    { name: "Delivery Requests", href: "/courier-dashboard/requests", icon: Package },
    { name: "Active Deliveries", href: "/courier-dashboard/active", icon: Bike },
    { name: "Delivery History", href: "/courier-dashboard/history", icon: Clock },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Courier Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold text-getmore-purple">Get</span>
                  <span className="text-xl font-bold text-getmore-turquoise">More</span>
                  <span className="text-lg font-bold text-gray-700">BW</span>
                </Link>
                <span className="ml-3 text-gray-300">|</span>
                <span className="ml-3 font-semibold">Courier Dashboard</span>
              </div>
            </div>
            
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="availability"
                    checked={currentCourier?.isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                  />
                  <label
                    htmlFor="availability"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {currentCourier?.isAvailable ? 'Available for deliveries' : 'Unavailable'}
                  </label>
                </div>
                
                {currentCourier && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-getmore-turquoise flex items-center justify-center text-white">
                      {currentCourier.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">{currentCourier.name}</span>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-getmore-turquoise flex items-center justify-center text-white">
                    {currentCourier?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">{currentCourier?.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mobile-availability"
                    checked={currentCourier?.isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                  />
                  <label
                    htmlFor="mobile-availability"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {currentCourier?.isAvailable ? 'Available' : 'Unavailable'}
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-getmore-turquoise hover:bg-gray-100 rounded-md"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation tabs */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between overflow-x-auto">
              <div className="flex">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "border-getmore-turquoise text-getmore-turquoise"
                        : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    <item.icon className="mr-2" size={16} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Routes>
          <Route index element={<CourierDashboardHome />} />
          <Route path="requests" element={<DeliveryRequestsPage />} />
          <Route path="active" element={<ActiveDeliveriesPage />} />
          <Route path="history" element={<DeliveryHistoryPage />} />
          <Route path="*" element={<Navigate to="/courier-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Dashboard Home Page
const CourierDashboardHome = () => {
  const { currentCourier, deliveryRequests, activeDeliveries, deliveryHistory } = useCourier();
  
  // Stats for the dashboard
  const pendingRequests = deliveryRequests.filter(req => req.status === 'pending').length;
  const activeCount = activeDeliveries.length;
  const completedCount = deliveryHistory.filter(del => del.status === 'delivered').length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {currentCourier?.name}</h1>
        <p className="text-gray-600">Your delivery dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Requests</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-gray-500">New delivery requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Bike className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-gray-500">Deliveries in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-gray-500">Total completed deliveries</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveryHistory.length > 0 ? (
              <div className="space-y-4">
                {deliveryHistory.slice(0, 5).map(delivery => (
                  <div key={delivery.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{delivery.storeName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        delivery.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No deliveries completed yet. Your delivery history will appear here.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Earnings Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-getmore-turquoise mr-2" />
                  <span className="font-medium">Today's Earnings</span>
                </div>
                <span className="font-bold">P0.00</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-getmore-turquoise mr-2" />
                  <span className="font-medium">This Week</span>
                </div>
                <span className="font-bold">P0.00</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-getmore-turquoise mr-2" />
                  <span className="font-medium">This Month</span>
                </div>
                <span className="font-bold">P0.00</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-getmore-turquoise mr-2" />
                  <span className="font-medium">Customer Rating</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold mr-1">{currentCourier?.rating || 'N/A'}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Delivery Requests Page
const DeliveryRequestsPage = () => {
  const { deliveryRequests, acceptDelivery } = useCourier();
  
  const pendingRequests = deliveryRequests.filter(req => req.status === 'pending');
  
  const handleAcceptDelivery = (requestId: string) => {
    acceptDelivery(requestId);
    toast.success("Delivery accepted! You can now pick up the order.");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Delivery Requests</h1>
        <p className="text-gray-600">Available orders for delivery</p>
      </div>
      
      {pendingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingRequests.map(request => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="bg-getmore-turquoise/10 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{request.storeName}</CardTitle>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    New Request
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Order #{request.orderId.substring(0, 8)}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-getmore-turquoise mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-600">{request.customerAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-getmore-turquoise mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Requested</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-getmore-turquoise hover:bg-teal-600 text-black"
                    onClick={() => handleAcceptDelivery(request.id)}
                  >
                    Accept Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no pending delivery requests at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

// Active Deliveries Page
const ActiveDeliveriesPage = () => {
  const { activeDeliveries, updateDeliveryStatus } = useCourier();
  
  const handlePickUp = (requestId: string) => {
    updateDeliveryStatus(requestId, 'picked_up');
    toast.success("Order picked up! Proceed with the delivery.");
  };
  
  const handleDeliver = (requestId: string) => {
    updateDeliveryStatus(requestId, 'delivered');
    toast.success("Delivery completed! Thank you for your service.");
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Active Deliveries</h1>
        <p className="text-gray-600">Deliveries in progress</p>
      </div>
      
      {activeDeliveries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeDeliveries.map(delivery => (
            <Card key={delivery.id} className="overflow-hidden">
              <CardHeader className={`${
                delivery.status === 'picked_up' 
                  ? 'bg-blue-50' 
                  : 'bg-getmore-turquoise/10'
              } pb-2`}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{delivery.storeName}</CardTitle>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    delivery.status === 'picked_up' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {delivery.status === 'picked_up' ? 'In Transit' : 'Accepted'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Order #{delivery.orderId.substring(0, 8)}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-getmore-turquoise mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-600">{delivery.customerAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-getmore-turquoise mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {delivery.status === 'picked_up' ? 'Picked Up' : 'Accepted'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(delivery.acceptedAt || delivery.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {delivery.status === 'accepted' ? (
                    <Button 
                      className="w-full bg-getmore-turquoise hover:bg-teal-600 text-black"
                      onClick={() => handlePickUp(delivery.id)}
                    >
                      Mark as Picked Up
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleDeliver(delivery.id)}
                    >
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Bike className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active deliveries</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any deliveries in progress. Accept requests to start delivering.
          </p>
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="text-getmore-turquoise border-getmore-turquoise hover:bg-getmore-turquoise/10"
              onClick={() => window.location.href = '/courier-dashboard/requests'}
            >
              View Available Requests
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Delivery History Page
const DeliveryHistoryPage = () => {
  const { deliveryHistory } = useCourier();
  
  const completedDeliveries = deliveryHistory.filter(del => del.status === 'delivered');
  const cancelledDeliveries = deliveryHistory.filter(del => del.status === 'cancelled');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <p className="text-gray-600">Record of your past deliveries</p>
      </div>
      
      {deliveryHistory.length > 0 ? (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Completed Deliveries</h2>
            {completedDeliveries.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedDeliveries.map(delivery => (
                      <tr key={delivery.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{delivery.orderId.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {delivery.storeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {delivery.customerAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(delivery.deliveredAt || delivery.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">
                No completed deliveries yet.
              </p>
            )}
          </div>
          
          {cancelledDeliveries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Cancelled Deliveries</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cancelledDeliveries.map(delivery => (
                      <tr key={delivery.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{delivery.orderId.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {delivery.storeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery history</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your completed deliveries will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

// Import the required icons
import { Menu, X, LogOut } from "lucide-react";

export default CourierDashboard;
