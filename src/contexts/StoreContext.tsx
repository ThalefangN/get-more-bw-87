import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order } from '@/types/order';

export interface StoreInfo {
  id: string;
  name: string;
  email: string;
  logo?: string;
  address: string;
  phone: string;
  categories: string[];
  description: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  inStock: boolean;
  createdAt: Date;
}

export interface Query {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  message: string;
  status: 'pending' | 'answered';
  createdAt: Date;
  response?: string;
  responseDate?: Date;
}

interface StoreContextType {
  currentStore: StoreInfo | null;
  storeProducts: Product[];
  storeOrders: Order[];
  storeQueries: Query[];
  isAuthenticated: boolean;
  login: (storeData: StoreInfo) => void;
  logout: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  respondToQuery: (queryId: string, response: string) => void;
  allStores: StoreInfo[];
  getStoreById: (storeId: string) => StoreInfo | undefined;
  getProductsByStore: (storeId: string) => Product[];
  notifyCourier: (orderId: string, courierId: string, orderDetails: any) => void;
  fetchStoreOrders: (storeId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentStore, setCurrentStore] = useState<StoreInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  const [storeQueries, setStoreQueries] = useState<Query[]>([]);
  const [allStores, setAllStores] = useState<StoreInfo[]>([]);

  useEffect(() => {
    const storedStoreInfo = localStorage.getItem('storeInfo');
    if (storedStoreInfo) {
      try {
        const parsedStore = JSON.parse(storedStoreInfo);
        setCurrentStore(parsedStore);
        setIsAuthenticated(true);
        
        loadStoreData(parsedStore.id);
        
        const ordersChannel = supabase
          .channel('orders-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'orders',
              filter: `store_id=eq.${parsedStore.id}`
            }, 
            (payload) => {
              console.log('Orders change received:', payload);
              fetchStoreOrders(parsedStore.id);
            }
          )
          .subscribe();
          
        return () => {
          supabase.removeChannel(ordersChannel);
        };
      } catch (error) {
        console.error('Failed to parse store info from localStorage:', error);
        localStorage.removeItem('storeInfo');
      }
    }
    
    const storedAllStores = localStorage.getItem('allStores');
    if (storedAllStores) {
      try {
        setAllStores(JSON.parse(storedAllStores));
      } catch (error) {
        console.error('Failed to parse all stores from localStorage:', error);
      }
    }
  }, []);

  const loadStoreData = (storeId: string) => {
    const storedProducts = localStorage.getItem('storeProducts');
    if (storedProducts) {
      try {
        const allProducts = JSON.parse(storedProducts);
        const storeProducts = allProducts.filter((p: Product) => p.storeId === storeId);
        setStoreProducts(storeProducts);
      } catch (error) {
        console.error('Failed to parse products from localStorage:', error);
      }
    }
    
    const storedQueries = localStorage.getItem('storeQueries');
    if (storedQueries) {
      try {
        const allQueries = JSON.parse(storedQueries);
        const storeQueries = allQueries.filter((q: Query) => q.storeId === storeId);
        setStoreQueries(storeQueries);
      } catch (error) {
        console.error('Failed to parse queries from localStorage:', error);
      }
    }
    
    fetchStoreOrders(storeId);
  };

  const fetchStoreOrders = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching store orders:', error);
        return;
      }
      
      if (data) {
        setStoreOrders(data as Order[]);
      }
    } catch (error) {
      console.error('Unexpected error fetching store orders:', error);
    }
  };

  const login = (storeData: StoreInfo) => {
    setCurrentStore(storeData);
    setIsAuthenticated(true);
    localStorage.setItem('storeInfo', JSON.stringify(storeData));
    
    const existingStoreIndex = allStores.findIndex(s => s.id === storeData.id);
    if (existingStoreIndex === -1) {
      const updatedStores = [...allStores, storeData];
      setAllStores(updatedStores);
      localStorage.setItem('allStores', JSON.stringify(updatedStores));
    } else {
      const updatedStores = [...allStores];
      updatedStores[existingStoreIndex] = storeData;
      setAllStores(updatedStores);
      localStorage.setItem('allStores', JSON.stringify(updatedStores));
    }
    
    loadStoreData(storeData.id);
  };

  const logout = () => {
    setCurrentStore(null);
    setIsAuthenticated(false);
    setStoreProducts([]);
    setStoreOrders([]);
    setStoreQueries([]);
    localStorage.removeItem('storeInfo');
  };

  const addProduct = (product: Product) => {
    if (!currentStore) return;
    
    const updatedProducts = [...storeProducts, product];
    setStoreProducts(updatedProducts);
    
    const storedProducts = localStorage.getItem('storeProducts');
    let allProducts: Product[] = [];
    
    if (storedProducts) {
      try {
        allProducts = JSON.parse(storedProducts);
      } catch (error) {
        console.error('Failed to parse products from localStorage:', error);
      }
    }
    
    allProducts = [...allProducts.filter(p => p.storeId !== currentStore.id), ...updatedProducts];
    localStorage.setItem('storeProducts', JSON.stringify(allProducts));
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const updatedProducts = storeProducts.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    );
    
    setStoreProducts(updatedProducts);
    
    const storedProducts = localStorage.getItem('storeProducts');
    if (storedProducts) {
      try {
        const allProducts = JSON.parse(storedProducts);
        const productsWithoutUpdated = allProducts.filter((p: Product) => p.id !== productId);
        const updatedProduct = updatedProducts.find(p => p.id === productId);
        localStorage.setItem('storeProducts', JSON.stringify([...productsWithoutUpdated, updatedProduct]));
      } catch (error) {
        console.error('Failed to update product in localStorage:', error);
      }
    }
  };

  const deleteProduct = (productId: string) => {
    const updatedProducts = storeProducts.filter(product => product.id !== productId);
    setStoreProducts(updatedProducts);
    
    const storedProducts = localStorage.getItem('storeProducts');
    if (storedProducts) {
      try {
        const allProducts = JSON.parse(storedProducts);
        const filteredProducts = allProducts.filter((p: Product) => p.id !== productId);
        localStorage.setItem('storeProducts', JSON.stringify(filteredProducts));
      } catch (error) {
        console.error('Failed to delete product from localStorage:', error);
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = storeOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    
    setStoreOrders(updatedOrders);
    
    const storedOrders = localStorage.getItem('storeOrders');
    if (storedOrders) {
      try {
        const allOrders = JSON.parse(storedOrders);
        const updatedAllOrders = allOrders.map((o: Order) => 
          o.id === orderId ? { ...o, status } : o
        );
        localStorage.setItem('storeOrders', JSON.stringify(updatedAllOrders));
      } catch (error) {
        console.error('Failed to update order in localStorage:', error);
      }
    }
  };

  const respondToQuery = (queryId: string, response: string) => {
    const updatedQueries = storeQueries.map(query => 
      query.id === queryId ? { 
        ...query, 
        response, 
        responseDate: new Date(), 
        status: 'answered' as const 
      } : query
    );
    
    setStoreQueries(updatedQueries);
    
    const storedQueries = localStorage.getItem('storeQueries');
    if (storedQueries) {
      try {
        const allQueries = JSON.parse(storedQueries);
        const updatedAllQueries = allQueries.map((q: Query) => 
          q.id === queryId ? { 
            ...q, 
            response, 
            responseDate: new Date(), 
            status: 'answered' 
          } : q
        );
        localStorage.setItem('storeQueries', JSON.stringify(updatedAllQueries));
      } catch (error) {
        console.error('Failed to respond to query in localStorage:', error);
      }
    }
  };

  const getStoreById = (storeId: string) => {
    return allStores.find(store => store.id === storeId);
  };

  const getProductsByStore = (storeId: string) => {
    const storedProducts = localStorage.getItem('storeProducts');
    if (!storedProducts) return [];
    
    try {
      const allProducts = JSON.parse(storedProducts);
      return allProducts.filter((p: Product) => p.storeId === storeId);
    } catch (error) {
      console.error('Failed to get products by store:', error);
      return [];
    }
  };

  const notifyCourier = async (orderId: string, courierId: string, orderDetails: any) => {
    try {
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({ courier_assigned: courierId })
        .eq('id', orderId);
      
      if (updateOrderError) throw updateOrderError;
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: 'New Delivery Request',
          message: `You've been assigned to deliver order #${orderId.substring(0, 8)}. Please respond quickly.`,
          type: 'delivery_update',
          user_id: courierId,
          order_id: orderId,
          data: {
            orderDetails: orderDetails,
            actionRequired: true
          }
        });
      
      if (notificationError) throw notificationError;
      
      setStoreOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, courier_assigned: courierId } : order
        )
      );

      toast.success('Courier has been notified about the delivery request');
      
      fetchStoreOrders(currentStore?.id || "");
      
    } catch (error) {
      console.error('Failed to notify courier:', error);
      toast.error('Failed to notify courier');
    }
  };

  return (
    <StoreContext.Provider value={{
      currentStore,
      storeProducts,
      storeOrders,
      storeQueries,
      isAuthenticated,
      login,
      logout,
      addProduct,
      updateProduct,
      deleteProduct,
      updateOrderStatus,
      respondToQuery,
      allStores,
      getStoreById,
      getProductsByStore,
      notifyCourier,
      fetchStoreOrders
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
