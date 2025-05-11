
import { useEffect, useState, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { CarouselApi } from "@/components/ui/carousel";

interface Shop {
  id: string;
  name: string;
  logo?: string;
  address: string;
  description: string;
  categories?: string[];
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
  "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

// Map store categories to relevant images
const categoryImageMap: Record<string, string> = {
  "Groceries": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
  "Beverages": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000&auto=format&fit=crop",
  "Fruits & Vegetables": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
  "Fruits": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
  "Vegetables": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
  "Ready Meals": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
  "Gifts & Lifestyle": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop",
  "Meat & Poultry": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop",
  "Meat": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1000&auto=format&fit=crop",
  "Bakery": "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=1000&auto=format&fit=crop",
  "Dairy": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=1000&auto=format&fit=crop",
  "Snacks": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=1000&auto=format&fit=crop",
  "Household": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?q=80&w=1000&auto=format&fit=crop",
  "Personal Care": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1000&auto=format&fit=crop",
  "Baby Products": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop",
  "Electronics": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop",
  "Pharmacy": "https://images.unsplash.com/photo-1631549916768-4119b4123a21?q=80&w=1000&auto=format&fit=crop",
  "Supermarket": "https://images.unsplash.com/photo-1601599963565-b7f49deb352a?q=80&w=1000&auto=format&fit=crop",
  "Convenience": "https://images.unsplash.com/photo-1515706886582-54c73c5eaf41?q=80&w=1000&auto=format&fit=crop"
};

const ShopCarousel = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const navigate = useNavigate();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setShops(data as Shop[]);
        } else {
          setShops([]);
        }
      } catch (error) {
        console.error("Failed to fetch shops:", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!api) return;

    const startAutoplay = () => {
      autoPlayRef.current = setInterval(() => {
        api.scrollNext();
      }, 3000);
    };
    const stopAutoplay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    };

    startAutoplay();
    const carouselEl = document.querySelector('.shop-carousel-container');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAutoplay);
      carouselEl.addEventListener('mouseleave', startAutoplay);
      carouselEl.addEventListener('touchstart', stopAutoplay);
      carouselEl.addEventListener('touchend', startAutoplay);
    }

    return () => {
      stopAutoplay();
      if (carouselEl) {
        carouselEl.removeEventListener('mouseenter', stopAutoplay);
        carouselEl.removeEventListener('mouseleave', startAutoplay);
        carouselEl.removeEventListener('touchstart', stopAutoplay);
        carouselEl.removeEventListener('touchend', startAutoplay);
      }
    };
  }, [api, shops]);

  const handleShopClick = (shop: Shop) => {
    navigate(`/shop/${shop.id}`);
  };

  // Get appropriate image based on store categories or name
  const getStoreImage = (shop: Shop) => {
    // First try to use the store's logo if available
    if (shop.logo && shop.logo.trim().length > 0) {
      return shop.logo;
    }
    
    // Next, check if the store has categories and try to match with our category images
    if (shop.categories && shop.categories.length > 0) {
      for (const category of shop.categories) {
        if (categoryImageMap[category]) {
          return categoryImageMap[category];
        }
      }
    }
    
    // If no categories match, try to match based on store name keywords
    const shopName = shop.name.toLowerCase();
    const nameKeywords = [
      { keywords: ["fruit", "veg", "vegetable", "produce", "green"], img: categoryImageMap["Fruits & Vegetables"] },
      { keywords: ["meat", "butcher", "poultry", "beef", "chicken"], img: categoryImageMap["Meat"] },
      { keywords: ["bakery", "bread", "pastry", "cake"], img: categoryImageMap["Bakery"] },
      { keywords: ["pharmacy", "drug", "medicine"], img: categoryImageMap["Pharmacy"] },
      { keywords: ["electronic", "device", "gadget", "tech"], img: categoryImageMap["Electronics"] },
      { keywords: ["super", "market", "grocery"], img: categoryImageMap["Supermarket"] },
      { keywords: ["convenience", "quick", "express"], img: categoryImageMap["Convenience"] }
    ];
    
    for (const entry of nameKeywords) {
      if (entry.keywords.some(keyword => shopName.includes(keyword))) {
        return entry.img;
      }
    }
    
    // Fallback to placeholder images with a consistent pattern based on store name
    const index = shop.name.length % placeholderImages.length;
    return placeholderImages[index];
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="container-custom">
          <h2 className="text-2xl font-bold mb-6">Shop by Store</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shops.length) {
    return (
      <div className="container-custom py-6">
        <h2 className="text-2xl font-bold mb-6">Shop by Store</h2>
        <p>No shops available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50 overflow-hidden">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-6">Shop by Store</h2>
        <div className="shop-carousel-container">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent>
              {shops.map((shop) => (
                <CarouselItem key={shop.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <div
                    className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow transform hover:scale-105 transition-transform duration-300"
                    onClick={() => handleShopClick(shop)}
                  >
                    <div className="h-32 overflow-hidden">
                      <img
                        src={getStoreImage(shop)}
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const index = shop.name.length % placeholderImages.length;
                          target.src = placeholderImages[index];
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium">{shop.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{shop.address}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-1 md:-left-12 bg-white hover:bg-getmore-purple hover:text-white transition-colors duration-300" />
            <CarouselNext className="right-1 md:-right-12 bg-white hover:bg-getmore-purple hover:text-white transition-colors duration-300" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ShopCarousel;
