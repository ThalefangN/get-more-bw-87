
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PackageOpen, Clock, Check, X } from "lucide-react";

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "delivered" | "cancelled";
  total_amount: number;
  store_name: string;
  order_items: OrderItem[];
  delivery_address: string;
  payment_method: string;
}

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    const fetchOrders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // Fetch orders from Supabase (this is a placeholder - adjust to your actual schema)
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // This is just sample data - replace with actual data when you have it
        const sampleOrders: Order[] = [
          {
            id: "ORD-12345",
            created_at: "2025-05-10T14:30:00Z",
            status: "delivered",
            total_amount: 125.75,
            store_name: "Fresh Grocery",
            delivery_address: "123 Main St, Gaborone",
            payment_method: "Credit Card",
            order_items: [
              { product_id: "1", product_name: "Apples (1kg)", quantity: 2, price: 12.50 },
              { product_id: "2", product_name: "Bread", quantity: 1, price: 8.75 },
              { product_id: "3", product_name: "Milk (1L)", quantity: 2, price: 15.00 }
            ]
          },
          {
            id: "ORD-12346",
            created_at: "2025-05-08T10:15:00Z",
            status: "processing",
            total_amount: 89.50,
            store_name: "Tech Hub",
            delivery_address: "123 Main St, Gaborone",
            payment_method: "Cash on Delivery",
            order_items: [
              { product_id: "4", product_name: "USB Cable", quantity: 1, price: 25.00 },
              { product_id: "5", product_name: "Phone Case", quantity: 1, price: 35.50 },
              { product_id: "6", product_name: "Screen Protector", quantity: 1, price: 29.00 }
            ]
          },
          {
            id: "ORD-12347",
            created_at: "2025-05-05T16:45:00Z",
            status: "pending",
            total_amount: 215.25,
            store_name: "Home Essentials",
            delivery_address: "123 Main St, Gaborone",
            payment_method: "Mobile Money",
            order_items: [
              { product_id: "7", product_name: "Bath Towel Set", quantity: 1, price: 85.25 },
              { product_id: "8", product_name: "Dish Soap", quantity: 2, price: 18.50 },
              { product_id: "9", product_name: "Laundry Detergent", quantity: 1, price: 45.00 },
              { product_id: "10", product_name: "Kitchen Knife Set", quantity: 1, price: 66.50 }
            ]
          }
        ];

        setOrders(sampleOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load your orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated, navigate]);

  const toggleOrderDetails = (orderId: string) => {
    if (activeOrder === orderId) {
      setActiveOrder(null);
    } else {
      setActiveOrder(orderId);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"><Clock size={14} /> Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"><PackageOpen size={14} /> Processing</Badge>;
      case "delivered":
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"><Check size={14} /> Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200"><X size={14} /> Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-lg font-semibold">{order.store_name}</h2>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Order #{order.id} • {formatDate(order.created_at)}</p>
                        <p className="font-semibold">Total: P{order.total_amount.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleOrderDetails(order.id)}
                        >
                          {activeOrder === order.id ? "Hide Details" : "View Details"}
                        </Button>
                        {order.status === "delivered" && (
                          <Button size="sm">Reorder</Button>
                        )}
                      </div>
                    </div>
                    
                    {activeOrder === order.id && (
                      <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Order Details</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-1">Delivery Address</h4>
                            <p className="text-sm">{order.delivery_address}</p>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-1">Payment Method</h4>
                            <p className="text-sm">{order.payment_method}</p>
                          </div>
                          <h4 className="text-sm font-semibold mb-2">Items</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-right py-2">Price</th>
                                <th className="text-right py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_items.map((item, index) => (
                                <tr key={item.product_id} className="border-b">
                                  <td className="py-2">{item.product_name}</td>
                                  <td className="text-center py-2">{item.quantity}</td>
                                  <td className="text-right py-2">P{item.price.toFixed(2)}</td>
                                  <td className="text-right py-2">P{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={3} className="text-right font-semibold py-2">Total</td>
                                <td className="text-right font-semibold py-2">P{order.total_amount.toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
