import { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route, useLocation } from "react-router-dom";
import { Home, Package, Store, Truck, Users, Settings, LogOut, Phone, Mail, Plus, Send, CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useStore, StoreInfo } from "@/contexts/StoreContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
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

const DashboardHome = () => {
  const { allStores } = useStore();
  const [stats, setStats] = useState({
    stores: 0,
    users: 0,
    orders: 0,
    couriers: 0
  });

  useEffect(() => {
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
  const [applications, setApplications] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
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
  const [activeTab, setActiveTab] = useState("couriers");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCouriers = async () => {
      setIsLoading(true);
      
      const storedCouriers = localStorage.getItem('couriers');
      if (storedCouriers) {
        setCouriers(JSON.parse(storedCouriers));
      }
      
      try {
        const { data, error } = await supabase
          .from('couriers')
          .select('*');
          
        if (!error && data) {
          setCouriers(data);
          localStorage.setItem('couriers', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching couriers:", error);
      }
      
      setIsLoading(false);
    };
    
    const fetchApplications = async () => {
      const storedApplications = localStorage.getItem('courierApplications');
      if (storedApplications) {
        setApplications(JSON.parse(storedApplications));
      }
      
      try {
        const { data, error } = await supabase
          .from('courier_applications')
          .select('*');
          
        if (!error && data) {
          setApplications(data);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    
    fetchCouriers();
    fetchApplications();
  }, []);

  const handleCreateCourier = async () => {
    if (!newCourier.name || !newCourier.email || !newCourier.phone || !newCourier.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newCourier.email,
        password: newCourier.password,
        options: {
          data: {
            name: newCourier.name,
            role: "courier",
            phone: newCourier.phone,
            vehicle: newCourier.vehicle
          }
        }
      });
      
      if (authError) throw authError;
      
      const courier = {
        id: authData.user?.id || `courier-${Date.now()}`,
        name: newCourier.name,
        email: newCourier.email,
        phone: newCourier.phone,
        vehicle_type: newCourier.vehicle,
        notes: newCourier.notes,
        status: "active",
        rating: 0,
        deliveries: 0,
        registered_at: new Date().toISOString(),
        created_by_admin: true,
        password: newCourier.password
      };
      
      const { error: dbError } = await supabase
        .from('couriers')
        .insert([courier]);
        
      if (dbError) throw dbError;

      const updatedCouriers = [...couriers, courier];
      setCouriers(updatedCouriers);
      localStorage.setItem('couriers', JSON.stringify(updatedCouriers));
      
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
      
      setSelectedCourier(courier);
      setIsShareDialogOpen(true);
    } catch (error: any) {
      console.error("Error creating courier:", error);
      toast.error(error.message || "Failed to create courier account");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveApplication = async () => {
    if (!selectedApplication) return;
    
    setIsLoading(true);
    
    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: selectedApplication.email,
        password: tempPassword,
        options: {
          data: {
            name: selectedApplication.full_name || selectedApplication.fullName,
            role: "courier",
            phone: selectedApplication.phone,
            vehicle: selectedApplication.vehicle_type || selectedApplication.vehicle
          }
        }
      });
      
      if (authError) throw authError;
      
      const courier = {
        id: authData.user?.id || `courier-${Date.now()}`,
        name: selectedApplication.full_name || selectedApplication.fullName,
        email: selectedApplication.email,
        phone: selectedApplication.phone,
        vehicle_type: selectedApplication.vehicle_type || selectedApplication.vehicle,
        notes: `Application approved from ${selectedApplication.city}. Experience: ${selectedApplication.experience || "N/A"}`,
        status: "active",
        rating: 0,
        deliveries: 0,
        registered_at: new Date().toISOString(),
        created_by_admin: true,
        password: tempPassword
      };
      
      const { error: dbError } = await supabase
        .from('couriers')
        .insert([courier]);
        
      if (dbError) throw dbError;
      
      if (selectedApplication.id && selectedApplication.id.toString().startsWith('app-')) {
        const updatedApplications = applications.map(app => 
          app.id === selectedApplication.id ? { ...app, status: 'approved' } : app
        );
        setApplications(updatedApplications);
        localStorage.setItem('courierApplications', JSON.stringify(updatedApplications));
      } else {
        await supabase
          .from('courier_applications')
          .update({ status: 'approved' })
          .eq('id', selectedApplication.id);
          
        const updatedApplications = applications.map(app => 
          app.id === selectedApplication.id ? { ...app, status: 'approved' } : app
        );
        setApplications(updatedApplications);
      }

      const updatedCouriers = [...couriers, courier];
      setCouriers(updatedCouriers);
      localStorage.setItem('couriers', JSON.stringify(updatedCouriers));
      
      setIsApproveDialogOpen(false);
      toast.success("Application approved and courier account created");
      
      setSelectedCourier(courier);
      setIsShareDialogOpen(true);
    } catch (error: any) {
      console.error("Error approving application:", error);
      toast.error(error.message || "Failed to approve application");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRejectApplication = async (application: any) => {
    try {
      if (application.id && !application.id.toString().startsWith('app-')) {
        await supabase
          .from('courier_applications')
          .update({ status: 'rejected' })
          .eq('id', application.id);
      }
      
      const updatedApplications = applications.map(app => 
        app.id === application.id ? { ...app, status: 'rejected' } : app
      );
      setApplications(updatedApplications);
      localStorage.setItem('courierApplications', JSON.stringify(updatedApplications));
      
      toast.success("Application rejected");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Failed to reject application");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCourier(prev => ({ ...prev, [name]: value }));
  };

  const pendingApplications = applications.filter(app => 
    app.status === 'pending' || !app.status
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Couriers</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus size={18} className="mr-2" />
          Add Courier
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="couriers">Active Couriers</TabsTrigger>
          <TabsTrigger value="applications">
            Applications
            {pendingApplications.length > 0 && (
              <Badge className="ml-2 bg-getmore-purple">{pendingApplications.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="couriers">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-getmore-purple border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading couriers...</p>
            </div>
          ) : couriers.length === 0 ? (
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
                    <div className="flex flex-col md:flex-row md:items-center">
                      <Avatar className="h-12 w-12 mb-3 md:mb-0 md:mr-4">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(courier.name)}&background=8B5CF6&color=fff`} alt={courier.name} />
                        <AvatarFallback>{courier.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 mb-3 md:mb-0">
                        <h3 className="font-medium">{courier.name}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 sm:space-x-4">
                          <div className="flex items-center mb-1 sm:mb-0">
                            <Mail size={14} className="mr-1" />
                            {courier.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            {courier.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCourier(courier);
                            setIsShareDialogOpen(true);
                          }}
                        >
                          <Send size={14} className="mr-1" />
                          Credentials
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="applications">
          {applications.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <Truck size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No applications found</h3>
              <p className="text-gray-500">No one has applied to be a courier yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.full_name || app.fullName}
                      </TableCell>
                      <TableCell>
                        <div>{app.email}</div>
                        <div className="text-gray-500">{app.phone}</div>
                      </TableCell>
                      <TableCell>{app.vehicle_type || app.vehicle}</TableCell>
                      <TableCell>{app.city}</TableCell>
                      <TableCell>
                        <Badge className={
                          app.status === 'approved' ? 'bg-green-500' : 
                          app.status === 'rejected' ? 'bg-red-500' : 
                          'bg-yellow-500'
                        }>
                          {app.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(app.status === 'pending' || !app.status) && (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => {
                                setSelectedApplication(app);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleRejectApplication(app)}
                            >
                              <XCircle size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
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
            <Button onClick={handleCreateCourier} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Courier Application</DialogTitle>
            <DialogDescription>
              Approve this application and create a courier account
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-md space-y-3 border">
                <div>
                  <label className="text-sm text-gray-500">Applicant Name:</label>
                  <p className="font-medium">{selectedApplication.full_name || selectedApplication.fullName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email:</label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone:</label>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">City:</label>
                  <p className="font-medium">{selectedApplication.city}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vehicle:</label>
                  <p className="font-medium">{selectedApplication.vehicle_type || selectedApplication.vehicle}</p>
                </div>
                {selectedApplication.experience && (
                  <div>
                    <label className="text-sm text-gray-500">Experience:</label>
                    <p className="font-medium">{selectedApplication.experience}</p>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                Approving this application will create a courier account with a temporary password that you can share with the courier.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveApplication} disabled={isLoading}>
              {isLoading ? "Approving..." : "Approve & Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
