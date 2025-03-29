
import { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { Home, Package, Store, Truck, Users, Settings, LogOut, Phone, Mail, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useStore, StoreInfo } from "@/contexts/StoreContext";

// Admin dashboard components
const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would call a signout API
    toast.success("Logged out successfully");
    navigate("/admin-signin");
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <div className="font-bold text-xl flex items-center">
            <span className="text-getmore-purple">Get</span>
            <span className="text-getmore-turquoise">More</span>
            <span className="text-gray-800 ml-1">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://ui-avatars.com/api/?name=Admin&background=8B5CF6&color=fff" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-500"
          >
            <LogOut size={18} />
            <span className="ml-2 text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: Home,
    },
    {
      name: "Stores",
      path: "/admin-dashboard/stores",
      icon: Store,
    },
    {
      name: "Couriers",
      path: "/admin-dashboard/couriers",
      icon: Truck,
    },
    {
      name: "Orders",
      path: "/admin-dashboard/orders",
      icon: Package,
    },
    {
      name: "Users",
      path: "/admin-dashboard/users",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/admin-dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="bg-gray-50 w-64 border-r shadow-sm">
      <nav className="flex flex-col h-full p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                currentPath === item.path
                  ? "bg-getmore-purple text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon size={18} className="mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

// Dashboard components for different tabs
const DashboardHome = () => {
  // Get stores, users, orders from localStorage 
  const { allStores } = useStore();
  const [stats, setStats] = useState({
    stores: 0,
    users: 0,
    orders: 0,
    couriers: 0
  });

  useEffect(() => {
    // In a real app, you would fetch this data from a backend API
    // For this demo, we'll get data from localStorage
    const userCount = localStorage.getItem('users') 
      ? JSON.parse(localStorage.getItem('users') || '[]').length 
      : 0;
    
    const orderCount = localStorage.getItem('storeOrders') 
      ? JSON.parse(localStorage.getItem('storeOrders') || '[]').length 
      : 0;
    
    const courierCount = localStorage.getItem('couriers') 
      ? JSON.parse(localStorage.getItem('couriers') || '[]').length 
      : 0;
    
    setStats({
      stores: allStores.length,
      users: userCount,
      orders: orderCount,
      couriers: courierCount
    });
  }, [allStores]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stores}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Couriers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.couriers}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent-orders">
        <TabsList>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="new-stores">New Stores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent-orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500 text-center py-10">
                No recent orders to display
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new-stores">
          <Card>
            <CardHeader>
              <CardTitle>Newly Registered Stores</CardTitle>
            </CardHeader>
            <CardContent>
              {allStores.length === 0 ? (
                <div className="text-gray-500 text-center py-10">
                  No stores to display
                </div>
              ) : (
                <div className="space-y-4">
                  {allStores.map((store) => (
                    <div key={store.id} className="flex items-center p-3 border rounded-lg">
                      <div className="h-10 w-10 mr-3">
                        <Avatar>
                          <AvatarImage src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=8B5CF6&color=fff`} alt={store.name} />
                          <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{store.name}</h4>
                        <p className="text-sm text-gray-500">{store.email}</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CouriersTab = () => {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCourier, setNewCourier] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicle: "motorcycle",
    notes: ""
  });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch couriers from API
    const storedCouriers = localStorage.getItem('couriers');
    if (storedCouriers) {
      setCouriers(JSON.parse(storedCouriers));
    }
  }, []);

  const handleCreateCourier = () => {
    // Validate form
    if (!newCourier.name || !newCourier.email || !newCourier.phone || !newCourier.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create new courier
    const courier = {
      id: `courier-${Date.now()}`,
      name: newCourier.name,
      email: newCourier.email,
      phone: newCourier.phone,
      password: newCourier.password,
      vehicle: newCourier.vehicle,
      notes: newCourier.notes,
      status: "active",
      rating: 0,
      deliveries: 0,
      registeredAt: new Date().toISOString()
    };

    // Save to state and localStorage
    const updatedCouriers = [...couriers, courier];
    setCouriers(updatedCouriers);
    localStorage.setItem('couriers', JSON.stringify(updatedCouriers));
    
    // Reset form and close dialog
    setNewCourier({
      name: "",
      email: "",
      phone: "",
      password: "",
      vehicle: "motorcycle",
      notes: ""
    });
    setIsCreateDialogOpen(false);
    toast.success("Courier account created successfully");
    
    // Open share credentials dialog
    setSelectedCourier(courier);
    setIsShareDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourier(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Couriers</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Courier
        </Button>
      </div>
      
      {couriers.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <Truck size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No couriers found</h3>
          <p className="text-gray-500 mb-4">Create a courier account to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            Add Courier
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {couriers.map((courier) => (
            <Card key={courier.id}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courier.name)}&background=8B5CF6&color=fff`} alt={courier.name} />
                    <AvatarFallback>{courier.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{courier.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-1" />
                        {courier.email}
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {courier.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedCourier(courier);
                        setIsShareDialogOpen(true);
                      }}
                    >
                      <Send size={14} className="mr-1" />
                      Share Credentials
                    </Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Courier Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Courier Account</DialogTitle>
            <DialogDescription>
              Enter the details for the new courier account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                value={newCourier.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newCourier.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number *
              </label>
              <Input
                id="phone"
                name="phone"
                value={newCourier.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newCourier.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="vehicle" className="text-sm font-medium">
                Vehicle Type
              </label>
              <select
                id="vehicle"
                name="vehicle"
                value={newCourier.vehicle}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="motorcycle">Motorcycle</option>
                <option value="car">Car</option>
                <option value="bicycle">Bicycle</option>
                <option value="van">Van</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={newCourier.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourier}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Credentials Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Courier Credentials</DialogTitle>
            <DialogDescription>
              Share these login credentials with the courier to allow them to access the system.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourier && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-3 border">
                <div>
                  <label className="text-sm text-gray-500">Courier Name:</label>
                  <p className="font-medium">{selectedCourier.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Login Email:</label>
                  <p className="font-medium">{selectedCourier.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Password:</label>
                  <p className="font-medium">{selectedCourier.password}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Login URL:</label>
                  <p className="font-medium text-getmore-purple">https://getmorebw.com/courier-login</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Share via:</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-whatsapp mr-2">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                      <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                      <path d="M9.95 15c.17 0 .33-.17.5-.33A5.4 5.4 0 0 0 11.95 15a5.4 5.4 0 0 0 1.5-.33.5.5 0 0 1 .5.33"></path>
                    </svg>
                    WhatsApp
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={() => {
                  // In a real app, this would copy to clipboard
                  toast.success("Credentials copied to clipboard");
                }} className="w-full">
                  Copy Credentials
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StoresTab = () => {
  const { allStores } = useStore();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Stores</h2>
      
      {allStores.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No stores found</h3>
          <p className="text-gray-500">No stores have been registered yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allStores.map((store: StoreInfo) => (
            <Card key={store.id}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=8B5CF6&color=fff`} alt={store.name} />
                    <AvatarFallback>{store.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{store.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-1" />
                        {store.email}
                      </div>
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {store.phone}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard component
const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AdminHeader />
      <div className="flex-1 flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/couriers" element={<CouriersTab />} />
            <Route path="/stores" element={<StoresTab />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
