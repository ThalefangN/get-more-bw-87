
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";

const LearnMore = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-white to-gray-100 py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-getmore-purple">About</span>{" "}
              <span className="text-getmore-turquoise">GetMore BW</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mb-12">
              Bringing convenience to your doorstep in minutes, GetMore BW is
              transforming how Botswana shops for groceries and essentials.
            </p>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-6">
                  We're on a mission to make everyday life easier for people in Botswana
                  by providing fast, reliable delivery of the products they need and love.
                </p>
                <p className="text-gray-600">
                  Our goal is to save you time for the things that matter most by bringing
                  the store to your door in just minutes.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1000&auto=format&fit=crop"
                  alt="GetMore BW delivery"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Why Choose GetMore BW?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-getmore-purple">1</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ultra-Fast Delivery</h3>
                  <p className="text-gray-600">
                    Get your groceries and essentials delivered in as little as 10 minutes.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-getmore-turquoise">2</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
                  <p className="text-gray-600">
                    Shop from thousands of products across multiple categories.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-getmore-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-getmore-orange">3</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Supermarket Prices</h3>
                  <p className="text-gray-600">
                    Enjoy competitive pricing with no hidden markups.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-6">Ready to get started?</h2>
              <a href="/shop" className="btn-primary inline-flex items-center">
                Shop Now
                <ArrowRight className="ml-2" size={18} />
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default LearnMore;
