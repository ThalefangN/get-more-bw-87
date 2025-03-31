
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Cart } from "@/components/Cart";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleShopNow = () => {
    if (isAuthenticated) {
      navigate("/shop");
    } else {
      navigate("/sign-in");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <section className="bg-white py-12">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start shopping?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Browse our wide selection of products from local stores and get them delivered to your doorstep in minutes.
            </p>
            <Button 
              className="bg-getmore-purple hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg"
              onClick={handleShopNow}
            >
              Shop Now
            </Button>
          </div>
        </section>
        <HowItWorks />
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default Index;
