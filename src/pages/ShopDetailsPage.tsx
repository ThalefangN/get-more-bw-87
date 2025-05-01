
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { supabase } from "@/integrations/supabase/client";

interface ShopDetails {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone?: string;
  description: string;
}

const ShopDetailsPage = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("stores")
          .select("*")
          .eq("id", shopId)
          .maybeSingle();
        
        if (data) setShop(data as ShopDetails);
        else setShop(null);
      } catch (error) {
        console.error("Error fetching shop details:", error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (shopId) {
      fetchShop();
    }
  }, [shopId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gray-50 py-8">
          <div className="container-custom flex flex-col md:flex-row gap-5 items-start">
            {loading ? (
              <div className="animate-pulse w-full">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : shop ? (
              <>
                <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={shop.logo || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                    alt={shop.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{shop.name}</h1>
                  <div className="mt-1 text-gray-600">{shop.address}</div>
                  {shop.phone && (
                    <div className="text-gray-500 mt-1">Contact: {shop.phone}</div>
                  )}
                  <p className="text-gray-700 mt-2">{shop.description}</p>
                </div>
              </>
            ) : (
              <div className="text-center w-full py-12">
                <h2 className="text-2xl font-bold text-gray-700">Shop not found</h2>
                <p className="text-gray-500 mt-2">The shop you're looking for doesn't exist or has been removed.</p>
              </div>
            )}
          </div>
        </div>
        {shop && (
          <div className="container-custom py-8">
            <h2 className="font-bold text-xl mb-4">Products from {shop.name}</h2>
            <ProductGrid storeId={shop.id} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShopDetailsPage;
