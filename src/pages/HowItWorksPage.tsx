
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import HowItWorks from "@/components/HowItWorks";
import { Download, Smartphone, Clock, Box, Check } from "lucide-react";
import { toast } from "sonner";

const HowItWorksPage = () => {
  const handleDownloadClick = () => {
    toast.info("The GetMore BW app is coming soon! We'll notify you when it's available.", {
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-white to-gray-100 py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-getmore-purple">How</span>{" "}
              <span className="text-getmore-turquoise">Get More BW</span>{" "}
              <span className="text-gray-800">Works</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mb-12">
              Our service is designed to be simple, fast, and convenient. Here's how
              it works and how you can get started in minutes.
            </p>
          </div>
        </div>

        {/* Core Process Section */}
        <div className="py-16 bg-white">
          <div className="container-custom">
            <HowItWorks />
          </div>
        </div>

        {/* Download App Section */}
        <div className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Download Our App</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get the most out of GetMore BW by downloading our mobile app for faster ordering and exclusive deals.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-md max-w-md">
                <div className="flex justify-center mb-6">
                  <Smartphone size={48} className="text-getmore-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">Coming Soon to Your Device</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Our mobile app is currently in development and will be available soon for both iOS and Android.
                </p>
                <button 
                  onClick={handleDownloadClick}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Get Notified
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Got questions? We've got answers to the most common questions about our service.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">How fast is the delivery?</h3>
                <p className="text-gray-600">
                  We deliver most orders in under 15 minutes, depending on your location and the items ordered.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">What areas do you cover?</h3>
                <p className="text-gray-600">
                  We currently operate in major areas of Gaborone, with plans to expand to other cities in Botswana soon.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">What are your operating hours?</h3>
                <p className="text-gray-600">
                  We are available 24/7 in select areas, and from 7 AM to midnight in other locations.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">Is there a minimum order amount?</h3>
                <p className="text-gray-600">
                  The minimum order amount is 30 BWP to qualify for delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default HowItWorksPage;
