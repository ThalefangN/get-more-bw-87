import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import StoreNavbar from "@/components/store/StoreNavbar";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, MessageSquare, DollarSign, TrendingUp, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ProductForm from "@/components/store/ProductForm";
import { Product } from "@/contexts/StoreContext";

const StoreDashboard = () => {
  const { currentStore, isAuthenticated, storeProducts, storeOrders, storeQueries } = useStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/store-signin" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StoreNavbar />
      <main className="flex-grow">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="queries" element={<QueriesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="*" element={<Navigate to="/store-dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardHome = () => {
  const { storeProducts, storeOrders, storeQueries, currentStore } = useStore();
  
  const totalRevenue = storeOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = storeOrders.filter(order => order.status === 'pending').length;
  const productCount = storeProducts.length;
  const queryCount = storeQueries.length;
  const pendingQueries = storeQueries.filter(query => query.status === 'pending').length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {currentStore?.name}</h1>
        <p className="text-gray-600">Here's a summary of your store's performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">P{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Lifetime earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-gray-500">Requires your attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-gray-500">Total active products</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {storeOrders.length > 0 ? (
              <div className="space-y-4">
                {storeOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.items.length} items • P{order.total_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'delivering'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'approved'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No orders yet. Once you receive orders, they will appear here.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {storeQueries.length > 0 ? (
              <div className="space-y-4">
                {storeQueries.slice(0, 5).map(query => (
                  <div key={query.id} className="flex items-start justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{query.customer_name}</p>
                      <p className="text-sm text-gray-600 line-clamp-1">{query.message}</p>
                      <p className="text-xs text-gray-500">{new Date(query.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        query.status === 'answered' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No queries yet. Once customers ask questions, they will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { storeProducts, deleteProduct } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  
  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsAddDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your store products</p>
        </div>
        <Button onClick={handleAddProduct}>Add Product</Button>
      </div>
      
      {storeProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="text-lg font-bold">P{product.price.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-getmore-purple/10 text-getmore-purple">
                    {product.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
          <div className="mt-6">
            <Button onClick={handleAddProduct}>Add Product</Button>
          </div>
        </div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            productToEdit={selectedProduct} 
            onCancel={() => setIsAddDialogOpen(false)}
            onSuccess={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrdersPage = () => {
  const { storeOrders, updateOrderStatus, currentStore, fetchStoreOrders } = useStore();
  
  useEffect(() => {
    if (currentStore?.id) {
      fetchStoreOrders(currentStore.id);
    }
  }, [currentStore, fetchStoreOrders]);
  
  const handleStatusChange = (orderId: string, newStatus: 'pending' | 'approved' | 'declined' | 'delivering' | 'completed') => {
    updateOrderStatus(orderId, newStatus);
  };
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-purple-100 text-purple-800",
    declined: "bg-red-100 text-red-800",
    delivering: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800"
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-gray-600">Manage customer orders</p>
      </div>
      
      {storeOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storeOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    P{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => handleStatusChange(order.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleStatusChange(order.id, 'declined')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    {(order.status === 'approved' || order.status === 'delivering') && (
                      <div className="text-sm text-gray-500">
                        {order.courier_assigned ? 'Courier assigned' : 'Awaiting courier'}
                      </div>
                    )}
                    {order.status === 'completed' && (
                      <div className="text-green-600 text-sm">Delivered</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">When customers place orders, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

const QueriesPage = () => {
  const { storeQueries, respondToQuery } = useStore();
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  
  const handleResponseChange = (queryId: string, response: string) => {
    setResponses(prev => ({ ...prev, [queryId]: response }));
  };
  
  const handleSubmitResponse = (queryId: string) => {
    const response = responses[queryId];
    if (response && response.trim()) {
      respondToQuery(queryId, response);
      setResponses(prev => {
        const updated = { ...prev };
        delete updated[queryId];
        return updated;
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customer Queries</h1>
        <p className="text-gray-600">Respond to customer questions and inquiries</p>
      </div>
      
      {storeQueries.length > 0 ? (
        <div className="space-y-6">
          {storeQueries.map(query => (
            <Card key={query.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{query.customer_name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {new Date(query.created_at).toLocaleDateString()} at {new Date(query.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    query.status === 'answered' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-gray-800">{query.message}</p>
                </div>
                
                {query.status === 'answered' ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Response:</h4>
                    <div className="p-4 bg-getmore-purple/10 rounded-lg">
                      <p className="text-gray-800">{query.response}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Sent on {new Date(query.responseDate!).toLocaleDateString()} at {new Date(query.responseDate!).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Response:</h4>
                    <Textarea
                      value={responses[query.id] || ''}
                      onChange={(e) => handleResponseChange(query.id, e.target.value)}
                      placeholder="Type your response here..."
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex justify-end">
                      <Button onClick={() => handleSubmitResponse(query.id)}>
                        Send Response
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No queries yet</h3>
          <p className="mt-1 text-sm text-gray-500">When customers have questions, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

const CustomersPage = () => {
  const { storeOrders } = useStore();
  
  const customers = [...new Map(
    storeOrders.map(order => [
      order.customer_id, 
      {
        id: order.customer_id,
        name: order.customer_name,
        orderCount: storeOrders.filter(o => o.customer_id === order.customer_id).length,
        totalSpent: storeOrders
          .filter(o => o.customer_id === order.customer_id)
          .reduce((sum, o) => sum + o.total_amount, 0),
        lastOrder: new Date(
          Math.max(...storeOrders
            .filter(o => o.customer_id === order.customer_id)
            .map(o => new Date(o.created_at).getTime())
          )
        )
      }
    ])
  ).values()];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-gray-600">View and manage your store customers</p>
      </div>
      
      {customers.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-getmore-purple/10 flex items-center justify-center text-getmore-purple font-medium">
                          {customer.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.orderCount} orders
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    P{customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrder.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers yet</h3>
          <p className="mt-1 text-sm text-gray-500">When you receive orders, customers will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
