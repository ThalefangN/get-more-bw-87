
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
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
  "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
];

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

  // Autoplay logic
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
              {shops.map((shop, index) => (
                <CarouselItem key={shop.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <div
                    className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow transform hover:scale-105 transition-transform duration-300"
                    onClick={() => handleShopClick(shop)}
                  >
                    <div className="h-32 overflow-hidden flex items-center justify-center bg-gray-100">
                      <img
                        src={shop.logo || placeholderImages[index % placeholderImages.length]}
                        alt={shop.name}
                        className="w-full h-full object-contain transition-transform duration-500"
                        onError={e => {
                          (e.target as HTMLImageElement).src = placeholderImages[index % placeholderImages.length];
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
