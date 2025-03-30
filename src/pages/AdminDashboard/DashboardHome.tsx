
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/contexts/StoreContext";
import { supabase } from "@/integrations/supabase/client";

const DashboardHome = () => {
  const { allStores } = useStore();
  const [stats, setStats] = useState({
    stores: 0,
    users: 0,
    orders: 0,
    couriers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch couriers count
        const { count: couriersCount, error: couriersError } = await supabase
          .from('couriers')
          .select('*', { count: 'exact', head: true });

        // Update stats with all values
        setStats({
          stores: allStores.length,
          users: localStorage.getItem('users') 
            ? JSON.parse(localStorage.getItem('users') || '[]').length 
            : 0,
          orders: localStorage.getItem('storeOrders') 
            ? JSON.parse(localStorage.getItem('storeOrders') || '[]').length 
            : 0,
          couriers: couriersCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
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

export default DashboardHome;
