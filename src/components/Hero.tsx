
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-100 overflow-hidden">
      <div className="container-custom py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 md:pr-12 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-getmore-purple">Groceries</span> delivered in 
              <span className="text-getmore-turquoise"> minutes</span>
            </h1>
            <p className="text-lg text-gray-600">
              Get More BW delivers groceries, food, and household essentials to your doorstep in minutes. Shop from thousands of products at supermarket prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn-primary flex items-center justify-center">
                Shop Now
                <ArrowRight className="ml-2" size={18} />
              </Link>
              <Link to="/learn-more" className="btn-secondary flex items-center justify-center">
                Learn More
              </Link>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Join 50,000+</span> happy customers in Botswana
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                alt="Get More BW Delivery"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-getmore-purple rounded-xl"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-getmore-turquoise rounded-xl"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-8 shadow-sm">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-getmore-purple">10min</div>
              <p className="text-gray-600 text-sm">Average Delivery</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-getmore-purple">5000+</div>
              <p className="text-gray-600 text-sm">Products</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-getmore-purple">24/7</div>
              <p className="text-gray-600 text-sm">Available</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-getmore-purple">10+</div>
              <p className="text-gray-600 text-sm">Cities in Botswana</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
