
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, LogOut, User, Clock, DollarSign, MapPin, 
  Truck, BarChart3, Settings, Bell, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  
  // Dummy data for the dashboard
  const driverData = {
    name: "Kabo Moeng",
    rating: 4.8,
    totalTrips: 152,
    earnings: {
      today: 250,
      week: 1750,
      month: 6800
    },
    recentTrips: [
      { id: 1, passenger: "Lesego Phiri", pickup: "Mall of Botswana", dropoff: "Gaborone CBD", amount: 75, time: "Today, 14:35" },
      { id: 2, passenger: "Boitumelo Ntsima", pickup: "Airport", dropoff: "Phakalane", amount: 120, time: "Today, 12:10" },
      { id: 3, passenger: "Tebogo Kgotla", pickup: "Grand Palm", dropoff: "Phase 2", amount: 55, time: "Yesterday, 19:45" }
    ]
  };
  
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
  
  const handleLogout = () => {
    toast.info("Logging out...");
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };
  
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
                <h2 className="font-bold text-lg">{driverData.name}</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span> {driverData.rating}
                  </div>
                  <span className="mx-2">•</span>
                  <div>{driverData.totalTrips} trips</div>
                </div>
              </div>
            </div>
            
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
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Earnings Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Earnings</h3>
              <DollarSign className="text-getmore-purple" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-bold">P{driverData.earnings.today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-bold">P{driverData.earnings.week}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold">P{driverData.earnings.month}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Your Activity</h3>
              <BarChart3 className="text-getmore-purple" size={20} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Car size={16} className="text-blue-500" />
                  </div>
                  <span className="text-gray-600">Trips Completed</span>
                </div>
                <span className="font-bold">{driverData.totalTrips}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <Clock size={16} className="text-yellow-500" />
                  </div>
                  <span className="text-gray-600">Hours Online</span>
                </div>
                <span className="font-bold">86</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Truck size={16} className="text-green-500" />
                  </div>
                  <span className="text-gray-600">Km Driven</span>
                </div>
                <span className="font-bold">1,245</span>
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
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">Account Active</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-700">Documents Verified</span>
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
                {driverData.recentTrips.map((trip) => (
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
