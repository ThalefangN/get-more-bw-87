
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/contexts/StoreContext";
import { Mail, Phone, Store, MapPin, Package, Clock, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StoresTab = () => {
  const { allStores } = useStore();
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchStoreProducts = async (storeId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId);
        
      if (error) throw error;
      
      setStoreProducts(data || []);
    } catch (error) {
      console.error("Error fetching store products:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = (store: any) => {
    setSelectedStore(store);
    setIsDetailsOpen(true);
    fetchStoreProducts(store.id);
  };
  
  // Generate a fallback avatar for stores without a logo
  const generateAvatarUrl = (storeName: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=8B5CF6&color=fff`;
  };
  
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
          {allStores.map((store) => (
            <Card key={store.id}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage 
                      src={store.logo || generateAvatarUrl(store.name)} 
                      alt={store.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = generateAvatarUrl(store.name);
                      }}
                    />
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(store)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Store Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Store Details</DialogTitle>
            <DialogDescription>
              Detailed information about this store
            </DialogDescription>
          </DialogHeader>
          
          {selectedStore && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:w-1/3">
                  <div className="bg-gray-50 p-4 rounded-md space-y-4 border">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={selectedStore.logo || generateAvatarUrl(selectedStore.name)} 
                          alt={selectedStore.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = generateAvatarUrl(selectedStore.name);
                          }} 
                        />
                        <AvatarFallback>{selectedStore.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold">{selectedStore.name}</h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Mail size={14} className="mr-1" />
                            {selectedStore.email}
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            {selectedStore.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Address</div>
                      <div className="flex items-start">
                        <MapPin size={16} className="mr-1 mt-0.5 text-gray-500" />
                        <span>{selectedStore.address}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Categories</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedStore.categories && selectedStore.categories.map((category: string, index: number) => (
                          <span key={index} className="bg-getmore-purple/10 text-getmore-purple text-xs px-2 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Description</div>
                      <p className="text-sm">{selectedStore.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Store Products</h3>
                    
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-getmore-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p>Loading products...</p>
                      </div>
                    ) : storeProducts.length === 0 ? (
                      <div className="text-center py-8 border rounded-lg bg-gray-50">
                        <ShoppingBag size={32} className="mx-auto text-gray-300 mb-3" />
                        <h4 className="text-gray-700">No products found</h4>
                        <p className="text-sm text-gray-500">This store has not added any products yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {storeProducts.map((product) => (
                          <div key={product.id} className="border rounded-lg p-4 flex">
                            <div className="w-16 h-16 mr-3 flex-shrink-0">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=Product";
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium line-clamp-1">{product.name}</h4>
                              <div className="text-sm text-gray-500 line-clamp-1 mb-1">{product.category}</div>
                              <div className="font-semibold">P{product.price.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoresTab;
