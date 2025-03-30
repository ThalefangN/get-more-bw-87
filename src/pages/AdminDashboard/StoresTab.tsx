
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/contexts/StoreContext";
import { Mail, Phone, Store } from "lucide-react";

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
          {allStores.map((store) => (
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

export default StoresTab;
