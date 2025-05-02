
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";

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
        const { data } = await import("@/integrations/supabase/client").then(mod =>
          mod.supabase
            .from("stores")
            .select("*")
            .eq("id", shopId)
            .maybeSingle()
        );
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
              <div className="animate-pulse w-full h-20">Loading...</div>
            ) : shop ? (
              <>
                <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={shop.logo || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"}
                    alt={shop.name}
                    className="w-full h-full object-contain"
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
              <div>No shop found.</div>
            )}
          </div>
        </div>
        <div className="container-custom py-8">
          <h2 className="font-bold text-xl mb-4">Products from this Shop</h2>
          {shop ? (
            <ProductGrid storeId={shop.id} />
          ) : (
            <div className="text-gray-400">No products found.</div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopDetailsPage;
