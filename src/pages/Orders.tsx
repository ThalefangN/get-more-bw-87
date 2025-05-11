
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define proper type for orders to avoid excessive type instantiation
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_address: string;
  estimated_delivery: string;
  items: OrderItem[];
}

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // This will be replaced with actual API call when backend is set up
        // For now, we're simulating orders data
        
        // Simulated API response
        setTimeout(() => {
          const mockOrders: Order[] = [
            {
              id: "ORD-2023-001",
              created_at: "2023-05-11T14:30:00Z",
              status: "delivered",
              total: 158.45,
              delivery_address: "123 Main St, Gaborone",
              estimated_delivery: "2023-05-11T15:30:00Z",
              items: [
                { id: "1", name: "Milk 1L", price: 12.99, quantity: 2 },
                { id: "2", name: "Bread", price: 8.50, quantity: 1 },
                { id: "3", name: "Eggs (12)", price: 22.99, quantity: 1 },
              ]
            },
            {
              id: "ORD-2023-002",
              created_at: "2023-05-09T10:15:00Z",
              status: "processing",
              total: 245.80,
              delivery_address: "456 Park Avenue, Gaborone",
              estimated_delivery: "2023-05-09T11:00:00Z",
              items: [
                { id: "4", name: "Chicken Breast", price: 65.99, quantity: 2 },
                { id: "5", name: "Rice 5kg", price: 89.99, quantity: 1 },
                { id: "6", name: "Cooking Oil 2L", price: 23.83, quantity: 1 },
              ]
            }
          ];
          
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
      case "in_transit":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">In Transit</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past">Past Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-pulse">Loading orders...</div>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Calendar size={16} />
                          <span className="text-sm">{formatDate(order.created_at)}</span>
                          <span className="mx-1">•</span>
                          <Clock size={16} />
                          <span className="text-sm">{formatTime(order.created_at)}</span>
                        </div>
                        
                        <div className="flex items-start gap-1 text-gray-600 mb-4">
                          <MapPin size={16} className="mt-0.5" />
                          <span className="text-sm">{order.delivery_address}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">Items:</h4>
                          <ul className="text-sm space-y-1">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span>{item.name} x {item.quantity}</span>
                                <span>P{item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="md:text-right space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold">P{order.total.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            Track Order
                          </Button>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <Button onClick={() => navigate("/shop")}>Start Shopping</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="active">
              <div className="text-center py-10">
                <p>You have no active orders.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              <div className="text-center py-10">
                <p>Your order history will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
