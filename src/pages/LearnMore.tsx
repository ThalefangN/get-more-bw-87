import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cart } from "@/components/Cart";
import React from "react";

const LearnMore = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Learn More About GetMore</h1>
            <p className="text-gray-600 mb-8">Discover how GetMore can help you shop from local stores and get your items delivered quickly.</p>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700">
                At GetMore, our mission is to connect local businesses with customers in a convenient and efficient way. We believe in supporting our community by making it easier for you to shop locally.
              </p>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <ol className="list-decimal pl-5 text-gray-700">
                <li>Browse our selection of local stores.</li>
                <li>Add items to your cart.</li>
                <li>Place your order and choose your delivery address.</li>
                <li>Receive your items quickly and easily.</li>
              </ol>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Benefits of Using GetMore</h2>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Support local businesses.</li>
                <li>Convenient and fast delivery.</li>
                <li>Wide selection of products.</li>
                <li>Easy-to-use platform.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
              <p className="text-gray-700">
                Ready to experience the convenience of GetMore? <Link to="/shop" className="text-getmore-purple hover:underline">Start shopping now</Link> and discover the best local products in your area.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <Cart />
    </div>
  );
};

export default LearnMore;
