
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  category: string;
  description: string;
  inStock: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'declined' | 'delivering' | 'completed';
  address: string;
  createdAt: Date;
  courierAssigned?: string;
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
  addProduct: (product: Omit<Product, 'id' | 'storeId' | 'createdAt'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  respondToQuery: (queryId: string, response: string) => void;
  allStores: StoreInfo[];
  getStoreById: (storeId: string) => StoreInfo | undefined;
  getProductsByStore: (storeId: string) => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [currentStore, setCurrentStore] = useState<StoreInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  const [storeQueries, setStoreQueries] = useState<Query[]>([]);
  const [allStores, setAllStores] = useState<StoreInfo[]>([]);

  // Load stored data on mount
  useEffect(() => {
    const storedStoreInfo = localStorage.getItem('storeInfo');
    if (storedStoreInfo) {
      try {
        const parsedStore = JSON.parse(storedStoreInfo);
        setCurrentStore(parsedStore);
        setIsAuthenticated(true);
        
        // Load this store's products, orders, and queries
        loadStoreData(parsedStore.id);
      } catch (error) {
        console.error('Failed to parse store info from localStorage:', error);
        localStorage.removeItem('storeInfo');
      }
    }
    
    // Load all registered stores
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
    // Load products
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
    
    // Load orders
    const storedOrders = localStorage.getItem('storeOrders');
    if (storedOrders) {
      try {
        const allOrders = JSON.parse(storedOrders);
        const storeOrders = allOrders.filter((o: Order) => o.storeId === storeId);
        setStoreOrders(storeOrders);
      } catch (error) {
        console.error('Failed to parse orders from localStorage:', error);
      }
    }
    
    // Load queries
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
  };

  const login = (storeData: StoreInfo) => {
    setCurrentStore(storeData);
    setIsAuthenticated(true);
    localStorage.setItem('storeInfo', JSON.stringify(storeData));
    
    // Update all stores list if this is a new store
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
    
    // Load this store's data
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

  const addProduct = (productData: Omit<Product, 'id' | 'storeId' | 'createdAt'>) => {
    if (!currentStore) return;
    
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
      storeId: currentStore.id,
      createdAt: new Date()
    };
    
    const updatedProducts = [...storeProducts, newProduct];
    setStoreProducts(updatedProducts);
    
    // Update localStorage with all products
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
    
    // Update in localStorage
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
    
    // Update in localStorage
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
    
    // Update in localStorage
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
    
    // Update in localStorage
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
      getProductsByStore
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
