
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, LogOut, User, Clock, DollarSign, MapPin, 
  Truck, BarChart3, Settings, Bell, MessageSquare, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DriverData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  car_model: string;
  car_year: string;
  id_number: string;
  license_number: string;
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // Not authenticated, redirect to login
        navigate('/driver-login');
        return;
      }
      
      // Fetch driver data
      fetchDriverData(data.session.user.id);
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchDriverData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setDriverData(data as DriverData);
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Could not load driver profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Example trip data - in a real app, this would come from the database
  const recentTrips = [
    { id: 1, passenger: "Lesego Phiri", pickup: "Mall of Botswana", dropoff: "Gaborone CBD", amount: 75, time: "Today, 14:35" },
    { id: 2, passenger: "Boitumelo Ntsima", pickup: "Airport", dropoff: "Phakalane", amount: 120, time: "Today, 12:10" },
    { id: 3, passenger: "Tebogo Kgotla", pickup: "Grand Palm", dropoff: "Phase 2", amount: 55, time: "Yesterday, 19:45" }
  ];
  
  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    toast(newStatus ? "You are now online" : "You are now offline", {
      description: newStatus 
        ? "You can now receive ride requests" 
        : "You will not receive any ride requests",
      icon: newStatus ? <Car /> : <Clock />
    });
  };
  
  const handleLogout = async () => {
    toast.info("Logging out...");
    
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-getmore-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-getmore-purple text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Car size={28} className="mr-2" />
            <h1 className="text-xl font-bold">GetMore BW Driver</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white">
              <MessageSquare size={20} />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Driver Status */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4 border-2 border-getmore-purple">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">{driverData?.full_name || 'Driver'}</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    {driverData?.status === 'active' ? (
                      <>
                        <CheckCircle size={14} className="text-green-500 mr-1" />
                        <span className="text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} className="text-amber-500 mr-1" />
                        <span className="text-amber-600">{driverData?.status || 'Pending'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {driverData?.status === 'active' ? (
              <div className="flex items-center">
                <span className="mr-3 font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={handleToggleOnline} 
                  className={isOnline ? 'bg-green-500' : ''} 
                />
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-md text-sm">
                {driverData?.status === 'pending' ? 'Verification Pending' : 'Account Inactive'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="container mx-auto py-8 px-4">
        {driverData?.status !== 'active' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-700">
            <h3 className="font-medium flex items-center">
              <AlertCircle size={18} className="mr-2" /> 
              Account Verification Status: {driverData?.status || 'Pending'}
            </h3>
            <p className="mt-2 text-sm">
              Your driver account is currently being verified. We'll notify you via email once your account is active.
              Please ensure your documents are valid and clearly visible.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Driver Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Driver Details</h3>
              <User className="text-getmore-purple" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Full Name</span>
                <span className="font-medium">{driverData?.full_name}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{driverData?.email}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium">{driverData?.phone}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">ID Number</span>
                <span className="font-medium">{driverData?.id_number}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium">{driverData?.car_model} ({driverData?.car_year})</span>
              </div>
            </div>
          </div>
          
          {/* Earnings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Earnings</h3>
              <DollarSign className="text-getmore-purple" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-bold">P250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-bold">P1,750</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold">P6,800</span>
              </div>
            </div>
          </div>
          
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Account Status</h3>
              <Settings className="text-getmore-purple" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${driverData?.status === 'active' ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                <span className="text-gray-700">Account {driverData?.status === 'active' ? 'Active' : 'Pending'}</span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${driverData?.status === 'active' ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                <span className="text-gray-700">Documents {driverData?.status === 'active' ? 'Verified' : 'Under Review'}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-gray-700">Vehicle Inspection Due in 14 days</span>
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-getmore-purple text-getmore-purple hover:bg-getmore-purple hover:text-white"
                >
                  Update Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Trips */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Recent Trips</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passenger</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dropoff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.passenger}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-green-500" />
                        {trip.pickup}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-red-500" />
                        {trip.dropoff}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">P{trip.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t">
            <Button variant="ghost" className="text-getmore-purple hover:text-getmore-purple hover:bg-purple-50">
              View All Trips
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
